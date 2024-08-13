declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production';
		PORT: string;
		DATABASE_URI: string;
		CLIENT_URL: string;
	}
}
