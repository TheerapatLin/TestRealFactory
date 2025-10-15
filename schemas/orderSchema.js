// ตรวจสอบความถูกต้องของไฟล์ Sample_orders.json
function assertOrdersArray(data) {
  if (!Array.isArray(data)) {
    const error = new Error("Sample_orders.json must contain an array of orders");
    error.statusCode = 500;
    throw error;
  }
}

module.exports = {
  assertOrdersArray,
};
