const express = require('express');
const product = require('../dal/product');
const { createProductForm, bootstrapField } = require('../forms');

const router = express.Router();

router.get('/', async function (req, res) {
    const products = await product.getAllProducts();
    res.render("products/index", {
        products: products.toJSON()
    });
});

router.get('/create', async function (req, res) {
    const allCategories = await product.getAllCategories();
    const allTags = await product.getAllTags();
    const productForm = createProductForm(allCategories, allTags);
    res.render('products/create', {
        form: productForm.toHTML(bootstrapField)
    });
});

router.post('/create', async function (req, res) {
    const product = await product.createProduct(req.body);
    req.flash("success_messages", "New product has been added");
    res.redirect('/products');
});

router.get('/:product_id/update', async function (req, res) {
    const product = await product.getProductById(req.params.product_id);
    const allCategories = await product.getAllCategories();
    const allTags = await product.getAllTags();
    const productForm = createProductForm(allCategories, allTags);
    res.render('products/update', {
        form: productForm.toHTML(bootstrapField),
        product: product.toJSON()
    });
});

router.post('/:product_id/update', async function (req, res) {
    await product.updateProduct(req.params.product_id, req.body);
    req.flash("success_messages", "Product has been updated");
    res.redirect('/products');
});

router.get('/:product_id/delete', async function (req, res) {
    const product = await product.getProductById(req.params.product_id);
    res.render('products/delete', {
        product: product.toJSON()
    });
});

router.post('/:product_id/delete', async function (req, res) {
    await product.deleteProduct(req.params.product_id);
    req.flash("success_messages", "Product has been deleted");
    res.redirect('/products');
});

module.exports = router;
