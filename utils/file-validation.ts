interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateAudioFile(file: File): ValidationResult {
  // Check file type
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3']
  const allowedExtensions = ['.mp3', '.wav']
  
  const hasValidType = allowedTypes.includes(file.type)
  const hasValidExtension = allowedExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  )

  if (!hasValidType && !hasValidExtension) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload MP3 or WAV files only.'
    }
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024 // 50MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File too large. Maximum size allowed is 50MB.'
    }
  }

  // Check minimum file size (at least 1KB)
  if (file.size < 1024) {
    return {
      isValid: false,
      error: 'File too small. Please upload a valid audio file.'
    }
  }

  return { isValid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    })
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio file'))
    })
    
    audio.src = url
  })
}
