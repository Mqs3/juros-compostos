import React from 'react';
import { ResultCardProps } from '../types';

export const ResultCard: React.FC<ResultCardProps> = ({ title, value, className }) => (
  <div className={`p-4 text-center text-white rounded-lg ${className}`}>
    <h2 className="text-sm font-medium">{title}</h2>
    <p className="text-lg font-bold">R$ {value}</p>
  </div>
);