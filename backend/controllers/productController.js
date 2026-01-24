const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const logAudit = require('../utils/auditLogger'); // Import Logger

// @desc    Fetch all products with Filtering & Sorting
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;

  // Filtering Logic
  const keyword = req.query.keyword
    ? {
      name: {
        $regex: req.query.keyword,
        $options: 'i',
      },
    }
    : {};

  const categoryFilter = req.query.category && req.query.category !== 'All'
    ? { mainCategory: req.query.category }
    : {};

  const subCategoryFilter = req.query.subcategory && req.query.subcategory !== 'All'
    ? { category: req.query.subcategory }
    : {};

  const priceFilter = {};
  if (req.query.minPrice || req.query.maxPrice) {
    priceFilter.price = {};
    if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
  }

  // Combine all filters
  const filter = { ...keyword, ...categoryFilter, ...subCategoryFilter, ...priceFilter };

  // Sorting Logic
  let sortOption = {};
  switch (req.query.sort) {
    case 'price-asc':
      sortOption = { price: 1 };
      break;
    case 'price-desc':
      sortOption = { price: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    default:
      sortOption = { _id: -1 }; // Default to newest
  }

  const count = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get category hierarchy
// @route   GET /api/products/categories
// @access  Public
const getCategoryHierarchy = asyncHandler(async (req, res) => {
  // Aggregate to find distinct Main Categories and their Sub Categories
  const categories = await Product.aggregate([
    {
      $group: {
        _id: '$mainCategory',
        subCategories: { $addToSet: '$category' }
      }
    },
    {
      $project: {
        _id: 0,
        mainCategory: '$_id',
        subCategories: 1
      }
    },
    { $sort: { mainCategory: 1 } }
  ]);

  res.json(categories);
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const currentProduct = await Product.findById(req.params.id);
  if (currentProduct) {
    const related = await Product.find({
      _id: { $ne: currentProduct._id },
      mainCategory: currentProduct.mainCategory
    }).limit(4);
    res.json(related);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // 📝 AUDIT: Record who deleted what
    await logAudit(req, 'DELETE_PRODUCT', product._id, `Deleted: ${product.name}`);

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  console.log('📦 Create product request received');
  console.log('   Request body:', req.body);

  const { name, price, description, image, category, mainCategory, countInStock, originalPrice, discount } = req.body;

  // Validation
  if (!name || name.trim() === '') {
    console.error('❌ Validation failed: Product name is required');
    res.status(400);
    throw new Error('Product name is required');
  }

  if (!price || price === '' || Number(price) <= 0) {
    console.error('❌ Validation failed: Valid price is required. Received:', price, 'Type:', typeof price);
    res.status(400);
    throw new Error('Valid price is required (must be greater than 0)');
  }

  if (!image || image.trim() === '') {
    console.error('❌ Validation failed: Product image is required. Received:', image);
    res.status(400);
    throw new Error('Product image is required');
  }

  // mainCategory is required by the schema
  const productMainCategory = mainCategory || category || 'Uncategorized';
  const productCategory = category || 'Uncategorized';

  const product = new Product({
    name: name.trim(),
    price: Number(price),
    originalPrice: Number(originalPrice) || Number(price),
    discount: Number(discount) || 0,
    image: image.trim(),
    mainCategory: productMainCategory,
    category: productCategory,
    countInStock: Number(countInStock) || 0,
    numReviews: 0,
    rating: 0,
    description: description || '',
  });

  const createdProduct = await product.save();

  // 📝 AUDIT: Record product creation
  await logAudit(req, 'CREATE_PRODUCT', createdProduct._id, `Created: ${createdProduct.name}`);

  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, category, mainCategory, countInStock, originalPrice, discount } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    if (name !== undefined) product.name = name.trim();
    if (price !== undefined) {
      if (price < 0) {
        res.status(400);
        throw new Error('Price cannot be negative');
      }
      product.price = Number(price);
    }
    if (originalPrice !== undefined) {
      if (originalPrice < 0) {
        res.status(400);
        throw new Error('Original price cannot be negative');
      }
      product.originalPrice = Number(originalPrice);
    }
    if (discount !== undefined) {
      product.discount = Number(discount);
    }
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image.trim();
    if (mainCategory !== undefined) product.mainCategory = mainCategory;
    if (category !== undefined) product.category = category;
    if (countInStock !== undefined) {
      if (countInStock < 0) {
        res.status(400);
        throw new Error('Stock count cannot be negative');
      }
      product.countInStock = Number(countInStock);
    }

    const updatedProduct = await product.save();

    // 📝 AUDIT: Record update
    await logAudit(req, 'UPDATE_PRODUCT', updatedProduct._id, `Updated: ${updatedProduct.name}`);

    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Worker/Admin
const updateProductStock = asyncHandler(async (req, res) => {
  const { countInStock } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    if (countInStock === undefined || countInStock < 0) {
      res.status(400);
      throw new Error('Valid stock count is required');
    }

    product.countInStock = Number(countInStock);
    const updatedProduct = await product.save();

    // 📝 AUDIT: Record stock update
    await logAudit(req, 'UPDATE_STOCK', updatedProduct._id, `Updated stock for ${updatedProduct.name} to ${countInStock}`);

    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

// Make sure ALL these names match what is in productRoutes.js
module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getRelatedProducts,
  getCategoryHierarchy,
  updateProductStock,
};