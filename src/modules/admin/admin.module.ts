import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { SitesModule } from './sites/sites.module'
import { ArticlesModule } from './articles/articles.module'
import { CategoriesModule } from './categories/categories.module'
import { TagsModule } from './tags/tags.module'
import { RolesModule } from '@modules/admin/roles/roles.module'
import { BannersModule } from '@modules/admin/banners/banners.module'
import { FilesModule } from './files/files.module'
import { DictionaryModule } from './dictionary/dictionary.module'
import { ContactUsModule } from './contact-us/contact-us.module'
import { RatelimitLogModule } from './ratelimit-log/ratelimit-log.module'
import { MediaModule } from '@modules/admin/media/media.module'
import { ApiLogModule } from './api-log/api-log.module'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    SitesModule,
    ArticlesModule,
    BannersModule,
    CategoriesModule,
    TagsModule,
    RolesModule,
    FilesModule,
    DictionaryModule,
    ContactUsModule,
    RatelimitLogModule,
    MediaModule,
    ApiLogModule,
  ],
})
export class AdminModule {}
