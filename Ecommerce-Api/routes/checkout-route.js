import express from 'express';

const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
    const { products } = req.body;

    try {
        let lineItems;
        if (Array.isArray(products) && products.length > 0) {
            lineItems = products.map(item => ({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.productDetails.name,
                    },
                    unit_amount: item.productDetails.price * 100,
                },
                quantity: item.quantity,
            }));
        }

        if (!lineItems || lineItems.length === 0) {
            console.error('No line items provided');
            res.status(400).json({ error: 'No line items provided' });
            return;
        }

        const session = await req.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: 'payment',
            success_url: `http://localhost:5173/customer/payment`,
            cancel_url: `http://localhost:5173/customer/`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;
