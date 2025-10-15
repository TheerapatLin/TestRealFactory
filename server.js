const express = require("express");

const PORT = process.env.PORT || 3103;

const app = express();
app.use(express.json());

// ทดสอบ API แรก
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// กำหนด Route ให้กับ API
const ordersRouter = require("./routes/ordersRoute");
app.use("/orders", ordersRouter);

// กำหนด Route ให้กับ API
const aiHelperRouter = require("./routes/aiHelperRoute");
app.use("/ai-helper", aiHelperRouter);

// เมื่อ Route จาก request ไม่ตรงกันกับที่กำหนดไว้เลย
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// เมื่อมี Error
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message || "Unexpected error" });
});

// Run Server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
