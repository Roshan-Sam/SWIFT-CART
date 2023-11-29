import express from 'express'
import Category from '../models/categorySchema.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const category = await Category.create(req.body);
        return res.status(201).json(category);
    } catch (e) {
        console.log(e);
        return res.status(404).json({ error: e })
    }
})

router.get('/', async (req, res) => {
    const query = {};
    const category = await Category.find(query);
    res.json(category);
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Category.findByIdAndUpdate(id, req.body);
        res.json({ message: 'Category Updated' });
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Update - No Category found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Category.findByIdAndDelete(id);
        res.json({ message: 'Category Deleted' });
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Delete - No Category found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const category = await Category.findById(id);
        res.status(200).json(category)
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to GET - No Category found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
})

export default router;


