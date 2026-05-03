import Link from 'next/link';

interface Props {
  role:           'client' | 'stander';
  userName?:      string;
  avatarInitials?: string;
}

export default function TopBar({ role, userName, avatarInitials }: Props) {
  const initials = avatarInitials ?? userName?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <header
      style={{
        position:       'sticky',
        top:            0,
        zIndex:         40,
        background:     '#1A1612',
        height:         '52px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 16px',
        borderBottom:   '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <Link href={role === 'client' ? '/client/home' : '/stander/home'} style={{ textDecoration: 'none' }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#f5ede0' }}>
          Queue
        </span>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#FF6B00' }}>
          Pe
        </span>
      </Link>

      {/* Right: avatar + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Role badge */}
        <span
          style={{
            fontFamily:    'DM Mono, monospace',
            fontSize:      '9px',
            letterSpacing: '0.12em',
            background:    role === 'client' ? 'rgba(255,107,0,0.15)' : 'rgba(26,122,74,0.2)',
            color:         role === 'client' ? '#FF6B00' : '#1A7A4A',
            border:        `1px solid ${role === 'client' ? 'rgba(255,107,0,0.3)' : 'rgba(26,122,74,0.3)'}`,
            borderRadius:  '4px',
            padding:       '2px 6px',
            textTransform: 'uppercase',
          }}
        >
          {role === 'client' ? 'CLIENT' : 'STANDER'}
        </span>

        {/* Avatar circle */}
        <div
          style={{
            width:          '32px',
            height:         '32px',
            borderRadius:   '50%',
            background:     '#FF6B00',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontFamily:     'Bebas Neue, sans-serif',
            fontSize:       '14px',
            color:          '#fff',
            flexShrink:     0,
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
