import express from 'express';
import Cart from '../models/cartSchema.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { customerId, productId, quantity } = req.body;
        const existingCart = await Cart.findOne({ customerId: customerId })
        if (existingCart) {

            const existingProductIndex = existingCart.products.findIndex((product) => (
                product.productId == productId
            ))

            if (existingProductIndex !== -1) {
                existingCart.products[existingProductIndex].quantity += quantity
            } else {
                existingCart.products.push({
                    productId: productId, quantity: quantity
                })
            }
            await existingCart.save();
            return res.status(201).json(existingCart);
        } else {
            const cart = {
                customerId,
                products: [{ productId, quantity }],
            }
            await Cart.create(cart)
            return res.status(201).json(cart);
        }

    } catch (e) {
        console.log(e);
    }
});

router.get('/', async (req, res) => {
    try {
        const customerId = req.query.customerId
        const cart = await Cart.findOne({ customerId: customerId });
        return res.json(cart);
    } catch (e) {
        return res.status(404).json(e);
    }

});

router.put('/', async (req, res) => {
    const { customerId, productId, quantity } = req.body
    try {
        const existingCart = await Cart.findOne({ customerId: customerId })
        const productIndex = existingCart.products.findIndex((product) => product.productId == productId)
        if (productIndex !== -1) {
            existingCart.products[productIndex].quantity = quantity;
            await existingCart.save()
            res.json({ message: 'Cart Updated' })
        } else {
            res.status(404).json({ message: "Product not found in the cart" });
        }
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Update - No product found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
});

router.delete('/', async (req, res) => {
    const { customerId, productId } = req.body;
    try {
        const existingCart = await Cart.findOne({ customerId: customerId });

        if (!existingCart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const productIndex = existingCart.products.findIndex((product) => product.productId == productId);

        if (productIndex !== -1) {
            existingCart.products.splice(productIndex, 1);
            await existingCart.save();
            return res.json({ message: 'Product removed from the cart' });
        } else {
            return res.status(404).json({ message: "Product not found in the cart" });
        }
    } catch (e) {
        if (e.name == 'CastError') {
            return res.status(404).json({
                message: 'Unable to Remove - No product found for the given ID',
            });
        } else {
            return res.status(500).json({ message: e.message });
        }
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await Cart.findOneAndDelete({ _id: id })
        return res.status(201)
    } catch (e) {
        if (e.name == 'CastError') {
            return res.status(404).json({
                message: 'Unable to Remove - No product found for the given ID',
            });
        } else {
            return res.status(500).json({ message: e.message });
        }
    }
})

export default router;
