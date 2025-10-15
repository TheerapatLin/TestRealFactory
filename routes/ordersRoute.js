const express = require("express");

const {
  listOrders,
  getOrdersSummary,
  createOrder,
} = require("../controllers/ordersController");

const router = express.Router();

router.get("/", listOrders);

router.get("/summary", getOrdersSummary);

router.post("/", createOrder);

module.exports = router;
