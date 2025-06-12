import { AnalysisResult, INPUT_TYPES } from '@/types'

// Define scoring parameters with exact weights from assignment
const SCORING_PARAMETERS = {
  greeting: { type: INPUT_TYPES.PASS_FAIL, weight: 5 },
  collectionUrgency: { type: INPUT_TYPES.SCORE, weight: 15 },
  rebuttalCustomerHandling: { type: INPUT_TYPES.SCORE, weight: 15 },
  callEtiquette: { type: INPUT_TYPES.SCORE, weight: 15 },
  callDisclaimer: { type: INPUT_TYPES.PASS_FAIL, weight: 5 },
  correctDisposition: { type: INPUT_TYPES.PASS_FAIL, weight: 10 },
  callClosing: { type: INPUT_TYPES.PASS_FAIL, weight: 5 },
  fatalIdentification: { type: INPUT_TYPES.PASS_FAIL, weight: 5 },
  fatalTapeDiscloser: { type: INPUT_TYPES.PASS_FAIL, weight: 10 },
  fatalToneLanguage: { type: INPUT_TYPES.PASS_FAIL, weight: 15 }
}

// Score validation function - THIS IS THE KEY FIX
function validateScore(paramKey: string, rawScore: number): number {
  const param = SCORING_PARAMETERS[paramKey]
  if (!param) return 0

  if (param.type === INPUT_TYPES.PASS_FAIL) {
    // PASS_FAIL: only 0 or weight allowed
    return rawScore >= param.weight ? param.weight : 0
  } else if (param.type === INPUT_TYPES.SCORE) {
    // SCORE: any value between 0 and weight
    return Math.max(0, Math.min(param.weight, Math.round(rawScore)))
  }
  
  return 0
}

export async function evaluateCallPerformance(transcription: string): Promise<Omit<AnalysisResult, 'transcription'>> {
  try {
    console.log('Analyzing transcription...')
    return analyzeWithKeywords(transcription)
  } catch (error) {
    console.error('Scoring error:', error)
    return getDefaultScoring()
  }
}

