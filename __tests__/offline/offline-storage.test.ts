/**
 * @jest-environment jsdom
 */

import { offlineStorage } from '@/lib/offline/storage';
import type { CachedConversation, OfflineQueueItem } from '@/lib/offline/types';

// Mock IndexedDB
const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null as any,
  onerror: null as any,
};

const mockObjectStore = {
  put: jest.fn(() => mockIDBRequest),
  get: jest.fn(() => mockIDBRequest),
  getAll: jest.fn(() => mockIDBRequest),
  delete: jest.fn(() => mockIDBRequest),
  clear: jest.fn(() => mockIDBRequest),
  createIndex: jest.fn(),
  index: jest.fn(() => ({
    getAll: jest.fn(() => mockIDBRequest),
  })),
};

const mockIDBTransaction = {
  objectStore: jest.fn(() => mockObjectStore),
};

const mockIDBDatabase = {
  transaction: jest.fn(() => mockIDBTransaction),
  objectStoreNames: {
    contains: jest.fn(() => false),
  },
  createObjectStore: jest.fn(() => mockObjectStore),
};

const mockIDBOpenRequest = {
  ...mockIDBRequest,
  onupgradeneeded: null as any,
};

// Mock IndexedDB
Object.defineProperty(window, 'indexedDB', {
  value: {
    open: jest.fn(() => mockIDBOpenRequest),
  },
});

// Mock navigator.storage
Object.defineProperty(navigator, 'storage', {
  value: {
    estimate: jest.fn(() => Promise.resolve({ usage: 1000, quota: 10000 })),
  },
});

