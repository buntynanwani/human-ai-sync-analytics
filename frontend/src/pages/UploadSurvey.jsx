import { useState, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const STATES = { idle: 'idle', dragging: 'dragging', uploading: 'uploading', success: 'success', error: 'error' }

export default function UploadSurvey() {
  const [state, setState] = useState(STATES.idle)
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef()

  function handleFile(f) {
    if (!f) return
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ]
    if (!allowed.includes(f.type) && !f.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMsg('Only .xlsx, .xls, or .csv files are accepted.')
      setState(STATES.error)
      return
    }
    setFile(f)
    setState(STATES.idle)
    setErrorMsg('')
  }

  function onDrop(e) {
    e.preventDefault()
    setState(STATES.idle)
    handleFile(e.dataTransfer.files[0])
  }

  async function upload() {
    if (!file) return
    setState(STATES.uploading)
    setResult(null)
    setErrorMsg('')

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch(`${API}/upload-survey`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')
      setResult(data)
      setState(STATES.success)
    } catch (err) {
      setErrorMsg(err.message)
      setState(STATES.error)
    }
  }

  function reset() {
    setState(STATES.idle)
    setFile(null)
    setResult(null)
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Upload survey data</h1>
          <p style={s.sub}>Import an Excel or CSV file exported from Google Forms to load responses into the database.</p>
        </div>
      </div>

      <div style={s.layout}>
        {/* Upload card */}
        <div style={s.card}>
          <p style={s.cardTitle}>Select file</p>

          {/* Drop zone */}
          <div
            style={{
              ...s.dropzone,
              ...(state === STATES.dragging ? s.dropzoneDrag : {}),
              ...(file ? s.dropzoneFile : {}),
            }}
            onDragOver={e => { e.preventDefault(); setState(STATES.dragging) }}
            onDragLeave={() => setState(file ? STATES.idle : STATES.idle)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />

            {file ? (
              <div style={s.fileInfo}>
                <FileIcon />
                <div>
                  <p style={s.fileName}>{file.name}</p>
                  <p style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  style={s.clearBtn}
                  onClick={e => { e.stopPropagation(); reset() }}
                >✕</button>
              </div>
            ) : (
              <div style={s.dropContent}>
                <UploadIcon />
                <p style={s.dropMain}>Drop your file here or <span style={{ color: 'var(--blue)', fontWeight: 500 }}>browse</span></p>
                <p style={s.dropSub}>Supports .xlsx · .xls · .csv</p>
              </div>
            )}
          </div>

          {/* Upload button */}
          <button
            style={{ ...s.btnPrimary, ...((!file || state === STATES.uploading) ? s.btnDisabled : {}) }}
            onClick={upload}
            disabled={!file || state === STATES.uploading}
          >
            {state === STATES.uploading ? 'Uploading…' : 'Upload to database'}
          </button>

          {/* Error message */}
          {state === STATES.error && (
            <div style={s.errorBox}>
              <span style={s.errorIcon}>!</span>
              <p style={{ fontSize: 13, color: 'var(--red-text)' }}>{errorMsg}</p>
            </div>
          )}

          {/* Success result */}
          {state === STATES.success && result && (
            <div style={s.successBox}>
              <p style={s.successTitle}>Import complete</p>
              <div style={s.successStats}>
                <Stat label="Inserted" value={result.inserted ?? '—'} color="green" />
                <Stat label="Skipped" value={result.skipped ?? '—'} color="amber" />
                <Stat label="Failed" value={result.failed ?? '—'} color="red" />
              </div>
              {result.message && <p style={s.successMsg}>{result.message}</p>}
              <button style={s.btnGhost} onClick={reset}>Upload another file</button>
            </div>
          )}
        </div>

        {/* Instructions panel */}
        <div style={s.instructions}>
          <p style={s.instrTitle}>How it works</p>
          <ol style={s.instrList}>
            <li style={s.instrItem}>
              <span style={s.step}>1</span>
              <div>
                <p style={s.instrHead}>Export from Google Forms</p>
                <p style={s.instrSub}>Open your form responses → click the green Sheets icon → download as .xlsx or .csv.</p>
              </div>
            </li>
            <li style={s.instrItem}>
              <span style={s.step}>2</span>
              <div>
                <p style={s.instrHead}>Drop the file above</p>
                <p style={s.instrSub}>The ETL pipeline will map the Spanish survey columns to the English relational schema automatically.</p>
              </div>
            </li>
            <li style={s.instrItem}>
              <span style={s.step}>3</span>
              <div>
                <p style={s.instrHead}>Duplicates are handled</p>
                <p style={s.instrSub}>The idempotency check skips any employee/campaign pair already in the database — safe to re-run.</p>
              </div>
            </li>
            <li style={s.instrItem}>
              <span style={s.step}>4</span>
              <div>
                <p style={s.instrHead}>Check results</p>
                <p style={s.instrSub}>The summary shows how many rows were inserted, skipped, or failed. Full logs are written to <code style={s.code}>logs/ingestion.log</code>.</p>
              </div>
            </li>
          </ol>

          <div style={s.noteBox}>
            <p style={s.noteTitle}>Backend endpoint</p>
            <p style={s.noteSub}>This form calls <code style={s.code}>POST /upload-survey</code> on your FastAPI backend. Make sure it is running on <code style={s.code}>{API}</code>.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ── */
function Stat({ label, value, color }) {
  const map = { green: ['var(--green-bg)', 'var(--green-text)'], amber: ['var(--amber-bg)', 'var(--amber-text)'], red: ['var(--red-bg)', 'var(--red-text)'] }
  const [bg, text] = map[color] || map.green
  return (
    <div style={{ background: bg, borderRadius: 'var(--r-sm)', padding: '10px 14px', flex: 1, textAlign: 'center' }}>
      <p style={{ fontSize: 20, fontWeight: 600, color: text }}>{value}</p>
      <p style={{ fontSize: 11, color: text, opacity: 0.8, marginTop: 2 }}>{label}</p>
    </div>
  )
}

/* ── Icons ── */
function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 10 }}>
      <rect x="4" y="22" width="24" height="3" rx="1.5" fill="var(--border)"/>
      <path d="M16 4v16M10 10l6-6 6 6" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function FileIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <rect x="5" y="2" width="18" height="28" rx="3" fill="var(--green-bg)" stroke="var(--green-text)" strokeWidth="1.5"/>
      <path d="M10 10h12M10 14h12M10 18h8" stroke="var(--green-text)" strokeWidth="1.3" strokeLinecap="round"/>
      <rect x="16" y="0" width="10" height="10" rx="2" fill="var(--bg-surface)"/>
      <path d="M16 0l10 10H18a2 2 0 01-2-2V0z" fill="var(--green-bg)" stroke="var(--green-text)" strokeWidth="1.2"/>
    </svg>
  )
}

