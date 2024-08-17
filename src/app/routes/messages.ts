import express from 'express';
import { MessageModel } from '../message/message.model';
import { UserModel } from '../user/user.model';

const router = express.Router();

// Create a new message
router.post('/messages', async (req, res, next) => {
	try {
		const { text, creator, itinerary } = req.body;

		console.log('received message:', text, creator, itinerary);

		// Verifying that all necessary fields are received
		if (!text || !creator || !itinerary) {
            throw new Error('Missing fields in request body');
		}

		const user = await UserModel.findOne({ 'provider.id': creator });

		if (!user) {
            throw new Error('User not found');
		}

		console.log('found user:', user);

		const message = new MessageModel({
			text,
			itinerary: itinerary,
			creator: user._id,
		});

        console.log('message:', message);
		await message.save();

		return res.status(201).json(message);
	} catch (error) {
		return next(error);
	}
});

router.get('/messages/:itineraryId', async (req, res) => {
	try {
		const { itineraryId } = req.params;

		const messages = await MessageModel.find({ itinerary: itineraryId })
			.populate('creator', 'name') // Populate creator field with user info
			.sort({ createdAt: 1 }); // Sort messages by creation date

		res.status(200).json(messages);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch messages' });
	}
});

export default router;
