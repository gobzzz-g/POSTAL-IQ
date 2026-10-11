import { Variants } from 'motion/react'

/**
 * Standard easing curve for premium, editorial feel
 */
export const premiumEase = [0.22, 1, 0.36, 1] as const

/**
 * Container variant that staggers child animations
 */
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0.04): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
})

/**
 * Fade and subtle slide up for individual cards, list items, headings
 */
export const fadeInScaleUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: premiumEase,
    },
  },
}

/**
 * Hero element variant with slightly larger vertical displacement
 */
export const heroItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: premiumEase,
    },
  },
}

/**
 * Section container viewport reveal
 */
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
}

/**
 * Smooth subtle scale hover
 */
export const cardHover = {
  rest: { y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  hover: { y: -4, transition: { duration: 0.2, ease: 'easeOut' } },
}

/**
 * Page route transition variants
 */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.16,
      ease: 'easeIn',
    },
  },
}
