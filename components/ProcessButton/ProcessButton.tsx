import { ProcessingState } from '@/types'
import styles from './ProcessButton.module.css'

interface ProcessButtonProps {
  onProcess: () => void
  processingState: ProcessingState
  disabled: boolean
}

export default function ProcessButton({ 
  onProcess, 
  processingState, 
  disabled 
}: ProcessButtonProps) {
  return (
    <div className={styles.container}>
      <button 
        className={`${styles.processButton} ${disabled ? styles.disabled : ''}`}
        onClick={onProcess}
        disabled={disabled}
      >
        {processingState.isProcessing ? (
          <div className={styles.processingContent}>
            <div className={styles.spinner}></div>
            <span>{processingState.stage}</span>
          </div>
        ) : (
          '🎯 Analyze Call Recording'
        )}
      </button>

      {processingState.isProcessing && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${processingState.progress}%` }}
            ></div>
          </div>
          <span className={styles.progressText}>
            {processingState.progress}%
          </span>
        </div>
      )}
    </div>
  )
}
