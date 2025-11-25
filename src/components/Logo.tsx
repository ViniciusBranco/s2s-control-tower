import React from "react";

export const Logo = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 512 512"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="15" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a5f3fc" />
                </linearGradient>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#172554" />
                </linearGradient>
            </defs>

            {/* Background Container */}
            <rect width="512" height="512" rx="128" fill="url(#bgGradient)" />

            {/* Abstract Network/Book Structure */}
            <g opacity="0.5">
                {/* Network Nodes representing 'pages' */}
                <circle cx="140" cy="200" r="12" fill="#60a5fa" />
                <circle cx="140" cy="350" r="12" fill="#60a5fa" />
                <circle cx="220" cy="275" r="12" fill="#60a5fa" />

                <circle cx="372" cy="200" r="12" fill="#60a5fa" />
                <circle cx="372" cy="350" r="12" fill="#60a5fa" />
                <circle cx="292" cy="275" r="12" fill="#60a5fa" />

                {/* Connections */}
                <path
                    d="M140 200 L140 350 L220 275 Z"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                <path
                    d="M372 200 L372 350 L292 275 Z"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />

                {/* Spine / Center connection */}
                <path
                    d="M220 275 L292 275"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
            </g>

            {/* Rising Arrow (Scale) */}
            <g filter="url(#glow)">
                {/* Main Shaft */}
                <path
                    d="M120 400 L380 140"
                    stroke="url(#arrowGradient)"
                    strokeWidth="40"
                    strokeLinecap="round"
                    fill="none"
                />
                {/* Arrowhead */}
                <path
                    d="M280 140 L380 140 L380 240"
                    stroke="url(#arrowGradient)"
                    strokeWidth="40"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </g>

            {/* Highlight Dot at origin of arrow */}
            <circle cx="120" cy="400" r="16" fill="#fff" filter="url(#glow)" />

        </svg>
    );
};
