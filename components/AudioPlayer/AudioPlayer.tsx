'use client'

import { useState, useRef, useEffect } from 'react'
import { AudioFile } from '@/types'
import styles from './AudioPlayer.module.css'

interface AudioPlayerProps {
  audioFile: AudioFile
}

export default function AudioPlayer({ audioFile }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [audioFile])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.container}>
      <div className={styles.playerCard}>
        <div className={styles.fileInfo}>
          <h3>📁 {audioFile.file.name}</h3>
          <p>{(audioFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>

        <div className={styles.controls}>
          <button 
            className={styles.playButton}
            onClick={togglePlayPause}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <div className={styles.progressContainer}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className={styles.progressBar}
            />
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>
        </div>

        <audio ref={audioRef} src={audioFile.url} preload="metadata" />
      </div>
    </div>
  )
}
