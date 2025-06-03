import { AnalysisResult, INPUT_TYPES } from '@/types'

// Define scoring parameters according to your specification
const SCORING_PARAMETERS = {
  greeting: {
    type: INPUT_TYPES.PASS_FAIL,
    weight: 5,
    description: "Call opening within 5 seconds"
  },
  collectionUrgency: {
    type: INPUT_TYPES.SCORE,
    weight: 15,
    description: "Create urgency, cross-questioning"
  },
  rebuttalCustomerHandling: {
    type: INPUT_TYPES.SCORE,
    weight: 15,
    description: "Address penalties, objections"
  },
  callEtiquette: {
    type: INPUT_TYPES.SCORE,
    weight: 15,
    description: "Tone, empathy, clear speech"
  },
  callDisclaimer: {
    type: INPUT_TYPES.PASS_FAIL,
    weight: 5,
    description: "Take permission before ending"
  },
  correctDisposition: {
    type: INPUT_TYPES.PASS_FAIL,
    weight: 10,
    description: "Use correct category with remark"
  },
  callClosing: {
    type: INPUT_TYPES.PASS_FAIL,
    weight: 5,
    description: "Thank the customer properly"
  },
  fatalIdentification: {
    type: INPUT_TYPES.PASS_FAIL,
    weight: 5,
    description: "Missing agent/customer info"
  },
  fatalTapeDiscloser: {
    type: INPUT_TYPES.PASS_FAIL,
    weight: 10,
    description: "Inform customer about recording"
  },
  fatalToneLanguage: {
    type: INPUT_TYPES.PASS_FAIL,
    weight: 15,
    description: "No abusive or threatening speech"
  }
}

export async function evaluateCallPerformance(transcription: string): Promise<Omit<AnalysisResult, 'transcription'>> {
  try {
    console.log('Analyzing transcription with proper call evaluation parameters...')
    return analyzeWithKeywords(transcription)
  } catch (error) {
    console.error('Scoring error:', error)
    return getDefaultScoring()
  }
}

function analyzeWithKeywords(transcription: string): Omit<AnalysisResult, 'transcription'> {
  const text = transcription.toLowerCase()
  
  // Analyze based on the correct parameters
  const scores = {
    greeting: calculateGreetingScore(text),
    collectionUrgency: calculateCollectionUrgencyScore(text),
    rebuttalCustomerHandling: calculateRebuttalHandlingScore(text),
    callEtiquette: calculateCallEtiquetteScore(text),
    callDisclaimer: calculateCallDisclaimerScore(text),
    correctDisposition: calculateCorrectDispositionScore(text),
    callClosing: calculateCallClosingScore(text),
    fatalIdentification: calculateIdentificationScore(text),
    fatalTapeDiscloser: calculateTapeDisclosureScore(text),
    fatalToneLanguage: calculateToneLanguageScore(text)
  }

  return {
    scores,
    overallFeedback: generateDetailedFeedback(scores, text),
    observation: generateDetailedObservation(text)
  }
}

// PASS_FAIL parameters (0 or full weight)
function calculateGreetingScore(text: string): number {
  const hasGreeting = text.includes('नमस्ते') || text.includes('good morning') || 
                     text.includes('good afternoon') || text.includes('hello') ||
                     text.includes('धन्यवाद') || text.includes('thank you for calling') ||
                     text.includes('agent:') || text.includes('एजेंट:')
  
  return hasGreeting ? 5 : 0
}

function calculateCallDisclaimerScore(text: string): number {
  const hasDisclaimer = text.includes('permission') || text.includes('अनुमति') ||
                       text.includes('कुछ और') || text.includes('anything else') ||
                       text.includes('और कोई') || text.includes('कोई और सवाल') ||
                       text.includes('कुछ और मदद')
  
  return hasDisclaimer ? 5 : 0
}

function calculateCorrectDispositionScore(text: string): number {
  const hasDisposition = text.includes('payment plan') || text.includes('भुगतान योजना') ||
                        text.includes('resolved') || text.includes('हल') ||
                        text.includes('agreement') || text.includes('समझौता') ||
                        text.includes('settlement') || text.includes('निपटान')
  
  return hasDisposition ? 10 : 0
}

function calculateCallClosingScore(text: string): number {
  const hasClosing = text.includes('धन्यवाद') || text.includes('thank you') ||
                    text.includes('आपका दिन शुभ हो') || text.includes('have a great day') ||
                    text.includes('स्वागत') || text.includes('welcome') ||
                    text.includes('कॉल करने के लिए धन्यवाद')
  
  return hasClosing ? 5 : 0
}

function calculateIdentificationScore(text: string): number {
  const hasIdentification = text.includes('मैं') || text.includes('this is') ||
                           text.includes('speaking') || text.includes('बात कर रहे हैं') ||
                           text.includes('से बात') || text.includes('collections') ||
                           text.includes('agent:') || text.includes('एजेंट:')
  
  return hasIdentification ? 5 : 0
}

function calculateTapeDisclosureScore(text: string): number {
  const hasTapeDisclosure = text.includes('recording') || text.includes('रिकॉर्ड') ||
                           text.includes('recorded') || text.includes('tape') ||
                           text.includes('monitor') || text.includes('निगरानी') ||
                           text.includes('रिकॉर्डिंग')
  
  return hasTapeDisclosure ? 10 : 0
}

