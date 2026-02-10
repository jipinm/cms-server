import { Global, Module } from '@nestjs/common'
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch'
import { ConfigService } from '@nestjs/config'
import { ElasticsearchService } from './elasticsearch.service'

@Global()
@Module({
  imports: [
    NestElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
        auth: {
          username: configService.get('ELASTICSEARCH_USERNAME'),
          password: configService.get('ELASTICSEARCH_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
