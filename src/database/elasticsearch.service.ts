import { Injectable } from '@nestjs/common'
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch'
import { Article } from '@prisma/client'

interface SearchHit {
  _source: {
    title: string
    content: string
    summary: string
    status: string
    createTime: Date
  }
  _id: string
  _score: number
}

@Injectable()
export class ElasticsearchService {
  constructor(private readonly elasticsearchService: NestElasticsearchService) {}

  async indexArticle(article: Article) {
    return this.elasticsearchService.index({
      index: 'articles',
      id: article.id.toString(),
      body: {
        title: article.title,
        content: article.content,
        summary: article.summary,
        status: article.status,
        createTime: article.createTime,
      },
    })
  }

  async deleteArticle(id: number) {
    return this.elasticsearchService.delete({
      index: 'articles',
      id: id.toString(),
    })
  }

  async searchArticles(keyword: string) {
    const res = await this.elasticsearchService.search({
      index: 'articles',
      body: {
        query: {
          multi_match: {
            query: keyword,
            fields: ['title', 'content', 'summary'],
          },
        },
      },
    })
  }
}
