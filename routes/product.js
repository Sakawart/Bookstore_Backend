const express = require('express');
const router = express.Router()

//conrollers
const { create, list, remove, read, update, listBy, searchFilters } = require('../controllers/product')

//middleware
const { auth, adminCheck } = require('../middleware/auth')

//@Endpoint http://localhost:5000/api/product
router.post('/product', auth, adminCheck, create);

//@Endpoint http://localhost:5000/api/product/count
router.get('/product/:count', list);

//@Endpoint http://localhost:5000/api/product/:id
router.delete("/product/:id", auth, adminCheck, remove);

//update
//@Endpoint http://localhost:5000/api/products/:id
router.get('/products/:id', read);

//@Endpoint http://localhost:5000/api/product/:id
router.put('/product/:id', auth, adminCheck, update);

router.post("/productby", listBy);

// Search
//@Endpoint http://localhost:5000/api/search/filters
router.post('/search/filters',searchFilters)

module.exports = router;