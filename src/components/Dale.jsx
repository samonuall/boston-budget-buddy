import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------- helpers ----------
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const defaultQuotes = [
  'Woof! Keep saving those treats!',
  'Every penny counts... just like every belly rub!',
  'You got this, budget boss!',
];

// ---------- mood configs ----------
const moodConfigs = {
  happy: {
    tailWag: true,
    hop: true,
    earDroop: 0,
    hideAmount: 0,
    eyeState: 'open',
    walk: true,
    bodyColor: '#8B6914',
  },
  nervous: {
    tailWag: false,
    hop: false,
    earDroop: 12,
    hideAmount: 0,
    eyeState: 'wide',
    walk: false,
    bodyColor: '#8B6914',
  },
  alarmed: {
    tailWag: false,
    hop: false,
    earDroop: 6,
    hideAmount: 28,
    eyeState: 'wide',
    walk: false,
    bodyColor: '#8B6914',
  },
  sleeping: {
    tailWag: false,
    hop: false,
    earDroop: 14,
    hideAmount: 0,
    eyeState: 'closed',
    walk: false,
    bodyColor: '#8B6914',
  },
  greeting: {
    tailWag: true,
    hop: true,
    earDroop: 0,
    hideAmount: 0,
    eyeState: 'open',
    walk: true,
    bodyColor: '#8B6914',
  },
};

// ---------- SVG sub-components ----------

/** Tail – optionally wagging */
function Tail({ wag }) {
  return (
    <motion.g
      style={{ originX: '0px', originY: '20px', transformOrigin: '0px 20px' }}
      animate={
        wag
          ? { rotate: [0, 30, -10, 25, -5, 0] }
          : { rotate: -8 }
      }
      transition={
        wag
          ? { duration: 0.6, repeat: Infinity, repeatDelay: 0.3, ease: 'easeInOut' }
          : { duration: 0.4 }
      }
    >
      {/* tail shape */}
      <path
        d="M0,20 Q-6,4 -2,-6 Q2,-10 6,-4 Q4,6 0,20Z"
        fill="#6B4F12"
        stroke="#5A3E0E"
        strokeWidth="0.5"
      />
    </motion.g>
  );
}

