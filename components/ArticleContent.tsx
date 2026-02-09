import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface ArticleContentProps {
  content: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ content }) => {
  // Convert HTML to Markdown for better rendering
  const htmlToMarkdown = (html: string): string => {
    return html
      .replace(/<p>/g, '\n')
      .replace(/<\/p>/g, '\n')
      .replace(/<strong>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<em>/g, '*')
      .replace(/<\/em>/g, '*')
      .replace(/<h2>/g, '## ')
      .replace(/<\/h2>/g, '\n')
      .replace(/<h3>/g, '### ')
      .replace(/<\/h3>/g, '\n')
      .replace(/<ul>/g, '')
      .replace(/<\/ul>/g, '\n')
      .replace(/<li>/g, '- ')
      .replace(/<\/li>/g, '\n')
      .replace(/<blockquote>/g, '> ')
      .replace(/<\/blockquote>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
      .trim();
  };

  const markdownContent = htmlToMarkdown(content);

  return (
    <div className="prose prose-lg max-w-none font-serif leading-relaxed">
      <ReactMarkdown 
        rehypePlugins={[rehypeRaw]}
        components={{
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 border-l-4 border-red-600 pl-4" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-4 text-gray-700 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-4 ml-6 list-disc space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-700" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-6 text-gray-600" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-900" {...props} />
          )
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default ArticleContent;