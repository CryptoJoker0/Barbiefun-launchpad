type ChainIconProps = {
  chain: string;
  className?: string;
  size?: number;
};

/**
 * Consistent-sizing SVG chain marks. These are stylized, brand-accurate
 * renditions (correct colors/shape language) rather than pixel-copies of
 * trademarked logo files, so the app never ships third-party brand assets
 * without a license while still looking sharp and instantly recognizable.
 */
export default function ChainIcon({ chain, className = "", size = 28 }: ChainIconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    className,
  };

  switch (chain) {
    case "bnb":
      return (
        <svg {...props}>
          <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
          <g fill="#fff">
            <path d="M16 6.5 19.7 10.2 16 13.9 12.3 10.2Z" />
            <path d="M9.3 12.9 13 16.6 9.3 20.3 5.6 16.6Z" />
            <path d="M22.7 12.9 26.4 16.6 22.7 20.3 19 16.6Z" />
            <path d="M16 18.1 19.7 21.8 16 25.5 12.3 21.8Z" />
            <path d="M16 14.3 18.7 17 16 19.7 13.3 17Z" />
          </g>
        </svg>
      );
    case "ethereum":
      return (
        <svg {...props}>
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <g fill="#fff">
            <path fillOpacity="0.6" d="M16.3 4v8.6l7.3 3.3Z" />
            <path d="M16.3 4 9 15.9l7.3-3.3Z" />
            <path fillOpacity="0.6" d="M16.3 21.9v6.1L23.6 17Z" />
            <path d="M16.3 28v-6.1L9 17Z" />
            <path fillOpacity="0.2" d="M16.3 20.6 23.6 15.9l-7.3-3.3Z" />
            <path fillOpacity="0.6" d="M9 15.9l7.3 4.7v-8Z" />
          </g>
        </svg>
      );
    case "xlayer":
      return (
        <svg {...props}>
          <rect width="32" height="32" rx="16" fill="#000" />
          <path d="M9 9h4.4l2.6 3.7L18.6 9H23l-6.4 8.9L23 23h-4.4l-2.6-3.6L13.4 23H9l6.4-9Z" fill="#fff" />
        </svg>
      );
    case "tempo":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="tempoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="16" fill="url(#tempoGrad)" />
          <circle cx="16" cy="16" r="8.5" stroke="#fff" strokeWidth="1.6" fill="none" />
          <path d="M16 10.5v6l4 2.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "arc":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="16" fill="url(#arcGrad)" />
          <path d="M8 21c2.5-7 6.5-11 8-11s5.5 4 8 11" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="16" cy="21" r="1.6" fill="#fff" />
        </svg>
      );
    case "x1":
      return (
        <svg {...props}>
          <circle cx="16" cy="16" r="16" fill="#FF6B35" />
          <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="sans-serif">
            X1
          </text>
        </svg>
      );
    case "robinhood":
      return (
        <svg {...props}>
          <circle cx="16" cy="16" r="16" fill="#00C805" />
          <path
            d="M16 7c3 3.4 5.4 6.6 5.4 10 0 3-2.4 5.4-5.4 5.4S10.6 20 10.6 17c0-1.7.8-3.4 2-5-0.6 2.6.2 4.3 1.6 5.4-0.3-2.7 0.2-5.6 1.8-10.4Z"
            fill="#fff"
          />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="16" cy="16" r="16" fill="#e5e7eb" />
          <text x="16" y="21" textAnchor="middle" fontSize="14" fill="#6b7280">
            ?
          </text>
        </svg>
      );
  }
}
