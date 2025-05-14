const bcrypt = require('bcryptjs')
const User = require('../models/User')
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        // Check user ว่า username ที่พิมพ์มามีในระบบมั้ย
        const { username, password } = req.body;
        var user = await User.findOne({ username })
        console.log(user)
        if (user) {
            return res.status(400).send('User Already exists');
        }
        const salt = await bcrypt.genSalt(10) //สร้างข้อความมั่ว 10 ตัว
        user = new User({
            username,
            password,
        });
        // Encrypt การเข้ารหัส
        user.password = await bcrypt.hash(password, salt) //การเข้ารหัส
        await user.save();
        res.send('register success');
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!')
    }
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        var user = await User.findOneAndUpdate({username}, {new: true});
        if(user && user.enabled){
            // เช็ค password
            const isMatch = await bcrypt.compare(password,user.password)
            if(!isMatch){
                return res.status(400).send('Username or Password Invalid!!!')
            }
            //Payload ส่งรหัสไปสร้างเป็น Token
            const payload = {
                user:{
                    username: user.username,
                    role: user.role
                }
            }
            //Generate Token สร้างเป็น Token
            jwt.sign(payload, 'jwtSecret',{expiresIn: 3600 },//กำหนดเวลาหมดอายุเป็นวิ 1 ชม.
                (err,token)=>{
                    if(err) throw err; //ให้โยน err ออกมา
                    res.json({token,payload})
            });
        }else{
            return res.status(400).send('Username or Password Invalid!!!');
        }
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!')
    }
}

exports.currentUser = async(req, res)=> {
    try{
        // model User
        //console.log('controller',req.user)
        const user = await User.findOne({username: req.user.username})
        .select("-password") // เลือกไม่ให้โชว์ password
        .exec();
        res.send(user);
    }catch(err){
        console.log(err);
        res.status(500).send('Server Error!')
    }
}

exports.listUser = async (req, res) => {
    try {
        res.send('List Get User')
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error!')
    }
}

exports.editUser = async (req, res) => {
    try {

        res.send('edituser')
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!')
    }
}

exports.deleteUser = async (req, res) => {
    try {

        res.send('deleteUser')
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error!')
    }
}