## Order Summary API

บริการ Node.js ที่อ่านข้อมูลจาก `Sample_orders.json` และเปิด API สำหรับดึงข้อมูลคำสั่งซื้อ สรุปผล และ mock AI helper 

### โครงสร้างโปรเจ็กต์

- `server.js` – จุดเริ่มต้นของแอป Express
- `controllers/` – ตรรกะอ่านและคำนวณข้อมูลจากไฟล์ JSON
- `ordersController.js` – ดึงรายการคำสั่งซื้อ / ค้นหา / สรุปยอด
- `aiHelperController.js` – mock สรุปภาษามนุษย์จาก prompt
- `routes/`
- `ordersRoute.js` – เส้นทาง `/orders` และ `/orders/summary`
- `aiHelperRoute.js` – เส้นทาง `/ai-helper` (POST)
- `schemas/` – ฟังก์ชันตรวจสอบและแปลงพารามิเตอร์
- `Sample_orders.json` – ข้อมูลคำสั่งซื้อ

### การติดตั้งและรัน

1. ติดตั้ง dependencies  
   npm install
   
2. รันเซิร์ฟเวอร์ (ดีฟอลต์ :3103)  
   node server.js

### Endpoints หลัก

- `GET /health` – ตรวจสอบสถานะบริการ
- `GET /orders` – รับรายการคำสั่งซื้อทั้งหมด
- `GET /orders/summary` – สรุปยอดรวม จำนวนสถานะหลัก และร้านที่ยอดขายสูงสุด
- `POST /ai-helper` – ส่ง `prompt` เพื่อรับข้อความสรุปแบบ human-friendly (mock response)

### จุดที่ใช้ AI และสิ่งที่ได้เรียนรู้

- ให้ AI Generate โปรแกรมในส่วนของการอ่านไฟล์และ Logic ภายใน Controller (บางส่วน)
- ให้ AI Generate โปรแกรมในส่วนของการ Error (บางส่วน)
- เรียนรู้การอ่านไฟล์ใน NodeJS
- เรียนรู้การทำ Mock Response

### Creativity & Optimization 
- จากไฟล์ order.json ควรเพิ่มรายละเอียดแสดงราคาต่อชิ้นของสินค้าได้ด้วย

