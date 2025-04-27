"use client";

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className,
  onClick,
  ...props 
}: ButtonProps) {
  // Your button implementation
  return (
    <button
      className={`btn btn-${variant} ${size === 'sm' ? 'text-sm py-1 px-3' : 
                  size === 'lg' ? 'text-lg py-3 px-6' : 'py-2 px-4'} ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}