import express from 'express'
import Product from '../models/productsSchema.js';
import checkAuthentication from '../middleware/checkAuthentication.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body)
        return res.status(201).json(product)
    } catch (e) {
        console.log(e);
        return res.status(404).json({ error: e })
    }
})

router.get('/', async (req, res) => {
    try {
        let filter = {};
        let brandNames;
        const { categoryId, sellerId, subCategoryId, page, limit, search, priceRange, brand, rating } = req.query;
        let products, categoryProducts, sellerProducts, subCategoryProducts, limitedProducts;

        if (page && categoryId && categoryId !== 'all' && categoryId !== 'Category') {
            filter.categoryId = categoryId;
        } else if (page && subCategoryId && subCategoryId !== 'all' && subCategoryId !== 'Sub Category') {
            if (brand && brand !== 'Brand') {
                filter.brand = brand;
                brandNames = await Product.distinct('brand', { subCategoryId: subCategoryId });
            } else {
                filter.subCategoryId = subCategoryId;
                brandNames = await Product.distinct('brand', { subCategoryId: subCategoryId });
            }
        } else if (!page && categoryId) {
            categoryProducts = await Product.find({ categoryId: categoryId });
        } else if (!page && subCategoryId) {
            subCategoryProducts = await Product.find({ subCategoryId: subCategoryId });
        } else if (sellerId) {
            sellerProducts = await Product.find({ sellerId: sellerId });
        } else {
            products = await Product.find({});
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.name = searchRegex;
        }

        if (priceRange) {
            if (priceRange === '100000') {
                filter.price = { $gte: 100000 };
            } else if (priceRange !== 'all') {
                const [min, max] = priceRange.split('-');
                filter.price = { $gte: min, $lte: max };
            }
        }
        if (page) {
            const skip = (page - 1) * limit;
            if (rating && rating !== 'Rating') {
                const ratingProducts = await Product.find(filter);
                const filteredProducts = ratingProducts.filter(product => {
                    const avgRating = product.ratings.length > 0 ?
                        product.ratings.map(rating => rating.rating).reduce((a, b) => a + b, 0) / product.ratings.length :
                        0;
                    return Math.round(avgRating) === parseInt(rating);
                });
                limitedProducts = filteredProducts.slice(skip, skip + parseInt(limit));
            } else {
                limitedProducts = await Product.find(filter).skip(skip).limit(parseInt(limit)).exec();
            }
        }
        return res.status(200).json({ products, categoryProducts, sellerProducts, subCategoryProducts, limitedProducts, brandNames });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const product = await Product.findById(id)
        res.status(201).json(product)
    } catch (e) {
        return res.status(404).json({ error: e })
    }
})

router.patch("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await Product.findByIdAndUpdate(id, req.body)
        res.status(201).json({ message: "Product Updated" })
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Update - No Product found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
})
router.put("/:id", async (req, res) => {
    const id = req.params.id
    const { customerId, rating, review, date } = req.body.ratings
    try {
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const newRating = {
            customerId: customerId,
            rating: rating,
            review: review,
            data: new Date(date)
        }
        product.ratings.push(newRating)
        await product.save()
        res.status(201).json({ message: "Product Updated" });
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Update - No Product found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
})
router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await Product.findByIdAndDelete(id)
        res.status(201).json({ message: "Product Deleted" })
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Delete - No Product found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
})

export default router;
