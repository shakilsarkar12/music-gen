import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import { getDashboardMetrics } from "@/lib/getDashboardMetrics";

export const metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default async function Ecommerce() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics 
          totalCustomers={metrics.totalCustomers} 
          totalOrders={metrics.totalOrders} 
        />

        <MonthlySalesChart chartData={metrics.chartData} />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>
      <div className="col-span-12 xl:col-span-12">
        <RecentOrders recentOrders={metrics.recentOrders} />
      </div>
    </div>
  );
}
