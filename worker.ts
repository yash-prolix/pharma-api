import { Container, getContainer } from '@cloudflare/containers';

// 1. Define the Container class that maps to our NestJS Docker container
export class PharmaApiContainer extends Container {
  defaultPort = 3000;
  sleepAfter = '10m'; // Scale down to zero after 10 minutes of inactivity to save costs

  constructor(state: any, env: any) {
    super(state, env);

    // Inject all runtime variables and secrets from the Worker environment into the container's environment
    this.envVars = {
      DATABASE_URL: env.DATABASE_URL || '',
      JWT_SECRET: env.JWT_SECRET || 'default_jwt_secret',
      JWT_ACCESS_TOKEN_EXPIRY: env.JWT_ACCESS_TOKEN_EXPIRY || '15',
      JWT_REFRESH_TOKEN_EXPIRY: env.JWT_REFRESH_TOKEN_EXPIRY || '10080',
      JWT_USER_TOKEN_EXPIRY: env.JWT_USER_TOKEN_EXPIRY || '1440',
      EMAIL_USER: env.EMAIL_USER || '',
      EMAIL_PASS: env.EMAIL_PASS || '',
      PORT: '3000',
      NODE_ENV: 'production',
      SWAGGER_DOCUMENTATION_AVAILABLE:
        env.SWAGGER_DOCUMENTATION_AVAILABLE || 'true',
    };
  }
}

export interface Env {
  PHARMA_API_CONTAINER: DurableObjectNamespace;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  JWT_ACCESS_TOKEN_EXPIRY?: string;
  JWT_REFRESH_TOKEN_EXPIRY?: string;
  JWT_USER_TOKEN_EXPIRY?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  SWAGGER_DOCUMENTATION_AVAILABLE?: string;
}

// 2. Gateway Worker to route all incoming HTTP requests to our NestJS Container
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Route all incoming traffic to a single instance of the container
    const containerInstance = getContainer(
      env.PHARMA_API_CONTAINER,
      'main-instance',
    );

    // Forward the request directly to the container
    return containerInstance.fetch(request);
  },
};
