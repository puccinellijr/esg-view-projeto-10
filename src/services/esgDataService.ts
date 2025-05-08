
// Mock data service to simulate fetching from an API
// In a real app, this would make actual API calls

interface ESGData {
  environmental: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  governance: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  social: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
}

// Generate random data for demo purposes
const generateRandomValue = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(4));
};

export const fetchESGData = async (
  terminal: string,
  period1: { month: string; year: string },
  period2: { month: string; year: string }
): Promise<ESGData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo purposes, generate random data
  return {
    environmental: {
      litro_tm: {
        value1: generateRandomValue(10, 50),
        value2: generateRandomValue(10, 50)
      },
      kg_tm: {
        value1: generateRandomValue(5, 25),
        value2: generateRandomValue(5, 25)
      },
      kwh_tm: {
        value1: generateRandomValue(100, 500),
        value2: generateRandomValue(100, 500)
      },
      litro_combustivel_tm: {
        value1: generateRandomValue(20, 80),
        value2: generateRandomValue(20, 80)
      },
      residuo_tm: {
        value1: generateRandomValue(2, 15),
        value2: generateRandomValue(2, 15)
      },
    },
    governance: {
      denuncia_corrupcao: {
        value1: generateRandomValue(0, 5),
        value2: generateRandomValue(0, 5)
      },
      reclamacao_vizinho: {
        value1: generateRandomValue(0, 10),
        value2: generateRandomValue(0, 10)
      },
      incidente_cibernetico: {
        value1: generateRandomValue(0, 3),
        value2: generateRandomValue(0, 3)
      },
    },
    social: {
      incidente: {
        value1: generateRandomValue(0, 8),
        value2: generateRandomValue(0, 8)
      },
      acidente: {
        value1: generateRandomValue(0, 5),
        value2: generateRandomValue(0, 5)
      },
      denuncia_discriminacao: {
        value1: generateRandomValue(0, 3),
        value2: generateRandomValue(0, 3)
      },
      mulher_trabalho: {
        value1: generateRandomValue(20, 50),
        value2: generateRandomValue(20, 50)
      },
    }
  };
};
