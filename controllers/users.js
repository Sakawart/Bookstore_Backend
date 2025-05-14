const bcrypt = require('bcryptjs')

// Models
const User = require('../models/User')
const Product = require('../models/Product')
const Cart = require('../models/Cart')
const Order = require('../models/Order')

const jwt = require('jsonwebtoken');
const { token } = require('morgan');

exports.listUsers = async (req, res) => {
    try {
        //code
        const user = await User.find({}).select('-password').exec();
        res.send(user)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!');
    }
};

exports.readUsers = async (req, res) => {
    try {
        //code
        const id = req.params.id;
        const user = await User.findOne({ _id: id }).select('-password').exec()
        res.send(user)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!');
    }
};

exports.updateUsers = async (req, res) => {
    try {
        //code
        var { id, password } = req.body.values
        // เอา salt มาช่วย
        const salt = await bcrypt.genSalt(10) //สร้างข้อความมั่ว 10 ตัว
        // Encrypt การเข้ารหัส
        var enPassword = await bcrypt.hash(password, salt) //การเข้ารหัส
        const user = await User.findOneAndUpdate(
            { _id: id },
            { password: enPassword },
        );
        res.send(user)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!');
    }
};

exports.removeUsers = async (req, res) => {
    try {
        //code
        const id = req.params.id;
        const user = await User.findOneAndDelete({ _id: id });
        res.send(user)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!');
    }
};

exports.changeStatus = async (req, res) => {
    try {
        //code
        console.log(req.body)
        const user = await User.findOneAndUpdate(
            { _id: req.body.id },
            { enabled: req.body.enabled },
        );
        res.send(user)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!');
    }
};

exports.changeRole = async (req, res) => {
    try {
        //code
        console.log(req.body)
        const user = await User.findOneAndUpdate(
            { _id: req.body.id },
            { role: req.body.role },
        );
        res.send(user)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!');
    }
};

exports.userCart = async (req, res) => {
    try {
        const { cart } = req.body;
        // Check User
        let user = await User.findOne({ username: req.user.username }).exec();
        // สร้าง array [{1},{2},{3}]
        let products = [];
        // Check ตะกร้าสินค้าอันเก่า
        let cartOld = await Cart.findOne({ orderdBy: user._id }).exec();
        if (cartOld) {
            await Cart.deleteOne({ _id: cartOld._id });
            console.log("remove old cart");
        }
        //แต่งสินค้า
        for (let i = 0; i < cart.length; i++) {
            let object = {};

            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.price = cart[i].price;

            // {3}
            products.push(object);
        }
        // หาผลรวมของตะกร้า
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            //code
            cartTotal = cartTotal + products[i].price * products[i].count;
        }

        let newCart = await new Cart({
            products,
            cartTotal,
            orderdBy: user._id,
        }).save();

        console.log(newCart);
        res.send("userCart Ok");
    } catch (err) {
        console.log(err);
        res.status(500).send("userCart Server Error");
    }
};

exports.getUserCart = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username }).exec();

        let cart = await Cart.findOne({ orderdBy: user._id })
            .populate("products.product", "_id title price")
            .exec();

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const { products, cartTotal } = cart;
        res.json({ products, cartTotal });
    } catch (err) {
        console.error('Error fetching cart:', error);
        res.status(500).send("getUserCart Error");
    }
};

exports.emptyCart = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username }).exec();
        const empty = await Cart
            .findOneAndDelete({ orderdBy: user._id })
            .exec()
        res.send(empty)

    } catch (err) {
        res.status(500).send("Delete Cart Error");
    }
};

exports.saveAddress = async (req, res) => {
    try {
        const userAddress = await User
            .findOneAndUpdate(
                { username: req.user.username },
                { address: req.body.address }
            ).exec();
        res.send({ ok: true })
    } catch (err) {
        res.status(500).send("Save Address Error");
    }
};

