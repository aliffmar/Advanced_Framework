// dal/productDAL.js
const { Product, Category, Tag } = require('../models');

async function getAllCategories() {
    return await Category.fetchAll();
}
async function getAllProducts() {
    return await product.fetchAll();
}

async function getAllTags() {
    return await Tag.fetchAll();
}

async function createProduct(productData) {
    const product = new Product(productData);
    await product.save();
    return product;
}

async function getProductById(productId) {
    return await Product.where({ id: productId }).fetch({ withRelated: ['tags'] });
}

async function updateProduct(productId, productData) {
    const product = await Product.where({ id: productId }).fetch({ require: true });
    await product.save(productData);
    return product;
}

async function deleteProduct(productId) {
    const product = await Product.where({ id: productId }).fetch({ require: true });
    await product.destroy();
}

module.exports = {
    getAllProducts,
    getAllCategories,
    getAllTags,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
};
