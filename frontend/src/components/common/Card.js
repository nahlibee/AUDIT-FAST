// src/components/common/Card.js
import React from 'react';
import { getCardClass } from '../../utils/StyleUtils';

/**
 * Standardized Card component
 * @param {Object} props
 * @param {string} props.variant - Card variant (default, info, warning, danger, success, dark)
 * @param {boolean} props.isInteractive - Whether the card is interactive (hover effects)
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Card content
 * @param {Function} props.onClick - Click handler
 */
const Card = ({
  variant = 'default',
  isInteractive = false,
  className = '',
  children,
  onClick,
  ...props
}) => {
  return (
    <div
      className={`${getCardClass(variant, isInteractive)} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;