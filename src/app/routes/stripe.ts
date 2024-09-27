import express from 'express';
import { stripeServices } from '../stripe/stripe.service';


const router = express.Router();

// Create a new message
router.post('/create-checkout-session', async (req, res, next) => {
	try {
        const session = await stripeServices.createCheckoutSession(req, res);
		res.json(session);
	} catch (error) {
		return next(error);
	}
});


export default router;
