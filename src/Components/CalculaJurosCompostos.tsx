import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { InputField } from './InputField';
import { ResultCard } from './ResultCard';
import { CustomTooltip } from './CustomToolTip';
import { Result, MonthlyData } from '../types';
import { formatCurrency, formatAxisValue, validateAndFormatNumber } from '../utils';

const CalculaJurosCompostos: React.FC = () => {
  const [initialValue, setInitialValue] = useState<string>("");
  const [monthlyValue, setMonthlyValue] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [rateType, setRateType] = useState<string>("anual");
  const [period, setPeriod] = useState<string>("");
  const [periodType, setPeriodType] = useState<string>("anos");
  const [result, setResult] = useState<Result | null>(null);
  const [graphData, setGraphData] = useState<MonthlyData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCalculation = () => {
    const PV = parseFloat(initialValue.replace(/\./g, "").replace(/,/g, ".")) || 0;
    const PMT = parseFloat(monthlyValue.replace(/\./g, "").replace(/,/g, ".")) || 0;
    let i = parseFloat(rate.replace(/\./g, "").replace(/,/g, ".")) || 0;
    let n = parseInt(period) || 0;

    if (isNaN(PV) || isNaN(PMT) || isNaN(i) || isNaN(n) || i <= 0 || n <= 0) {
      setErrorMessage("Preencha todos os campos corretamente antes de calcular.");
      return;
    }
    setErrorMessage("");

    i = rateType === "anual" ? Math.pow(1 + i / 100, 1 / 12) - 1 : i / 100;
    n = periodType === "anos" ? n * 12 : n;

    const monthlyData: MonthlyData[] = [];
    let currentValue = PV;
    let totalInvested = PV;
    let monthlyInterest = 0;
    let totalInterest = 0;

    for (let month = 0; month <= n; month++) {
      monthlyInterest = currentValue * i;
      totalInterest += monthlyInterest;
      
      monthlyData.push({
        mes: month,
        juros: monthlyInterest,
        totalInvestido: totalInvested,
        totalJuros: totalInterest,
        totalAcumulado: currentValue + monthlyInterest,
        valorComJuros: totalInvested + totalInterest
      });

      currentValue = (currentValue + monthlyInterest + PMT);
      if (month < n) totalInvested += PMT;
    }

    setGraphData(monthlyData);
    setResult({
      finalValue: formatCurrency(monthlyData[n].totalAcumulado),
      totalInvested: formatCurrency(totalInvested),
      totalInterest: formatCurrency(totalInterest),
    });
  };

  return (
    <div className="flex flex-col p-2 sm:p-4 space-y-4 border rounded-lg shadow-lg mx-auto max-w-[95vw] sm:max-w-4xl">
      <h1 className="text-lg sm:text-xl font-bold text-blue-700">Simulador de Juros Compostos</h1>
      
      <div className="flex flex-col space-y-3">
        <InputField
          label="Valor inicial R$"
          value={initialValue}
          onChange={(e) => setInitialValue(validateAndFormatNumber(e.target.value.replace(/[R$\s.,]/g, "")))}
          onKeyUp={(e) => e.key === "Enter" && handleCalculation()}
          placeholder="0,00"
        />
        <InputField
          label="Valor mensal R$"
          value={monthlyValue}
          onChange={(e) => setMonthlyValue(validateAndFormatNumber(e.target.value.replace(/[R$\s.,]/g, "")))}
          onKeyUp={(e) => e.key === "Enter" && handleCalculation()}
          placeholder="0,00"
        />
        
        {/* Campos de taxa e período em coluna no mobile */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
          <InputField
            label="Taxa de juros"
            value={rate}
            onChange={(e) => setRate(validateAndFormatNumber(e.target.value.replace(/[R$\s.,]/g, "")))}
            onKeyUp={(e) => e.key === "Enter" && handleCalculation()}
            placeholder="0,00"
            suffix={{
              value: rateType,
              onChange: setRateType,
              options: [
                { value: "anual", label: "Anual" },
                { value: "mensal", label: "Mensal" }
              ]
            }}
          />
          <InputField
            label="Período"
            value={period}
            onChange={(e) => setPeriod(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyUp={(e) => e.key === "Enter" && handleCalculation()}
            placeholder="0"
            suffix={{
              value: periodType,
              onChange: setPeriodType,
              options: [
                { value: "anos", label: "Anos" },
                { value: "meses", label: "Meses" }
              ]
            }}
          />
        </div>
      </div>

      {errorMessage && <p className="text-red-500 text-sm font-bold">{errorMessage}</p>}
      
      <button
        onClick={handleCalculation}
        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 text-sm sm:text-base"
      >
        Calcular
      </button>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
            <ResultCard
              title="Valor total final"
              value={result.finalValue}
              className="bg-green-600 p-2 sm:p-4"
            />
            <ResultCard
              title="Valor total investido"
              value={result.totalInvested}
              className="bg-gray-600 p-2 sm:p-4"
            />
            <ResultCard
              title="Total em juros"
              value={result.totalInterest}
              className="bg-blue-700 p-2 sm:p-4"
            />
          </div>

          <div className="h-64 sm:h-96 w-full mt-4">
            <h2 className="font-bold text-black text-lg sm:text-xl mb-2">Gráfico:</h2>
            <ResponsiveContainer>
              <LineChart 
                data={graphData} 
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin - 100', (dataMax: number) => dataMax * 1.1]}
                  tickFormatter={formatAxisValue}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone" 
                  dataKey="valorComJuros" 
                  name="Total em juros" 
                  stroke="#0F52BA" 
                  strokeWidth={2} 
                  dot={{ r: 2 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="totalInvestido" 
                  name="Valor Investido" 
                  stroke="#1F2937" 
                  strokeWidth={2} 
                  dot={{ r: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-5">
            <h2 className="font-bold text-black text-lg sm:text-xl mb-2">Tabela:</h2>
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-64 sm:max-h-96 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Juros</th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Investido</th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Juros</th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {graphData.map((row) => (
                      <tr key={row.mes}>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">{row.mes}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">R$ {formatCurrency(row.juros)}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">R$ {formatCurrency(row.totalInvestido)}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">R$ {formatCurrency(row.totalJuros)}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">R$ {formatCurrency(row.totalAcumulado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CalculaJurosCompostos;