import { BadRequestException, ValidationPipe as NestValidationPipe } from '@nestjs/common'
import { values } from 'lodash'

export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      transform: true,
      exceptionFactory: (errors) => {
        if (errors.length > 0) {
          const errValues = values(errors[errors.length - 1].constraints)
          throw new BadRequestException(errValues[errValues.length - 1])
        }
      },
    })
  }
}
