import { Module } from '@nestjs/common';
import { DiagnosticTestController } from './diagnostic-test.controller';
import { DiagnosticTestService } from './diagnostic-test.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenTestStatus } from 'src/entities/children_test_status.entity';
import { File } from 'src/entities/file.entity';
import { DiagnosticTest } from 'src/entities/diagnostic_tests.entity';
import { DiagnosticQuestion } from 'src/entities/diagnostic_questions.entity';
import { DiagnosticResponse } from 'src/entities/diagnostic_responses.entity';
import { Faq } from 'src/entities/faq.entity';
import { Doctor } from 'src/entities/doctor.entity';
import { DiagnosticResult } from 'src/entities/diagnostic_results.entity';
import { DiagnosticHistory } from 'src/entities/diagnostic_history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      File,
      ChildrenTestStatus,
      DiagnosticTest,
      DiagnosticQuestion,
      DiagnosticResponse,
      Faq,
      Doctor,
      DiagnosticResult,
      DiagnosticHistory,
    ]),
  ],
  controllers: [DiagnosticTestController],
  providers: [DiagnosticTestService],
})
export class DiagnosticTestModule {}
