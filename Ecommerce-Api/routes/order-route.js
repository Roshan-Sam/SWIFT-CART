import express from 'express';
import Order from '../models/orderSchema.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        return res.status(201).json(order);
    } catch (e) {
        console.log(e);
    }
});

router.get('/', async (req, res) => {
    const { sellerId, customerId, customerPopulate } = req.query
    const query = {};

    if (sellerId) {
        query.sellerId = sellerId;
    }
    if (customerId) {
        query.customerId = customerId;
    }
    try {
        if (customerPopulate) {
            const order = await Order.find(query).populate('customerId');
            res.status(201).json(order)
        } else {
            const order = await Order.find(query);
            res.status(201).json(order)
        }
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Update - No Order found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Order.findByIdAndUpdate(id, req.body);
        res.json({ message: 'Order Updated' });
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Update - No Order found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Order.findByIdAndDelete(id);
        res.json({ message: 'Order Deleted' });
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Delete - No Order found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
});

export default router;