function calculateToneLanguageScore(text: string): number {
  const hasAbusiveLanguage = text.includes('stupid') || text.includes('idiot') ||
                            text.includes('damn') || text.includes('threat') ||
                            text.includes('मूर्ख') || text.includes('बेवकूफ') ||
                            text.includes('गधा') || text.includes('बदमाश')
  
  return hasAbusiveLanguage ? 0 : 15
}

// SCORE parameters (0 to full weight)
function calculateCollectionUrgencyScore(text: string): number {
  let score = 0
  
  if (text.includes('outstanding') || text.includes('बकाया')) score += 3
  if (text.includes('urgent') || text.includes('तुरंत') || text.includes('जल्दी')) score += 4
  if (text.includes('payment') || text.includes('भुगतान')) score += 3
  if (text.includes('consequences') || text.includes('परिणाम')) score += 3
  if (text.includes('deadline') || text.includes('समय सीमा')) score += 2
  
  return Math.min(score, 15)
}

function calculateRebuttalHandlingScore(text: string): number {
  let score = 0
  
  if (text.includes('penalty') || text.includes('जुर्माना')) score += 4
  if (text.includes('objection') || text.includes('आपत्ति')) score += 3
  if (text.includes('concern') || text.includes('चिंता')) score += 3
  if (text.includes('solution') || text.includes('समाधान')) score += 3
  if (text.includes('address') || text.includes('संबोधित')) score += 2
  
  return Math.min(score, 15)
}

function calculateCallEtiquetteScore(text: string): number {
  let score = 5 // Base score
  
  if (text.includes('please') || text.includes('कृपया')) score += 2
  if (text.includes('understand') || text.includes('समझ')) score += 2
  if (text.includes('help') || text.includes('मदद')) score += 2
  if (text.includes('appreciate') || text.includes('सराहना')) score += 2
  if (text.includes('sorry') || text.includes('माफ करें')) score += 2
  
  return Math.min(score, 15)
}

function generateDetailedFeedback(scores: Record<string, number>, text: string): string {
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const maxScore = 105 // Sum of all maximum scores
  const percentage = (totalScore / maxScore) * 100

  let feedback = ""
  
  if (percentage >= 80) {
    feedback = "उत्कृष्ट प्रदर्शन! एजेंट ने मजबूत पेशेवर कौशल का प्रदर्शन किया और सकारात्मक परिणाम प्राप्त किया। "
  } else if (percentage >= 60) {
    feedback = "अच्छा प्रदर्शन लेकिन सुधार की गुंजाइश है। एजेंट ने कॉल को पेशेवर तरीके से संभाला लेकिन कुछ क्षेत्रों को बेहतर बनाया जा सकता है। "
  } else {
    feedback = "प्रदर्शन में सुधार की आवश्यकता है। एजेंट को बेहतर संचार और समाधान कौशल विकसित करने पर ध्यान देना चाहिए। "
  }

  // Add specific feedback based on scores
  if (scores.greeting === 0) feedback += "उचित अभिवादन और परिचय में सुधार करें। "
  if (scores.fatalTapeDiscloser === 0) feedback += "कॉल रिकॉर्डिंग के बारे में ग्राहक को सूचित करना आवश्यक है। "
  if (scores.callEtiquette < 8) feedback += "ग्राहक की स्थिति के प्रति अधिक सहानुभूति और समझ दिखाएं। "
  if (scores.collectionUrgency < 8) feedback += "भुगतान की तात्कालिकता को अधिक प्रभावी रूप से संप्रेषित करें। "

  return feedback.trim()
}

function generateDetailedObservation(text: string): string {
  let observations = []

  if (text.includes('payment plan') || text.includes('भुगतान योजना')) {
    observations.push("भुगतान योजना पर चर्चा की गई और सहमति बनी")
  }
  if (text.includes('cooperative') || text.includes('सहयोग')) {
    observations.push("ग्राहक पूरी कॉल के दौरान सहयोगी रहा")
  }
  if (text.includes('concern') || text.includes('चिंता')) {
    observations.push("ग्राहक की चिंताओं को संबोधित किया गया")
  }
  if (text.includes('satisfied') || text.includes('संतुष्ट')) {
    observations.push("कॉल सकारात्मक नोट पर समाप्त हुई")
  }
  if (text.includes('agent:') && text.includes('customer:')) {
    observations.push("स्पीकर डायराइज़ेशन उपलब्ध - एजेंट और ग्राहक की पहचान की गई")
  }

  return observations.length > 0 ? observations.join('. ') + '.' : 
         "मानक कलेक्शन कॉल जिसमें सामान्य ग्राहक इंटरैक्शन पैटर्न देखे गए।"
}

function getDefaultScoring(): Omit<AnalysisResult, 'transcription'> {
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
    overallFeedback: "कॉल विश्लेषण डिफ़ॉल्ट स्कोरिंग पैरामीटर का उपयोग करके पूरा किया गया।",
    observation: "विस्तृत विश्लेषण करने में असमर्थ। डिफ़ॉल्ट स्कोरिंग लागू की गई।"
  }
}
