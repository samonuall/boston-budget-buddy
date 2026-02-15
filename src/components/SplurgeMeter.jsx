import { useBudget } from '../hooks/useBudget';
import { motion } from 'framer-motion';

export default function SplurgeMeter() {
  const { needsSpent, wantsSpent, treatsSpent } = useBudget();
  
  const totalTracked = needsSpent + wantsSpent + treatsSpent;
  
  const needsPct = totalTracked > 0 ? (needsSpent / totalTracked) * 100 : 0;
  const wantsPct = totalTracked > 0 ? (wantsSpent / totalTracked) * 100 : 0;
  const treatsPct = totalTracked > 0 ? (treatsSpent / totalTracked) * 100 : 0;

  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between text-sm font-semibold text-text-light">
        <span className="text-sage-dark">Needs {Math.round(needsPct)}%</span>
        <span className="text-dusty-purple-dark">Wants {Math.round(wantsPct)}%</span>
        <span className="text-warm-rose">Treats {Math.round(treatsPct)}%</span>
      </div>
      
      <div className="h-4 w-full bg-cream-dark/30 rounded-full flex overflow-hidden shadow-inner">
        {needsPct > 0 && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${needsPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-sage"
          />
        )}
        {wantsPct > 0 && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${wantsPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="h-full bg-dusty-purple"
          />
        )}
        {treatsPct > 0 && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${treatsPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="h-full bg-warm-rose"
          />
        )}
      </div>
    </div>
  );
}