function analyzeWithKeywords(transcription: string): Omit<AnalysisResult, 'transcription'> {
  const text = transcription.toLowerCase()

  // Calculate raw scores first
  const rawScores = {
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

  // Validate all scores against their constraints - THIS IS THE KEY CHANGE
  const validatedScores = {}
  for (const [key, rawScore] of Object.entries(rawScores)) {
    validatedScores[key] = validateScore(key, rawScore)
  }

  return {
    scores: validatedScores, // Use validated scores instead of raw scores
    overallFeedback: generateDetailedFeedback(validatedScores, text),
    observation: generateDetailedObservation(text)
  }
}

// ----- PASS_FAIL SCORING -----

function calculateGreetingScore(text: string): number {
  const hasGreeting = ['नमस्ते', 'good morning', 'good afternoon', 'hello', 'thank you for calling', 'agent:', 'एजेंट:'].some(word => text.includes(word))
  return hasGreeting ? 5 : 0
}

function calculateCallDisclaimerScore(text: string): number {
  const keywords = ['permission', 'अनुमति', 'कुछ और', 'anything else', 'कोई और सवाल', 'कुछ और मदद']
  return keywords.some(word => text.includes(word)) ? 5 : 0
}

function calculateCorrectDispositionScore(text: string): number {
  const keywords = ['payment plan', 'भुगतान योजना', 'resolved', 'हल', 'agreement', 'समझौता', 'settlement', 'निपटान']
  return keywords.some(word => text.includes(word)) ? 10 : 0
}

function calculateCallClosingScore(text: string): number {
  const keywords = ['धन्यवाद', 'thank you', 'आपका दिन शुभ हो', 'have a great day', 'स्वागत', 'कॉल करने के लिए धन्यवाद']
  return keywords.some(word => text.includes(word)) ? 5 : 0
}

function calculateIdentificationScore(text: string): number {
  const keywords = ['मैं', 'this is', 'speaking', 'बात कर रहे हैं', 'से बात', 'collections', 'agent:', 'एजेंट:']
  return keywords.some(word => text.includes(word)) ? 5 : 0
}

function calculateTapeDisclosureScore(text: string): number {
  const keywords = ['recording', 'रिकॉर्ड', 'recorded', 'tape', 'monitor', 'निगरानी']
  return keywords.some(word => text.includes(word)) ? 10 : 0
}

function calculateToneLanguageScore(text: string): number {
  const abusiveWords = ['stupid', 'idiot', 'damn', 'threat', 'मूर्ख', 'बेवकूफ', 'गधा', 'बदमाश']
  const containsAbuse = abusiveWords.some(word => text.includes(word))
  return containsAbuse ? 0 : 15
}

// ----- SCORE SCORING (REMOVED HARDCODED Math.min) -----

function calculateCollectionUrgencyScore(text: string): number {
  let score = 0, indicators = 0
  const conditions = [
    ['outstanding', 'बकाया', 4],
    ['urgent', 'तुरंत', 'जल्दी', 4],
    ['immediate', 'तत्काल', 3],
    ['payment', 'भुगतान', 2],
    ['consequences', 'परिणाम', 2],
    ['deadline', 'समय सीमा', 2],
    ['when can you', 'कब कर सकते हैं', 2],
    ['what prevents', 'क्या रोक रहा है', 2]
  ]

  for (const group of conditions) {
    const weight = group.pop() as number
    if ((group as string[]).some(word => text.includes(word))) {
      score += weight
      indicators++
    }
  }

  if (indicators >= 3) score += 2
  if (indicators >= 5) score += 1

  // Return raw score - validation happens in validateScore()
  return score
}

function calculateRebuttalHandlingScore(text: string): number {
  let score = 0, count = 0
  const phrases = [
    ['penalty', 'जुर्माना', 3],
    ['objection', 'आपत्ति', 3],
    ['concern', 'चिंता', 3],
    ['solution', 'समाधान', 2],
    ['understand your', 'आपकी समझ', 2],
    ['let me explain', 'मैं समझाता हूं', 2],
    ['alternative', 'विकल्प', 2],
    ['payment plan', 'भुगतान योजना', 2],
    ['i understand', 'मैं समझ सकता हूं', 1]
  ]

  for (const group of phrases) {
    const weight = group.pop() as number
    if ((group as string[]).some(word => text.includes(word))) {
      score += weight
      count++
    }
  }

  if (count >= 4) score += 2
  if (count >= 6) score += 1

  // Return raw score - validation happens in validateScore()
  return score
}

function calculateCallEtiquetteScore(text: string): number {
  let score = 3, count = 0
  const goodEtiquette = [
    ['please', 'कृपया', 2],
    ['thank you', 'धन्यवाद', 2],
    ['sorry', 'माफ करें', 1],
    ['understand', 'समझ', 2],
    ['help', 'मदद', 1],
    ['appreciate', 'सराहना', 2],
    ['let me clarify', 'स्पष्ट करता हूं', 2],
    ['in other words', 'दूसरे शब्दों में', 1],
    ['sir', 'madam', 'जी', 1]
  ]

  for (const group of goodEtiquette) {
    const weight = group.pop() as number
    if ((group as string[]).some(word => text.includes(word))) {
      score += weight
      count++
    }
  }

  if (text.includes('but you') || text.includes('लेकिन आप')) score -= 1
  if (text.includes('you must') || text.includes('आपको करना होगा')) score -= 1

  if (count >= 5) score += 2
  if (count >= 7) score += 1

  // Return raw score - validation happens in validateScore()
  return Math.max(0, score)
}

// ----- FEEDBACK & DEFAULTS -----

function generateDetailedFeedback(scores: Record<string, number>, text: string): string {
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const maxScore = Object.values(SCORING_PARAMETERS).reduce((sum, param) => sum + param.weight, 0)
  const percentage = (totalScore / maxScore) * 100

  let feedback = ""
  if (percentage >= 80) feedback = "उत्कृष्ट प्रदर्शन! एजेंट ने मजबूत पेशेवर कौशल का प्रदर्शन किया। "
  else if (percentage >= 60) feedback = "अच्छा प्रदर्शन लेकिन सुधार की गुंजाइश है। "
  else if (percentage >= 40) feedback = "औसत प्रदर्शन। एजेंट को मुख्य क्षेत्रों में सुधार की आवश्यकता है। "
  else feedback = "प्रदर्शन में महत्वपूर्ण सुधार की आवश्यकता है। "

  if (scores.greeting === 0) feedback += "उचित अभिवादन और परिचय में सुधार करें। "
  if (scores.fatalTapeDiscloser === 0) feedback += "कॉल रिकॉर्डिंग के बारे में ग्राहक को सूचित करें। "
  if (scores.callEtiquette < 8) feedback += "ग्राहक की स्थिति के प्रति अधिक सहानुभूति दिखाएं। "
  if (scores.collectionUrgency < 8) feedback += "भुगतान की तात्कालिकता को और स्पष्ट करें। "
  if (scores.rebuttalCustomerHandling < 8) feedback += "ग्राहक की आपत्तियों को बेहतर तरीके से संबोधित करें। "
  if (scores.callClosing === 0) feedback += "कॉल को धन्यवाद के साथ समाप्त करें। "

  return feedback.trim()
}

function generateDetailedObservation(text: string): string {
  const observations = []

  if (text.includes('payment plan') || text.includes('भुगतान योजना')) observations.push("भुगतान योजना पर चर्चा की गई")
  if (text.includes('cooperative') || text.includes('सहयोग')) observations.push("ग्राहक सहयोगी था")
  if (text.includes('concern') || text.includes('चिंता')) observations.push("चिंताओं को संबोधित किया गया")
  if (text.includes('satisfied') || text.includes('संतुष्ट')) observations.push("कॉल संतोषजनक रही")
  if (text.includes('agent:') && text.includes('customer:')) observations.push("एजेंट और ग्राहक की पहचान हुई")

  return observations.length ? observations.join('. ') + '.' : "मानक कलेक्शन कॉल जिसमें सामान्य इंटरैक्शन हुए।"
}

function getDefaultScoring(): Omit<AnalysisResult, 'transcription'> {
  const defaultScores = {}
  
  // Initialize all scores to 0 using the parameter definitions
  for (const [key] of Object.entries(SCORING_PARAMETERS)) {
    defaultScores[key] = 0
  }

  return {
    scores: defaultScores,
    overallFeedback: "कॉल विश्लेषण डिफ़ॉल्ट स्कोरिंग पैरामीटर से किया गया।",
    observation: "कोई विशेष अवलोकन नहीं मिला।"
  }
}
