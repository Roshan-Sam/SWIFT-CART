// routes/index.js
import express from 'express';
import imageRouter from './image-upload.js';
import customerRouter from './customer-route.js';
import categoryRouter from './category-route.js';
import subCategoryRouter from './sub-category-route.js'
import sellerRouter from './seller-route.js'
import productRouter from './product-route.js'
import cartRouter from './cart-route.js'
import orderRouter from './order-route.js'
import checkoutRouter from './checkout-route.js'

const router = express.Router();

router.use(imageRouter);
router.use('/customer', customerRouter);
router.use('/seller', sellerRouter)
router.use('/category', categoryRouter);
router.use('/subcategory', subCategoryRouter)
router.use('/products', productRouter)
router.use('/cart', cartRouter)
router.use('/order', orderRouter)
router.use('/api', checkoutRouter)

export default router;


