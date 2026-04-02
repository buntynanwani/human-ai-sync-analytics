import { useState } from 'react'

const DEPARTMENTS = ['All departments', 'Engineering', 'Data & Analytics', 'Product', 'HR', 'Operations', 'Finance']

const MOCK_CAMPAIGNS = [
  { id: 1, name: 'AI Impact Q1 2026', dept: 'Engineering', status: 'active', responses: 157, created: '2026-01-10' },
  { id: 2, name: 'Q2 2026 Pulse Check', dept: 'All departments', status: 'draft', responses: 0, created: '2026-03-28' },
]

export default function Campaigns() {
  const [showForm, setShowForm] = useState(false)
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS)
  const [form, setForm] = useState({ name: '', dept: '', description: '' })
  const [saved, setSaved] = useState(false)

  function handleCreate(e) {
    e.preventDefault()
    if (!form.name || !form.dept) return
    const newCampaign = {
      id: Date.now(),
      name: form.name,
      dept: form.dept,
      status: 'draft',
      responses: 0,
      created: new Date().toISOString().slice(0, 10),
    }
    setCampaigns(prev => [newCampaign, ...prev])
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowForm(false); setForm({ name: '', dept: '', description: '' }) }, 1800)
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Campaigns</h1>
          <p style={s.sub}>Create and manage survey campaigns by department.</p>
        </div>
        <button style={s.btnPrimary} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ New campaign'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={s.formCard}>
          <p style={s.formTitle}>New campaign</p>
          <form onSubmit={handleCreate} style={s.form}>
            <div style={s.fieldRow}>
              <div style={s.field}>
                <label style={s.label}>Campaign name *</label>
                <input
                  style={s.input}
                  placeholder="e.g. AI Impact Q2 2026"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Department *</label>
                <select
                  style={s.input}
                  value={form.dept}
                  onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}
                  required
                >
                  <option value="">Select a department…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Description (optional)</label>
              <textarea
                style={{ ...s.input, height: 72, resize: 'vertical' }}
                placeholder="Add context about this campaign…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div style={s.formFooter}>
              {saved && <span style={s.savedMsg}>Campaign created ✓</span>}
              <button type="submit" style={s.btnPrimary}>Create campaign</button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns list */}
      <div style={s.table}>
        <div style={s.tableHeader}>
          <span style={{ ...s.th, width: 72 }}>Status</span>
          <span style={{ ...s.th, flex: 1 }}>Name</span>
          <span style={{ ...s.th, width: 140 }}>Department</span>
          <span style={{ ...s.th, width: 90, textAlign: 'right' }}>Responses</span>
          <span style={{ ...s.th, width: 100 }}>Created</span>
          <span style={{ ...s.th, width: 80, textAlign: 'right' }}>Actions</span>
        </div>

        {campaigns.map(c => (
          <div key={c.id} style={s.row}>
            <StatusPill status={c.status} />
            <span style={{ flex: 1, fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</span>
            <span style={{ width: 140, fontSize: 13, color: 'var(--text-secondary)' }}>{c.dept}</span>
            <span style={{ width: 90, textAlign: 'right', fontSize: 13, color: 'var(--text-secondary)' }}>
              {c.responses > 0 ? `${c.responses}` : '—'}
            </span>
            <span style={{ width: 100, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.created}</span>
            <span style={{ width: 80, textAlign: 'right' }}>
              <button style={s.btnSmall}>View</button>
            </span>
          </div>
        ))}

        {campaigns.length === 0 && (
          <div style={s.empty}>No campaigns yet — create your first one above.</div>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  const map = {
    active: { bg: 'var(--green-bg)', color: 'var(--green-text)', label: 'Active' },
    draft:  { bg: 'var(--bg-subtle)', color: 'var(--text-muted)', label: 'Draft' },
    closed: { bg: 'var(--red-bg)', color: 'var(--red-text)', label: 'Closed' },
  }
  const c = map[status] || map.draft
  return (
    <span style={{ width: 72, fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 500, background: c.bg, color: c.color, textAlign: 'center' }}>
      {c.label}
    </span>
  )
}

const s = {
  page: { padding: '32px 36px', maxWidth: 960, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 },
  sub: { fontSize: 13, color: 'var(--text-secondary)' },

  btnPrimary: {
    background: 'var(--blue)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--r-sm)',
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
  btnSmall: {
    fontSize: 12,
    padding: '4px 12px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },

  formCard: {
    background: 'var(--bg-surface)',
    border: '1.5px solid var(--blue)',
    borderRadius: 'var(--r-lg)',
    padding: '22px 24px',
    marginBottom: 20,
  },
  formTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' },
  input: {
    fontFamily: 'var(--font)',
    fontSize: 13,
    padding: '8px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
  },
  formFooter: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
  savedMsg: { fontSize: 13, color: 'var(--green-text)', fontWeight: 500 },

  table: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    background: 'var(--bg-subtle)',
    borderBottom: '1px solid var(--border)',
  },
  th: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 16px',
    borderBottom: '1px solid var(--border)',
  },
  empty: { padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' },
}