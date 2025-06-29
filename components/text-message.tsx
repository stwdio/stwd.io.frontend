'use client'

interface TextMessageProps {
  content: string
  senderName: string
  timestamp: string
  isOwn?: boolean
}

export function TextMessage({ 
  content, 
  senderName, 
  timestamp,
  isOwn = false 
}: TextMessageProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <div 
          className={`p-3 rounded-lg shadow-sm ${
            isOwn 
              ? 'bg-blue-600 text-white ml-8' 
              : 'bg-white border border-gray-200 text-gray-900 mr-8'
          }`}
        >
          <p className="text-sm leading-relaxed">
            {content}
          </p>
        </div>
        <div className={`mt-2 text-xs text-gray-500 ${isOwn ? 'text-right' : 'text-left'}`}>
          <span className="font-medium">{senderName}</span>
          <span className="mx-1">•</span>
          <span>
            {new Date(timestamp).toLocaleDateString()} at {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  )
} 