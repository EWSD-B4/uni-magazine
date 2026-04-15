"use client";

import * as React from "react"
import { MostViewedPage } from "@/components/MostViewedPage"
import { MostActiveUsers } from "@/components/MostActiveUsers"
import { BrowserUsageChart } from "@/components/BrowserUsageChart"
import { ContributionBarChart } from "@/components/ContributionBarChart"

// Sample data for the chart
const chartData = [
  { name: "ENG", contributions: 28, color: "#F26454CC" },
  { name: "IT", contributions: 12, color: "#F26454CC" },
  { name: "ART", contributions: 15, color: "#F26454CC" },
  { name: "SCIENCE", contributions: 32, color: "#F26454CC" },
  { name: "MATH", contributions: 24, color: "#F26454CC" },
  { name: "PHYSICS", contributions: 26, color: "#F26454CC" },
]

export default function SystemMonitoringDashboard() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("This Semester")

  const handleViewProfile = (user) => {
    console.log("View profile for:", user.username)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2f6_60%,_#e2e8f0_100%)]">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
            <div className="flex min-h-screen">
                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-6 space-y-6">
                        {/* Welcome */}
                        <h1 className="text-3xl font-bold text-foreground mb-15">System Monitoring</h1>
                          
                        <div className="grid gap-6 lg:grid-cols-2">
                            <MostViewedPage />
                            <MostActiveUsers onViewProfile={handleViewProfile} />
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <BrowserUsageChart />
                            <ContributionBarChart
                                data={chartData}
                                selectedPeriod={selectedPeriod}
                                onPeriodChange={setSelectedPeriod}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    </div>
  )
}
