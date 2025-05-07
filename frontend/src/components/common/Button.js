import React from 'react';
import { getButtonClass } from '../../utils/StyleUtils';

/**
 * Standardized Button component
 * @param {Object} props
 * @param {string} props.variant - Button variant (primary, secondary, danger, success, warning, outline, text)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type (button, submit, reset)
 */
const Button = ({
  variant = 'primary',
  disabled = false,
  size = 'md',
  className = '',
  children,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`${getButtonClass(variant, disabled, size)} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 