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

router.get('/:product_id/update', async (req, res) => {
    // retrieve the product
    const productId = req.params.product_id
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true
    });

    const productForm = createProductForm();

    // fill in the existing values
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })

})

module.exports = router; // #3 export out the router

const { bootstrapField, createProductForm } = require('../forms'); // import in the Forms