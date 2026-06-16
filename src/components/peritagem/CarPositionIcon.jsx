const views = {
  front: (
  <svg viewBox="0 0 120 70" aria-hidden="true">
    <rect x="20" y="18" width="80" height="38" rx="10" fill="#dce8e2" stroke="#1f8f5f" strokeWidth="2" />
    <rect x="32" y="24" width="18" height="12" rx="2" fill="#a8cfc0" />
    <rect x="70" y="24" width="18" height="12" rx="2" fill="#a8cfc0" />
    <circle cx="32" cy="58" r="7" fill="#2c3a33" />
    <circle cx="88" cy="58" r="7" fill="#2c3a33" />
  </svg>
  ),
  left: (
  <svg viewBox="0 0 120 70" aria-hidden="true">
    <path d="M18 42 L28 22 H78 L88 42 V52 H18 Z" fill="#dce8e2" stroke="#1f8f5f" strokeWidth="2" />
    <rect x="42" y="28" width="22" height="10" rx="2" fill="#a8cfc0" />
    <circle cx="30" cy="54" r="7" fill="#2c3a33" />
    <circle cx="78" cy="54" r="7" fill="#2c3a33" />
    <circle cx="22" cy="34" r="5" fill="none" stroke="#e74c3c" strokeWidth="2" />
  </svg>
  ),
  'door-left': (
  <svg viewBox="0 0 120 70" aria-hidden="true">
    <path d="M20 44 L30 24 H82 L92 44 V54 H20 Z" fill="#dce8e2" stroke="#1f8f5f" strokeWidth="2" />
    <rect x="48" y="30" width="20" height="14" rx="2" fill="#a8cfc0" />
    <rect x="24" y="26" width="8" height="6" rx="1" fill="#c0392b" opacity="0.7" />
    <circle cx="32" cy="56" r="7" fill="#2c3a33" />
    <circle cx="80" cy="56" r="7" fill="#2c3a33" />
  </svg>
  ),
  bumper: (
  <svg viewBox="0 0 120 70" aria-hidden="true">
    <rect x="22" y="20" width="76" height="36" rx="8" fill="#dce8e2" stroke="#1f8f5f" strokeWidth="2" />
    <rect x="30" y="26" width="14" height="10" rx="2" fill="#f4d03f" />
    <rect x="76" y="26" width="14" height="10" rx="2" fill="#f4d03f" />
    <ellipse cx="38" cy="48" rx="12" ry="6" fill="none" stroke="#e74c3c" strokeWidth="2" />
    <circle cx="34" cy="58" r="7" fill="#2c3a33" />
    <circle cx="86" cy="58" r="7" fill="#2c3a33" />
  </svg>
  ),
  'rear-left': (
  <svg viewBox="0 0 120 70" aria-hidden="true">
    <path d="M22 44 L32 26 H80 L90 44 V54 H22 Z" fill="#dce8e2" stroke="#1f8f5f" strokeWidth="2" />
    <rect x="50" y="32" width="18" height="10" rx="2" fill="#a8cfc0" />
    <circle cx="34" cy="56" r="7" fill="#2c3a33" />
    <circle cx="82" cy="56" r="7" fill="#2c3a33" />
  </svg>
  ),
  rear: (
  <svg viewBox="0 0 120 70" aria-hidden="true">
    <rect x="24" y="20" width="72" height="36" rx="8" fill="#dce8e2" stroke="#1f8f5f" strokeWidth="2" />
    <rect x="36" y="28" width="16" height="10" rx="2" fill="#a8cfc0" />
    <rect x="68" y="28" width="16" height="10" rx="2" fill="#a8cfc0" />
    <rect x="48" y="38" width="24" height="6" rx="2" fill="#95a5a6" />
    <circle cx="36" cy="58" r="7" fill="#2c3a33" />
    <circle cx="84" cy="58" r="7" fill="#2c3a33" />
  </svg>
  ),
}

export default function CarPositionIcon({ view = 'front' }) {
  return <div className="car-position-icon">{views[view] || views.front}</div>
}
