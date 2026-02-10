import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join, resolve } from 'path'
import { uniqueId } from 'lodash'
import { remove } from 'fs-extra'
import { IsSystemAdmin } from '@core/guards/role-auth.guard'
import dayjs from 'dayjs'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '@core/guards/jwt-auth.guard'
import { ObsService } from '@database/obs.service'
import { SignatureAuthGuard } from '@core/guards/signature-auth.guard'

@ApiTags('文件')
@Controller('files')
export class FilesController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private obs: ObsService,
  ) {}

  @ApiOperation({
    summary: '上传文件，需要验证签名',
  })
  @UseGuards(SignatureAuthGuard)
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'upload'),
        filename: (req, file, cb) => {
          const filename = `${dayjs().format('YYYYMMDDHHmmss')}_${uniqueId()}${extname(file.originalname)}`
          cb(null, filename)
        },
      }),
      limits: {
        fields: 1,
        fileSize: 1024 * 1024 * 10,
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException(`'file' was required`, HttpStatus.BAD_REQUEST)
    }
    // const ext = extname(file.originalname)
    // if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext.slice(1).toLowerCase())) {
    //   remove(file.path)
    //   throw new HttpException('Only supports png、jpg、jpeg、webp image file', HttpStatus.BAD_REQUEST)
    // }
    // if (process.env.NODE_ENV === 'development') {
    //   return {
    //     url: `//localhost:3000/files/${file.filename}`,
    //   };
    // }

    const subPath = dayjs().format('YYYYMMDD')
    const { url } = await this.obs.uploadFile({
      Key: `${subPath}/${file.filename}`,
      SourceFile: file.path,
    })
    this.logger.info(`upload obs file:${url}`)
    remove(file.path)
    const response = {
      name: file.filename,
      url,
      size: file.size,
    }
    return response
  }

  @ApiOperation({
    summary: '删除文件',
  })
  @IsSystemAdmin()
  @Delete()
  async removeFile(@Body() params: { file: string }) {
    await remove(resolve(process.cwd(), 'files', params.file))
    return 'ok'
  }
}
