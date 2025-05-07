import React from 'react';
import { getBadgeClass } from '../../utils/StyleUtils';

/**
 * Standardized Badge component
 * @param {Object} props
 * @param {string} props.variant - Badge variant (default, info, warning, danger, success, count)
 * @param {boolean} props.large - Whether the badge is large
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Badge content
 */
const Badge = ({
  variant = 'default',
  large = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`${getBadgeClass(variant, large)} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge; 