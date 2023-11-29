import express from 'express'
import Subcategory from './../models/subCategorySchema.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const subcategory = await Subcategory.create(req.body)
        return res.status(201).json(subcategory)
    } catch (e) {
        console.log(e);
        return res.status(404).json({ error: e })
    }
})

router.get('/', async (req, res) => {
    const query = {};
    const subcategory = await Subcategory.find(query);
    res.json(subcategory);
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Subcategory.findByIdAndUpdate(id, req.body);
        res.json('Subcategory Updated');
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Update-No Subcategory found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Subcategory.findByIdAndDelete(id);
        res.json('subcategory Deleted');
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Delete-No Subcategory found for the given ID',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
});

export default router