/** Floppy ears */
function Ear({ side, droop }) {
  const flip = side === 'left' ? 1 : -1;
  return (
    <motion.path
      d={`M0,0 Q${flip * 10},${4 + droop} ${flip * 6},${14 + droop} Q${flip * 2},${10 + droop} 0,0Z`}
      fill="#6B4F12"
      stroke="#5A3E0E"
      strokeWidth="0.4"
      animate={{ d: `M0,0 Q${flip * 10},${4 + droop} ${flip * 6},${14 + droop} Q${flip * 2},${10 + droop} 0,0Z` }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    />
  );
}

/** Eyes */
function Eyes({ state }) {
  if (state === 'closed') {
    return (
      <>
        {/* left eye closed */}
        <path d="M-5,0 Q-3,-2 -1,0" fill="none" stroke="#2C1810" strokeWidth="1.2" strokeLinecap="round" />
        {/* right eye closed */}
        <path d="M4,0 Q6,-2 8,0" fill="none" stroke="#2C1810" strokeWidth="1.2" strokeLinecap="round" />
        {/* zzz */}
        <motion.text
          x="14"
          y="-10"
          fontSize="7"
          fill="#6B4F12"
          fontFamily="sans-serif"
          fontWeight="bold"
          animate={{ opacity: [0, 1, 0], y: [-10, -18, -10] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          z
        </motion.text>
        <motion.text
          x="20"
          y="-16"
          fontSize="5"
          fill="#6B4F12"
          fontFamily="sans-serif"
          fontWeight="bold"
          animate={{ opacity: [0, 0, 1, 0], y: [-16, -16, -22, -16] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          z
        </motion.text>
      </>
    );
  }

  const r = state === 'wide' ? 2.8 : 2.2;
  const pupilR = state === 'wide' ? 1.4 : 1.1;
  return (
    <>
      {/* left eye */}
      <circle cx="-3" cy="0" r={r} fill="#2C1810" />
      <circle cx="-2.4" cy="-0.6" r={pupilR} fill="#FFFFFF" opacity="0.6" />
      {/* right eye */}
      <circle cx="6" cy="0" r={r} fill="#2C1810" />
      <circle cx="6.6" cy="-0.6" r={pupilR} fill="#FFFFFF" opacity="0.6" />
      {/* brow hints for alarmed */}
      {state === 'wide' && (
        <>
          <path d="M-6,-4 Q-3,-6 0,-4" fill="none" stroke="#5A3E0E" strokeWidth="0.7" />
          <path d="M3,-4 Q6,-6 9,-4" fill="none" stroke="#5A3E0E" strokeWidth="0.7" />
        </>
      )}
    </>
  );
}

/** Nose & mouth */
function Snout() {
  return (
    <>
      {/* nose */}
      <ellipse cx="2" cy="8" rx="3" ry="2.2" fill="#2C1810" />
      {/* nostrils */}
      <circle cx="0.8" cy="7.8" r="0.5" fill="#1A0E08" />
      <circle cx="3.2" cy="7.8" r="0.5" fill="#1A0E08" />
      {/* mouth */}
      <path d="M0,10 Q2,13 4,10" fill="none" stroke="#2C1810" strokeWidth="0.7" strokeLinecap="round" />
    </>
  );
}

/** Little legs */
function Legs({ mood }) {
  const isWalking = mood === 'happy' || mood === 'greeting';
  const legVariants = {
    idle: (i) => ({ rotate: 0, transition: { duration: 0.4 } }),
    walk: (i) => ({
      rotate: [8, -8, 8],
      transition: {
        duration: 0.35,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: i * 0.09,
      },
    }),
  };

  const legPositions = [
    { x: -22, label: 'frontLeft' },
    { x: -14, label: 'frontRight' },
    { x: 18, label: 'backLeft' },
    { x: 26, label: 'backRight' },
  ];

  return (
    <>
      {legPositions.map((leg, i) => (
        <motion.g
          key={leg.label}
          style={{ originX: `${leg.x + 3}px`, originY: '0px', transformOrigin: `${leg.x + 3}px 0px` }}
          custom={i}
          animate={isWalking ? 'walk' : 'idle'}
          variants={legVariants}
        >
          <rect
            x={leg.x}
            y={0}
            width={6}
            height={14}
            rx={3}
            fill="#8B6914"
            stroke="#6B4F12"
            strokeWidth="0.5"
          />
          {/* paw */}
          <ellipse cx={leg.x + 3} cy={14} rx={4} ry={2.4} fill="#6B4F12" />
        </motion.g>
      ))}
    </>
  );
}

// ---------- Speech bubble ----------
function SpeechBubble({ text, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.85 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 10,
        background: '#FFFDF5',
        border: '2px solid #D4A843',
        borderRadius: 14,
        padding: '10px 16px',
        maxWidth: 220,
        fontSize: 13,
        lineHeight: 1.45,
        color: '#3D2E0A',
        fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
        fontWeight: 600,
        boxShadow: '0 4px 16px rgba(107, 79, 18, 0.18)',
        cursor: 'pointer',
        whiteSpace: 'normal',
        textAlign: 'center',
        zIndex: 10001,
        pointerEvents: 'auto',
      }}
    >
      {text}
      {/* little triangle pointer */}
      <span
        style={{
          position: 'absolute',
          bottom: -9,
          left: '50%',
          marginLeft: -7,
          width: 0,
          height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '9px solid #D4A843',
        }}
      />
      <span
        style={{
          position: 'absolute',
          bottom: -6,
          left: '50%',
          marginLeft: -6,
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid #FFFDF5',
        }}
      />
    </motion.div>
  );
}

// ---------- Main DaleSVG (the inline dachshund) ----------
function DaleSVG({ config }) {
  const { tailWag, earDroop, eyeState } = config;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-50 -55 130 90"
      width="140"
      height="100"
      style={{ overflow: 'visible', display: 'block' }}
    >
      {/* === body group === */}
      <g>
        {/* shadow on ground */}
        <ellipse cx="2" cy="18" rx="40" ry="4" fill="rgba(0,0,0,0.08)" />

        {/* --- Tail (far back) --- */}
        <g transform="translate(34, -14)">
          <Tail wag={tailWag} />
        </g>

        {/* --- Body --- */}
        {/* main torso – the long dachshund shape */}
        <ellipse cx="2" cy="-6" rx="36" ry="16" fill="#8B6914" />
        {/* belly highlight */}
        <ellipse cx="2" cy="0" rx="30" ry="9" fill="#A07D1E" opacity="0.45" />
        {/* back shading */}
        <ellipse cx="2" cy="-16" rx="28" ry="6" fill="#6B4F12" opacity="0.3" />

        {/* --- Legs --- */}
        <g transform="translate(2, 8)">
          <Legs mood={config.walk ? 'happy' : 'idle'} />
        </g>

        {/* --- Chest tuft --- */}
        <ellipse cx="-28" cy="-2" rx="7" ry="10" fill="#A07D1E" opacity="0.5" />

        {/* --- Head --- */}
        <g transform="translate(-34, -20)">
          {/* head shape */}
          <ellipse cx="2" cy="4" rx="16" ry="14" fill="#8B6914" />
          {/* cheek highlight */}
          <ellipse cx="-4" cy="8" rx="6" ry="4" fill="#A07D1E" opacity="0.35" />

          {/* left ear */}
          <g transform="translate(-10, -4)">
            <Ear side="left" droop={earDroop} />
          </g>
          {/* right ear */}
          <g transform="translate(12, -4)">
            <Ear side="right" droop={earDroop} />
          </g>

          {/* eyes */}
          <g transform="translate(-1, 0)">
            <Eyes state={eyeState} />
          </g>

          {/* snout */}
          <g transform="translate(-1, 2)">
            <Snout />
          </g>

          {/* eyebrows (subtle) */}
          <path d="M-6,-6 Q-3,-9 0,-6" fill="none" stroke="#6B4F12" strokeWidth="0.6" opacity="0.5" />
          <path d="M3,-6 Q6,-9 9,-6" fill="none" stroke="#6B4F12" strokeWidth="0.6" opacity="0.5" />
        </g>

        {/* --- Collar --- */}
        <g transform="translate(-22, -8)">
          <rect x="-4" y="0" width="14" height="4" rx="2" fill="#C0392B" />
          {/* tag */}
          <circle cx="3" cy="5" r="2.5" fill="#F4D03F" stroke="#C8A415" strokeWidth="0.5" />
          <text x="3" y="6.3" fontSize="3" fill="#8B6914" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
            D
          </text>
        </g>
      </g>
    </svg>
  );
}

// ---------- Dale component ----------
export default function Dale({ mood = 'greeting', quotes = defaultQuotes }) {
  const [showBubble, setShowBubble] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [walkX, setWalkX] = useState(0);

  const config = moodConfigs[mood] || moodConfigs.greeting;

  // auto-dismiss speech bubble
  useEffect(() => {
    if (!showBubble) return;
    const timer = setTimeout(() => setShowBubble(false), 4000);
    return () => clearTimeout(timer);
  }, [showBubble, currentQuote]);

  // walking drift for happy / greeting
  useEffect(() => {
    if (!config.walk) {
      setWalkX(0);
      return;
    }
    let frame;
    let start = null;
    const speed = 0.012; // pixels per ms (slow amble)
    const range = 120; // how far Dale wanders from center

    const step = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      // gentle sine drift
      setWalkX(Math.sin(elapsed * speed * 0.05) * range);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [config.walk]);

  const handleClick = () => {
    const q = quotes && quotes.length > 0 ? quotes : defaultQuotes;
    setCurrentQuote(pickRandom(q));
    setShowBubble((prev) => !prev);
  };

  // idle breathing / bobbing
  const idleBob = {
    y: [0, -3, 0],
  };
  const idleTransition = {
    duration: 2.8,
    repeat: Infinity,
    ease: 'easeInOut',
  };

  // hop for happy / greeting
  const hopAnimation = config.hop
    ? {
        y: [0, -10, 0, -4, 0],
      }
    : {};
  const hopTransition = config.hop
    ? {
        duration: 0.7,
        repeat: Infinity,
        repeatDelay: 2.2,
        ease: 'easeInOut',
      }
    : {};

  // alarmed – partially hidden
  const hideY = config.hideAmount;

  // sleeping curl – scale down slightly to look curled
  const sleepScale = mood === 'sleeping' ? 0.88 : 1;

  // nervous cautious sway
  const nervousSway =
    mood === 'nervous'
      ? { x: [0, -3, 3, -2, 0] }
      : {};
  const nervousTransition =
    mood === 'nervous'
      ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      : {};

  return (
    <motion.div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        zIndex: 10000,
        cursor: 'pointer',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
      animate={{
        x: walkX - 70, // center offset for 140px wide SVG
      }}
      transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
    >
      {/* speech bubble */}
      <AnimatePresence>
        {showBubble && currentQuote && (
          <SpeechBubble
            key="bubble"
            text={currentQuote}
            onClose={() => setShowBubble(false)}
          />
        )}
      </AnimatePresence>

      {/* Dale's animated wrapper */}
      <motion.div
        onClick={handleClick}
        animate={{
          ...idleBob,
          ...hopAnimation,
          ...nervousSway,
          translateY: hideY,
          scale: sleepScale,
        }}
        transition={{
          // merge transitions – idle breathing is the base
          ...idleTransition,
          ...(config.hop ? hopTransition : {}),
          ...(mood === 'nervous' ? nervousTransition : {}),
          translateY: { duration: 0.6, ease: 'easeInOut' },
          scale: { duration: 0.8, ease: 'easeInOut' },
        }}
        whileHover={{ scale: sleepScale * 1.08 }}
        whileTap={{ scale: sleepScale * 0.95 }}
        style={{ position: 'relative' }}
      >
        <DaleSVG config={config} />
      </motion.div>
    </motion.div>
  );
}
