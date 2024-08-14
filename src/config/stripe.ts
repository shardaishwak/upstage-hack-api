// initialize stripe in es6
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY);

export default stripe;
