/**
 * Motion tokens for Framer Motion animations.
 * Import these instead of declaring inline variant objects in each component.
 */
import type { Transition, Variants } from 'framer-motion';

/** Snappy spring-like ease — use for most interactive transitions */
const EASE_EXPRESSIVE = [0.16, 1, 0.3, 1] as const;

/** Base transition: fast (150 ms) */
export const TRANSITION_BASE: Transition = {
  duration: 0.15,
  ease: EASE_EXPRESSIVE,
};

/** Slow transition: measured (250 ms) — use for page-level enter/exit */
export const TRANSITION_SLOW: Transition = {
  duration: 0.25,
  ease: EASE_EXPRESSIVE,
};

/** Fade + slide up — for cards, list items entering the viewport */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_BASE,
  },
};

/** Simple opacity fade — for overlays, tooltips */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: TRANSITION_BASE,
  },
};

/** Scale + fade — for modals, popovers */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITION_BASE,
  },
};

/**
 * Stagger container — wrap lists of animated children.
 * Children should use `fadeInUp` or `fadeIn` as their variant.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};
