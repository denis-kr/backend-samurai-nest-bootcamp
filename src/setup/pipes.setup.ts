import { INestApplication, ValidationPipe } from '@nestjs/common';

export function pipesSetup(app: INestApplication) {
  // transform: turns query/body into DTO class instances so defaults
  // (e.g. BaseQueryParams.pageNumber) and @Type conversions are applied.
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
}
