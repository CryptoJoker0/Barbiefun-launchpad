import robinhoodLogo from "@assets/20260703_080059_1783141834672.jpg";
import x1Logo from "@assets/20260703_080024_1783141834739.jpg";
import pulsechainLogo from "@assets/file_0000000062ac81f48ea11588303a614c_1788099479287.png";

type ChainIconProps = {
  chain: string;
  className?: string;
  size?: number;
};

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

    case "base":
      return (
        <svg {...props}>
          <circle cx="16" cy="16" r="16" fill="#0052FF" />
          <path
            d="M16.0 6C10.477 6 6 10.477 6 16s4.477 10 10 10c5.185 0 9.449-3.947 9.95-9H15.999V14h11.95C27.45 8.477 22.186 6 16 6z"
            fill="#fff"
          />
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

    case "solana":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="solGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9945FF" />
              <stop offset="50%" stopColor="#14F195" />
              <stop offset="100%" stopColor="#9945FF" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="16" fill="url(#solGrad)" />
          <g fill="#fff">
            <path d="M8 11.5h13.5l-2 3H8z" opacity="0.9" />
            <path d="M8 14.5h11.5l-2 3H8z" opacity="0.9" />
            <path d="M8 17.5h13.5l-2 3H8z" opacity="0.9" />
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

    case "pluschain":
      return (
        <img
          src={pulsechainLogo}
          alt="PlusChain"
          width={size}
          height={size}
          className={`${className} rounded-full object-cover`}
          style={{ width: size, height: size }}
        />
      );

    case "x1":
      return (
        <img
          src={x1Logo}
          alt="X1"
          width={size}
          height={size}
          className={`${className} rounded-full object-cover`}
          style={{ width: size, height: size }}
        />
      );

    case "robinhood":
      return (
        <img
          src={robinhoodLogo}
          alt="Robinhood Chain"
          width={size}
          height={size}
          className={`${className} rounded-full object-cover`}
          style={{ width: size, height: size }}
        />
      );

    default:
      return (
        <svg {...props}>
          <circle cx="16" cy="16" r="16" fill="#e5e7eb" />
          <text x="16" y="21" textAnchor="middle" fontSize="14" fill="#6b7280">?</text>
        </svg>
      );
  }
}
