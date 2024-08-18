import OpenAI from 'openai';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

export const upstage = new OpenAI({
	apiKey: process.env.UPSTAGE_API_KEY,
	baseURL: 'https://api.upstage.ai/v1/solar',
});

