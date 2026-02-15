import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';

// ---------- helpers ----------
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const defaultQuotes = [
  'Woof! Keep saving those treats!',
  'Every penny counts... just like every belly rub!',
  'You got this, budget boss!',
];

// ---------- Speech bubble ----------
function SpeechBubble({ text, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.8 }}
      transition={{ duration: 0.4, ease: 'easeOut', type: 'spring', stiffness: 300 }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 20,
        background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF9EB 100%)',
        border: '3px solid #D4A843',
        borderRadius: 24,
        padding: '16px 24px',
        maxWidth: 280,
        fontSize: 15,
        lineHeight: 1.5,
        color: '#3D2E0A',
        fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
        fontWeight: 700,
        boxShadow: '0 8px 24px rgba(107, 79, 18, 0.25), 0 2px 8px rgba(107, 79, 18, 0.15)',
        cursor: 'pointer',
        whiteSpace: 'normal',
        textAlign: 'center',
        zIndex: 10001,
        pointerEvents: 'auto',
      }}
    >
      {text}
      {/* little triangle pointer - rounder */}
      <span
        style={{
          position: 'absolute',
          bottom: -12,
          left: '50%',
          marginLeft: -10,
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '12px solid #D4A843',
        }}
      />
      <span
        style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          marginLeft: -8,
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '10px solid #FFFDF5',
        }}
      />
    </motion.div>
  );
}

// ---------- Dale component ----------
export default function Dale({ mood = 'greeting', quotes = defaultQuotes }) {
  const [showBubble, setShowBubble] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');

  // Use motion values to track position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Set initial position on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      x.set(window.innerWidth / 2 - 75); // Center horizontally (75 is half of 150px width)
      y.set(window.innerHeight - 160); // Bottom of screen
    }
  }, [x, y]);

  const handleClick = () => {
    const q = quotes && quotes.length > 0 ? quotes : defaultQuotes;
    setCurrentQuote(pickRandom(q));
    setShowBubble((prev) => !prev);
  };

  // Dachshund image
  const daleImageUrl = "/dale.png";

  return (
    <motion.div
      drag
      dragElastic={0.1}
      dragMomentum={false}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x,
        y,
        zIndex: 10000,
        cursor: 'grab',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
      transition={{ opacity: { duration: 0.5 } }}
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

      {/* Dale's image */}
      <motion.div
        onClick={handleClick}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.1 }}
        style={{
          position: 'relative',
          filter: 'drop-shadow(0 4px 12px rgba(107, 79, 18, 0.25))',
        }}
      >
        <img
          src={daleImageUrl}
          alt="Dale the Dachshund"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={{
            width: '150px',
            height: 'auto',
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
