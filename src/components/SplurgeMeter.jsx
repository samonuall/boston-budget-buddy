import { useBudget } from '../hooks/useBudget';
import { motion } from 'framer-motion';

export default function SplurgeMeter() {
  const { needsSpent, wantsSpent, treatsSpent } = useBudget();
  
  const totalTracked = needsSpent + wantsSpent + treatsSpent;
  
  const needsPct = totalTracked > 0 ? (needsSpent / totalTracked) * 100 : 0;
  const wantsPct = totalTracked > 0 ? (wantsSpent / totalTracked) * 100 : 0;
  const treatsPct = totalTracked > 0 ? (treatsSpent / totalTracked) * 100 : 0;

  return (
    <div className="w-full space-y-4 bg-white p-8 rounded-[1.5rem] shadow-lg border-2 border-sage-light/30">
      <div className="flex justify-between text-base font-bold gap-6">
        <span className="text-sage-dark flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-sage flex-shrink-0"></span>
          <span className="truncate">Needs {Math.round(needsPct)}%</span>
        </span>
        <span className="text-dusty-purple-dark flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-dusty-purple flex-shrink-0"></span>
          <span className="truncate">Wants {Math.round(wantsPct)}%</span>
        </span>
        <span className="text-warm-rose flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-warm-rose flex-shrink-0"></span>
          <span className="truncate">Treats {Math.round(treatsPct)}%</span>
        </span>
      </div>

      <div className="h-7 w-full bg-cream-dark/50 rounded-full flex overflow-hidden shadow-inner border-2 border-cream-dark/30">
        {needsPct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${needsPct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full bg-sage shadow-sm"
          />
        )}
        {wantsPct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${wantsPct}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
            className="h-full bg-dusty-purple shadow-sm"
          />
        )}
        {treatsPct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${treatsPct}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
            className="h-full bg-warm-rose shadow-sm"
          />
        )}
      </div>
    </div>
  );
}
