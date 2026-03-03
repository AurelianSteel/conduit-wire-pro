export type CalculatorType =
  | 'conduit-fill'
  | 'box-fill'
  | 'voltage-drop'
  | 'transformer-sizing';

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

// Bend Radius Calculator Types
export * from './bendRadius';

// Pipe Bending Calculator Types
export * from './pipeBending';

// Transformer Calculator Types
export * from './transformer';
