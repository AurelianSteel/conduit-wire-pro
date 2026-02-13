export type CalculatorType = 'conduit-fill' | 'box-fill' | 'voltage-drop';

export interface CalculationResult {
  type: CalculatorType;
  timestamp: number;
  inputs: Record<string, any>;
  result: Record<string, any>;
}

export interface HistoryEntry extends CalculationResult {
  id: string;
  label?: string;
}
