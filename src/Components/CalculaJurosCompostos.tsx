import { useState } from "react";

const validateAndFormatNumber = (value: string): string => {
  // Remove tudo que não for número
  const numbers = value.replace(/\D/g, "");

  // Se não houver números, retorna string vazia
  if (!numbers) return "";

  // Converte para centavos (move a vírgula duas casas)
  const amount = parseInt(numbers) / 100;

  // Formata o número com pontos nos milhares e vírgula nas decimais
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "decimal",
  }).format(amount);
};

interface Result {
  finalValue: string;
  totalInvested: string;
  totalInterest: string;
}

const CalculaJurosCompostos = () => {
  const [initialValue, setInitialValue] = useState("");
  const [monthlyValue, setMonthlyValue] = useState("");
  const [rate, setRate] = useState("");
  const [rateType, setRateType] = useState("anual");
  const [period, setPeriod] = useState("");
  const [periodType, setPeriodType] = useState("anos");
  const [result, setResult] = useState<Result | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInitialValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[R$\s.,]/g, ""); // Adicionei o ponto aqui
    setInitialValue(validateAndFormatNumber(rawValue));
  };

  const handleMonthlyValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[R$\s.,]/g, ""); // Adicionei o ponto aqui
    setMonthlyValue(validateAndFormatNumber(rawValue));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[R$\s.,]/g, ""); // Adicionei o ponto aqui
    setRate(validateAndFormatNumber(rawValue));
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriod(e.target.value.replace(/[^0-9]/g, ""));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") calculateCompoundInterest();
  };

  const calculateCompoundInterest = () => {
    // Remove pontos e converte vírgula para ponto antes de usar parseFloat
    const PV =
      parseFloat(initialValue.replace(/\./g, "").replace(/,/g, ".")) || 0;
    const PMT =
      parseFloat(monthlyValue.replace(/\./g, "").replace(/,/g, ".")) || 0;
    let i = parseFloat(rate.replace(/\./g, "").replace(/,/g, ".")) || 0;
    let n = parseInt(period) || 0;

    if (isNaN(PV) || isNaN(PMT) || isNaN(i) || isNaN(n) || i <= 0 || n <= 0) {
      setErrorMessage(
        "Preencha todos os campos corretamente antes de calcular."
      );
      return;
    }
    setErrorMessage(""); // Limpa a mensagem de erro ao calcular com sucesso

    // Converter taxa anual para mensal (se necessário)
    if (rateType === "anual") {
      i = Math.pow(1 + i / 100, 1 / 12) - 1;
    } else {
      i = i / 100;
    }

    // Converter período para meses
    if (periodType === "anos") n *= 12;

    // Cálculo do montante com aportes mensais
    let FV = PV * Math.pow(1 + i, n);
    if (PMT > 0) {
      FV += PMT * ((Math.pow(1 + i, n) - 1) / i);
    }

    const totalInvested = PV + PMT * n;
    const totalInterest = FV - totalInvested;

    setResult({
      finalValue: FV.toFixed(2).replace(".", ","),
      totalInvested: totalInvested.toFixed(2).replace(".", ","),
      totalInterest: totalInterest.toFixed(2).replace(".", ","),
    });
  };

  return (
    <div className="flex flex-col p-4 space-y-6 border rounded-lg shadow-lg">
      <h1 className="text-lg font-bold text-blue-700">
        Simulador de Juros Compostos
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Valor inicial $
          </label>
          <input
            type="text"
            value={initialValue}
            onKeyUp={handleKeyPress}
            onChange={handleInitialValueChange}
            className="border p-2 rounded-lg w-full text-right"
            placeholder="0,00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Valor mensal $
          </label>
          <input
            type="text"
            value={monthlyValue}
            onKeyUp={handleKeyPress}
            onChange={handleMonthlyValueChange}
            className="border p-2 rounded-lg w-full text-right"
            placeholder="0,00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Taxa de juros
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={rate}
              onKeyUp={handleKeyPress}
              onChange={handleRateChange}
              className="border p-2 rounded-lg w-full text-right"
              placeholder="0,00"
            />
            <select
              value={rateType}
              onChange={(e) => setRateType(e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="anual">Anual</option>
              <option value="mensal">Mensal</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Período
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={period}
              onKeyUp={handleKeyPress}
              onChange={handlePeriodChange}
              className="border p-2 rounded-lg w-full text-right"
              placeholder="0"
            />
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="anos">Anos</option>
              <option value="meses">Meses</option>
            </select>
          </div>
        </div>
      </div>
      {errorMessage && (
        <p className="text-blue-500 font-bold ">{errorMessage}</p>
      )}
      <button
        onClick={calculateCompoundInterest}
        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
      >
        Calcular
      </button>
      {result && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-4 text-center text-white bg-green-600 rounded-lg">
            <h2 className="text-sm font-medium">Valor total final</h2>
            <p className="text-lg font-bold">$ {result.finalValue}</p>
          </div>
          <div className="p-4 text-center text-white bg-gray-600 rounded-lg">
            <h2 className="text-sm font-medium">Valor total investido</h2>
            <p className="text-lg font-bold">$ {result.totalInvested}</p>
          </div>
          <div className="p-4 text-center text-white bg-blue-700 rounded-lg">
            <h2 className="text-sm font-medium">Total em juros</h2>
            <p className="text-lg font-bold">$ {result.totalInterest}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculaJurosCompostos;
