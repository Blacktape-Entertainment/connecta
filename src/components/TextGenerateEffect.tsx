'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { cn } from '../lib/utils';

export interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: TextGenerateEffectProps) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const wordsArray = words.split(' ');

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const renderWords = () => {
    return (
      <motion.div ref={ref} initial="hidden" animate={controls}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            variants={{
              hidden: {
                opacity: 0,
                filter: filter ? 'blur(10px)' : 'none',
              },
              visible: {
                opacity: 1,
                filter: filter ? 'blur(0px)' : 'none',
              },
            }}
            transition={{
              duration: duration,
              delay: idx * 0.1,
            }}
            className="inline-block"
          >
            {word}{' '}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return (
    <div className={cn('font-bold', className)}>
      <div className="mt-4">
        <div className="leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
