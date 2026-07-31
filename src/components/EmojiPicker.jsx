import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * A small curated emoji picker. Deliberately hand-rolled rather than pulling in
 * emoji-mart: the app ships as an offline Electron build, and a ~1MB emoji
 * dataset is not worth it for a list of budget categories.
 *
 * Each entry is [emoji, searchKeywords].
 */
const EMOJI_GROUPS = [
  {
    name: 'Money',
    emojis: [
      ['💰', 'money bag cash savings'], ['💵', 'dollar cash money bill'], ['💳', 'credit card payment'],
      ['🏦', 'bank building'], ['📈', 'chart up invest stocks growth'], ['📉', 'chart down loss'],
      ['🐖', 'piggy bank savings pig'], ['💎', 'diamond gem luxury'], ['🧾', 'receipt bill invoice'],
      ['🪙', 'coin change money'], ['💸', 'money flying spending'], ['🏧', 'atm cash withdraw'],
    ],
  },
  {
    name: 'Home',
    emojis: [
      ['🏠', 'house home rent'], ['🏡', 'house home garden'], ['🛋️', 'couch sofa furniture living'],
      ['🛏️', 'bed bedroom sleep furniture'], ['🚿', 'shower bath water'], ['🧹', 'broom cleaning chores'],
      ['💡', 'lightbulb utilities electric power'], ['🔑', 'key keys rent lease'], ['🧺', 'laundry basket washing'],
      ['🪑', 'chair furniture'], ['🚪', 'door home'], ['🔌', 'plug electric utilities power'],
      ['🔥', 'fire heat gas heating'], ['💧', 'water drop utilities'], ['🪴', 'plant houseplant green'],
    ],
  },
  {
    name: 'Food & Drink',
    emojis: [
      ['🍕', 'pizza food takeout'], ['🍔', 'burger food fast'], ['🌮', 'taco food mexican'],
      ['🍣', 'sushi food japanese'], ['🍜', 'ramen noodles food soup'], ['🥗', 'salad healthy food'],
      ['🍎', 'apple fruit groceries healthy'], ['🥑', 'avocado food healthy'], ['🍞', 'bread groceries bakery'],
      ['☕', 'coffee cafe drink latte'], ['🍺', 'beer drink alcohol bar'], ['🍷', 'wine drink alcohol'],
      ['🧋', 'boba bubble tea drink'], ['🍦', 'ice cream dessert treat'], ['🛒', 'groceries shopping cart food'],
      ['🥡', 'takeout delivery food'], ['🍳', 'cooking breakfast eggs food'], ['🍫', 'chocolate candy treat snack'],
      ['🥐', 'croissant bakery pastry breakfast'], ['🍰', 'cake dessert birthday'],
    ],
  },
  {
    name: 'Transport',
    emojis: [
      ['🚇', 'subway metro train transit t'], ['🚌', 'bus transit transport'], ['🚗', 'car drive auto'],
      ['🚕', 'taxi uber lyft rideshare cab'], ['🚲', 'bike bicycle cycling'], ['✈️', 'plane flight travel airline'],
      ['🛴', 'scooter transport'], ['⛽', 'gas fuel petrol car'], ['🅿️', 'parking car'],
      ['🚆', 'train commuter rail transit'], ['🛵', 'moped scooter delivery'], ['🚢', 'boat ferry ship'],
      ['🛞', 'tire car maintenance'], ['🧭', 'compass navigation travel'],
    ],
  },
  {
    name: 'Health & Care',
    emojis: [
      ['💪', 'gym fitness workout muscle strength'], ['🏋️', 'gym weights lifting workout'], ['🧘', 'yoga meditation wellness'],
      ['🏃', 'running run cardio exercise'], ['🩺', 'doctor medical health checkup'], ['💊', 'medicine pills pharmacy prescription'],
      ['🦷', 'dentist teeth dental'], ['👓', 'glasses eyes vision optometrist'], ['🧴', 'lotion skincare personal care'],
      ['🧼', 'soap hygiene personal care'], ['💅', 'nails manicure beauty'], ['💇', 'haircut salon barber hair'],
      ['✨', 'sparkle personal care beauty self'], ['🧠', 'therapy mental health brain'], ['🩹', 'bandage first aid health'],
    ],
  },
  {
    name: 'Fun',
    emojis: [
      ['🎮', 'games gaming video console fun'], ['🎬', 'movies cinema film entertainment'], ['🎵', 'music song audio'],
      ['🎧', 'headphones music spotify audio'], ['🎸', 'guitar music instrument'], ['📚', 'books reading library'],
      ['🎨', 'art painting hobby craft'], ['🎟️', 'ticket event concert show'], ['🎳', 'bowling fun activity'],
      ['🎯', 'darts goal target'], ['⚽', 'soccer sports football'], ['🏀', 'basketball sports'],
      ['🏈', 'football sports nfl patriots'], ['⚾', 'baseball sports sox'], ['🍿', 'popcorn movies snack'],
      ['🎪', 'circus event fun'], ['🎲', 'dice games board'], ['📷', 'camera photography hobby'],
    ],
  },
  {
    name: 'Social & Gifts',
    emojis: [
      ['🎉', 'party celebration social fun'], ['🥂', 'cheers drinks celebration social'], ['🎂', 'birthday cake celebration'],
      ['🎁', 'gift present birthday holiday'], ['🍻', 'beers friends social bar drinks'], ['💐', 'flowers gift bouquet'],
      ['💌', 'letter card love gift'], ['🎊', 'confetti party celebration'], ['👯', 'friends social going out'],
      ['💍', 'ring wedding engagement jewelry'], ['🎄', 'christmas holiday gifts'], ['🎃', 'halloween holiday costume'],
    ],
  },
  {
    name: 'Pets',
    emojis: [
      ['🐶', 'dog puppy pet dale'], ['🐕', 'dog pet walk dale'], ['🐾', 'paws pet dog cat dale'],
      ['🦴', 'bone dog treat pet dale'], ['🐱', 'cat kitten pet'], ['🐟', 'fish pet aquarium'],
      ['🦮', 'dog service pet'], ['🧸', 'toy pet stuffed'], ['🐹', 'hamster pet small'],
    ],
  },
  {
    name: 'Tech & Bills',
    emojis: [
      ['💻', 'laptop computer tech software'], ['📱', 'phone mobile cell bill'], ['⌚', 'watch smartwatch tech'],
      ['🖥️', 'monitor desktop computer tech'], ['📡', 'internet wifi satellite bill'], ['🔋', 'battery power charge'],
      ['💾', 'storage backup subscription data'], ['📺', 'tv streaming netflix subscription'], ['🎛️', 'subscription service settings'],
      ['📶', 'signal wifi internet phone bill'],
    ],
  },
  {
    name: 'Travel',
    emojis: [
      ['🧳', 'luggage suitcase travel trip'], ['🏖️', 'beach vacation holiday travel'], ['🗺️', 'map travel trip'],
      ['🏕️', 'camping outdoors tent travel'], ['🎿', 'ski snow winter sport'], ['🛎️', 'hotel stay travel'],
      ['⛰️', 'mountain hiking outdoors'], ['🗽', 'travel city trip landmark'], ['🏝️', 'island vacation travel'],
    ],
  },
  {
    name: 'Work & School',
    emojis: [
      ['💼', 'work business job briefcase'], ['📊', 'reports data work analytics'], ['🎓', 'school education tuition college'],
      ['📖', 'study textbook school reading'], ['🏫', 'school education building'], ['⚖️', 'legal lawyer taxes'],
      ['🖊️', 'pen supplies office stationery'], ['📎', 'office supplies clip'], ['🗂️', 'files documents admin'],
    ],
  },
  {
    name: 'Other',
    emojis: [
      ['⭐', 'star favorite special'], ['❤️', 'heart love charity donation'], ['🌈', 'rainbow misc happy'],
      ['🌙', 'moon night'], ['☀️', 'sun day weather'], ['🍀', 'luck clover lottery'],
      ['🎈', 'balloon fun misc'], ['🛡️', 'insurance protection shield renters safety'], ['♻️', 'recycle eco green'],
      ['🔒', 'security lock safe'], ['⏰', 'time alarm clock reminder'], ['📅', 'calendar monthly recurring date'],
      ['🧩', 'misc puzzle other'], ['🌸', 'flower spring pretty'], ['❓', 'unknown other misc'],
    ],
  },
];

