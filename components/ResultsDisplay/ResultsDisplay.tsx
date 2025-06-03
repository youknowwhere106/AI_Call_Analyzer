import { AnalysisResult } from '@/types'
import styles from './ResultsDisplay.module.css'

interface ResultsDisplayProps {
  result: AnalysisResult
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return styles.scoreGood
    if (percentage >= 60) return styles.scoreOkay
    return styles.scorePoor
  }

  const totalPossibleScore = Object.values(result.scores).reduce((sum, score) => {
    // Assuming max scores based on common parameters
    const maxScores: Record<string, number> = {
      greeting: 5,
      collectionUrgency: 15,
      professionalism: 10,
      clarity: 10,
      empathy: 8,
      resolution: 12
    }
    return sum + (maxScores[Object.keys(result.scores)[Object.values(result.scores).indexOf(score)]] || 10)
  }, 0)

  const actualScore = Object.values(result.scores).reduce((sum, score) => sum + score, 0)
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
              const maxScore = parameter === 'collectionUrgency' ? 15 : 
                              parameter === 'resolution' ? 12 : 
                              parameter === 'professionalism' || parameter === 'clarity' ? 10 :
                              parameter === 'empathy' ? 8 : 5
              
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

        {/* Transcription if available */}
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
