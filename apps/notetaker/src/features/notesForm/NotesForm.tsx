import { useEffect, useRef, useState } from "react"
import type { SubmitEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import { NotesSchema } from "@/schemas/notes"
import { useNotesFormSubmit } from "./hooks/useNotesFormSubmit"
import type { Notes, NotesInput } from "@/schemas/notes"
import { getCurrentTimestamp } from "@/common/timestamp"

import { AudioRecorder } from "@/features/audioRecorder"
import type { AudioRecorderHandle } from "@/features/audioRecorder"
import { useToast } from "@/common/toast/ToastContext"
import styles from "./notesForm.module.css"
import { deleteRecording } from "@/common/voiceMemoDB/utils/deleteRecording"

type NotesFormProps = {
  initialData?: Notes
  noteId: string
}

export const NotesForm = ({ initialData, noteId }: NotesFormProps) => {
  const navigate = useNavigate()

  const { onSubmit, isSuccess, isError, savedNote, reset } =
    useNotesFormSubmit()
  const { showToast } = useToast()

  const audioRecorderRef = useRef<AudioRecorderHandle>(null)

  const [hasAudio, setHasAudio] = useState(!!initialData?.hasAudio)
  const [pendingAudioRemoval, setPendingAudioRemoval] = useState(false)

  const {
    register,
    handleSubmit,
    reset: resetForm,
    setValue,
    formState: { errors },
  } = useForm<NotesInput, unknown, Notes>({
    resolver: zodResolver(NotesSchema),
    defaultValues: initialData,
  })

  useEffect(() => {
    resetForm(initialData ?? { id: noteId, title: "", note: "", timestamp: "" })
  }, [initialData, resetForm])

  useEffect(() => {
    return () => reset()
  }, [])

  useEffect(() => {
    if (isSuccess && savedNote) {
      showToast("Note is saved")
      navigate({
        to: "/note/$noteId",
        params: { noteId: savedNote.id },
      })
    }
  }, [isSuccess, savedNote, navigate])

  const handleRemoveAudio = () => {
    setPendingAudioRemoval(true)
    setHasAudio(false)
    setValue("hasAudio", false)
  }

  const handleFormSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (audioRecorderRef.current?.isRecording) {
      await audioRecorderRef.current.stopAndAwait()
      setHasAudio(true)
      setValue("hasAudio", true)
    }
    if (pendingAudioRemoval) {
      await deleteRecording(noteId)
    }
    setValue("timestamp", getCurrentTimestamp())
    await handleSubmit(onSubmit)()
  }

  return (
    <form className={styles.form} onSubmit={handleFormSubmit} noValidate>
      <input type="hidden" {...register("id")} />
      <input type="hidden" {...register("timestamp")} />
      <h2>{initialData ? "Edit Note" : "New Note"}</h2>

      {isError && (
        <p className={styles.errorBanner} role="alert">
          Failed to save note. Please try again.
        </p>
      )}

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.inputLabel} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className={styles.input}
            type="text"
            aria-describedby={errors.title ? "title-error" : undefined}
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          {errors.title?.message && (
            <p id="title-error" className={styles.error} role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.inputLabel} htmlFor="note">
            Note
          </label>
          <textarea
            id="note"
            className={styles.textarea}
            aria-describedby={errors.note ? "note-error" : undefined}
            aria-invalid={!!errors.note}
            {...register("note")}
          />
          {errors.note?.message && (
            <p id="note-error" className={styles.error} role="alert">
              {errors.note.message}
            </p>
          )}
        </div>
      </div>

      <AudioRecorder
        ref={audioRecorderRef}
        onRecordingComplete={() => {
          setHasAudio(true)
          setPendingAudioRemoval(false)
          setValue("hasAudio", true)
        }}
        onRecordingDelete={() => {
          setHasAudio(false)
          setValue("hasAudio", false)
        }}
        uuid={noteId}
        showPlayer={!!initialData?.hasAudio && !pendingAudioRemoval}
      />

      {!!initialData?.hasAudio && hasAudio && !pendingAudioRemoval && (
        <button
          type="button"
          className={styles.removeAudio}
          onClick={handleRemoveAudio}
        >
          Remove Audio
        </button>
      )}

      <button className={styles.submit} type="submit">
        Save Note
      </button>
    </form>
  )
}
