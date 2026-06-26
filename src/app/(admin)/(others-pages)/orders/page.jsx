import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { getSettings } from "@/lib/getSettings";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";

export const metadata = {
  title: "Orders | Dashboard",
  description: "Shopify Orders List",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const settings = await getSettings();
  let orders = [];
  let errorMsg = null;

  if (!settings.shopUrl1 || !settings.shopifyAdminApiKey) {
    errorMsg = "Shopify integration is not configured. Please add Shop URL and Admin API Key in Settings.";
  } else {
    try {
      let url = settings.shopUrl1;
      if (!url.startsWith('http')) url = `https://${url}`;
      
      const response = await fetch(`${url}/admin/api/2024-04/orders.json?status=any&limit=50`, {
        headers: {
          "X-Shopify-Access-Token": settings.shopifyAdminApiKey,
          "Content-Type": "application/json"
        },
        cache: "no-store"
      });
      
      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch(e) {
        throw new Error("Invalid response from Shopify API");
      }
      
      if (response.ok && data.orders) {
        orders = data.orders;
      } else {
        errorMsg = data.errors ? JSON.stringify(data.errors) : "Failed to fetch orders from Shopify.";
      }
    } catch (err) {
      console.error(err);
      errorMsg = "An error occurred while fetching orders: " + err.message;
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Shopify Orders" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:mb-7">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Order List
          </h3>
        </div>

        {errorMsg ? (
          <div className="p-4 rounded bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {errorMsg}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                  <tr>
                    <th className="px-5 py-3 font-medium text-gray-500 text-sm dark:text-gray-400">Order ID</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-sm dark:text-gray-400">Customer</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-sm dark:text-gray-400">Date</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-sm dark:text-gray-400">Financial Status</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-sm dark:text-gray-400">Fulfillment Status</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-sm dark:text-gray-400">Total</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-sm dark:text-gray-400">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        <Link href={`/orders/${order.id}`} className="text-brand-500 hover:text-brand-600 hover:underline">
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="block font-medium text-gray-800 dark:text-white/90">
                          {order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'No Customer'}
                        </span>
                        <span className="text-xs text-gray-500">{order.email}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <Badge size="sm" color={order.financial_status === 'paid' ? 'success' : order.financial_status === 'pending' ? 'warning' : 'error'}>
                          {order.financial_status || 'unknown'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <Badge size="sm" color={order.fulfillment_status === 'fulfilled' ? 'success' : 'warning'}>
                          {order.fulfillment_status || 'unfulfilled'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">
                        {order.total_price} {order.currency}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400">
                        <ul className="list-disc pl-4 space-y-1">
                          {order.line_items.map(item => (
                            <li key={item.id}>
                              {item.title} <span className="text-gray-400">x{item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-5 py-8 text-center text-gray-500">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
