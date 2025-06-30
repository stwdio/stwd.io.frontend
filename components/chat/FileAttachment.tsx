import React, { useState, useRef, useCallback } from 'react'
import { Paperclip, X, FileText, Image as ImageIcon, Video, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface FileAttachmentProps {
  onFilesSelected: (files: File[]) => void
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

interface FilePreview {
  file: File
  url: string
  type: 'image' | 'document' | 'video' | 'audio'
}

export function FileAttachment({
  onFilesSelected,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', 'video/*', 'audio/*'],
  className
}: FileAttachmentProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileType = (file: File): 'image' | 'document' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    return 'document'
  }

  const getFileIcon = (type: 'image' | 'document' | 'video' | 'audio') => {
    switch (type) {
      case 'image': return ImageIcon
      case 'video': return Video
      case 'audio': return Music
      default: return FileText
    }
  }

  const createFilePreview = useCallback((file: File): FilePreview => {
    const type = getFileType(file)
    let url = ''
    
    if (type === 'image') {
      url = URL.createObjectURL(file)
    }
    
    return { file, url, type }
  }, [])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return

    const validFiles: File[] = []
    const newPreviews: FilePreview[] = []

    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`)
        return
      }

      validFiles.push(file)
      newPreviews.push(createFilePreview(file))
    })

    if (validFiles.length > 0) {
      setPreviews(prev => [...prev, ...newPreviews])
      onFilesSelected(validFiles)
    }
  }, [maxFileSize, createFilePreview, onFilesSelected])

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const updated = [...prev]
      const removed = updated.splice(index, 1)[0]
      if (removed.url) {
        URL.revokeObjectURL(removed.url)
      }
      return updated
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="mb-1"
        onClick={handleFileSelect}
        type="button"
      >
        <Paperclip className="h-5 w-5" />
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Drag and Drop Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="border-2 border-dashed border-primary rounded-lg p-8 bg-background/90">
              <div className="text-center">
                <Paperclip className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Drop files here</h3>
                <p className="text-sm text-muted-foreground">
                  Maximum file size: {maxFileSize}MB
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Previews */}
      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-12 left-0 right-0 p-2 bg-background border rounded-lg shadow-lg max-h-32 overflow-y-auto"
          >
            <div className="space-y-2">
              {previews.map((preview, index) => {
                const Icon = getFileIcon(preview.type)
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2 p-2 bg-muted rounded"
                  >
                    {preview.type === 'image' && preview.url ? (
                      <img
                        src={preview.url}
                        alt={preview.file.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    ) : (
                      <Icon className="w-8 h-8 text-muted-foreground" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {preview.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(preview.file.size)}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removePreview(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global drop zone listener */}
      <div
        className="fixed inset-0 pointer-events-none"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  )
} 