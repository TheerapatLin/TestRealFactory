// โมคโมดูล fs/promises ให้ readFile/writeFile เป็น jest mock fn
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

// ฟังก์ชันช่วยสร้าง response mock
function createMockRes() {
  const res = {};
  // mock implementation ของ res.statusCode เพื่อเก็บ statusCode แล้วคืน res 
  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  // mock implementation ของ res.json เพื่อเก็บ body แล้วคืน res
  res.json = jest.fn().mockImplementation((payload) => {
    res.body = payload;
    return res;
  });
  return res;
}

// เริ่ม test suite สำหรับ ordersController
describe("ordersController", () => {
  const sampleOrders = [
    { order_id: 1001, merchant: "Alpha", items: 2, amount: 400, status: "PAID" },
    { order_id: 1002, merchant: "Beta", items: 1, amount: 200, status: "PENDING" },
    { order_id: 1003, merchant: "Alpha", items: 3, amount: 600, status: "CANCELLED" },
  ];

  // ก่อนแต่ละเทสต์ คืนค่า mock ที่ clear แล้ว
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // test: listOrders
  test("listOrders responds with orders data", async () => {
    // เตรียมให้ readFile คืนค่า sampleOrders (เป็น JSON string)
    readFile.mockResolvedValueOnce(JSON.stringify(sampleOrders));

    const req = {};
    const res = createMockRes();

    await listOrders(req, res); // เรียกฟังก์ชันที่ทดสอบ

    expect(readFile).toHaveBeenCalledTimes(1); // ควรอ่านไฟล์ 1 ครั้ง
    expect(res.status).toHaveBeenCalledWith(200); // ควรคืนค่า 200
    expect(res.json).toHaveBeenCalledWith(sampleOrders); // ควรคืนค่า json ด้วยข้อมูลตัวอย่าง

  });

  // test: getOrdersSummary
  test("getOrdersSummary returns computed totals", async () => {
    readFile.mockResolvedValueOnce(JSON.stringify(sampleOrders));

    const req = {};
    const res = createMockRes();

    await getOrdersSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(200); // ควรคืนค่า 200
    // คาดว่า body ถูกคำนวณเป็นตามที่ระบุ
    expect(res.body).toEqual({
      total_amount: 1200,
      status_counts: { PAID: 1, PENDING: 1, CANCELLED: 1 },
      top_merchant: { merchant: "Alpha", amount: 1000 },
    });
  });

  // test: createOrder
  test("createOrder persists a new order and returns it", async () => {
    readFile.mockResolvedValueOnce(JSON.stringify(sampleOrders));
    // mock ให้ writeFile สำเร็จ
    writeFile.mockResolvedValueOnce();

    const req = {
      body: { merchant: "Gamma", items: 4, amount: 800, status: "PAID" },
    };
    const res = createMockRes();

    await createOrder(req, res);

    expect(readFile).toHaveBeenCalledTimes(1); // ควรอ่านไฟล์ 1 ครั้ง
    expect(writeFile).toHaveBeenCalledTimes(1); // ควรเขียนไฟล์ 1 ครั้ง
    expect(res.status).toHaveBeenCalledWith(201); // ควรคืนค่า 201
    expect(res.body).toMatchObject({
      merchant: "Gamma",
      items: 4,
      amount: 800,
      status: "PAID",
    });

    // ตรวจ payload ที่ถูกเขียนลงไฟล์ 
    const [, savedPayload] = writeFile.mock.calls[0];
    const savedOrders = JSON.parse(savedPayload);
    expect(savedOrders).toHaveLength(sampleOrders.length + 1); // จำนวน orders ทั้งหมดต้องเพิ่มขึ้น 1
    expect(savedOrders[savedOrders.length - 1]).toMatchObject(res.body); // รายการสุดท้ายต้องตรงกับ response
  });
});
