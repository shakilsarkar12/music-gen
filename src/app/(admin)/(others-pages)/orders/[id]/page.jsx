import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { getSettings } from "@/lib/getSettings";
import Badge from "@/components/ui/badge/Badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditOrderModal from "@/components/ecommerce/EditOrderModal";

export const metadata = {
  title: "Shopify Order Details | Dashboard",
  description: "Detailed view of a Shopify order",
};

export const dynamic = "force-dynamic";

export default async function ShopifyOrderDetailsPage({ params }) {
  const { id } = await params;
  const settings = await getSettings();
  let orderInfo = null;
  let errorMsg = null;

  if (!settings.shopUrl || !settings.shopifyAdminApiKey) {
    errorMsg = "Shopify integration is not configured.";
  } else {
    try {
      let url = settings.shopUrl;
      if (!url.startsWith('http')) url = `https://${url}`;
      
      const response = await fetch(`${url}/admin/api/2024-04/orders/${id}.json`, {
        headers: {
          "X-Shopify-Access-Token": settings.shopifyAdminApiKey,
          "Content-Type": "application/json"
        },
        cache: "no-store"
      });
      
      const data = await response.json();
      if (response.ok && data.order) {
        orderInfo = data.order;
      } else {
        errorMsg = data.errors ? JSON.stringify(data.errors) : "Failed to fetch order from Shopify.";
      }
    } catch (err) {
      console.error(err);
      errorMsg = "An error occurred while fetching the order.";
    }
  }

  if (errorMsg) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Order Details" />
        <div className="p-4 rounded bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {errorMsg}
        </div>
        <Link href="/orders" className="mt-4 inline-block text-brand-500 underline">Back to Orders</Link>
      </div>
    );
  }

  if (!orderInfo) return notFound();

  return (
    <div>
      <PageBreadcrumb pageTitle={`Order #${orderInfo.order_number}`} />
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <Link href="/orders" className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition">
          ← Back to Orders
        </Link>
        <EditOrderModal order={orderInfo} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: Customer & Main Info */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Name</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {orderInfo.customer ? `${orderInfo.customer.first_name} ${orderInfo.customer.last_name}` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{orderInfo.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{orderInfo.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Location</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {orderInfo.customer?.default_address ? `${orderInfo.customer.default_address.city}, ${orderInfo.customer.default_address.country}` : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Order Items</h3>
            <div className="space-y-4">
              {orderInfo.line_items.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white/90">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.variant_title || "Default"}</p>
                    {item.properties && item.properties.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        {item.properties.map((p, idx) => (
                          <span key={idx} className="block">{p.name}: {p.value}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800 dark:text-white/90">{item.price} {orderInfo.currency}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {(orderInfo.note || orderInfo.tags) && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Additional Info</h3>
              {orderInfo.tags && (
                <div className="mb-4">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {orderInfo.tags.split(',').map(tag => (
                      <Badge key={tag} size="sm" color="info">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {orderInfo.note && (
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Order Note</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {orderInfo.note}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right: Meta Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Date</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {new Date(orderInfo.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Financial</span>
                <Badge size="sm" color={orderInfo.financial_status === 'paid' ? 'success' : 'warning'}>
                  {orderInfo.financial_status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Fulfillment</span>
                <Badge size="sm" color={orderInfo.fulfillment_status === 'fulfilled' ? 'success' : 'warning'}>
                  {orderInfo.fulfillment_status || 'unfulfilled'}
                </Badge>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between font-semibold">
                <span className="text-gray-800 dark:text-white/90">Total</span>
                <span className="text-gray-800 dark:text-white/90">{orderInfo.total_price} {orderInfo.currency}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
