const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  Tag.findAll({include: [{model: Product, through: ProductTag}]})
  .then((tagData)=>{
    res.status(200).json(tagData)
  }).catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  Tag.findByPk(req.params.id,{include: [{model: Product, through: ProductTag}]})
  .then((tagData)=>{
    res.status(200).json(tagData)
  }).catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.post('/', (req, res) => {
  // create a new tag
  // body has a tag name and productIds array
  /*{
     "tag_name": "sports",
      "productIds": [6]
    } */
  Tag.create(req.body)
  .then((tag) =>{
    if (req.body.productIds.length) {
      const productTagIdArr = req.body.productIds.map((product_id) => {
        return {
          tag_id: tag.id,
          product_id,
        };
      });
      return ProductTag.bulkCreate(productTagIdArr);
    }
    // if no product tags, just respond
    res.status(200).json(tag);
  })
  .then((productTagIds) => res.status(200).json(productTagIds))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
  });

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body,{
    where:{
      id: req.params.id,
    },
  })
  .then((tag) => {
    if (req.body.productIds && req.body.productIds.length) {
      ProductTag.findAll({
        where: { tag_id: req.params.id }
      }).then((productTags) => {
        // create filtered list of new tag_ids
        const productTagIds = productTags.map(({ product_id }) => product_id);
        const newProductTags = req.body.productIds
        .filter((product_id) => !productTagIds.includes(product_id))
        .map((product_id) => {
          return {
            tag_id: req.params.id,
            product_id,
          };
        });

          // figure out which ones to remove
        const productTagsToRemove = productTags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);
                // run both actions
        return Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
      });
    }

    return res.json(tag);
  })
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  Tag.destroy({where: {id: req.params.id}})
  .then((tag) => {
    if (req.body.productIds && req.body.productIds.length) {
      
      ProductTag.findAll({
        where: { tag_id: req.params.id }
      }).then((productTags) => {
          // figure out which ones to remove
        const productTagsToRemove = productTags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);
                // remove the product from the array
        return Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ]);
      });
    }

    return res.json(tag);
  })
  .catch((err) => {
    // console.log(err);
    res.status(400).json(err);
  });
});

module.exports = router;
