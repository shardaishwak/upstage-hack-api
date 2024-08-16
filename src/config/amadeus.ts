import Amadeus from 'amadeus-ts';
import dotenv from 'dotenv';
import { CustomAmadeus } from '../lib/amadeus';
dotenv.config();

const amadeus = new Amadeus({
	clientId: process.env.AMADEUS_CLIENT_ID,
	clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

export const customAmadeus = new CustomAmadeus(
	process.env.AMADEUS_CLIENT_ID,
	process.env.AMADEUS_CLIENT_SECRET
);

export default amadeus;
