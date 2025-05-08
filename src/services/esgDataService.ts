// Data service to fetch ESG data from PHP API
// When in development mode, we can use mock data by setting useMockData to true

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

// Set to true to use mock data instead of real API
const useMockData = true;

// Generate random data for mock mode
const generateRandomValue = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(4));
};

// Generate mock data
const generateMockData = (): ESGData => {
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

export const fetchESGData = async (
  terminal: string,
  period1: { month: string; year: string },
  period2: { month: string; year: string }
): Promise<ESGData> => {
  // If using mock data, return randomly generated data after simulated delay
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockData();
  }

  // Otherwise, fetch from the actual API
  try {
    // Construct API URL with parameters
    const apiUrl = `http://localhost/esg_api/get_esg_data.php?terminal=${encodeURIComponent(terminal)}&mes1=${period1.month}&ano1=${period1.year}&mes2=${period2.month}&ano2=${period2.year}`;
    
    console.log("Fetching data from API:", apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API response:", data);
    
    return data as ESGData;
  } catch (error) {
    console.error("Error fetching from API:", error);
    
    // Fall back to mock data if API call fails
    console.log("Falling back to mock data");
    return generateMockData();
  }
};
