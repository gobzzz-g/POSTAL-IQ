import React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { sectionReveal } from './motionVariants'

interface AnimatedSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  id?: string
  delay?: number
  as?: 'section' | 'div' | 'article'
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  id,
  delay = 0,
  as = 'section',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion()

  const MotionComponent = motion[as]

  if (shouldReduceMotion) {
    const Component = as
    return (
      <Component id={id} className={className} {...props}>
        {children}
      </Component>
    )
  }

  return (
    <MotionComponent
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={sectionReveal}
      transition={{ delay }}
      {...(props as any)}
    >
      {children}
    </MotionComponent>
  )
}

export default AnimatedSection
