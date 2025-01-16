import React from 'react';
import { InputFieldProps } from '../types';

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  onKeyUp, 
  placeholder, 
  type = "text", 
  suffix,
  className = "w-full"
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="flex space-x-2">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyUp={onKeyUp}
        className="border p-2 rounded-lg w-full text-left"
        placeholder={placeholder}
      />
      {suffix && (
        <select
          value={suffix.value}
          onChange={(e) => suffix.onChange(e.target.value)}
          className="border p-2 rounded-lg"
        >
          {suffix.options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      )}
    </div>
  </div>
);