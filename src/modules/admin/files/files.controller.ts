import { FilesService } from './files.service'
import { Controller, HttpCode, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { uniqueId } from 'lodash'
import dayjs from 'dayjs'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { RequestUser } from '@core/decorators/request-user.decorator'

@ApiTags('后台文件上传')
@Controller('admin/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({
    summary: '上传文件',
  })
  @Post('upload')
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
        fileSize: 1024 * 1024 * 150,
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @RequestUser() user: JwtUser) {
    if (!file) {
      throw new HttpException(`'file' was required`, HttpStatus.BAD_REQUEST)
    }

    return this.filesService.uploadFile(file, user)
  }
}
