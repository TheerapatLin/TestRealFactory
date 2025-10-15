jest.mock("fs/promises", () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

const { readFile, writeFile } = require("fs/promises");
const {
  listOrders,
  getOrdersSummary,
  createOrder,
} = require("../controllers/ordersController");

function createMockRes() {
  const res = {};
  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation((payload) => {
    res.body = payload;
    return res;
  });
  return res;
}

describe("ordersController", () => {
  const sampleOrders = [
    { order_id: 1001, merchant: "Alpha", items: 2, amount: 400, status: "PAID" },
    { order_id: 1002, merchant: "Beta", items: 1, amount: 200, status: "PENDING" },
    { order_id: 1003, merchant: "Alpha", items: 3, amount: 600, status: "CANCELLED" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listOrders responds with orders data", async () => {
    readFile.mockResolvedValueOnce(JSON.stringify(sampleOrders));

    const req = {};
    const res = createMockRes();

    await listOrders(req, res);

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(sampleOrders);
  });

  test("getOrdersSummary returns computed totals", async () => {
    readFile.mockResolvedValueOnce(JSON.stringify(sampleOrders));

    const req = {};
    const res = createMockRes();

    await getOrdersSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual({
      total_amount: 1200,
      status_counts: { PAID: 1, PENDING: 1, CANCELLED: 1 },
      top_merchant: { merchant: "Alpha", amount: 1000 },
    });
  });

  test("createOrder persists a new order and returns it", async () => {
    readFile.mockResolvedValueOnce(JSON.stringify(sampleOrders));
    writeFile.mockResolvedValueOnce();

    const req = {
      body: { merchant: "Gamma", items: 4, amount: 800, status: "PAID" },
    };
    const res = createMockRes();

    await createOrder(req, res);

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.body).toMatchObject({
      merchant: "Gamma",
      items: 4,
      amount: 800,
      status: "PAID",
    });

    const [, savedPayload] = writeFile.mock.calls[0];
    const savedOrders = JSON.parse(savedPayload);
    expect(savedOrders).toHaveLength(sampleOrders.length + 1);
    expect(savedOrders[savedOrders.length - 1]).toMatchObject(res.body);
  });

  test("createOrder validates required merchant field", async () => {
    const req = {
      body: { merchant: "  ", items: 2, amount: 100, status: "PAID" },
    };
    const res = createMockRes();

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "merchant is required" });
    expect(readFile).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });
});
