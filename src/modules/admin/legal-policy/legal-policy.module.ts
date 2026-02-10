import { Module } from '@nestjs/common'
import { LegalPolicyController } from './legal-policy.controller'
import { LegalPolicyService } from './legal-policy.service'

@Module({
  controllers: [LegalPolicyController],
  providers: [LegalPolicyService],
})
export class LegalPolicyModule {}
