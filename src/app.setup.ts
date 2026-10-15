import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './setup/pipes.setup.js';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  //   globalPrefixSetup(app);
  //   swaggerSetup(app);
  //   //...
}
