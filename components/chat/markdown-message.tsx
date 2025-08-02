'use client'

import React from 'react'

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  // Simple markdown parsing for common elements
  const parseMarkdown = (text: string): React.ReactNode => {
    // Split by line breaks to handle line-by-line parsing
    const lines = text.split('\n')
    
    return lines.map((line, lineIndex) => {
      // Check for headers
      if (line.startsWith('### ')) {
        return <h3 key={lineIndex} className="font-semibold text-base mt-2 mb-1">{line.substring(4)}</h3>
      }
      if (line.startsWith('## ')) {
        return <h2 key={lineIndex} className="font-semibold text-lg mt-3 mb-2">{line.substring(3)}</h2>
      }
      if (line.startsWith('# ')) {
        return <h1 key={lineIndex} className="font-bold text-xl mt-4 mb-2">{line.substring(2)}</h1>
      }
      
      // Check for bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={lineIndex} className="ml-4 list-disc">
            {parseInlineMarkdown(line.substring(2))}
          </li>
        )
      }
      
      // Check for numbered lists
      const numberedMatch = line.match(/^(\d+)\.\s(.+)/)
      if (numberedMatch) {
        return (
          <li key={lineIndex} className="ml-4 list-decimal">
            {parseInlineMarkdown(numberedMatch[2])}
          </li>
        )
      }
      
      // Empty line = paragraph break
      if (line.trim() === '') {
        return <br key={lineIndex} />
      }
      
      // Regular paragraph
      return (
        <span key={lineIndex}>
          {parseInlineMarkdown(line)}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      )
    })
  }
  
  // Parse inline markdown elements
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Bold text
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>')
    
    // Italic text
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>')
    
    // Code blocks
    text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    
    // Parse HTML safely
    return <span dangerouslySetInnerHTML={{ __html: text }} />
  }
  
  return (
    <div className={`${className} space-y-1`}>
      {parseMarkdown(content)}
    </div>
  )
}