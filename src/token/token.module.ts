import { Module } from '@nestjs/common';

import { TokenSerive } from './token.service';

@Module({
  providers: [TokenSerive],
  exports: [TokenSerive],
})
export class TokenModule {}
