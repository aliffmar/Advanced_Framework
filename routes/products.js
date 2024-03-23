const express = require('express');
const { Product, Category, Tag } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');

const router = express.Router();

router.get('/', async function (req, res) {
    
    // Same as SELECT * FROM products
    let products = await Product.collection().fetch({
        withRelated:['category'] 
    });
    res.render("products/index", {
        products: products.toJSON()
    })
})

router.get('/create', async function (req, res) {


    const allCategories = await Category.fetchAll().map(category => [category.get('id'), category.get('name')]);

    const tags = await Tag.fetchAll().map( tag =>  [tag.get('id'), tag.get('name')]);

    const productForm = createProductForm(allCategories, tags);
    res.render('products/create', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async function (req, res) {
    const allCategories = await Category.fetchAll().map(category => [category.get('id'), category.get('name')]);
    const tags = await Tag.fetchAll().map( tag =>  [tag.get('id'), tag.get('name')]);
 
 
    const productForm = createProductForm(allCategories, tags);
    productForm.handle(req, {
        "success": async function (form) {

            const product = new Product();
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('category_id', form.data.category_id)
        
            await product.save();

            let tags = form.data.tags;

            if (tags) {

               
                await product.tags().attach(tags.split(','));
            }

            req.flash("success_messages", "New product has been added");  // req.session.messages.success_messages = [ "New product hass been added"];
            res.redirect('/products');
  

        },
        "error": function (form) {
            res.render('products/create', {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": function (form) {
            res.render('products/create', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/update', async function (req, res) {
    const tags = await Tag.fetchAll().map( tag =>  [tag.get('id'), tag.get('name')]);
    const allCategories = await Category.fetchAll().map(category => [category.get('id'), category.get('name')]);

    // get the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        withRelated:['tags'],
        require: true 
    }); 

    const productForm = createProductForm(allCategories, tags);

    productForm.fields.name.value = product.get('name');
    productForm.fields.description.value = product.get('description');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.category_id.value = product.get('category_id');

    // get all the selected tags' id
    const selectedTags = await product.related('tags').pluck('id');
    console.log(selectedTags);
    productForm.fields.tags.value = selectedTags;

    res.render('products/update', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/:product_id/update', async function(req,res)
{
    const tags = await Tag.fetchAll().map( tag =>  [tag.get('id'), tag.get('name')]);
    const allCategories = await Category.fetchAll().map(category => [category.get('id'), category.get('name')]);
    const productForm = createProductForm(allCategories, tags);

    // fetch the product that we want to update
    const product = await Product.where({
        id: req.params.product_id
    }).fetch({
        require: true,
        withRelated:['tags']
    })

    productForm.handle(req, {
        "success": async function(form) {
            let {tags, ...productData} = form.data;
     
            product.set(productData);
            await product.save();

    
            let tagIds = tags.split(",");


            const existingTagIds = await product.related('tags').pluck('id');
            await product.tags().detach(existingTagIds);

            await product.tags().attach(tagIds);

            res.redirect('/products');
        },
        "error": async function(form) {
            res.render('products/update',{
                form: form.toHTML(bootstrapField)
            })
        },
        "empty":async function(form){
            res.render('products/update',{
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/delete', async function(req,res){

     const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true 
    }); 

    res.render('products/delete', {
        product: product.toJSON()
    })
})

router.post('/:product_id/delete', async function(req,res){
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true // if no such product is found, throw an exception
    }); 
    await product.destroy();
    req.flash("success_messages", "Product has been deleted");
    res.redirect('/products');
})

module.exports = router;