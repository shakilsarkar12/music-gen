import dbConnect from "./mongoose";
import Order from "@/models/Order";
import { getSettings } from "./getSettings";

export async function getDashboardMetrics() {
  await dbConnect();

  try {
    // Basic counts
    const totalOrders = await Order.countDocuments({});
    
    // Distinct customers based on email
    const distinctCustomers = await Order.distinct("email");
    const totalCustomers = distinctCustomers.length;

    // Fetch recent 5 Shopify orders instead of DB orders
    const settings = await getSettings();
    let shopifyRecentOrders = [];
    if (settings.shopUrl && settings.shopifyAdminApiKey) {
      try {
        let url = settings.shopUrl;
        if (!url.startsWith('http')) url = `https://${url}`;
        
        const response = await fetch(`${url}/admin/api/2024-04/orders.json?status=any&limit=5`, {
          headers: {
            "X-Shopify-Access-Token": settings.shopifyAdminApiKey,
            "Content-Type": "application/json"
          },
          cache: "no-store"
        });
        const data = await response.json();
        if (data.orders) {
          shopifyRecentOrders = data.orders;
        }
      } catch (err) {
        console.error("Error fetching recent Shopify orders:", err);
      }
    }

    // For MonthlySalesChart (Let's group by date for the last 7 days)
    // To make it simple without complex aggregations, let's just do a basic aggregate
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyOrdersAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build chart data array mapping each of the last 7 days to the count
    const chartCategories = [];
    const chartSeriesData = [];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
      const found = dailyOrdersAgg.find(item => item._id === dateStr);
      chartCategories.push(d.toLocaleDateString("en-US", { weekday: 'short' })); // e.g. Mon, Tue
      chartSeriesData.push(found ? found.count : 0);
    }

    return {
      totalOrders,
      totalCustomers,
      recentOrders: shopifyRecentOrders,
      chartData: {
        categories: chartCategories,
        series: chartSeriesData
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return {
      totalOrders: 0,
      totalCustomers: 0,
      recentOrders: [],
      chartData: { categories: [], series: [] }
    };
  }
}
