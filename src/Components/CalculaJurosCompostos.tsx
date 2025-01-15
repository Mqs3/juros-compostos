import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  suffix?: {
    value: string;
    onChange: (value: string) => void;
    options: Array<{
      value: string;
      label: string;
    }>;
  };
  halfWidth?: boolean;
}

interface ResultCardProps {
  title: string;
  value: string;
  className: string;
}

interface Result {
  finalValue: string;
  totalInvested: string;
  totalInterest: string;
}

interface MonthlyData {
  mes: number;
  juros: number;
  totalInvestido: number;
  totalJuros: number;
  totalAcumulado: number;
  valorComJuros: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: MonthlyData;
  }>;
  label?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, onKeyUp, placeholder, type = "text", suffix, halfWidth = false }) => (
  <div className={halfWidth ? "w-1/2" : "w-full"}>
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

const ResultCard: React.FC<ResultCardProps> = ({ title, value, className }) => (
  <div className={`p-4 text-center text-white rounded-lg ${className}`}>
    <h2 className="text-sm font-medium">{title}</h2>
    <p className="text-lg font-bold">R$ {value}</p>
  </div>
);

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatAxisValue = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

const validateAndFormatNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  const amount = parseInt(numbers) / 100;
  return formatCurrency(amount);
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    
    const displayPeriod = label
    return (
      <div className="bg-white p-4 border rounded shadow-lg">
        <p className="text-sm font-medium">{displayPeriod}</p>
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
    <div className="flex flex-col p-4 space-y-6 border rounded-lg shadow-lg max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-blue-700">Simulador de Juros Compostos</h1>
      
      <div className="flex flex-col space-y-4">
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
        <div className="flex space-x-4">
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
            halfWidth
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
            halfWidth
          />
        </div>
      </div>

      {errorMessage && <p className="text-red-500 font-bold">{errorMessage}</p>}
      
      <button
        onClick={handleCalculation}
        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
      >
        Calcular
      </button>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultCard
              title="Valor total final"
              value={result.finalValue}
              className="bg-green-600"
            />
            <ResultCard
              title="Valor total investido"
              value={result.totalInvested}
              className="bg-gray-600"
            />
            <ResultCard
              title="Total em juros"
              value={result.totalInterest}
              className="bg-blue-700"
            />
          </div>

          <div className="h-96 w-full">
            <h1 className='font-bold text-black text-xl'> Gráfico:</h1>
            <ResponsiveContainer>
              <LineChart 
                data={graphData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                />
                <YAxis 
                  domain={['dataMin - 100', (dataMax: number) => dataMax * 1.1]}
                  tickFormatter={formatAxisValue}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone" 
                  dataKey="valorComJuros" 
                  name="Total em juros" 
                  stroke="#0F52BA" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="totalInvestido" 
                  name="Valor Investido" 
                  stroke="#1F2937" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h1 className='font-bold text-black text-xl pt-10'> Tabela:</h1>
          <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Juros</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Investido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Juros</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Acumulado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {graphData.map((row) => (
                  <tr key={row.mes}>
                    <td className="px-6 py-4 whitespace-nowrap">{row.mes}</td>
                    <td className="px-6 py-4 whitespace-nowrap">R$ {formatCurrency(row.juros)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">R$ {formatCurrency(row.totalInvestido)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">R$ {formatCurrency(row.totalJuros)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">R$ {formatCurrency(row.totalAcumulado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default CalculaJurosCompostos;