
export interface Period {
  month: string;
  year: string;
}

export interface ESGIndicator {
  id?: string;
  name: string;
  value: number;
  category: "environmental" | "social" | "governance";
  terminal: string;
  month: number;
  year: number;
  created_by?: string; // Make it optional since the database doesn't have this column
}

export interface ESGIndicatorResult {
  success: boolean;
  data?: any;
  error?: any;
  message?: string;
  id?: string;
}

export interface ESGComparisonData {
  environmental: Record<string, { value1: number; value2: number }>;
  social: Record<string, { value1: number; value2: number }>;
  governance: Record<string, { value1: number; value2: number }>;
  tonnage?: { value1: number; value2: number };
}
