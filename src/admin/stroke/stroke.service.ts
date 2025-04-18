import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KoreanUnitDetails } from 'src/entities/korean_unit_details.entity';
import { responseObj } from 'src/util/responseObj';
import { Repository } from 'typeorm';
/**
 * 쓰기 탭 쓰기 파일 조회
 * sort 0 : 쓰기 정답 이미지
 * sort 1 : gif 쓰기 가이드
 * sort 2 : 쓰기 점선 가이드
 * sort 3 : 쓰기 일반
 *
 */
@Injectable()
export class AdminStrokeService {
  constructor(
    @InjectRepository(KoreanUnitDetails)
    private readonly koreanUnitDetailsRepository: Repository<KoreanUnitDetails>,
  ) {}

  async getStroke() {
    const stroke = await this.koreanUnitDetailsRepository.find({
      where: {
        unit_tab_name: 'write',
        files: {
          sort: 3,
        },
      },
      relations: ['files'],
    });
    return responseObj.success(stroke);
  }

  async updateStroke(unitDetailId: number, body: any) {
    await this.koreanUnitDetailsRepository.update(unitDetailId, body);
    return responseObj.success();
  }
}
