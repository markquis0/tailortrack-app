import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold text-base transition-all';
  const variants = {
    primary: 'bg-[#1F7A8C] text-white hover:bg-[#174E5A] disabled:opacity-60',
    danger: 'bg-[#E63946] text-white hover:bg-[#C1121F] disabled:opacity-60',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-60',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

