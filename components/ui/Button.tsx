import React from 'react';
import { motion, HTMLMotionProps, MotionProps } from 'framer-motion';

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'text';
  children: React.ReactNode;
  className?: string;
  whileHover?: MotionProps['whileHover'];
  whileTap?: MotionProps['whileTap'];
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  whileHover,
  whileTap,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-secondary-main text-neutral-gray900 rounded-lg shadow-[0_4px_12px_rgba(255,214,0,0.3)] hover:bg-secondary-dark hover:shadow-[0_6px_16px_rgba(255,214,0,0.4)] px-8 py-3.5",
    secondary: "bg-white text-primary-main border-2 border-primary-main rounded-lg hover:bg-neutral-gray50 px-8 py-3.5",
    text: "bg-transparent text-primary-main hover:underline px-4 py-2"
  };

  const defaultHover = { scale: variant !== 'text' ? 1.02 : 1, y: variant !== 'text' ? -2 : 0 };
  const defaultTap = { scale: 0.98 };

  return (
    <motion.button
      whileHover={whileHover !== undefined ? whileHover : defaultHover}
      whileTap={whileTap !== undefined ? whileTap : defaultTap}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;