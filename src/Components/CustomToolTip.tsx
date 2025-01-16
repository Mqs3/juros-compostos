import React from 'react';
import { CustomTooltipProps } from '../types';
import { formatCurrency } from '../utils';

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-gray-600">
          Valor Investido: R$ {formatCurrency(payload[1].value)}
        </p>
        <p className="text-sm text-blue-700">
          Total em Juros: R$ {formatCurrency(payload[0].payload.totalJuros)}
        </p>
      </div>
    );
  }
  return null;
};