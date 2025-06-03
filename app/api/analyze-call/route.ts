import { NextRequest, NextResponse } from 'next/server'
import { analyzeCallRecording } from '@/lib/audio-processor'
import { AnalysisResult } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3']
    if (!allowedTypes.includes(audioFile.type) && 
        !audioFile.name.toLowerCase().match(/\.(mp3|wav)$/)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP3 and WAV files are supported.' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Process the audio file
    const result: AnalysisResult = await analyzeCallRecording(audioFile)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze audio file' },
      { status: 500 }
    )
  }
}

