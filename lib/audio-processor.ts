import { createClient } from '@deepgram/sdk'
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
      scores: {
        greeting: 0,
        collectionUrgency: 0,
        rebuttalCustomerHandling: 0,
        callEtiquette: 0,
        callDisclaimer: 0,
        correctDisposition: 0,
        callClosing: 0,
        fatalIdentification: 0,
        fatalTapeDiscloser: 0,
        fatalToneLanguage: 0
      },
      overallFeedback: 'विश्लेषण विफल हो गया। कृपया दूसरी ऑडियो फाइल के साथ पुनः प्रयास करें।',
      observation: 'ट्रांसक्रिप्शन त्रुटि के कारण विश्लेषण पूरा नहीं हो सका।',
      transcription: `ट्रांसक्रिप्शन विफल। त्रुटि: ${error instanceof Error ? error.message : 'अज्ञात त्रुटि'}`
    }
  }
}

async function transcribeWithDeepgram(audioFile: File): Promise<string> {
  console.log('Starting Deepgram transcription for Hindi audio...')
  console.log(`File name: ${audioFile.name}`)
  console.log(`File size: ${(audioFile.size / 1024 / 1024).toFixed(2)} MB`)
  console.log(`File type: ${audioFile.type}`)
  
  // Try multiple strategies for Hindi transcription
  const strategies = [
    {
      name: "Enhanced General Model",
      options: {
        model: 'general',
        tier: 'enhanced',
        language: 'hi',
        smart_format: true,
        punctuate: true,
        diarize: true,
        utterances: true
      }
    },
    {
      name: "General Model",
      options: {
        model: 'general',
        language: 'hi',
        smart_format: true,
        punctuate: true,
        diarize: true
      }
    },
    {
      name: "Nova-2 Simplified",
      options: {
        model: 'nova-2',
        language: 'hi',
        smart_format: true,
        punctuate: true
      }
    },
    {
      name: "Auto-detect Language",
      options: {
        model: 'general',
        detect_language: true,
        smart_format: true,
        punctuate: true,
        diarize: true
      }
    }
  ]
  
  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i]
    console.log(`\nTrying strategy ${i + 1}/${strategies.length}: ${strategy.name}`)
    
    try {
      const result = await attemptTranscription(audioFile, strategy.options)
      if (result && result.trim().length > 0) {
        console.log(`Success with strategy: ${strategy.name}`)
        return result
      } else {
        console.log(`Strategy ${strategy.name} returned empty result`)
      }
    } catch (error) {
      console.error(`Strategy ${strategy.name} failed:`, error.message)
      
      // If it's an auth error, don't try other strategies
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        throw error
      }
    }
  }
  
  throw new Error('All transcription strategies failed. Please check your audio file quality and format.')
}

async function attemptTranscription(audioFile: File, options: any): Promise<string> {
  try {
    console.log('Deepgram options:', JSON.stringify(options, null, 2))
    
    // Convert File to Buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    console.log('Sending audio to Deepgram...')
    
    // Send audio to Deepgram for transcription
    const response = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      options
    )
    
    console.log('Deepgram response received')
    
    // Log the full response structure for debugging
    if (response && response.result) {
      console.log('Response result exists')
      console.log('Results structure:', JSON.stringify(response.result, null, 2))
    } else {
      console.log('Response or result is null/undefined')
      console.log('Full response:', JSON.stringify(response, null, 2))
      throw new Error('No response or result from Deepgram API')
    }
    
    // Extract transcription from response
    const results = response.result?.results
    if (!results) {
      throw new Error('No results field in Deepgram response')
    }
    
    if (!results.channels || results.channels.length === 0) {
      throw new Error('No channels in Deepgram response')
    }
    
    const channel = results.channels[0]
    if (!channel.alternatives || channel.alternatives.length === 0) {
      throw new Error('No alternatives in Deepgram response')
    }
    
    const transcript = channel.alternatives[0]?.transcript
    
    if (!transcript || transcript.trim().length === 0) {
      // Check if there are any words in the response
      const words = channel.alternatives[0]?.words
      if (words && words.length > 0) {
        // Extract transcript from words if main transcript is empty
        const extractedTranscript = words.map(word => word.word).join(' ')
        if (extractedTranscript.trim().length > 0) {
          console.log('Extracted transcript from words array')
          return formatTranscriptBasic(extractedTranscript)
        }
      }
      throw new Error('Empty transcription received from Deepgram')
    }
    
    console.log(`Raw transcription successful (${transcript.length} characters):`)
    console.log(transcript.substring(0, 300) + '...')
    
    // Check if we have speaker diarization data
    let formattedTranscript = transcript
    const utterances = results.utterances
    
    if (utterances && utterances.length > 0) {
      console.log(`Speaker diarization available with ${utterances.length} utterances`)
      formattedTranscript = formatTranscriptWithSpeakers(utterances)
    } else {
      console.log('No speaker diarization available, using basic formatting')
      formattedTranscript = formatTranscriptBasic(transcript)
    }
    
    console.log('Final formatted transcript:')
    console.log(formattedTranscript.substring(0, 500) + '...')
    
    return formattedTranscript
    
  } catch (error) {
    console.error('Transcription attempt error:', error)
    throw error
  }
}

function formatTranscriptWithSpeakers(utterances: any[]): string {
  let formattedText = ''
  let currentSpeaker = -1
  
  utterances.forEach((utterance, index) => {
    const speakerNum = utterance.speaker
    let speakerLabel = speakerNum === 0 ? 'Agent' : 'Customer'
    
    const text = utterance.transcript?.trim()
    const confidence = utterance.confidence || 0
    
    // Only include utterances with reasonable confidence and meaningful content
    if (confidence > 0.3 && text && text.length > 2) {
      // Add speaker label if speaker changed
      if (speakerNum !== currentSpeaker) {
        if (formattedText.length > 0) {
          formattedText += '\n\n'
        }
        formattedText += `${speakerLabel}: `
        currentSpeaker = speakerNum
      } else {
        formattedText += ' '
      }
      
      formattedText += text
    }
  })
  
  return formattedText.trim()
}

function formatTranscriptBasic(transcript: string): string {
  // Basic formatting when no speaker diarization is available
  const sentences = transcript.split(/[।.!?]+/).filter(s => s.trim().length > 0)
  
  let formatted = ''
  sentences.forEach((sentence, index) => {
    const cleanSentence = sentence.trim()
    if (cleanSentence.length > 0) {
      // Simple alternating pattern for agent/customer
      const speaker = index % 2 === 0 ? 'Agent' : 'Customer'
      formatted += `${speaker}: ${cleanSentence}\n\n`
    }
  })
  
  return formatted.trim() || transcript // Return original if formatting fails
}
