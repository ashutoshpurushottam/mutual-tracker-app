"use client"
import { DashboardContent } from "./dashboard-content";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ACCESS_TOKEN, ROUTES } from "../constants";
import { AuthService } from "../util/ApiUtils";
import { fetchPortfolios } from "../util/InvestmentUtil";


export default function DashboardPage() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Investment Dashboard</h1>
      <DashboardContent />
    </div>
  );
}
