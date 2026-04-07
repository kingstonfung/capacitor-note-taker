import { forwardRef, useImperativeHandle } from "react"
import styles from "./audioRecorder.module.css"
import { AudioPlayer } from "@/common/audioPlayer/AudioPlayer"
import { useRecorderMethods } from "./hooks/useRecorderMethods"
import screenRecordIcon from "@/assets/icons/screen_record.svg"
import stopCircleIcon from "@/assets/icons/stop_circle.svg"
import deleteIcon from "@/assets/icons/delete.svg"

export interface AudioRecorderHandle {
  isRecording: boolean
  stopAndAwait: () => Promise<void>
}

interface AudioRecorderProps {
  onRecordingComplete?: (recordingId: string) => void
  onRecordingDelete?: () => void
  uuid: string
  showPlayer: boolean
}

// If user presses "Save Note" while the audio is still recording, I want it
// to be able to stop & save the audio as well.
// Instead of lifting all the states up to the parent, I've decided to use `forwardRef` here.
export const AudioRecorder = forwardRef<
  AudioRecorderHandle,
  AudioRecorderProps
>(({ onRecordingComplete, onRecordingDelete, showPlayer, uuid }, ref) => {
  const { recordingState, start, stop, stopAndAwait, reRecord, handleDelete } =
    useRecorderMethods({
      uuid,
      onRecordingComplete,
      onRecordingDelete,
    })

  useImperativeHandle(ref, () => ({
    isRecording: recordingState === "recording",
    stopAndAwait,
  }))

  const isRecording = recordingState === "recording"
  const isDone = recordingState === "done"
  const showPlayerControl = showPlayer || isRecording || isDone

  return (
    <div className={styles.field}>
      <span className={styles.label}>Audio Recording:</span>
      <div className={styles.recorder}>
        <div className={styles.status}>
          <span
            className={`${styles.dot} ${isRecording ? styles.dotRecording : ""}`}
          />
          <span className={isRecording ? styles.statusTextRecording : ""}>
            {isRecording ? "Recording" : isDone ? "Recorded" : "Ready"}
          </span>
        </div>

        <div className={styles.controls}>
          {!isDone && !isRecording && (
            <button type="button" className={styles.btnRecord} onClick={start}>
              <img
                src={screenRecordIcon}
                width={18}
                height={18}
                alt=""
                aria-hidden="true"
              />
            </button>
          )}
          {isRecording && (
            <button type="button" className={styles.btnStop} onClick={stop}>
              <img
                src={stopCircleIcon}
                width={18}
                height={18}
                alt=""
                aria-hidden="true"
              />
            </button>
          )}
          {isDone && (
            <>
              <button
                type="button"
                className={styles.btnRecord}
                onClick={reRecord}
              >
                <img
                  src={screenRecordIcon}
                  width={18}
                  height={18}
                  alt=""
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className={styles.btnDelete}
                onClick={handleDelete}
              >
                <img
                  src={deleteIcon}
                  width={18}
                  height={18}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </>
          )}
        </div>
      </div>

      {showPlayerControl && (
        <AudioPlayer uuid={uuid} isProcessing={isRecording} />
      )}
    </div>
  )
})
