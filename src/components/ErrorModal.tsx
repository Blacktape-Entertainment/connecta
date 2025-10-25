import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function ErrorModal({ 
  isOpen, 
  onClose, 
  title = "Oops!",
  message 
}: ErrorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotateX: -15 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              rotateX: 0,
              transition: {
                type: "spring",
                duration: 0.5,
                bounce: 0.3
              }
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={cn(
              "relative w-full max-w-md bg-linear-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10",
              "rounded-3xl p-8 shadow-2xl",
              "border border-red-500/20",
              "backdrop-blur-xl"
            )}
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                transition: {
                  type: "spring",
                  delay: 0.2,
                  duration: 0.6,
                  bounce: 0.5
                }
              }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-red-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
                {/* Pulsing ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full border-2 border-red-500"
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.3 }
              }}
              className="text-3xl font-bold text-center mb-4 bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
            >
              {title}
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: { delay: 0.4 }
              }}
              className="text-center text-gray-200 mb-8 leading-relaxed"
            >
              {message}
            </motion.p>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.5 }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={cn(
                "w-full py-4 rounded-xl font-semibold text-lg",
                "bg-linear-to-r from-red-500 to-orange-500",
                "text-white shadow-lg hover:shadow-xl",
                "transition-all duration-300",
                "hover:from-red-600 hover:to-orange-600"
              )}
            >
              Got it
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
