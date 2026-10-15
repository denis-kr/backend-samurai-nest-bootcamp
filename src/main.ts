import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { appSetup } from './app.setup.js';

const PORT = process.env.PORT || 5005; //TODO: move to configService. will be in the following lessons

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSetup(app);
  await app.listen(PORT);
}
await bootstrap();
