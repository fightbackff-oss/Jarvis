import React, { useState } from 'react';
import { Check, Copy, Eye, Code as CodeIcon, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [mode, setMode] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState(false);

  // Determine if the code is previewable (HTML or SVG)
  const isPreviewable = ['html', 'svg', 'xml'].includes(language.toLowerCase());

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden my-3 bg-white shadow-sm font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
           <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
             <Terminal className="w-3 h-3" />
             {language || 'text'}
           </span>
        </div>
        
        <div className="flex items-center gap-2">
          {isPreviewable && (
            <div className="flex bg-slate-200/50 rounded-lg p-0.5 border border-slate-200/50">
               <button
                  onClick={() => setMode('code')}
                  className={`p-1 px-2 rounded-md transition-all text-xs font-medium flex items-center gap-1 ${
                    mode === 'code' 
                      ? 'bg-white shadow-sm text-slate-700' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="View Code"
               >
                 <CodeIcon className="w-3 h-3" />
                 Code
               </button>
               <button
                  onClick={() => setMode('preview')}
                  className={`p-1 px-2 rounded-md transition-all text-xs font-medium flex items-center gap-1 ${
                    mode === 'preview' 
                      ? 'bg-white shadow-sm text-indigo-600' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Live Preview"
               >
                 <Eye className="w-3 h-3" />
                 Preview
               </button>
            </div>
          )}
          
          <button 
            onClick={handleCopy} 
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors ml-2"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {mode === 'code' ? (
        <div className="relative group">
          <div className="p-4 overflow-x-auto bg-[#0d1117] text-slate-300 font-mono text-sm leading-relaxed scrollbar-hide">
            {/* Simple syntax highlighting simulation via regex could go here, 
                but for now we stick to clean monospaced text preservation */}
            <pre className="whitespace-pre">{code}</pre>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
          <iframe
            srcDoc={code}
            className="w-full h-[400px] border-none"
            title="Preview"
            sandbox="allow-scripts"
          />
        </div>
      )}
    </div>
  );
};