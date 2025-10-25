import { motion, AnimatePresence } from 'framer-motion';
import { FireworksBackground } from './FireworksBackground';
import { TextGenerateEffect } from './TextGenerateEffect';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessModal = ({ isOpen, onClose }: SuccessModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Fireworks Background */}
          <div className="absolute inset-0 pointer-events-none">
            <FireworksBackground
              population={2}
              color={['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']}
              particleSpeed={{ min: 3, max: 8 }}
              particleSize={{ min: 2, max: 6 }}
            />
          </div>

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, rotateX: 40, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            exit={{ scale: 0.8, rotateX: 40, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="bg-green-500/20 rounded-full p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-500"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-heading text-3xl md:text-4xl font-bold text-white"
              >
                🎉 Congratulations!
              </motion.h2>

              {/* Animated Text Message */}
              <TextGenerateEffect
                words="Thank you for signing up for Connecta event!"
                className="text-lg md:text-xl text-white/90 font-body"
                duration={0.3}
              />

              {/* Event Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-3 text-left border border-white/10"
              >
                <div className="flex items-center gap-3 text-white/90">
                  <span className="text-2xl">📍</span>
                  <span className="font-body">El Manara Hall 4</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <span className="text-2xl">📅</span>
                  <span className="font-body">17-19 November 2025</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <span className="text-2xl">🕐</span>
                  <span className="font-body">10:00 AM - 8:00 PM</span>
                </div>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="text-white/70 font-body text-sm"
              >
                We're excited to see you there! 🚀
              </motion.p>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                onClick={onClose}
                className="w-full bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-body font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/50"
              >
                Got it!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
