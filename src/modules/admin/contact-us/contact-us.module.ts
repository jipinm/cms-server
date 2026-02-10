import { Module } from '@nestjs/common'
import { ContactUsController } from './contact-us.controller'
import { ContactUsService } from './contact-us.service'

@Module({
  imports: [],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
