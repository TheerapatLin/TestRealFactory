const path = require("path");
const { readFile, writeFile } = require("fs/promises");

const { assertOrdersArray } = require("../schemas/orderSchema");

// กำหนดไฟล์ orders.json เก็บใน dataPath
let dataPath = path.resolve(__dirname, "..", "orders.json");

// อ่าน dataPath
async function loadOrders() {
  try {
    const file = await readFile(dataPath, "utf8");
    const orders = JSON.parse(file);
    assertOrdersArray(orders);
    return orders;
  }
  catch (error) {
    console.log(`Error: ${error}`)
  }

}

async function saveOrders(orders) {
  await writeFile(dataPath, JSON.stringify(orders, null, 2), "utf8");
}

// response คำสั่งซื้อทั้งหมด
async function listOrders(req, res) {
  try {
    const orders = await loadOrders();

    res.status(200).json(orders)
  }
  catch (error) {
    res.status(500).json({ error: `Failed to get orders : ${error}` })
  }
}

// summary
async function getOrdersSummary(req, res) {
  try {
    const orders = await loadOrders();

    // เริ่มต้นตัวแปรนับสถานะ
    const statusCounts = { PAID: 0, PENDING: 0, CANCELLED: 0 };
    let totalAmount = 0;

    // เก็บยอดรวมตามชื่อร้านค้า 
    const merchantTotals = {};

    for (const order of orders) {
      // แปลง amount เป็นตัวเลข (ถ้าไม่ใช่ตัวเลขจะเป็น 0)
      const numericAmount = Number(order.amount) || 0;
      totalAmount += numericAmount;

      // แปลงสถานะเป็นตัวพิมพ์ใหญ่ เช่น paid -> PAID
      const statusUpper = String(order.status || "").toUpperCase();

      // ถ้ามีสถานะในรายการที่เรานับ ก็เพิ่มจำนวน
      if (statusUpper) {
        statusCounts[statusUpper] += 1;
      }

      const merchantName = String(order.merchant || "").trim();
      if (merchantName) {
        // ถ้ายังไม่มีร้านค้านี้ใน merchantTotals ให้เริ่มจาก 0 ก่อน
        if (!merchantTotals[merchantName]) {
          merchantTotals[merchantName] = 0;
        }
        merchantTotals[merchantName] += numericAmount;
      }
    }

    // หาร้านค้าที่มียอดขายรวมมากที่สุด
    let topMerchant = { merchant: null, amount: 0 };

    for (const merchantName in merchantTotals) {
      const amount = merchantTotals[merchantName];
      if (amount > topMerchant.amount) {
        topMerchant = { merchant: merchantName, amount };
      }
    }

    res.status(200).json({
      total_amount: totalAmount,
      status_counts: statusCounts,
      top_merchant: topMerchant,
    });

  } catch (error) {
    console.error("Error generating order summary:", error);
    res.status(500).json({ error: `Failed to get orders summary : ${error}` });
  }
}

async function createOrder(req, res) {
  try {
    // กำหนดตัวแปรต่างๆที่จะเพิ่ม
    const { merchant, items, amount, status } = req.body || {};
    const numericItems = Number(items);
    const numericAmount = Number(amount);

    if (!merchant || typeof merchant !== "string" || !merchant.trim()) {
      return res.status(400).json({ error: "merchant is required" });
    }

    if (!Number.isInteger(numericItems) || numericItems <= 0) {
      return res.status(400).json({ error: "items must be a positive integer" });
    }

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ error: "amount must be a non-negative number" });
    }

    if (!status || typeof status !== "string" || !status.trim()) {
      return res.status(400).json({ error: "status is required" });
    }

    const orders = await loadOrders();

    if (!Array.isArray(orders)) {
      return res.status(500).json({ error: "Orders data is not available" });
    }

    const nextOrderId = Math.floor(Math.random() * 1000000);

    const newOrder = {
      order_id: nextOrderId,
      merchant: merchant.trim(),
      items: numericItems,
      amount: numericAmount,
      status: status.trim().toUpperCase(),
    };

    orders.push(newOrder);
    await saveOrders(orders);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: `Failed to create order : ${error.message || error}` });
  }
}

module.exports = {
  listOrders,
  getOrdersSummary,
  createOrder,
};