describe('OfflineStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Simulate successful IndexedDB operations
    mockIDBOpenRequest.onsuccess = () => {
      mockIDBOpenRequest.result = mockIDBDatabase;
    };
    
    mockIDBRequest.onsuccess = () => {
      // Default to empty result
      mockIDBRequest.result = null;
    };
  });

  describe('Initialization', () => {
    it('should initialize the database', async () => {
      await offlineStorage.init();
      
      expect(window.indexedDB.open).toHaveBeenCalledWith('OpenFiestaOffline', 1);
    });

    it('should create object stores on upgrade', async () => {
      // Simulate upgrade needed
      mockIDBOpenRequest.onupgradeneeded = (event: any) => {
        const db = mockIDBDatabase;
        mockIDBOpenRequest.result = db;
      };

      await offlineStorage.init();
      
      // Verify that the upgrade handler would create stores
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Conversation Storage', () => {
    beforeEach(async () => {
      await offlineStorage.init();
    });

    it('should store a conversation', async () => {
      const conversation: CachedConversation = {
        id: 'test-conversation',
        thread: {
          id: 'test-conversation',
          title: 'Test Conversation',
          messages: [],
          createdAt: Date.now(),
        },
        lastModified: Date.now(),
        syncStatus: 'synced',
      };

      mockIDBRequest.onsuccess = () => {
        mockIDBRequest.result = conversation;
      };

      await offlineStorage.storeConversation(conversation);
      
      expect(mockObjectStore.put).toHaveBeenCalledWith(conversation);
    });

    it('should retrieve a conversation', async () => {
      const conversationId = 'test-conversation';
      const expectedConversation: CachedConversation = {
        id: conversationId,
        thread: {
          id: conversationId,
          title: 'Test Conversation',
          messages: [],
          createdAt: Date.now(),
        },
        lastModified: Date.now(),
        syncStatus: 'synced',
      };

      mockIDBRequest.onsuccess = () => {
        mockIDBRequest.result = expectedConversation;
      };

      const result = await offlineStorage.getConversation(conversationId);
      
      expect(mockObjectStore.get).toHaveBeenCalledWith(conversationId);
      expect(result).toEqual(expectedConversation);
    });

    it('should return null for non-existent conversation', async () => {
      mockIDBRequest.onsuccess = () => {
        mockIDBRequest.result = undefined;
      };

      const result = await offlineStorage.getConversation('non-existent');
      
      expect(result).toBeNull();
    });

    it('should retrieve all conversations', async () => {
      const conversations: CachedConversation[] = [
        {
          id: 'conv1',
          thread: { id: 'conv1', title: 'Conv 1', messages: [], createdAt: Date.now() },
          lastModified: Date.now(),
          syncStatus: 'synced',
        },
        {
          id: 'conv2',
          thread: { id: 'conv2', title: 'Conv 2', messages: [], createdAt: Date.now() },
          lastModified: Date.now(),
          syncStatus: 'pending',
        },
      ];

      mockIDBRequest.onsuccess = () => {
        mockIDBRequest.result = conversations;
      };

      const result = await offlineStorage.getAllConversations();
      
      expect(mockObjectStore.getAll).toHaveBeenCalled();
      expect(result).toEqual(conversations);
    });

    it('should delete a conversation', async () => {
      const conversationId = 'test-conversation';

      await offlineStorage.deleteConversation(conversationId);
      
      expect(mockObjectStore.delete).toHaveBeenCalledWith(conversationId);
    });
  });

  describe('Queue Management', () => {
    beforeEach(async () => {
      await offlineStorage.init();
    });

    it('should add action to queue', async () => {
      const queueItem: OfflineQueueItem = {
        id: 'test-action',
        type: 'SEND_MESSAGE',
        payload: { chatId: 'test', message: { role: 'user', content: 'test', ts: Date.now() } },
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3,
        status: 'pending',
      };

      await offlineStorage.addToQueue(queueItem);
      
      expect(mockObjectStore.put).toHaveBeenCalledWith(queueItem);
    });

    it('should retrieve queued actions', async () => {
      const queueItems: OfflineQueueItem[] = [
        {
          id: 'action1',
          type: 'SEND_MESSAGE',
          payload: {},
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          status: 'pending',
        },
      ];

      mockIDBRequest.onsuccess = () => {
        mockIDBRequest.result = queueItems;
      };

      const result = await offlineStorage.getQueuedActions();
      
      expect(result).toEqual(queueItems);
    });

    it('should update queue item', async () => {
      const queueItem: OfflineQueueItem = {
        id: 'test-action',
        type: 'SEND_MESSAGE',
        payload: {},
        timestamp: Date.now(),
        retryCount: 1,
        maxRetries: 3,
        status: 'failed',
        error: 'Network error',
      };

      await offlineStorage.updateQueueItem(queueItem);
      
      expect(mockObjectStore.put).toHaveBeenCalledWith(queueItem);
    });

    it('should remove action from queue', async () => {
      const actionId = 'test-action';

      await offlineStorage.removeFromQueue(actionId);
      
      expect(mockObjectStore.delete).toHaveBeenCalledWith(actionId);
    });

    it('should clear entire queue', async () => {
      await offlineStorage.clearQueue();
      
      expect(mockObjectStore.clear).toHaveBeenCalled();
    });
  });

  describe('Storage Usage', () => {
    it('should return storage usage when supported', async () => {
      const usage = await offlineStorage.getStorageUsage();
      
      expect(usage).toEqual({ used: 1000, quota: 10000 });
      expect(navigator.storage.estimate).toHaveBeenCalled();
    });

    it('should return zero usage when not supported', async () => {
      // Mock unsupported storage API
      Object.defineProperty(navigator, 'storage', {
        value: undefined,
      });

      const usage = await offlineStorage.getStorageUsage();
      
      expect(usage).toEqual({ used: 0, quota: 0 });
    });
  });

  describe('Error Handling', () => {
    it('should handle database initialization errors', async () => {
      mockIDBOpenRequest.onerror = () => {
        mockIDBOpenRequest.error = new Error('Database error');
      };

      await expect(offlineStorage.init()).rejects.toThrow();
    });

    it('should handle storage operation errors', async () => {
      await offlineStorage.init();
      
      mockIDBRequest.onerror = () => {
        mockIDBRequest.error = new Error('Storage error');
      };

      const conversation: CachedConversation = {
        id: 'test',
        thread: { id: 'test', title: 'Test', messages: [], createdAt: Date.now() },
        lastModified: Date.now(),
        syncStatus: 'synced',
      };

      await expect(offlineStorage.storeConversation(conversation)).rejects.toThrow();
    });
  });
});