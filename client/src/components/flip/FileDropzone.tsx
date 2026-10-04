import { useRef, useState } from 'react'
import { FileUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  maxSizeMB?: number
  onFile: (file: File) => void
  onError?: (message: string) => void
}

export function FileDropzone({ maxSizeMB = 10, onFile, onError }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handle = (file?: File) => {
    if (!file) return
    if (file.type !== 'application/pdf') return onError?.('Only PDF files are supported.')
    if (file.size > maxSizeMB * 1024 * 1024) return onError?.(`File is larger than ${maxSizeMB} MB.`)
    onFile(file)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handle(e.dataTransfer.files[0])
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        dragging ? 'border-primary bg-primary/5' : 'hover:bg-accent',
      )}
    >
      <FileUp className="size-8 text-muted-foreground" aria-hidden />
      <p className="font-medium">Drop a PDF here or click to browse</p>
      <p className="text-sm text-muted-foreground">Up to {maxSizeMB} MB · text-based PDFs only</p>
      <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  )
}
