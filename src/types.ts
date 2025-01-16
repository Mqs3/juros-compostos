export interface InputFieldProps {
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
    className?: string;
  }
  
  export interface ResultCardProps {
    title: string;
    value: string;
    className: string;
  }
  
  export interface Result {
    finalValue: string;
    totalInvested: string;
    totalInterest: string;
  }
  
  export interface MonthlyData {
    mes: number;
    juros: number;
    totalInvestido: number;
    totalJuros: number;
    totalAcumulado: number;
    valorComJuros: number;
  }
  
  export interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: MonthlyData;
    }>;
    label?: string;
  }