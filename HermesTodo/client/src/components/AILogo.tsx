export function AILogo({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`ai-logo ${className}`} aria-hidden="true" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 116" role="presentation">
        <defs>
          <linearGradient id="ai-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3d18a"/>
            <stop offset=".38" stopColor="#b97a2f"/>
            <stop offset=".7" stopColor="#e0b766"/>
            <stop offset="1" stopColor="#76501f"/>
          </linearGradient>
          <linearGradient id="ai-ivory" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff8e9"/>
            <stop offset=".55" stopColor="#efe1c7"/>
            <stop offset="1" stopColor="#dcc7a6"/>
          </linearGradient>
          <filter id="ai-shadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.4" floodColor="#0b1116" floodOpacity=".62"/>
          </filter>
        </defs>
        <path d="M50 3 89 17v34c0 28-15 47-39 61C26 98 11 79 11 51V17L50 3Z"
          fill="url(#ai-gold)" stroke="#5a3514" strokeWidth="2.2" filter="url(#ai-shadow)"/>
        <path d="M50 9 83 21v30c0 23-12 40-33 53C29 91 17 74 17 51V21L50 9Z"
          fill="url(#ai-ivory)" stroke="#c69749" strokeWidth="1.5"/>
        <path d="M50 15 77 25v26c0 20-10 34-27 45C33 85 23 71 23 51V25L50 15Z"
          fill="none" stroke="#8e6a38" strokeWidth=".8" opacity=".5"/>
        <path d="m50 18 2.5 7.5L60 28l-7.5 2.5L50 38l-2.5-7.5L40 28l7.5-2.5L50 18Z"
          fill="url(#ai-gold)" stroke="#75501f" strokeWidth=".7"/>
        <text x="50" y="67" textAnchor="middle" fill="#202327" stroke="#7c5a2c" strokeWidth=".45"
          fontFamily="Georgia, 'Times New Roman', serif" fontSize="34" fontWeight="700" letterSpacing="-2">AI</text>
        <path d="M31 78c7-1 13 1 19 7 6-6 12-8 19-7v13c-7-1-13 1-19 6-6-5-12-7-19-6V78Z"
          fill="url(#ai-gold)" stroke="#6e471b" strokeWidth="1.1"/>
        <path d="M50 84v13" stroke="#6e471b" strokeWidth="1"/>
        <circle cx="18" cy="48" r="1.3" fill="#d0a24e"/>
        <circle cx="82" cy="48" r="1.3" fill="#d0a24e"/>
      </svg>
    </span>
  );
}