import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'dev_jwt_secret_change_me',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
}));

