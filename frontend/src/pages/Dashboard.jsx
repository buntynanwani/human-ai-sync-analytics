import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  const navigate = useNavigate()
  const [dbOk, setDbOk] = useState(null)

  useEffect(() => {
    fetch(`${API}/db-test`)
      .then(r => r.ok ? setDbOk(true) : setDbOk(false))
      .catch(() => setDbOk(false))
  }, [])

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.sub}>Welcome back — here's your pipeline at a glance</p>
        </div>
        <DbBadge ok={dbOk} />
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        <StatCard value="157" label="Survey responses" color="blue" />
        <StatCard value="—" label="Active mentors" color="amber" />
        <StatCard value="—" label="Courses loaded" color="purple" />
        <StatCard value="2" label="Power BI reports" color="green" />
      </div>

      {/* Quick actions */}
      <SectionLabel>Quick actions</SectionLabel>
      <div style={s.actionsGrid}>
        <ActionCard
          title="New survey campaign"
          desc="Create a campaign, select a department, and distribute survey links."
          iconBg="var(--blue-bg)"
          icon={<CampaignIcon />}
          cta="Create campaign"
          accent
          onClick={() => navigate('/campaigns')}
        />
        <ActionCard
          title="Upload survey data"
          desc="Import the Excel or CSV file exported from Google Forms."
          iconBg="var(--green-bg)"
          icon={<UploadIcon color="#3B6D11" />}
          cta="Upload file"
          onClick={() => navigate('/upload-survey')}
        />
        <ActionCard
          title="Load mentor catalog"
          desc="Sync the mentors Excel file with the database."
          iconBg="var(--amber-bg)"
          icon={<MentorsIcon />}
          cta="Upload mentors"
          onClick={() => navigate('/mentors')}
        />
        <ActionCard
          title="Load course catalog"
          desc="Upload courses and auto-classify beginner / intermediate / advanced."
          iconBg="var(--purple-bg)"
          icon={<CoursesIcon />}
          cta="Upload courses"
          onClick={() => navigate('/courses')}
        />
      </div>

      {/* Campaigns table */}
      <SectionLabel>Recent campaigns</SectionLabel>
      <div style={s.table}>
        <div style={s.tableHeader}>
          <span style={s.th}>Status</span>
          <span style={{ ...s.th, flex: 1 }}>Campaign name</span>
          <span style={s.th}>Department</span>
          <span style={{ ...s.th, textAlign: 'right' }}>Responses</span>
          <span style={{ ...s.th, textAlign: 'right' }}>Actions</span>
        </div>
        <CampaignRow status="active" name="AI Impact Q1 2026" dept="Engineering" count={157} />
        <CampaignRow status="draft" name="Q2 2026 Pulse Check" dept="All departments" count={null} />
      </div>

      {/* Power BI placeholder */}
      <SectionLabel>Power BI Reports</SectionLabel>
      <div style={s.biPlaceholder}>
        <div style={s.biIcon}>
          <ChartIcon />
        </div>
        <div>
          <p style={s.biTitle}>Reports will appear here</p>
          <p style={s.biSub}>Upload a Power BI video or embed a report once your license is active.</p>
        </div>
        <button style={s.btnGhost} disabled>Upload video</button>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function DbBadge({ ok }) {
  if (ok === null) return <span style={{ ...badge, background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>Checking DB…</span>
  if (ok) return <span style={{ ...badge, background: 'var(--green-bg)', color: 'var(--green-text)' }}>● DB connected</span>
  return <span style={{ ...badge, background: 'var(--red-bg)', color: 'var(--red-text)' }}>● DB offline</span>
}

const badge = { fontSize: 12, padding: '5px 12px', borderRadius: 99, fontWeight: 500 }

function StatCard({ value, label, color }) {
  const map = {
    blue:   { bg: 'var(--blue-bg)',   text: 'var(--blue-text)' },
    green:  { bg: 'var(--green-bg)',  text: 'var(--green-text)' },
    amber:  { bg: 'var(--amber-bg)',  text: 'var(--amber-text)' },
    purple: { bg: 'var(--purple-bg)', text: 'var(--purple-text)' },
  }
  const c = map[color] || map.blue
  return (
    <div style={{ ...s.statCard, background: c.bg }}>
      <span style={{ fontSize: 26, fontWeight: 600, color: c.text }}>{value}</span>
      <span style={{ fontSize: 12, color: c.text, opacity: 0.75, marginTop: 2 }}>{label}</span>
    </div>
  )
}

function SectionLabel({ children }) {
  return <p style={s.sectionLabel}>{children}</p>
}

function ActionCard({ title, desc, iconBg, icon, cta, accent, onClick }) {
  return (
    <div
      style={{ ...s.actionCard, ...(accent ? s.actionCardAccent : {}) }}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = accent ? 'var(--blue)' : 'var(--border)'}
    >
      <div style={{ ...s.actionIconWrap, background: iconBg }}>{icon}</div>
      <p style={s.actionTitle}>{title}</p>
      <p style={s.actionDesc}>{desc}</p>
      <span style={s.actionCta}>{cta} →</span>
    </div>
  )
}

function CampaignRow({ status, name, dept, count }) {
  const pillStyle = status === 'active'
    ? { background: 'var(--green-bg)', color: 'var(--green-text)' }
    : { background: 'var(--bg-subtle)', color: 'var(--text-muted)' }
  return (
    <div style={s.tableRow}>
      <span style={{ ...s.pill, ...pillStyle }}>{status}</span>
      <span style={{ flex: 1, fontWeight: 500, color: 'var(--text-primary)', fontSize: 13 }}>{name}</span>
      <span style={{ width: 120, color: 'var(--text-secondary)', fontSize: 13 }}>{dept}</span>
      <span style={{ width: 80, textAlign: 'right', color: 'var(--text-secondary)', fontSize: 13 }}>
        {count !== null ? `${count} resp.` : '—'}
      </span>
      <span style={{ width: 80, textAlign: 'right' }}>
        <button style={s.btnSmall}>View</button>
      </span>
    </div>
  )
}

/* ── Inline SVGs ── */
function CampaignIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="14" height="14" rx="3" stroke="#185FA5" strokeWidth="1.5" fill="none"/>
      <path d="M9 5v8M5 9h8" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function UploadIcon({ color = '#185FA5' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 13v2h12v-2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 3v9M6 6l3-3 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function MentorsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="6" r="3" stroke="#854F0B" strokeWidth="1.4" fill="none"/>
      <circle cx="13" cy="6" r="2" stroke="#854F0B" strokeWidth="1.3" fill="none"/>
      <path d="M1 16c0-3 2.5-4.5 6-4.5s6 1.5 6 4.5" stroke="#854F0B" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M14.5 11.5c1.8 0 3 1 3 3.5" stroke="#854F0B" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
function CoursesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="2" stroke="#534AB7" strokeWidth="1.4" fill="none"/>
      <path d="M5 7h8M5 10h5" stroke="#534AB7" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="16" width="5" height="8" rx="1.5" fill="var(--border-strong)"/>
      <rect x="10" y="10" width="5" height="14" rx="1.5" fill="var(--border)"/>
      <rect x="18" y="4" width="5" height="20" rx="1.5" fill="var(--border)"/>
    </svg>
  )
}

/* ── Styles ── */
const s = {
  page: { padding: '32px 36px', maxWidth: 960, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 },
  sub: { fontSize: 13, color: 'var(--text-secondary)' },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    borderRadius: 'var(--r-md)',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: 10,
  },

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
    padding: '18px 20px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    transition: 'border-color 0.12s',
  },
  actionCardAccent: {
    borderColor: 'var(--blue)',
    borderWidth: '1.5px',
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 'var(--r-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  actionTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  actionDesc: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 },
  actionCta: { fontSize: 12, color: 'var(--blue)', fontWeight: 500, marginTop: 4 },

  table: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
    overflow: 'hidden',
    marginBottom: 28,
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-subtle)',
  },
  th: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 80 },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 16px',
    borderBottom: '1px solid var(--border)',
  },
  pill: { fontSize: 11, padding: '3px 9px', borderRadius: 99, fontWeight: 500, width: 80, textAlign: 'center' },
  btnSmall: {
    fontSize: 12,
    padding: '4px 12px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },

  biPlaceholder: {
    background: 'var(--bg-surface)',
    border: '1px dashed var(--border-strong)',
    borderRadius: 'var(--r-lg)',
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  biIcon: {
    width: 52,
    height: 52,
    background: 'var(--bg-subtle)',
    borderRadius: 'var(--r-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  biTitle: { fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 },
  biSub: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 },
  btnGhost: {
    marginLeft: 'auto',
    fontSize: 12,
    padding: '7px 16px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
    flexShrink: 0,
  },
}