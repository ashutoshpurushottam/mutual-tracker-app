import { get } from "http"
import axios from "axios"
import { use } from "react"

export interface Portfolio {
    id: string
    userId: string
    schemeName: string
    amcName: string
    folioNumber: string
    units: number
    investedValue: number
    schemeCode: string | null
    tradingsymbol: string
    currentValue: number
    lastUpdateDate: string
    category: string
  }

  export class PortfolioUtil {
    static calculateReturns(portfolio: Portfolio): number {
      return ((portfolio.currentValue - portfolio.investedValue) / portfolio.investedValue) * 100;
    }

    static calculateGainLoss(portfolio: Portfolio): number {
      return portfolio.currentValue - portfolio.investedValue;
    }   

    static calculateGainLossPercentage(portfolio: Portfolio): number {
      return ((portfolio.currentValue - portfolio.investedValue) / portfolio.investedValue) * 100;
    }
    
    // static calculateIrr(portfolio: Portfolio): number {
    //   const dates = portfolio.historicalData.map(item => new Date(item.date));
    //   const cashFlows = [portfolio.investedValue, ...portfolio.historicalData.map(item => -item.nav)];
    //   return irr(cashFlows, dates);
    // }

  }

  export const fetchPortfolios = async (username: string): Promise<Portfolio[]> => {
    try {
        const response = await axios.get<Portfolio[]>('http://localhost:8888/users/'+username+'/portfolios');
        return response.data;
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      return [];
    }
  };

  
  export const uploadFile = async (file: File, userid: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const url = 'http://localhost:8888/users/'+userid+'/upload';
    const response = await axios.post<string>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  };
