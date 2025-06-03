'use client'

import { useRef, useState } from 'react'
import { AudioFile } from '@/types'
import { validateAudioFile } from '@/utils/file-validation'
import styles from './AudioUploader.module.css'

interface AudioUploaderProps {
  onFileUpload: (file: AudioFile) => void
}

export default function AudioUploader({ onFileUpload }: AudioUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const validation = validateAudioFile(file)
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setError(null)
    const audioFile: AudioFile = {
      file,
      url: URL.createObjectURL(file)
    }
    
    onFileUpload(audioFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={styles.uploadIcon}>🎵</div>
        <h3>Upload Call Recording</h3>
        <p>Drag and drop your .mp3 or .wav file here, or click to browse</p>
        <button className={styles.browseButton}>Browse Files</button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
      />

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  )
}
