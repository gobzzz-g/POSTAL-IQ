import React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { pageVariants } from './motionVariants'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
