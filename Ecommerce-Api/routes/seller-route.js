import express from 'express'
import Seller from './../models/sellerSchema.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import checkAuthentication from './../middleware/checkAuthentication.js';
const router = express.Router();

router.post('/sign-up', async (req, res) => {
    try {
        const sellerData = req.body;
        console.log(sellerData)
        if (sellerData.password != sellerData.confirmPassword) {
            return res.status(404).json({ error: "password dont match" })
        }
        const hashedPassword = await bcrypt.hash(sellerData.password, 2)
        const seller = await Seller.create({ ...sellerData, password: hashedPassword })
        res.status(201).json(seller)
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
    }

})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const seller = await Seller.findOne({ email: email })
        console.log(seller)
        if (!seller) {
            return res.status(404).json({ error: 'email or password does not match' })
        }

        const isPasswordMatch = await bcrypt.compare(password, seller.password)
        if (isPasswordMatch) {
            const token = jwt.sign({
                sellerId: seller._id, role: 'SELLER'
            }, process.env.JWT_API_KEY
            );
            return res.status(200).json({ message: 'You are logged in', token: token, sellerId: seller._id })
        } else {
            return res.status(404).json({ message: 'Email or Password does not match' })
        }
    } catch (e) {
        return res.status(500).json({ error: "Internal server error" })
    }
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const seller = await Seller.findById(id)
        res.status(200).json(seller)
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: "Unable to GET - No Seller found for the given ID"
            })
        } else {
            res.status(404).json(e.message);

        }
    }
})

router.patch("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await Seller.findByIdAndUpdate(id, req.body)
        res.json({ message: "Seller Updated" })
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to Update - No Seller found for the given ID',
            });
        } else {
            res.status(404).json(e.message);

        }
    }
})

router.delete("/:id", async (req, res) => {
    const id = req.params.id
    try {
        await Seller.findByIdAndDelete(id)
        res.status(201).json({
            message: "Seller Removed"
        })
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: 'Unable to remove seller with give id',
            });
        } else {
            res.status(404).json(e.message);
        }
    }
})


export default router;
