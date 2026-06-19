import { FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-bg-light/60 backdrop-blur-md" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Modal Content */}
      <motion.div 
        className="relative bg-white border border-warm/50 rounded-3xl p-8 max-w-sm w-full soft-shadow flex flex-col items-center"
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-14 h-14 bg-bg-alt rounded-2xl flex items-center justify-center mb-6 border border-warm-dark/30 shadow-sm">
          <FileText className="w-6 h-6 text-sage-dark" />
        </div>
        
        <h3 className="font-serif font-bold text-3xl mb-3 text-text-main">Sign in required</h3>
        <p className="text-muted-dark text-center text-sm mb-8 leading-relaxed px-2">
          Create an account or sign in to save your reports and access full analysis.
        </p>

        {/* Google Sign In Button */}
        <button 
          onClick={onSuccess}
          className="w-full flex items-center justify-center gap-3 bg-white border border-warm-dark/50 p-3.5 rounded-xl hover:bg-bg-alt hover:border-warm-dark transition-all soft-shadow-sm group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.72 17.59V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
            <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.59C14.74 18.25 13.48 18.66 12 18.66C9.14 18.66 6.7 16.73 5.82 14.15H2.15V16.99C3.96 20.59 7.69 23 12 23Z" fill="#34A853"/>
            <path d="M5.82 14.15C5.59 13.48 5.46 12.76 5.46 12C5.46 11.24 5.59 10.52 5.82 9.85V7.01H2.15C1.41 8.49 1 10.19 1 12C1 13.81 1.41 15.51 2.15 16.99L5.82 14.15Z" fill="#FBBC05"/>
            <path d="M12 5.34C13.62 5.34 15.07 5.89 16.22 6.98L19.35 3.85C17.46 2.08 14.97 1 12 1C7.69 1 3.96 3.41 2.15 7.01L5.82 9.85C6.7 7.27 9.14 5.34 12 5.34Z" fill="#EA4335"/>
          </svg>
          <span className="font-bold text-sm text-text-main group-hover:text-black transition-colors">Continue with Google</span>
        </button>

        <button 
          onClick={onClose} 
          className="mt-6 text-[11px] font-bold text-muted hover:text-text-main uppercase tracking-widest transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
