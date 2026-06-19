import { motion } from 'motion/react';

interface LoaderProps {
  text?: string;
  variant?: 'inline' | 'full';
}

export default function Loader({ text = "Loading...", variant = 'inline' }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center w-12 h-12">
        {/* Outer spinning ring */}
        <motion.div 
          className="absolute w-12 h-12 rounded-full border border-warm-dark/30 border-t-sage border-r-sage"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner pulsing ring */}
        <motion.div 
          className="absolute w-8 h-8 rounded-full border border-sage/20 border-b-sage/40"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5], rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Center dot */}
        <motion.div 
          className="w-1.5 h-1.5 bg-sage rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {text && (
        <motion.span 
          className="text-[10px] text-muted-dark uppercase tracking-[0.25em] font-bold"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );

  if (variant === 'full') {
    return (
      <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center w-full h-full">
        {content}
      </div>
    );
  }

  return (
    <div className="py-8 w-full flex justify-center">
      {content}
    </div>
  );
}
