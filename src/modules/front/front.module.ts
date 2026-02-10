import { Module } from '@nestjs/common'
import { ArticlesModule } from './articles/articles.module'
import { BannersModule } from './banners/banners.module'
import { PolicyModule } from './policy/policy.module'
import { ContactUsModule } from './contact-us/contact-us.module'
import { CrmModule } from '../crm/crm.module'

@Module({
  imports: [ArticlesModule, BannersModule, PolicyModule, ContactUsModule, CrmModule],
})
export class FrontModule {}
