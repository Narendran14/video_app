import React, { useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const STAGES = [
  { label: 'Uploading', description: 'Transferring file', progress: 25, wait: 500 },
  { label: 'Processing', description: 'Optimizing formats', progress: 55, wait: 700 },
  { label: 'Analyzing', description: 'Scanning for safety', progress: 85, wait: 600 },
  { label: 'Finalizing', description: 'Publishing to library', progress: 100, wait: 400 }
]

export default function UploadForm({ onUploaded, useMock = false }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [progress, setProgress] = useState(null)
  const [status, setStatus] = useState('')
  const [activeStage, setActiveStage] = useState(-1)
  const { role, user } = useAuth()
  const fileInputRef = useRef(null)

  const roleBadge = useMemo(() => {
    if (role === 'admin') return 'Admin access'
    if (role === 'editor') return 'Editor access'
    return 'Viewer access'
  }, [role])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setStatus('Please select a file')

    setStatus('Uploading...')
    setProgress(0)

    try {
      if (useMock) {
        for (let i = 0; i < STAGES.length; i += 1) {
          const stage = STAGES[i]
          setActiveStage(i)
          setStatus(stage.description)
          setProgress(stage.progress)
          await new Promise(res => setTimeout(res, stage.wait))
        }

        setStatus('Upload complete!')

        // Add mock video to localStorage with status and metadata
        try {
          const id = Date.now().toString()
          const newVideo = {
            id,
            title: title || file?.name || `Video ${id}`,
            filename: file?.name || `video-${id}.mp4`,
            url: URL.createObjectURL(file),
            thumb: `https://picsum.photos/seed/${id}/600/400`,
            status: 'safe',
            uploadedBy: user?.email || 'editor@test.com',
            uploadDate: new Date().toISOString()
          }
          const existing = JSON.parse(localStorage.getItem('mock_videos') || 'null') || []
          existing.unshift(newVideo)
          localStorage.setItem('mock_videos', JSON.stringify(existing))
        } catch (e) {
          console.error('persist mock video', e)
        }

        await new Promise(res => setTimeout(res, 600))
        setFile(null)
        setTitle('')
        setProgress(null)
        setActiveStage(-1)
        setStatus('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (onUploaded) onUploaded()
        return
      }
  // In front-end only mode we don't POST anywhere. This branch is kept
  // in case someone later turns off mock mode, but for this demo we
  // won't make network calls.
  setStatus('Upload complete (no backend configured)')
  setFile(null)
  setTitle('')
  setProgress(null)
  if (onUploaded) onUploaded()
    } catch (err) {
      console.error(err)
      setStatus('Upload failed: ' + (err.message || err))
      setProgress(null)
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="upload-heading">
        <div>
          <h2>Upload a new video</h2>
          <p>Accepted formats: mp4, mov, webm up to 500 MB</p>
        </div>
        <span className={`role-chip role-${role}`}>{roleBadge}</span>
      </div>

      <div className="field">
        <label>Video title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your video a name" />
      </div>

      <div className="field">
        <label>Upload file</label>
        <div className={`dropzone ${file ? 'has-file' : ''}`} onClick={() => fileInputRef.current?.click()}>
          <div className="dropzone-content">
            <div className="drop-icon" aria-hidden>📹</div>
            <div>
              <strong>{file ? file.name : 'Drag & drop your file here'}</strong>
              <p>{file ? `${(file.size/1024/1024).toFixed(2)} MB selected` : 'or click to browse from your device'}</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} hidden />
        </div>
      </div>

      <div className="actions">
        <button className="btn primary" type="submit" disabled={!file}>Start upload</button>
        <span className="upload-hint">Uploads run locally for this demo environment.</span>
      </div>

      {progress !== null && (
        <div className="progress-card">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <ul className="progress-steps">
            {STAGES.map((stage, index) => (
              <li key={stage.label} className={index <= activeStage ? 'active' : ''}>
                <span>{stage.label}</span>
                <small>{stage.description}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status && <p className={`status ${status.includes('complete') ? 'success' : ''}`}>{status}</p>}
    </form>
  )
}
