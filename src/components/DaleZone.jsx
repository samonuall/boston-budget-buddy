import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useBudget } from '../hooks/useBudget';
import { DALE_HATS, DALE_TREAT_QUOTES } from '../utils/constants';
import { pickDaleQuote } from '../utils/dale';
import Dale from './Dale';

const DALE_SIZE = 200;
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Drag position in *viewport* coordinates, to compare against
 * getBoundingClientRect(). framer-motion's info.point is page-relative, so
 * prefer the native pointer event and fall back to un-scrolling info.point.
 */
function viewportPoint(event, info) {
  if (event && typeof event.clientX === 'number') {
    return { x: event.clientX, y: event.clientY };
  }
  return { x: info.point.x - window.scrollX, y: info.point.y - window.scrollY };
}

const within = (rect, p) =>
  !!rect && p.x >= rect.left && p.x <= rect.right && p.y >= rect.top && p.y <= rect.bottom;

export default function DaleZone() {
  const { daleMood, daleHat, updateDaleHat } = useBudget();

  const [quote, setQuote] = useState('');
  const [isEating, setIsEating] = useState(false);
  const [treatVisible, setTreatVisible] = useState(true);
  const [treatHovering, setTreatHovering] = useState(false);

  // Dale is "home" in his corner, or roaming free over the page. He can only be
  // fed and re-hatted at home — that's what dropping him back in the corner is for.
  const [isHome, setIsHome] = useState(true);
  const [overHome, setOverHome] = useState(false);

  const panelRef = useRef(null); // drop target: the whole corner panel
  const daleRef = useRef(null); // Dale's own box: treat hit-testing
  const eatTimers = useRef([]);
  const dragMoved = useRef(false);

  const roamX = useMotionValue(0);
  const roamY = useMotionValue(0);

  useEffect(() => () => eatTimers.current.forEach(clearTimeout), []);

  // Keep a roaming Dale reachable if the window shrinks under him.
  useEffect(() => {
    if (isHome) return undefined;
    const clamp = () => {
      roamX.set(Math.min(Math.max(0, roamX.get()), Math.max(0, window.innerWidth - DALE_SIZE)));
      roamY.set(Math.min(Math.max(0, roamY.get()), Math.max(0, window.innerHeight - DALE_SIZE)));
    };
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [isHome, roamX, roamY]);

  const panelRect = () => panelRef.current?.getBoundingClientRect();

  // --- talking -------------------------------------------------------------

  const handleDaleClick = () => {
    // A drag ends with a click event on the same element; ignore that one.
    if (dragMoved.current) {
      dragMoved.current = false;
      return;
    }
    if (isEating) return;
    setQuote((prev) => (prev ? '' : pickDaleQuote(daleMood)));
  };

  const trackDrag = (_event, info) => {
    if (Math.abs(info.offset.x) > 4 || Math.abs(info.offset.y) > 4) dragMoved.current = true;
  };

  // --- leaving / returning home -------------------------------------------

  const handleHomeDragEnd = (event, info) => {
    trackDrag(event, info);
    // Released still over the corner → dragSnapToOrigin puts him back.
    if (within(panelRect(), viewportPoint(event, info))) return;

    // Hand off to the roaming layer at exactly the position he was released,
    // so there is no visual jump between the two render modes.
    const rect = daleRef.current?.getBoundingClientRect();
    const p = viewportPoint(event, info);
    roamX.set(rect ? rect.left : p.x - DALE_SIZE / 2);
    roamY.set(rect ? rect.top : p.y - DALE_SIZE / 2);
    setQuote('');
    setIsHome(false);
  };

  const handleRoamDrag = (event, info) => {
    trackDrag(event, info);
    setOverHome(within(panelRect(), viewportPoint(event, info)));
  };

  const handleRoamDragEnd = (event, info) => {
    trackDrag(event, info);
    setOverHome(false);
    if (within(panelRect(), viewportPoint(event, info))) {
      setIsHome(true);
      setQuote('');
    }
  };

  // --- treats --------------------------------------------------------------

  const feedDale = useCallback(() => {
    setTreatVisible(false);
    setIsEating(true);
    setQuote(pickRandom(DALE_TREAT_QUOTES));

    eatTimers.current.forEach(clearTimeout);
    eatTimers.current = [
      setTimeout(() => setIsEating(false), 900),
      setTimeout(() => setTreatVisible(true), 1600),
      setTimeout(() => setQuote(''), 3200),
    ];
  }, []);

  const treatOverDale = (event, info) =>
    within(daleRef.current?.getBoundingClientRect(), viewportPoint(event, info));

  const handleTreatDrag = (event, info) => setTreatHovering(treatOverDale(event, info));

  const handleTreatDragEnd = (event, info) => {
    setTreatHovering(false);
    if (treatOverDale(event, info)) feedDale();
  };

  // --- render --------------------------------------------------------------

  const daleEl = (
    <Dale
      innerRef={daleRef}
      hat={daleHat}
      quote={quote}
      isEating={isEating}
      isHovered={treatHovering}
      size={DALE_SIZE}
      onClick={handleDaleClick}
      onDismissQuote={() => setQuote('')}
    />
  );

  return (
    <div
      ref={panelRef}
      className={`bg-white rounded-[2rem] shadow-lg border-2 px-8 pt-7 pb-8 transition-colors duration-200 ${
        overHome ? 'border-sage-dark bg-sage-light/10' : 'border-sage-light/40'
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <h3 className="text-xl font-extrabold text-text">Dale&rsquo;s Corner</h3>
        <p className="text-xs font-semibold text-text-lighter text-right">
          {isHome
            ? 'Click to chat · drag him a treat · drag him away to explore'
            : 'Drop Dale back here to feed him and change hats'}
        </p>
      </div>

      {/* Dale + treat */}
      <div className="relative flex items-end justify-center gap-6 sm:gap-12 min-h-[230px] pt-14">
        {/* Treat — only at home; he can't be fed while out roaming */}
        <div className="relative w-16 h-16 flex-shrink-0 self-center">
          {isHome && (
            <div
              className={`absolute inset-0 rounded-2xl border-2 border-dashed transition-colors duration-200 ${
                treatVisible ? 'border-cream-dark' : 'border-transparent'
              }`}
            />
          )}
          <AnimatePresence>
            {isHome && treatVisible && (
              <motion.button
                key="treat"
                type="button"
                aria-label="Drag this treat to Dale"
                title="Drag me to Dale!"
                drag
                dragSnapToOrigin
                dragElastic={0.18}
                dragMomentum={false}
                onDrag={handleTreatDrag}
                onDragEnd={handleTreatDragEnd}
                whileDrag={{ scale: 1.25, zIndex: 40, cursor: 'grabbing' }}
                whileHover={{ scale: 1.12, rotate: -8 }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.2, transition: { duration: 0.18 } }}
                className={`emoji absolute inset-0 text-4xl cursor-grab rounded-2xl transition-shadow ${
                  treatHovering ? 'drop-shadow-[0_0_10px_rgba(212,168,67,0.9)]' : ''
                }`}
                style={{ touchAction: 'none' }}
              >
                🦴
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Dale at home, or the empty spot he left behind */}
        {isHome ? (
          <motion.div
            drag
            dragSnapToOrigin
            dragElastic={0.12}
            dragMomentum={false}
            onDragStart={() => {
              dragMoved.current = false;
            }}
            onDrag={trackDrag}
            onDragEnd={handleHomeDragEnd}
            whileDrag={{ cursor: 'grabbing', zIndex: 50 }}
            style={{ cursor: 'grab', touchAction: 'none' }}
          >
            {daleEl}
          </motion.div>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-cream-dark text-center px-6"
            style={{ width: DALE_SIZE, height: DALE_SIZE * 0.8 }}
          >
            <span className="emoji text-3xl opacity-40">🐾</span>
            <p className="text-xs font-semibold text-text-lighter">
              Dale is out exploring.
              <br />
              Drop him here to bring him home.
            </p>
          </div>
        )}
      </div>

      {/* Hat rack */}
      <div className="mt-6 pt-5 border-t-2 border-cream-dark">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-lighter mb-2.5">
          Hat rack{' '}
          <span className="normal-case tracking-normal">
            {isHome
              ? daleHat
                ? '· click again to take it off'
                : ''
              : '· bring Dale home to change his hat'}
          </span>
        </p>
        <div className={`flex flex-wrap gap-2 transition-opacity duration-200 ${isHome ? '' : 'opacity-40'}`}>
          {DALE_HATS.map((hat) => (
            <motion.button
              key={hat.id}
              type="button"
              title={isHome ? hat.label : 'Drop Dale in his corner first'}
              aria-label={hat.label}
              aria-pressed={daleHat === hat.id}
              disabled={!isHome}
              onClick={() => updateDaleHat(hat.id)}
              whileHover={isHome ? { scale: 1.12, y: -2 } : undefined}
              whileTap={isHome ? { scale: 0.94 } : undefined}
              className={`h-12 w-12 flex items-center justify-center rounded-2xl border-2 transition-colors duration-200 ${
                daleHat === hat.id
                  ? 'border-sage-dark bg-sage-light/50 shadow-md'
                  : 'border-cream-dark bg-cream hover:border-sage hover:bg-sage-light/20'
              } ${isHome ? '' : 'cursor-not-allowed'}`}
            >
              <span className="emoji text-2xl">{hat.emoji}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Roaming Dale — portalled to <body> so `position: fixed` is measured
          against the viewport and can't be clipped by an ancestor's overflow
          or turned into a containing block by a parent transform. */}
      {!isHome &&
        createPortal(
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.06}
            onDragStart={() => {
              dragMoved.current = false;
            }}
            onDrag={handleRoamDrag}
            onDragEnd={handleRoamDragEnd}
            whileDrag={{ cursor: 'grabbing', scale: 1.04 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              x: roamX,
              y: roamY,
              // Above the sticky header (z-30), below the settings modal (z-50).
              zIndex: 45,
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            {daleEl}
          </motion.div>,
          document.body
        )}
    </div>
  );
}
