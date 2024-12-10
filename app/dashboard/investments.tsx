import axios from 'axios';

export interface Investment {
  schemeName: string;
  amcName: string;
  category: string;
  folioNo: string;
  investedValue: number;
  currentValue: number;
  returns: number;
  units: number;
}

export const fetchInvestments = async (userId: string): Promise<Investment[]> => {
  try {
    const response = await axios.get<Investment[]>(`/api/investments?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
};