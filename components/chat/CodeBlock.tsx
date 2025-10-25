import { useTheme } from '@/lib/themeContext';
import hljs from 'highlight.js';
import { useEffect } from 'react';

export default function CodeBlock({ code, className }: { code: string; className?: string }) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  useEffect(() => {
    hljs.highlightAll();
  }, [code, isDark]);

  return (
    <pre className={`${className} hljs ${isDark ? 'dark' : 'light'}`}>
      <code>{code}</code>
    </pre>
  );
}
