// กำหนด Mock response ตาม keyword ที่กำหนด
const MOCK_RULES = [
  {
    summary:
      "วันนี้มีคำสั่งซื้อ 3 รายการ รวม 2,880 บาท โดยร้าน A มียอดขายสูงสุด",
    matches(normalizedPrompt) {
      return (
        // หา substring
        normalizedPrompt.includes("ยอดขายประจำวัน") ||
        normalizedPrompt.includes("sales daily") ||
        normalizedPrompt.includes("รายงานประจำวัน")
      );
    },
  },
  {
    summary:
      "ตอนนี้มีคำสั่งซื้อที่รอดำเนินการ 2 รายการ มูลค่ารวม 540 บาท ทีมแพ็ครับทราบและกำลังเร่งจัดส่ง",
    matches(normalizedPrompt) {
      return (
        normalizedPrompt.includes("รายงานรอดำเนินการ") ||
        normalizedPrompt.includes("pending") ||
        normalizedPrompt.includes("รายงานค้างส่ง")
      );
    },
  },
  {
    summary:
      "มีคำสั่งซื้อถูกยกเลิก 1 รายการ และมียอดคืนสินค้า 120 บาท ส่งต่อให้ทีมบริการลูกค้าดำเนินการแล้ว",
    matches(normalizedPrompt) {
      return (
        normalizedPrompt.includes("รายงานยกเลิก") ||
        normalizedPrompt.includes("cancel") ||
        normalizedPrompt.includes("รายงานคืนสินค้า") ||
        normalizedPrompt.includes("รายงานrefund")
      );
    },
  },
];

const DEFAULT_SUMMARY =
  "ยังไม่มีข้อมูลสรุปเพิ่มเติมในตอนนี้ ลองระบุสิ่งที่อยากให้ช่วยสรุปอีกครั้งได้เลยนะ";

async function getMockAiSummary(req, res) {
  try {
    prompt = req.body.prompt
    const normalizedPrompt = String(prompt || "").trim().toLowerCase();

    // หา keyword ที่ตรงกัน
    const matchedRule = MOCK_RULES.find((rule) => rule.matches(normalizedPrompt));
    // ถ้าไม่มี keyword ที่ตรงกัน ให้ใช้ DEFAULT_SUMMARY
    const summary = matchedRule ? matchedRule.summary : DEFAULT_SUMMARY;

    res.status(200).json({
      prompt,
      summary,
    })
  }
  catch (error) {
    res.status(500).json({ error: `Internal Server Error : ${error}` })
  }
}

module.exports = {
  getMockAiSummary,
};
