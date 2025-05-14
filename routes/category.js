const express = require('express');
const router = express.Router()

//conrollers
const { list, create, read, update, remove } = require('../controllers/category')

//middleware
const { auth, adminCheck } = require('../middleware/auth')

//@Endpoint http://localhost:5000/api/category
router.get('/category',list );

//@Endpoint http://localhost:5000/api/category
router.post('/category',auth, adminCheck,create);

//@Endpoint http://localhost:5000/api/category/:id
router.get('/category/:id',auth, adminCheck,read);

//@Endpoint http://localhost:5000/api/category/:id
router.put('/category/:id',auth, adminCheck,update);

//@Endpoint http://localhost:5000/api/category/:id
router.delete('/category/:id',auth, adminCheck,remove);



module.exports = router;