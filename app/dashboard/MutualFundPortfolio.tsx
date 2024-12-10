"use client"

import  { useState, useEffect } from 'react';
import axios from 'axios';

interface Investment {
  schemeName: string;
  amcName: string;
  category: string;
  folioNo: string;
  investedValue: number;
  currentValue: number;
  returns: number;
  units: number;
}

const MutualFundPortfolio: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await axios.get<Investment[]>('/api/investments');
        setInvestments(response.data);
      } catch (error) {
        console.error('Error fetching investments:', error);
      }
    };

    fetchInvestments();
  }, []);

  return (
    <div>
      <h1>Mutual Fund Portfolio</h1>
      <table>
        <thead>
          <tr>
            <th>Scheme Name</th>
            <th>AMC Name</th>
            <th>Category</th>
            <th>Folio No.</th>
            <th>Invested Value</th>
            <th>Current Value</th>
            <th>Returns</th>
            <th>Units</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((investment, index) => (
            <tr key={index}>
              <td>{investment.schemeName}</td>
              <td>{investment.amcName}</td>
              <td>{investment.category}</td>
              <td>{investment.folioNo}</td>
              <td>{investment.investedValue}</td>
              <td>{investment.currentValue}</td>
              <td>{investment.returns}</td>
              <td>{investment.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MutualFundPortfolio;