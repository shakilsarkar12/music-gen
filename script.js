const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI;

const OrderSchema = new mongoose.Schema({
  selectedPackage: String,
  status: String
}, { strict: false });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

async function run() {
  if(!MONGO_URI) { console.error("No URI"); process.exit(1); }
  await mongoose.connect(MONGO_URI);
  const orders = await Order.find({});
  let count = 0;

  for (const order of orders) {
    if (order.status === 'pending_payment' || !order.status) {
      if (order.selectedPackage && order.selectedPackage !== 'NONE') {
        order.status = 'in_cart';
      } else {
        order.status = 'created';
      }
      await order.save();
      count++;
    }
  }

  console.log(`Updated ${count} orders.`);
  process.exit(0);
}

run().catch(console.error);
