import { cleanEnv, str, port, url } from 'envalid';

interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: string;
  MONGO_USER: string;
  MONGO_PASSWORD: string;
  MONGO_PATH: string;
  MONGO_DATABASE: string;
  MONGO_DEV_DATABASE: string;
  WHITELISTED_DOMAINS: string;
  JWT_SECRET: string;
  COOKIE_SECRET: string;
  CRYPTO_SECRET: string;
  CLIENT_URL: string;
  MAILGUN_USERNAME: string;
  MAILGUN_PASSWORD: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECERT: string;
  FACEBOOKL_APP_ID: string;
  ServiceAccount_project_id: string;
  ServiceAccount_private_key: string;
  ServiceAccount_client_email: string;
  isProduction: boolean;
}

const ENV = (): EnvironmentVariables => cleanEnv(process.env, {
  PORT: port(),
  NODE_ENV: str(),
  MONGO_USER: str(),
  MONGO_PASSWORD: str(),
  MONGO_PATH: str(),
  MONGO_DATABASE: str(),
  MONGO_DEV_DATABASE: str(),
  WHITELISTED_DOMAINS: str(),
  CLIENT_URL: str(),
  JWT_SECRET: str(),
  COOKIE_SECRET: str(),
  CRYPTO_SECRET: str(),
  MAILGUN_USERNAME: str(),
  MAILGUN_PASSWORD: str(),
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECERT: str(),
  FACEBOOKL_APP_ID: str(),
  ServiceAccount_project_id: str(),
  ServiceAccount_private_key: str(),
  ServiceAccount_client_email: str(),
});


export default ENV;
