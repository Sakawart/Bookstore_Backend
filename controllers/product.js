const Product = require('../models/Product');

exports.create = async (req, res) => {
  try {
    console.log(req.body)
    // const { name } = (req.body);
    const product = await new Product(req.body).save()
    res.send(product);
  } catch (err) {
    res.status(500).send('Create Product Error!!')
  }
};

exports.list = async (req, res) => {
  try {
    const count = parseInt(req.params.count)

    const product = await Product.find()
      .limit(count) //เรียกโชว์กี่ตัว
      .populate('category') //ใช้สำหรับ join table ที่ต้องการ
      .sort([["createdAt", "desc"]]) //ให้เรียงการที่สร้างล่าสุด
    res.send(product);
  } catch (err) {
    res.status(500).send('List Product Error!!')
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      _id: req.params.id,
    }).exec();
    res.send(deleted);
  } catch (err) {
    res.status(500).send("Remove Product Error!!");
  }
};

exports.read = async (req, res) => {
  try {
    //code
    const product = await Product.findOne({ _id: req.params.id })
      .populate("category") //ใช้สำหรับ join table ที่ต้องการ
      .exec();
    res.send(product);
  } catch (err) {
    //err
    res.status(500).send("Read Product Error!!");
  }
};

exports.update = async (req, res) => {
  try {
    //code
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    ).exec();
    res.send(product);
  } catch (err) {
    //err
    res.status(500).send("Update Product Error!!");
  }
};

exports.listBy = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;
    const product = await Product.find()
      .limit(limit) //เรียกโชว์กี่ตัว
      .populate('category') //ใช้สำหรับ join table ที่ต้องการ
      .sort([[sort, order]]) //ให้เรียงการที่สร้างล่าสุด
    res.send(product);
  } catch (err) {
    res.status(500).send('ListBy Product Error!!')
  }
};


// search 
const handleQuery = async (req, res) => {
  const { query } = req.body;
  const regex = new RegExp(query, 'i'); // 'i' ทำให้ค้นหาแบบไม่สนใจตัวพิมพ์ใหญ่-เล็ก
  let products = await Product.find({
    $or: [
      { title: { $regex: regex } },
      { author: { $regex: regex } },
      { publisher: { $regex: regex } },
    ],
  })
    .populate('category', "_id name");
  res.send(products);
}

const handleCategory = async (req, res, category) => {
  let products = await Product.find({ category })
    .populate('category', "_id name");
  res.send(products);
}

exports.searchFilters = async (req, res) => {
  const { query, category } = req.body
  // ถ้าไม่มีทั้ง query และ category ให้ส่งสินค้าทั้งหมดกลับมา
  if (!query && !category) {
    const products = await Product.find()
      .populate('category', '_id name')
      .sort({ createdAt: -1 }) // เรียงลำดับล่าสุดอยู่บนสุด
      .exec();
    return res.json(products);
  }

  if (query) {
    console.log('query', query)
    await handleQuery(req, res, query)
  }
  if (category) {
    console.log('category: ', category)
    await handleCategory(req, res, category)
  }
}  