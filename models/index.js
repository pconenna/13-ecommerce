// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.belongsTo(Category,{
  foreignKey: 'category_id',
  onDelete: 'CASCADE'
})
// Categories have many Products
Category.hasMany(Product,{
  // not sure if this will work
  foreignKey: 'product_id',
  onDelete: 'CASCADE'
})
// Products belongToMany Tags (through ProductTag)
Product.belongsToMany(Tag,{
  foreignKey: 'tag_id',
  through:{
    model: ProductTag,
    unique:false
  },
  as: 'product_tag'
})

// Tags belongToMany Products (through ProductTag)
Tag.belongsToMany(Product,{
  foreignKey: 'product_id',
  through:{
    model: ProductTag,
    unique:false
  },
  as: 'tag_name'
})

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
