declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production';
		PORT: string;
		DATABASE_URI: string;
		CLIENT_URL: string;
		AMADEUS_CLIENT_ID: string;
		AMADEUS_CLIENT_SECRET: string;
		STRIPE_API_SECRET_KEY: string;
		UPSTAGE_API_KEY: string;
		GEOLOCATION_API_KEY: string;
	}
}
