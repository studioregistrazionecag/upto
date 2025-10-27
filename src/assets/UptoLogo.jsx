// src/assets/UptoLogo.jsx
import React from 'react';

const UptoLogo = ({ className }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>
        {`
          .base-text {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 80px;
            font-weight: bold;
            letter-spacing: 2px;
            text-anchor: middle;
          }

          .glow-layer {
            /* Applica la nuova animazione a doppio battito */
            animation: double-beat-pulse 3s ease-in-out infinite;
          }

          /*
            NUOVA ANIMAZIONE "DOUBLE BEAT":
            - C'è una lunga pausa fino al 50%.
            - Due battiti ravvicinati (uno al 60%, uno all'80%).
            - Un'altra pausa fino alla fine.
          */
          @keyframes double-beat-pulse {
            0%, 50%, 100% {
              opacity: 0; /* Lo strato è spento per metà del tempo */
            }
            60% {
              opacity: 1; /* Primo battito (veloce) */
            }
            80% {
              opacity: 1; /* Secondo battito (veloce) */
            }
          }
        `}
      </style>
      
      {/* GRUPPO 1: Lo strato base, rosso scuro, sempre visibile */}
      <g filter="url(#neon-glow)" fill="none" strokeWidth="2.5" stroke="#B71C1C">
        <text className="base-text" x="100" y="85">UP</text>
        <text className="base-text" x="100" y="165">TO</text>
      </g>
      
      {/* GRUPPO 2: Lo strato "glow" che pulsa con il doppio battito */}
      <g className="glow-layer" filter="url(#neon-glow)" fill="none" strokeWidth="2.5" stroke="#FF5555">
        <text className="base-text" x="100" y="85">UP</text>
        <text className="base-text" x="100" y="165">TO</text>
      </g>
    </svg>
  );
};

export default UptoLogo;