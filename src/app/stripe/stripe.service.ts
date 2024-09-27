import stripe from '../../config/stripe';

export const stripeServices = {
	// Stripe service functions go here
	createCheckoutSession: async (req:any, res:any) => {
		try {
			const { flightName, flightPrice, flightImage } = req.body;
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items: [
					{
						price_data: {
							currency: 'usd',
							product_data: {
								name: flightName,
							},
							unit_amount: flightPrice * 100, // 2000 cents = $20.00
						},
						quantity: 1,
					},
				],
				mode: 'payment',
				success_url: `${process.env.CLIENT_URL}/checkout/success`,
				cancel_url: `${process.env.CLIENT_URL}`,
			});

			return res.json({ sessionId: session.id });
		} catch (error) {
			console.error('Error creating checkout session:', error);
			res.status(500).send({ error: 'Failed to create checkout session' });
		}
	},
};