// Order
exports.saveOrder = async (req, res) => {
    try {
        // ดึงข้อมูลผู้ใช้จาก Token
        let user = await User.findOne({ username: req.user.username }).exec();

        // ดึงข้อมูล Cart ที่ผู้ใช้ทำการสั่งซื้อ
        let userCart = await Cart.findOne({ orderdBy: user._id }).exec();

        // สร้างคำสั่งซื้อใหม่ (Order)
        let newOrder = new Order({
            products: userCart.products,  // สินค้าที่อยู่ในตะกร้า
            cartTotal: userCart.cartTotal, // ยอดรวมตะกร้าสินค้า
            orderstatus: 'Not Process',  // สถานะเริ่มต้นของคำสั่งซื้อ
            orderdBy: user._id  // เชื่อมโยงคำสั่งซื้อกับผู้ใช้
        });

        const savedOrder = await newOrder.save(); // บันทึกคำสั่งซื้อ

        // อัปเดตจำนวนสินค้าที่ขายและจำนวนที่เหลือในคลังสินค้า (Products)
        let bulkOption = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },  // ค้นหาสินค้าจาก ID
                    update: { $inc: { quantity: -item.count, sold: +item.count } } // อัปเดตจำนวนสินค้าและจำนวนขาย
                }
            }
        });

        let updated = await Product.bulkWrite(bulkOption, {});  // ดำเนินการ bulk update กับสินค้า

        // ส่งคำสั่งซื้อที่ถูกบันทึกพร้อมข้อมูล
        res.status(201).json({ _id: savedOrder._id, message: 'Order created successfully', order: savedOrder });

    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ error: 'Error saving order' });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username }).exec();
        let order = await Order.find({ orderdBy: user._id })
            .populate("products.product")
            .populate('payment')
            .exec();
        res.json(order);
    } catch (err) {
        res.status(500).send("get Order Error");
    }
};

exports.removeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        // หา Order ที่ต้องการลบ
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // ดึงข้อมูลการชำระเงินจากคำสั่งซื้อ
        const payment = await Payment.findById(order.payment);

        // ลบสลิปจาก Cloudinary ถ้ามีการอัปโหลดสลิป
        if (payment && payment.slip && payment.slip.public_id) {
            await cloudinary.uploader.destroy(payment.slip.public_id);
        }

        // ลบคำสั่งซื้อและการชำระเงิน
        await Order.findByIdAndDelete(orderId);
        if (payment) {
            await Payment.findByIdAndDelete(payment._id);
        }

        // ไม่ปรับ count และ sold ของสินค้า
        // เพิ่มโค้ดด้านล่างนี้หากมีการคืนสต็อกของสินค้าตอนสร้างคำสั่งซื้อ
        const bulkOption = order.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: +item.count, sold: -item.count } }  // ย้อนกลับการเปลี่ยนแปลง
                }
            };
        });
        await Product.bulkWrite(bulkOption, {});

        res.json({ message: 'Order and payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting order and payment:', error);
        res.status(500).json({ error: 'Error deleting order' });
    }
};

//wishlist
exports.addToWishList = async (req, res) => {
    try {
        const { productId } = req.body
        let user = await User.findOneAndUpdate(
            { username: req.user.username }, { $addToSet: { wishlist: productId } }
        ).exec()
        res.send(user)
    } catch (err) {
        res.status(500).send('Add Wishlist Error')
    }
}

exports.getWishList = async (req, res) => {
    try {
        let list = await User
            .findOne({ username: req.user.username })
            .select('wishlist')
            .populate({
                path: 'wishlist',
                populate: { path: 'category' } // ทำการ populate category ด้วย
            })
            .exec();
        res.json(list);

    } catch (err) {
        res.status(500).send('GET Wishlist Error');
    }
}


exports.removeWishList = async (req, res) => {
    try {
        //code
        // //https://localhost/user/wishlist/465465456456456
        const { productId } = req.params
        let user = await User.findOneAndUpdate(
            { username: req.user.username },
            { $pull: { wishlist: productId } }
        ).exec()

        res.send(user)

    } catch (err) {
        res.status(500).send('GET Wishlist Error')
    }
}

