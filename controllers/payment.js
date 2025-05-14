const Payment = require('../models/Payment');
const Order = require('../models/Order');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 60000, // กำหนด timeout เป็น 60 วินาที 
});

exports.createPayment = async (req, res) => {
    try {
        const { method, bank, slip, order } = req.body;

        // ตรวจสอบว่า orderId ถูกส่งมา
        if (!order) {
            return res.status(400).send('Order ID is required');
        }

        // อัปโหลดสลิปไปยัง Cloudinary
        let slipData = { url: '', public_id: '' };
        if (slip) {
            const result = await cloudinary.uploader.upload(slip, {
                public_id: Date.now(),
                resource_type: 'auto',
            });
            slipData = {
                url: result.secure_url,
                public_id: result.public_id,
            };
        }

        // สร้างการชำระเงินใหม่
        const newPayment = new Payment({
            method,
            bank,
            slip: slipData,
            status: 'Pending',
        });

        await newPayment.save();

        // อัปเดตคำสั่งซื้อด้วยการเชื่อมโยงการชำระเงิน
        const updatedOrder = await Order.findByIdAndUpdate(
            order,  // orderId ที่ส่งมา
            { payment: newPayment._id },  // เพิ่ม paymentId ลงในคำสั่งซื้อ
            { new: true }  // คืนค่าข้อมูลคำสั่งซื้อที่ถูกอัปเดต
        );

        res.status(201).json({
            message: 'Payment created and order updated successfully',
            payment: newPayment,
            order: updatedOrder  // ส่งข้อมูลคำสั่งซื้อที่อัปเดตกลับไป
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).send('Error creating payment');
    }
};

exports.ChangePaymentStatus = async (req, res) => {
    try {
        const { orderId, paymentStatus } = req.body;

        // ค้นหา Order เพื่อดึง paymentId
        const order = await Order.findById(orderId).populate('payment');

        if (!order || !order.payment) {
            return res.status(404).send('Order or Payment not found');
        }

        // อัปเดตสถานะการชำระเงิน
        let paymentUpdate = await Payment.findByIdAndUpdate(
            order.payment._id,  // อัปเดต paymentId ที่เชื่อมโยงกับ order
            { status: paymentStatus },
            { new: true }
        );

        res.send(paymentUpdate);
    } catch (err) {
        res.status(500).send('Update PaymentStatus Error!!');
    }
};
