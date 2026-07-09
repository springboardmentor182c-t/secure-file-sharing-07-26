import './Badge.css'

export default function Badge({ tone = 'gray', children, icon: Icon }) {
  return (
    <span className={`admin-badge admin-badge-${tone}`}>
      {Icon && <Icon width={12} height={12} />}
      {children}
    </span>
  )
}
