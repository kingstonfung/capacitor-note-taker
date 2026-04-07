import styles from "./AudioPlayer.module.css"
import { useAudioLoader } from "./hooks/useAudioLoader"
import { useAudioPlayback } from "./hooks/useAudioPlayback"
import playCircleIcon from "@/assets/icons/play_circle.svg"
import stopCircleIcon from "@/assets/icons/stop_circle.svg"

interface AudioPlayerProps {
  uuid: string
  isProcessing?: boolean
}

const fmt = (secs: number): string => {
  if (!isFinite(secs) || isNaN(secs)) return "0:00"
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0")
  return `${m}:${s}`
}

export const AudioPlayer = ({
  uuid,
  isProcessing = false,
}: AudioPlayerProps) => {
  const { audioRef, loadState, prepare } = useAudioLoader(uuid)
  const { playing, current, duration, handleClick, seek, audioEvents } =
    useAudioPlayback({
      audioRef,
      loadState,
      prepare,
      isProcessing,
    })

  const isLoading = loadState === "loading"
  const hasError = loadState === "error"

  return (
    <div className={styles.player}>
      <audio ref={audioRef} {...audioEvents} />

      <button
        type="button"
        className={`${styles.playBtn} ${playing ? styles.playBtnStop : ""}`}
        onClick={handleClick}
        disabled={!isProcessing && (isLoading || hasError)}
        aria-label={isProcessing ? "Processing" : playing ? "Pause" : "Play"}
      >
        {isProcessing || isLoading ? (
          "…"
        ) : playing ? (
          <img
            src={stopCircleIcon}
            width={22}
            height={22}
            alt=""
            aria-hidden="true"
          />
        ) : (
          <img
            src={playCircleIcon}
            width={22}
            height={22}
            alt=""
            aria-hidden="true"
          />
        )}
      </button>

      <input
        className={styles.scrubber}
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={current}
        onChange={seek}
        disabled={isProcessing || loadState !== "ready"}
      />

      <span className={styles.time}>
        {hasError ? "Error" : `${fmt(current)} / ${fmt(duration)}`}
      </span>
    </div>
  )
}
