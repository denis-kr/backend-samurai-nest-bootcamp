import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('testing')
export class TestingController {
  constructor() {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    console.log('roflan');
  }
}
