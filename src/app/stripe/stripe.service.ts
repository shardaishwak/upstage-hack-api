import stripe from '../../config/stripe';
import { ItineraryModel } from '../itinerary/itinerary.model';

export const stripeServices = {
	// Stripe service functions go here
	createCheckoutSession: async (req: any, res: any) => {
		try {
			const { itineraryId } = req.body;
			const itinerary = await ItineraryModel.findById(itineraryId);
			if (!itinerary) {
				return res.status(404).send({ error: 'Itinerary not found' });
			}

			const flights = itinerary.g_flights;

			if (!flights || flights.length === 0) {
				return res.status(400).send({ error: 'No flights found in itinerary' });
			}

			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items: flights.map((flight) => {
					return {
						price_data: {
							currency: 'usd',
							product_data: {
								name:
									flight.flights[0].airline +
									' - ' +
									flight.flights[0]?.flight_number +
									' - ' +
									`${flight.flights[0]?.departure_airport?.id} to ${flight?.flights[0]?.arrival_airport?.id}`,
								description: `Departure: ${flight.flights[0]?.departure_airport?.time} - Arrival: ${flight?.flights[0]?.departure_airport?.time}`,
								images: [flight?.airline_logo || flight?.flights[0]?.airline_logo],
							},
							unit_amount: flight?.price * 100, // 2000 cents = $20.00
						},
						quantity: 1,
					};
				}),

				mode: 'payment',
				success_url: `${process.env.CLIENT_URL}/checkout/success?itineraryId=${itineraryId}`,
				cancel_url: `${process.env.CLIENT_URL}`,
				metadata: {
					itineraryId: itineraryId,
				},
			});

			return res.json({ sessionId: session.id });
		} catch (error) {
			console.error('Error creating checkout session:', error);
			res.status(500).send({ error: 'Failed to create checkout session' });
		}
	},
	handleWebhook: async (req: any, res: any) => {
		const sig = req.headers['stripe-signature'];
		let event;

		try {
			event = stripe.webhooks.constructEvent(
				req.body,
				sig,
				process.env.STRIPE_WEBHOOK_SECRET
			);
		} catch (err: any) {
			console.log('Webhook signature verification failed.', err.message);
			return res.status(400).send(`Webhook Error: ${err.message}`);
		}

		if (event.type === 'checkout.session.completed') {
			const session = event.data.object;

			// Retrieve the payment intent to get more detailed payment information
			const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

			const itineraryId = session.metadata?.itineraryId;

			try {
				await ItineraryModel.findByIdAndUpdate(itineraryId, {
					payment: paymentIntent,
					isBooked: true,
				});

				console.log(`Itinerary ${itineraryId} successfully updated with payment details.`);
			} catch (err: any) {
				console.error('Error updating itinerary with payment details:', err);
				return res
					.status(500)
					.send({ error: 'Failed to update itinerary with payment details' });
			}
		}

		res.status(200).send('Webhk received and processed');
	},
};
