const express = require('express');
const { Product, Category, Tag } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');

const router = express.Router();

router.get('/', async function (req, res) {
    let query = Product.collection();
    
    // Check if search terms are provided in the query parameters
    if (req.query.name) {
        query = query.where('name', 'like', `%${req.query.name}%`);
    }
    if (req.query.category_id) {
        query = query.where('category_id', req.query.category_id);
    }
    if (req.query.min_cost) {
        query = query.where('cost', '>=', req.query.min_cost);
    }
    if (req.query.max_cost) {
        query = query.where('cost', '<=', req.query.max_cost);
    }

    let products = await query.fetch({ withRelated: ['category'] });

    res.render("products/index", {
        products: products.toJSON()
    });
});

router.get('/create', async function (req, res) {
    const allCategories = await Category.fetchAll().map(category => [category.get('id'), category.get('name')]);
    const tags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
    const productForm = createProductForm(allCategories, tags);
    res.render('products/create', {
        form: productForm.toHTML(bootstrapField)
    });
});

router.post('/create', async function (req, res) {
    const allCategories = await Category.fetchAll().map(category => [category.get('id'), category.get('name')]);
   
    const tags = await Tag.fetchAll().map( tag =>  [tag.get('id'), tag.get('name')]);
 
 
    const productForm = createProductForm(allCategories, tags);
    // start the form processing
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

            // update the M:N relationship with tags
            let tagIds = tags.split(",");

            // get and remove all the existing tags
            const existingTagIds = await product.related('tags').pluck('id');
            await product.tags().detach(existingTagIds);

            // Attach all the selected tags to the product
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
        require: true 
    }); 
    await product.destroy();
    res.redirect('/products');
})

module.exports = router;