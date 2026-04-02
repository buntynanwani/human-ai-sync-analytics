import { NavLink, useLocation } from 'react-router-dom'

const NAV = [
  {
    group: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: IconGrid },
      { to: '/campaigns', label: 'Campaigns', icon: IconCampaign },
      { to: '/upload-survey', label: 'Survey Upload', icon: IconSurvey },
    ]
  },
  {
    group: 'Catalog',
    items: [
      { to: '/mentors', label: 'Mentors', icon: IconMentors },
      { to: '/courses', label: 'Courses', icon: IconCourses },
    ]
  },
  {
    group: 'Insights',
    items: [
      { to: '/analytics', label: 'HR Agent (AI)', icon: IconAgent, soon: true },
      { to: '/powerbi', label: 'Power BI Reports', icon: IconBI, soon: true },
    ]
  },
]

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <div style={styles.logoMark}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="2" fill="#185FA5"/>
            <rect x="11" y="2" width="7" height="7" rx="2" fill="#185FA5" opacity="0.5"/>
            <rect x="2" y="11" width="7" height="7" rx="2" fill="#185FA5" opacity="0.3"/>
            <rect x="11" y="11" width="7" height="7" rx="2" fill="#185FA5" opacity="0.15"/>
          </svg>
        </div>
        <div>
          <div style={styles.logoName}>HumanAI Sync</div>
          <div style={styles.logoSub}>HR Analytics</div>
        </div>
      </div>

      {/* Nav groups */}
      <nav style={styles.nav}>
        {NAV.map(group => (
          <div key={group.group} style={styles.group}>
            <span style={styles.groupLabel}>{group.group}</span>
            {group.items.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        ))}
      </nav>

      
    </aside>
  )
}

function NavItem({ to, label, icon: Icon, soon }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...styles.navItem,
        ...(isActive ? styles.navItemActive : {}),
        ...(soon ? { opacity: 0.5, pointerEvents: 'none' } : {}),
      })}
    >
      <Icon size={16} />
      <span style={{ flex: 1 }}>{label}</span>
      {soon && (
        <span style={styles.soonBadge}>soon</span>
      )}
    </NavLink>
  )
}

/* ── Styles ── */
const styles = {
  sidebar: {
    width: 'var(--sidebar-w)',
    flexShrink: 0,
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 20,
    marginBottom: 8,
    borderBottom: '1px solid var(--border)',
  },
  logoMark: {
    width: 36,
    height: 36,
    background: 'var(--blue-bg)',
    borderRadius: 'var(--r-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoName: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 1,
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  group: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '0 10px',
    marginBottom: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '8px 10px',
    borderRadius: 'var(--r-sm)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 400,
    transition: 'background 0.12s, color 0.12s',
    textDecoration: 'none',
  },
  navItemActive: {
    background: 'var(--blue-bg)',
    color: 'var(--blue-text)',
    fontWeight: 500,
  },
  soonBadge: {
    fontSize: 10,
    background: 'var(--bg-subtle)',
    color: 'var(--text-muted)',
    padding: '2px 6px',
    borderRadius: 99,
  },
  
  
}

/* ── Icons ── */
function IconGrid({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
    </svg>
  )
}
function IconCampaign({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 12V4l6-2 6 2v8l-6 2-6-2z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}
function IconSurvey({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M4 6h8M4 9h6M4 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconMentors({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <circle cx="11.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M1 14c0-2.5 2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M12.5 10c1.5 0 2.5 1 2.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
function IconCourses({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
function IconAgent({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconBI({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="10" width="3" height="4" rx="1" fill="currentColor" opacity="0.4"/>
      <rect x="6" y="6" width="3" height="8" rx="1" fill="currentColor" opacity="0.7"/>
      <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor"/>
    </svg>
  )
}