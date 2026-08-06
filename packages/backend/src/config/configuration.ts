export default () => ({
  app: {
    port: parseInt(process.env.API_PORT || '3000'),
    environment: process.env.NODE_ENV || 'development',
    url: process.env.API_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '900s',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  veriff: {
    apiKey: process.env.VERIFF_API_KEY,
    apiUrl: process.env.VERIFF_API_URL || 'https://api.veriff.me',
  },
  s3: {
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_S3_REGION || 'eu-central-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
});
