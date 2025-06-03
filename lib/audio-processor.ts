import { createClient } from '@deepgram/sdk'
import fs from 'fs'
import path from 'path'
import { AnalysisResult } from '@/types'
import { evaluateCallPerformance } from './scoring-engine'

// Initialize Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY!)

export async function analyzeCallRecording(audioFile: File): Promise<AnalysisResult> {
  try {
    // Step 1: Transcribe audio using Deepgram
    const transcription = await transcribeWithDeepgram(audioFile)
    
    // Step 2: Analyze the transcription for call quality metrics
    const analysis = await evaluateCallPerformance(transcription)
    
    return {
      ...analysis,
      transcription
    }
  } catch (error) {
    console.error('Audio processing error:', error)
    
    // Return error message instead of mock analysis
    return {
      scores: {},
      overallFeedback: 'Analysis failed due to transcription error.',
      observation: 'Analysis could not be completed because transcription failed.',
      transcription: 'Transcription failed. Please try again with a different audio file.'
    }
  }
}

async function transcribeWithDeepgram(audioFile: File): Promise<string> {
  try {
    console.log('Starting Deepgram transcription for Hindi audio...')
    console.log(`File size: ${(audioFile.size / 1024 / 1024).toFixed(2)} MB`)
    
    // Convert File to Buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    
    // Configure Deepgram options for Hindi audio
    const options = {
      model: 'nova-2',
      language: 'hi', // Hindi language
      smart_format: true,
      punctuate: true,
      diarize: true, // Speaker separation
      utterances: true,
      detect_language: false, // We know it's Hindi
      encoding: audioFile.type.includes('wav') ? 'linear16' : 'mp3',
      sample_rate: 16000
    }
    
    console.log('Sending audio to Deepgram...')
    
    // Send audio to Deepgram for transcription
    const response = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      options
    )
    
    console.log('Deepgram response received')
    
    // Extract transcription from response
    const transcript = response.result?.results?.channels?.[0]?.alternatives?.[0]?.transcript
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('No transcription received from Deepgram')
    }
    
    console.log(`Transcription successful (${transcript.length} characters):`, transcript.substring(0, 200) + '...')
    
    // If diarization is available, format with speaker labels
    let formattedTranscript = transcript
    const utterances = response.result?.results?.utterances
    
    if (utterances && utterances.length > 0) {
      console.log('Speaker diarization available, formatting transcript...')
      formattedTranscript = formatTranscriptWithSpeakers(utterances)
    }
    
    return formattedTranscript
    
  } catch (error) {
    console.error('Deepgram transcription error:', error)
    throw error
  }
}

function formatTranscriptWithSpeakers(utterances: any[]): string {
  let formattedText = ''
  
  utterances.forEach((utterance, index) => {
    const speaker = utterance.speaker === 0 ? 'Agent' : 'Customer'
    const text = utterance.transcript
    const confidence = utterance.confidence
    
    // Only include utterances with reasonable confidence
    if (confidence > 0.5) {
      formattedText += `${speaker}: ${text}\n\n`
    }
  })
  
  return formattedText.trim()
}
