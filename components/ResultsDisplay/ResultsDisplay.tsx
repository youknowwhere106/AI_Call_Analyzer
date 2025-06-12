import { AnalysisResult } from '@/types'
import styles from './ResultsDisplay.module.css'

interface ResultsDisplayProps {
  result: AnalysisResult
}

// Move this to a constants file if reused
const SCORING_PARAMETERS: Record<string, number> = {
  callEtiquette: 5,
  callDisclaimer: 5,
  correctDisposition: 5,
  callClosing: 5,
  fatalIdentification: 5,
  fatalTapeDiscloser: 10,
  fatalToneLanguage: 15,
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return styles.scoreGood
    if (percentage >= 60) return styles.scoreOkay
    return styles.scorePoor
  }

  const actualScore = Object.entries(result.scores).reduce((sum, [key, value]) => sum + value, 0)
  const totalPossibleScore = Object.entries(result.scores).reduce((sum, [key]) => sum + (SCORING_PARAMETERS[key] || 5), 0)
  const overallPercentage = Math.round((actualScore / totalPossibleScore) * 100)

  return (
    <div className={styles.container}>
      <div className={styles.resultsCard}>
        <h2 className={styles.title}>📊 Analysis Results</h2>

        {/* Overall Score */}
        <div className={styles.overallScore}>
          <div className={styles.scoreCircle}>
            <span className={styles.percentage}>{overallPercentage}%</span>
            <span className={styles.label}>Overall Score</span>
          </div>
        </div>

        {/* Parameter Scores */}
        <div className={styles.scoresSection}>
          <h3>Parameter Scores</h3>
          <div className={styles.scoresGrid}>
            {Object.entries(result.scores).map(([parameter, score]) => {
              const maxScore = SCORING_PARAMETERS[parameter] || 5
              return (
                <div key={parameter} className={styles.scoreItem}>
                  <div className={styles.scoreHeader}>
                    <span className={styles.parameterName}>
                      {parameter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className={`${styles.scoreValue} ${getScoreColor(score, maxScore)}`}>
                      {score}/{maxScore}
                    </span>
                  </div>
                  <div className={styles.scoreBar}>
                    <div 
                      className={`${styles.scoreBarFill} ${getScoreColor(score, maxScore)}`}
                      style={{ width: `${(score / maxScore) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feedback Section */}
        <div className={styles.feedbackSection}>
          <div className={styles.feedbackItem}>
            <h3>💬 Overall Feedback</h3>
            <div className={styles.feedbackContent}>
              {result.overallFeedback}
            </div>
          </div>

          <div className={styles.feedbackItem}>
            <h3>👁️ Observations</h3>
            <div className={styles.feedbackContent}>
              {result.observation}
            </div>
          </div>
        </div>

        {/* Transcription */}
        {result.transcription && (
          <div className={styles.transcriptionSection}>
            <h3>📝 Transcription</h3>
            <div className={styles.transcriptionContent}>
              {result.transcription}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
