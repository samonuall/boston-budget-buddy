import { motion, AnimatePresence } from 'framer-motion';
import { HAT_ANCHOR, DALE_HATS } from '../utils/constants';
// Imported, not referenced as "/dale.png". Vite cannot rewrite a path inside a
// JSX string literal, so an absolute one survives into the bundle and resolves
// against the filesystem root under file:// — the packaged app showed no dog.
// Importing routes it through the asset pipeline, which honours `base: './'`.
import daleImage from '../assets/dale.png';

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
        marginBottom: 16,
        background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF9EB 100%)',
        border: '3px solid #D4A843',
        borderRadius: 24,
        padding: '14px 22px',
        width: 'max-content',
        maxWidth: 260,
        fontSize: 15,
        lineHeight: 1.5,
        color: '#3D2E0A',
        fontWeight: 700,
        boxShadow: '0 8px 24px rgba(107, 79, 18, 0.25), 0 2px 8px rgba(107, 79, 18, 0.15)',
        cursor: 'pointer',
        textAlign: 'center',
        zIndex: 20,
      }}
    >
      {text}
      {/* rounded triangle pointer */}
      <span
        style={{
          position: 'absolute', bottom: -12, left: '50%', marginLeft: -10,
          width: 0, height: 0,
          borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
          borderTop: '12px solid #D4A843',
        }}
      />
      <span
        style={{
          position: 'absolute', bottom: -8, left: '50%', marginLeft: -8,
          width: 0, height: 0,
          borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
          borderTop: '10px solid #FFFDF5',
        }}
      />
    </motion.div>
  );
}

// ---------- Dale ----------
export default function Dale({
  hat = null,
  quote = '',
  isEating = false,
  isHovered = false,
  size = 200,
  onClick,
  onDismissQuote,
  innerRef,
}) {
  const hatDef = DALE_HATS.find((h) => h.id === hat);

  return (
    <div
      ref={innerRef}
      onClick={onClick}
      style={{ position: 'relative', width: size, cursor: 'pointer', userSelect: 'none' }}
    >
      <AnimatePresence>
        {quote && <SpeechBubble key="bubble" text={quote} onClose={onDismissQuote} />}
      </AnimatePresence>

      <motion.div
        animate={
          isEating
            ? { rotate: [0, -7, 6, -5, 4, 0], scale: [1, 1.07, 0.98, 1.05, 1], y: 0 }
            : { y: [0, -8, 0], rotate: 0, scale: isHovered ? 1.05 : 1 }
        }
        transition={
          isEating
            ? { duration: 0.9, ease: 'easeInOut' }
            : {
                y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 0.2 },
              }
        }
        style={{
          position: 'relative',
          filter: 'drop-shadow(0 6px 14px rgba(107, 79, 18, 0.22))',
        }}
      >
        <img
          src={daleImage}
          alt="Dale the Dachshund"
          draggable={false}
          style={{ width: size, height: 'auto', display: 'block', pointerEvents: 'none' }}
        />

        {/* Hat, anchored to Dale's head */}
        <AnimatePresence>
          {hatDef && (
            <motion.span
              key={hatDef.id}
              className="emoji"
              initial={{ opacity: 0, y: -22, rotate: hatDef.rotate - 25 }}
              animate={{ opacity: 1, y: 0, rotate: hatDef.rotate }}
              exit={{ opacity: 0, y: -22, rotate: hatDef.rotate + 25 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              style={{
                position: 'absolute',
                left: `${HAT_ANCHOR.left + hatDef.dx}%`,
                top: `${HAT_ANCHOR.top + hatDef.dy}%`,
                fontSize: size * (HAT_ANCHOR.size / 100) * hatDef.scale,
                translate: '-50% -50%',
                pointerEvents: 'none',
                filter: 'drop-shadow(0 2px 4px rgba(107, 79, 18, 0.3))',
              }}
            >
              {hatDef.emoji}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
