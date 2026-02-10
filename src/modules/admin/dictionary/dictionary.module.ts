import { Module } from '@nestjs/common'
import { DictionaryTypeController } from './dictionary-type.controller'
import { DictionaryItemController } from './dictionary-item.controller'
import { DictionaryTypeService } from './dictionary-type.service'
import { DictionaryItemService } from './dictionary-item.service'

@Module({
  imports: [],
  controllers: [DictionaryTypeController, DictionaryItemController],
  providers: [DictionaryTypeService, DictionaryItemService],
  exports: [DictionaryTypeService, DictionaryItemService],
})
export class DictionaryModule {}
