"use client";

import { useId } from "react";

/** SVG coordinates are shared with the worker's motion and impact effects. */
export function WorkerRobot() {
  const id = useId().replace(/:/g, "");
  const shell = `skr-worker-shell-${id}`;
  const face = `skr-worker-face-${id}`;
  const metal = `skr-worker-metal-${id}`;

  return (
    <g className="skr-worker-robot" aria-hidden="true">
      <defs>
        <linearGradient id={shell} x1="-9" y1="-24" x2="10" y2="-2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fcfdff" />
          <stop offset="0.46" stopColor="#f3f7fc" />
          <stop offset="1" stopColor="#cbd8e8" />
        </linearGradient>
        <linearGradient id={face} x1="0" y1="-26" x2="0" y2="-17" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#26384e" />
          <stop offset="1" stopColor="#152133" />
        </linearGradient>
        <linearGradient id={metal} x1="17" y1="-20" x2="23" y2="-11" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e5edf7" />
          <stop offset="0.55" stopColor="#b9cadd" />
          <stop offset="1" stopColor="#819bb8" />
        </linearGradient>
      </defs>

      <g className="skr-worker-torso">
        {/* Compact feet keep the work pose grounded without adding visual noise. */}
        <path
          d="M-4.5-1.8H-1.2V.3Q-2.8 1.1-4.9.3ZM1.2-1.8H4.5L4.9.3Q2.8 1.1 1.2.3Z"
          fill="#b7c8db"
          stroke="#90a8c3"
          strokeWidth=".4"
          strokeLinejoin="round"
        />
        <rect
          x="-7" y="-14" width="14" height="14" rx="3.4"
          fill={`url(#${shell})`}
          stroke="#93abc7"
          strokeWidth=".65"
        />
        <path
          d="M-3.4-12.8H2.6M-5.8-10.5V-5.2"
          fill="none"
          stroke="#fcfdff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity=".9"
        />
        <path d="M-2.4-2.8H2.4" fill="none" stroke="#91accb" strokeWidth=".6" strokeLinecap="round" />
        <rect x="-.9" y="-10.4" width="1.8" height=".85" rx=".42" fill="var(--brand-primary)" opacity=".7" />

        {/* The support arm rests near the hip; the working arm is a sibling. */}
        <g className="skr-worker-support-arm">
          <circle cx="-6.7" cy="-11.1" r="1.55" fill="#c4d3e5" stroke="#93abc7" strokeWidth=".5" />
          <path
            d="M-7.1-11.3C-9-10.4-9.8-8.8-9.1-6.9L-8.5-5.3"
            fill="none"
            stroke="#8fa6c0"
            strokeWidth="3.1"
            strokeLinecap="round"
          />
          <path
            d="M-7.1-11.3C-9-10.4-9.8-8.8-9.1-6.9L-8.5-5.3"
            fill="none"
            stroke="#eff4fb"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <ellipse className="skr-worker-rest-hand" cx="-8.35" cy="-5.25" rx="1.35" ry="1.6" fill="#eef4fc" stroke="#93abc7" strokeWidth=".5" />
          <g className="skr-worker-thumb-hand" transform="translate(-8.35 -5.25) rotate(-95)" opacity="0">
            <path
              d="M-2.2 1.7V-1.1H-.8L-.35-3.2Q-.1-4 .65-3.65Q1.2-3.4.95-2.15L.75-1.1H2Q2.85-1.1 2.65-.1L2.3 1.25Q2.15 1.9 1.45 1.9H-.5Z"
              fill="#f2f7fd" stroke="#93abc7" strokeWidth=".5" strokeLinejoin="round"
            />
            <path d="M-.6-.85V1.65M.35.05H2.2M.35.9H2" fill="none" stroke="#b5c7dc" strokeWidth=".35" strokeLinecap="round" />
          </g>
        </g>
      </g>

      <g className="skr-worker-head">
        <rect x="-9.5" y="-27.5" width="19" height="13" rx="3.8" fill={`url(#${shell})`} stroke="#93abc7" strokeWidth=".7" />
        <path
          d="M-5.6-26.2H4.7"
          fill="none"
          stroke="#fcfdff"
          strokeWidth=".85"
          strokeLinecap="round"
          opacity=".9"
        />
        <rect
          x="-7.6" y="-24.9" width="15.2" height="7.7" rx="2.5"
          fill={`url(#${face})`}
          stroke="#344960"
          strokeWidth=".45"
        />
        <path d="M-5.4-24H5.4" fill="none" stroke="#647a94" strokeWidth=".5" strokeLinecap="round" opacity=".35" />
        <g className="skr-worker-eyes">
          <path
            d="M-5.7-22.2Q-5.7-23.1-4.8-23.1H-2.2Q-1.3-23.1-1.3-22.2V-20.7Q-1.3-20.1-1.9-20.2Q-3.5-21.1-5.1-20.2Q-5.7-20.1-5.7-20.7ZM1.3-22.2Q1.3-23.1 2.2-23.1H4.8Q5.7-23.1 5.7-22.2V-20.7Q5.7-20.1 5.1-20.2Q3.5-21.1 1.9-20.2Q1.3-20.1 1.3-20.7Z"
            fill="color-mix(in srgb, var(--brand-primary) 65%, white)"
            stroke="none"
          />
        </g>
      </g>

      <g className="skr-worker-arm">
        <circle cx="6" cy="-12" r="1.55" fill="#b7c9df" stroke="#93abc7" strokeWidth=".55" />
        <path d="M6.7-11.5L9.7-9.1L13.9-12.9" fill="none" stroke="#8fa6c0" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.7-11.5L9.7-9.1L13.9-12.9" fill="none" stroke="#f0f5fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.7" cy="-9.1" r="1.2" fill="#d0ddec" stroke="#8fa6c0" strokeWidth=".4" />
        <circle cx="9.7" cy="-9.1" r=".43" fill="#94acc6" />

        {/* In this rest pose the hammer's lower striking face touches (20, -11). */}
        <path d="M13-13L20-18" fill="none" stroke="#597999" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13-13L20-18" fill="none" stroke="#b0c5df" strokeWidth=".65" strokeLinecap="round" />
        <path d="M18.3-20H21.7Q22.7-20 22.7-19V-12Q22.7-11 21.7-11H18.3Q17.3-11 17.3-12V-19Q17.3-20 18.3-20Z" fill={`url(#${metal})`} stroke="#7893b1" strokeWidth=".5" />
        <path d="M18.3-19H21.6" fill="none" stroke="#f3f7fd" strokeWidth=".7" strokeLinecap="round" />
        <path d="M18.3-11H21.7" fill="none" stroke="#577798" strokeWidth=".65" strokeLinecap="round" />
        <path d="M12.7-13.9Q13.8-15.2 15.1-14.3L15.9-13.4Q16.4-12.1 15.1-11.5Q13.6-11 12.7-12.1Z" fill="#f2f7fd" stroke="#91a9c4" strokeWidth=".55" />
        <path d="M14.3-13.4L15.3-12.4" fill="none" stroke="#9fb5ce" strokeWidth=".45" strokeLinecap="round" />
      </g>
    </g>
  );
}
