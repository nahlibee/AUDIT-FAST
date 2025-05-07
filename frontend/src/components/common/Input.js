import React from 'react';
import { getInputClass, getLabelClass, getErrorMessageClass } from '../../utils/StyleUtils';

/**
 * Standardized Input component
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.name - Input name
 * @param {string} props.type - Input type (text, password, email, etc.)
 * @param {string} props.size - Input size (sm, md, lg)
 * @param {boolean} props.hasError - Whether the input has an error
 * @param {string} props.errorMessage - Error message to display
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Object} props.inputProps - Additional input props
 */
const Input = ({
  label,
  name,
  type = 'text',
  size = 'md',
  hasError = false,
  errorMessage,
  className = '',
  value,
  onChange,
  inputProps = {},
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className={getLabelClass(hasError)}>
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={getInputClass(hasError, size)}
        {...inputProps}
        {...props}
      />
      {hasError && errorMessage && (
        <p className={getErrorMessageClass()}>{errorMessage}</p>
      )}
    </div>
  );
};

export default Input; 