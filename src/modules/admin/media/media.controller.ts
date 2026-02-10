import { Controller, Get, Post, Body, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { MediaService } from './media.service'
import { CreateMediaDto } from './dto/create-media.dto'
import { QueryMediaDto } from './dto/query-media.dto'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { MediaVo } from './vo'

@ApiTags('素材管理')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiOperation({ summary: '上传素材' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResult(MediaVo)
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMediaDto: CreateMediaDto,
    @RequestUser() user: JwtUser,
  ) {
    if (!/[^\u0000-\u00ff]/.test(file.originalname)) {  
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8'); 
    }
    return this.mediaService.create(file, createMediaDto, user)
  }

  @Get()
  @ApiOperation({ summary: '获取素材列表' })
  @ApiResult(MediaVo, { isArray: true, isPager: true })
  findAll(@Query(ValidationPipe) query: QueryMediaDto, @RequestUser() user: JwtUser) {
    return this.mediaService.findAll(query, user)
  }

  @Get('getMimeTypes')
  @ApiOperation({ summary: '获取mimeType列表' })
  @ApiResult(String, { isArray: true })
  getMimeTypes() {
    return this.mediaService.getMimeTypes()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取素材详情' })
  @ApiResult(MediaVo)
  findOne(@Param('id') id: string, @RequestUser() user: JwtUser) {
    return this.mediaService.findOne(id, user)
  }

  @Delete('batch')
  @ApiOperation({ summary: '删除素材' })
  @ApiResult(MediaVo)
  remove(@Body('ids') ids: string[], @RequestUser() user: JwtUser) {
    return this.mediaService.remove(ids, user)
  }
}
