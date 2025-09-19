import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
// FIX: Import missing section data type.
import { MarkdownSectionData } from '../../constants';
// FIX: Changed import to be a named import for the new Editable component.
import { Editable } from '../ui/Editable';

interface MarkdownSectionProps {
  data: MarkdownSectionData;
  onUpdate: (data: Partial<MarkdownSectionData>) => void;
  isEditable?: boolean;
}

const MarkdownSection: React.FC<MarkdownSectionProps> = ({ data, onUpdate, isEditable = true }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <Editable value={data.title} onChange={value => onUpdate({ title: value })} isEditable={isEditable} />
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isEditable ? (
          <textarea
            value={data.markdown}
            onChange={e => onUpdate({ markdown: e.target.value })}
            className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm resize-y focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            placeholder="Enter Markdown here..."
          />
        ) : <div/>}

        <div className={`prose max-w-none p-4 border border-gray-200 rounded-md bg-gray-50 h-96 overflow-y-auto ${!isEditable ? 'col-span-2' : ''}`}>
          <ReactMarkdown
            children={data.markdown}
            remarkPlugins={[remarkGfm]}
            components={{
              // FIX: Add 'any' type to props to fix type error with 'inline' property.
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, '')}
                    // FIX: Cast style to 'any' to fix type mismatch error.
                    style={materialDark as any}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MarkdownSection;