/* ── Styles ── */
const s = {
  page: { padding: '32px 36px', maxWidth: 900, margin: '0 auto' },
  header: { marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 },
  sub: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, maxWidth: 560 },

  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' },

  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  cardTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },

  dropzone: {
    border: '1.5px dashed var(--border-strong)',
    borderRadius: 'var(--r-md)',
    padding: '32px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.12s, background 0.12s',
    minHeight: 150,
  },
  dropzoneDrag: {
    borderColor: 'var(--blue)',
    background: 'var(--blue-bg)',
  },
  dropzoneFile: {
    borderStyle: 'solid',
    borderColor: 'var(--green-text)',
    background: 'var(--green-bg)',
    padding: '16px 20px',
    minHeight: 'unset',
  },
  dropContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  dropMain: { fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 },
  dropSub: { fontSize: 12, color: 'var(--text-muted)' },

  fileInfo: { display: 'flex', alignItems: 'center', gap: 12, width: '100%' },
  fileName: { fontSize: 13, fontWeight: 500, color: 'var(--green-text)' },
  fileSize: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  clearBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 14,
    cursor: 'pointer',
    padding: '2px 6px',
  },

  btnPrimary: {
    background: 'var(--blue)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--r-sm)',
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.12s',
  },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  btnGhost: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    padding: '8px 16px',
    fontSize: 12,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    marginTop: 4,
  },

  errorBox: {
    background: 'var(--red-bg)',
    border: '1px solid',
    borderColor: 'var(--red-text)',
    borderRadius: 'var(--r-sm)',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: 'var(--red-text)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },

  successBox: {
    background: 'var(--green-bg)',
    border: '1px solid var(--green-text)',
    borderRadius: 'var(--r-md)',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  successTitle: { fontSize: 14, fontWeight: 600, color: 'var(--green-text)' },
  successStats: { display: 'flex', gap: 8 },
  successMsg: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 },

  instructions: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  instrTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  instrList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 },
  instrItem: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  step: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'var(--blue-bg)',
    color: 'var(--blue-text)',
    fontSize: 11,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  instrHead: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 },
  instrSub: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 },
  code: { fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-subtle)', padding: '1px 5px', borderRadius: 4 },

  noteBox: {
    background: 'var(--bg-subtle)',
    borderRadius: 'var(--r-sm)',
    padding: '12px 14px',
    borderLeft: '3px solid var(--blue)',
  },
  noteTitle: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 },
  noteSub: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 },
}