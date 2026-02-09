import React from 'react';

interface SafeHTMLRendererProps {
  html: string;
  className?: string;
}

const SafeHTMLRenderer: React.FC<SafeHTMLRendererProps> = ({ html, className = '' }) => {
  // Clean and format the HTML
  const cleanHTML = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
};

export default SafeHTMLRenderer;