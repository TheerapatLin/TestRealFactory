// แปลค่า id ที่ได้รับมาเป็น Number
function parseOrderId(orderIdParam) {
  const numericId = Number(orderIdParam);

  if (!Number.isFinite(numericId)) {
    const error = new Error("Order id must be a number");
    error.statusCode = 400;
    throw error;
  }

  return numericId;
}

module.exports = {
  parseOrderId,
};
