const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['QR', 'BankTransfer'],
        required: true,
    },
    bank: {
        type: String,
    },
    slip: {
        url: String, // URL ของสลิปใน Cloudinary
        public_id: String, // public_id สำหรับลบจาก Cloudinary หากต้องการ
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',  // ฟิลด์นี้สามารถเก็บการเชื่อมโยงกับ order
        required: false, // เปลี่ยนจาก required: true เป็น false
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Confirmed'],
    }
}, { timestamps: true });

module.exports = Payment = mongoose.model('Payment', PaymentSchema);
