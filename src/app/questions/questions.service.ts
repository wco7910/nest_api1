import { Injectable } from '@nestjs/common';
import { IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { responseObj } from 'src/util/responseObj';
import { Questions } from 'src/entities/questions.entity';
import { AddQuestionDto } from './dto/addQuestionDto.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Questions)
    private readonly questionsRepository: Repository<Questions>,
  ) {}

  async getMyQuestions(userUUID: string) {
    console.log('userUUID', userUUID);
    const questions = await this.questionsRepository.find({
      where: { author: { id: userUUID } },
    });

    return responseObj.success(questions);
  }

  async addQuestion(userUUID: string, addQuestionDto: AddQuestionDto) {
    const question = await this.questionsRepository.create({
      author: { id: userUUID },
      content: addQuestionDto.content,
      title: addQuestionDto.title,
    });
    await this.questionsRepository.save(question);
    return responseObj.success('1:1 문의 추가 완료');
  }

  async getCategoryQuestions(category: string) {
    try {
      let questions;
      if (category === 'all') {
        questions = await this.questionsRepository.find({
          where: {
            category: Not(IsNull()),
          },
          order: {
            created_at: 'DESC',
          },
        });
      } else {
        questions = await this.questionsRepository.find({
          where: { category },
        });
      }

      if (!questions || questions.length === 0) {
        return responseObj.success([]);
      }

      return responseObj.success(questions);
    } catch (error) {
      console.error('FAQ 조회 중 오류 발생:', error);
      return responseObj.fail('FAQ 조회 중 오류가 발생했습니다.');
    }
  }
}
