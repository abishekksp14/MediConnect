import React from 'react';
import './Button.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', size = 'md', className = '', disabled = false, icon: Icon }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${className} ${disabled ? 'disabled' : ''}`}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 18} className="btn-icon" />}
      {children}
    </button>
  );
};

export default Button;