const ALL_EMOJIS = EMOJI_GROUPS.flatMap((g) => g.emojis.map(([e, kw]) => [e, `${kw} ${g.name.toLowerCase()}`]));

export default function EmojiPicker({ value, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const panelRef = useRef(null);

  // Close on outside click / Escape.
  useEffect(() => {
    const onPointerDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return ALL_EMOJIS.filter(([emoji, kw]) => kw.includes(q) || emoji === q).map(([e]) => e);
  }, [query]);

  const renderEmoji = (emoji) => (
    <button
      key={emoji}
      type="button"
      onClick={() => {
        onSelect(emoji);
        onClose();
      }}
      className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all duration-150 hover:bg-sage-light/40 hover:scale-110 ${
        emoji === value ? 'bg-sage-light/60 ring-2 ring-sage-dark' : ''
      }`}
    >
      <span className="emoji text-xl">{emoji}</span>
    </button>
  );

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.95, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute left-0 top-full mt-2 z-50 w-[300px] bg-white rounded-2xl shadow-2xl border-2 border-sage-light/50 p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        autoFocus
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search emoji…"
        className="w-full px-3 py-2 text-sm rounded-xl border-2 border-cream-dark bg-cream focus:border-sage outline-none mb-2"
      />

      <div className="max-h-[240px] overflow-y-auto pr-1">
        {results ? (
          results.length > 0 ? (
            <div className="grid grid-cols-7 gap-0.5">{results.map(renderEmoji)}</div>
          ) : (
            <p className="text-xs text-text-lighter text-center py-6 italic">No emoji match “{query}”</p>
          )
        ) : (
          EMOJI_GROUPS.map((group) => (
            <div key={group.name} className="mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-lighter mb-1 px-1">
                {group.name}
              </p>
              <div className="grid grid-cols-7 gap-0.5">{group.emojis.map(([e]) => renderEmoji(e))}</div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
