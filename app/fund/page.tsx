import { Metadata } from "next"
import FundPerformance from "./fund-performance"

export const metadata: Metadata = {
  title: "Mutual Fund Performance",
  description: "View the performance of a mutual fund over different time periods",
}

export default function FundPage({ params }: { params: { name: string } }) {
  return <FundPerformance fundName={decodeURIComponent(params.name)} />
}
