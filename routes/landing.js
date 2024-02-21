const express = require("express");
const router = express.Router(); // #1 - Create a new express Router


//  #2 Add a new route to the Express router
router.get('/', (req, res) => {
    res.render('landing/index')
})
router.get('/about-us', (req, res) => {
    res.render('landing/about-us')
})

router.get('/contact-us', (req, res) => {
    res.render('landing/contact-us')
})

router.get('/create', async (req, res) => {
    const productForm = createProductForm();
    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField)
    })
})

module.exports = router; // #3 export out the router

const { bootstrapField, createProductForm } = require('../forms'); // import in the Forms