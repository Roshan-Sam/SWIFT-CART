import express from 'express'
import Customer from '../models/customerSchema.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const router = express.Router();

router.post('/sign-up', async (req, res) => {
    const customerData = req.body;
    try {
        console.log(customerData)
        if (customerData.password != customerData.confirmPassword) {
            return res.status(404).json({ error: "password dont match" })
        }
        const hashedPassword = await bcrypt.hash(customerData.password, 2)
        const customer = await Customer.create({ ...customerData, password: hashedPassword })
        console.log(customer)
        return res.status(201).json(customer)
    } catch (e) {
        return res.status(500).json({ error: e })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const customer = await Customer.findOne({ email: email })
        console.log(customer)
        if (!customer) {
            return res.status(404).json({ error: 'email or password dont match' })
        }

        const isPasswordMatch = await bcrypt.compare(password, customer.password)
        if (isPasswordMatch) {
            const token = jwt.sign({
                customerId: customer._id,
                role: 'CUSTOMER'
            }, process.env.JWT_API_KEY)
            return res.status(200).json({ message: 'You are logged in', token: token, customerId: customer._id })
        } else {
            return res.status(404).json({ message: 'Email or Password does not match' })
        }
    } catch (e) {
        return res.status(500).json({ error: e })
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const customer = await Customer.findById(id);
        res.status(200).json(customer)
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: "Unable to GET - No Customer found for the given ID"
            })
        } else {
            res.status(404).json(e.message)
        }
    }
})

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Customer.findByIdAndUpdate(id, req.body);
        res.json({ message: "Customer Updated" })
    } catch (e) {
        if (e.name == 'CastError') {
            res.status(404).json({
                message: "Unable to Update - No Customer found for the given ID"
            })
        } else {
            res.status(404).json(e.message)
        }
    }
})

router.delete("/:id", async (req, res) => {
    const id = req.params.id
    try {
        await Customer.findByIdAndDelete(id)
        res.status(201).json({
            message: "Customer Removed"
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
