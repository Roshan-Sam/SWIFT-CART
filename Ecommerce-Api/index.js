import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet';
import mongoose from './db/index.js';
import router from './routes/index.js';
import stripe from 'stripe';

dotenv.config();

const app = express();

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use((req, res, next) => {
    req.stripe = stripeInstance;
    next();
});

// connecting routes
app.use(router)

app.listen(process.env.PORT, () => {
    console.log('App is running @ localhost:8000')
})

