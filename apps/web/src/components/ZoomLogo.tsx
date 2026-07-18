// Simple Zoom-style video badge (brand blue). Not the official logo.
export function ZoomLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <rect x="1" y="6" width="15" height="12" rx="3.5" fill="#2D8CFF" />
      <path d="M17.5 10.2l4-2.4a.7.7 0 011.1.6v7.2a.7.7 0 01-1.1.6l-4-2.4v-3.6z" fill="#2D8CFF" />
      <rect x="4.2" y="9" width="8" height="6" rx="1.4" fill="#fff" />
    </svg>
  )
}
