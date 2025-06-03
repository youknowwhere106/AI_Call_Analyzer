'use client'

import { useState } from 'react'
import AudioUploader from '@/components/AudioUploader/AudioUploader'
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer'
import ProcessButton from '@/components/ProcessButton/ProcessButton'
import ResultsDisplay from '@/components/ResultsDisplay/ResultsDisplay'
import { AudioFile, AnalysisResult, ProcessingState } from '@/types'

export default function Home() {
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: ''
  })

  const handleFileUpload = (file: AudioFile) => {
    setAudioFile(file)
    setAnalysisResult(null)
  }

  const handleProcess = async () => {
    if (!audioFile) return

    setProcessingState({
      isProcessing: true,
      progress: 0,
      stage: 'Uploading file...'
    })

    try {
      const formData = new FormData()
      formData.append('audio', audioFile.file)

      setProcessingState(prev => ({ ...prev, progress: 25, stage: 'Transcribing audio...' }))

      const response = await fetch('/api/analyze-call', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      setProcessingState(prev => ({ ...prev, progress: 75, stage: 'Analyzing content...' }))

      const result: AnalysisResult = await response.json()
      
      setProcessingState(prev => ({ ...prev, progress: 100, stage: 'Complete!' }))
      setAnalysisResult(result)

    } catch (error) {
      console.error('Processing error:', error)
      alert('Failed to process audio file')
    } finally {
      setTimeout(() => {
        setProcessingState({
          isProcessing: false,
          progress: 0,
          stage: ''
        })
      }, 1000)
    }
  }

  return (
    <div className="container">
      <header className="main-header">
        <h1>Call Recording Analyzer</h1>
        <p>Upload and analyze call recordings with AI-powered insights</p>
      </header>

      <main>
        <AudioUploader onFileUpload={handleFileUpload} />
        
        {audioFile && (
          <AudioPlayer audioFile={audioFile} />
        )}

        {audioFile && (
          <ProcessButton 
            onProcess={handleProcess}
            processingState={processingState}
            disabled={processingState.isProcessing}
          />
        )}

        {analysisResult && (
          <ResultsDisplay result={analysisResult} />
        )}
      </main>
    </div>
  )
}
