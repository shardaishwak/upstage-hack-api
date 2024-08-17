// src/routes/auth.ts
import express from 'express';
import { UserModel } from '../user/user.model';


const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, name, picture, sub } = req.body;

  console.log('Received info about', email)

  try {
    // Check if the user already exists
    let user = await UserModel.findOne({ email });

    if (!user) {
      // Create a new user if they don't exist
      user = new UserModel({
        email,
        name,
        image: picture,
        provider: {
          name: 'auth0', // Assuming Auth0 is your provider
          id: sub,
        },
        itineraries: [],
        preferences: [],
      });
      await user.save();
    } else {
      // Update the user if they already exist
      user.name = name;
      user.image = picture;
      user.provider.id = sub;
      await user.save();
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
});

export default router;
