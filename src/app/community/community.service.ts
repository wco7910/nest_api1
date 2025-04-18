import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { responseObj } from 'src/util/responseObj';
import { DataSource, Repository } from 'typeorm';
import { File } from 'src/entities/file.entity';
import { Book } from 'src/entities/books.entity';
import { Travel } from 'src/entities/travel.entity';
import { ParentingCounseling } from 'src/entities/parenting_counseling.entity';
import { Content } from 'src/entities/content.entity';
import { Users } from 'src/entities/users.entity';
import { ProfileImageFile } from 'src/entities/profile_image_files.entity';

import { CounselingComment } from 'src/entities/counseling_comment.entity';
import { WriteCounselDto } from './dto/write-counsel.dto';
import { Topic } from 'src/entities/topics.entity';
import { WriteContestDto } from './dto/write-contest.dto';
import { UUID } from 'crypto';
import { CreateCounselingCommentDto } from './dto/create-counseling-comment.dto';
import { Doctor } from 'src/entities/doctor.entity';
import { BoardLike } from 'src/entities/board_likes.entity';
@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Travel)
    private readonly travelRepository: Repository<Travel>,
    @InjectRepository(ParentingCounseling)
    private readonly parentingCounselingRepository: Repository<ParentingCounseling>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(CounselingComment)
    private readonly counselingCommentRepository: Repository<CounselingComment>,
    @InjectRepository(BoardLike)
    private readonly boardLikeRepository: Repository<BoardLike>,
    private readonly dataSource: DataSource,
  ) {}

  async writeContest(writeContestDto: WriteContestDto, userUUID: string) {
    try {
      const { title, content, images } = writeContestDto;

      console.log('images', images);
      const contentSave = this.contentRepository.create({
        title,
        body: content,
        category: 'contest',
        user_id: userUUID,
        like_count: 0,
      });

      const dataSource = this.contentRepository.manager.connection;

      await dataSource.transaction(async (transactionalEntityManager) => {
        // content 저장
        const savedContent = await transactionalEntityManager.save(contentSave);

        const fileSave = images.map((image: any) => {
          const fileNameParts = image.filename.split('.');
          // 파일 확장자 추출
          const fileExtension = fileNameParts[fileNameParts.length - 1];
          // 파일 이름 추출
          const fileNmae = fileNameParts[0];

          return {
            file_name: fileNmae,
            ext: fileExtension,
            type: image.mimetype.split('/')[0],
            service_id: savedContent.id as UUID,
            size: image.size,
            mime_type: image.mimetype,
          };
        });

        // file 저장
        await transactionalEntityManager.save(File, fileSave);
      });

      return responseObj.success(content);
    } catch (e: any) {
      Logger.log('writeContest', e);
      return responseObj.fail(e.message);
    }
  }

  async getContestBoardPaginated(page: number = 1, limit: number = 4) {
    try {
      const offset = (page - 1) * limit;

      //  pagination이 적용된 고유 content id들을 서브쿼리로 선택
      const subQuery = this.contentRepository
        .createQueryBuilder('content')
        .select('content.id')
        .where('content.category = :category', { category: 'contest' })
        .orderBy('content.created_at', 'DESC')
        .offset(offset)
        .take(limit);

      // 서브쿼리로 가져온 id들을 기반으로 실제 데이터를 조인하여 조회
      const data = await this.contentRepository
        .createQueryBuilder('content')
        .leftJoin(File, 'file', 'content.id = file.service_id')
        .innerJoin(Users, 'users', 'content.user_id = users.id')
        .innerJoin(
          ProfileImageFile,
          'profile_image_file',
          'users.profile_image_id = profile_image_file.id',
        )
        .leftJoin(BoardLike, 'board_like', 'board_like.board_id = content.id')
        .select([
          'content.id AS id',
          'content.body AS body',
          'file.file_name AS src',
          'file.ext AS ext',
          'users.username AS user_name',
          'profile_image_file.path AS profile_image_path',
          'COUNT(DISTINCT board_like.id) AS like',
        ])
        .where(`content.id IN (${subQuery.getQuery()})`, {
          category: 'contest',
        })
        .setParameters(subQuery.getParameters())
        .groupBy('content.id')
        .addGroupBy('file.file_name')
        .addGroupBy('file.ext')
        .addGroupBy('users.username')
        .addGroupBy('profile_image_file.path')
        .orderBy('content.created_at', 'DESC')
        .getRawMany();

      // 전체 데이터 개수 조회
      const total = await this.contentRepository
        .createQueryBuilder('content')
        .where('content.category = :category', { category: 'contest' })
        .getCount();

      return responseObj.success({ data, total });
    } catch (e: any) {
      Logger.error('getContestBoardPaginated', e);
      return responseObj.fail(e.message);
    }
  }

  async getContestDetail(id: string, userUUID?: string) {
    try {
      const contentData = await this.contentRepository
        .createQueryBuilder('content')
        .innerJoin(Users, 'users', 'content.user_id = users.id')
        .innerJoin(
          ProfileImageFile,
          'profile_image_file',
          'users.profile_image_id = profile_image_file.id',
        )
        .leftJoin(BoardLike, 'board_like', 'board_like.board_id = content.id')
        .leftJoin(
          BoardLike,
          'my_like',
          'my_like.board_id = content.id AND my_like.user_id = :userUUID',
          { userUUID },
        )
        .select([
          'content.id AS id',
          'content.title AS title',
          'content.body AS content',
          'content.created_at AS created_at',
          'users.username AS user_name',
          'profile_image_file.path AS profile_image_path',
          'COUNT(DISTINCT board_like.id) AS like',
          'CASE WHEN my_like.id IS NOT NULL THEN true ELSE false END AS is_liked',
        ])
        .where('content.id = :id', { id })
        .groupBy('content.id')
        .addGroupBy('users.id')
        .addGroupBy('users.username')
        .addGroupBy('profile_image_file.path')
        .addGroupBy('my_like.id')
        .getRawOne();

      const images = await this.contentRepository
        .createQueryBuilder('content')
        .leftJoin(File, 'file', 'content.id = file.service_id')
        .select(['file.file_name AS src', 'file.ext AS ext'])
        .where('content.id = :id', { id })
        .getRawMany();

      const result = {
        ...contentData,
        images: images.map((img) => ({
          src: img.src,
          ext: img.ext,
        })),
      };

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  /** 커뮤니티 > 콘테스트 > 베스트 리스트 */
  async getContestBest() {
    try {
      const result = await this.contentRepository
        .createQueryBuilder('content')
        .leftJoin(File, 'file', 'content.id = file.service_id')
        .innerJoin(Users, 'users', 'content.user_id = users.id')
        .innerJoin(
          ProfileImageFile,
          'profile_image_file',
          'users.profile_image_id = profile_image_file.id',
        )
        .leftJoin(BoardLike, 'board_like', 'board_like.board_id = content.id')
        .select([
          'content.id AS id',
          'content.body AS body',
          'file.file_name AS src',
          'file.ext AS ext',
          'users.username AS user_name',
          'profile_image_file.path AS profile_image_path',
          'COUNT(DISTINCT board_like.id) AS like',
        ])
        .where('content.category = :category', { category: 'contest' })
        .groupBy('content.id')
        .addGroupBy('file.file_name')
        .addGroupBy('file.ext')
        .addGroupBy('users.username')
        .addGroupBy('profile_image_file.path')
        .orderBy('COUNT(DISTINCT board_like.id)', 'DESC')
        .limit(3)
        .getRawMany();

      console.log('result', result);

      return responseObj.success(result);
    } catch (e: any) {
      Logger.error('getContestBest', e);
      return responseObj.fail(e.message);
    }
  }

  async contestBoardLike(postId: string, userUUID: string) {
    try {
      const contest = await this.contentRepository.findOne({
        where: { id: postId },
      });
      if (!contest) {
        throw new NotFoundException('게시글이 존재하지 않습니다');
      }

      const existingLike = await this.boardLikeRepository.findOne({
        where: {
          user: { id: userUUID },
          board_id: postId,
        },
      });

      console.log('existingLike', existingLike);
      let likeCount = 0;
      if (existingLike) {
        // 좋아요 취소
        await this.boardLikeRepository.remove(existingLike);
        likeCount = await this.boardLikeRepository.count({
          where: { board_id: postId },
        });
      } else {
        // 좋아요 추가
        const like = this.boardLikeRepository.create({
          user: { id: userUUID },
          board_id: postId,
        });
        await this.boardLikeRepository.save(like);
        likeCount = await this.boardLikeRepository.count({
          where: { board_id: postId },
        });
      }

      await this.contentRepository.save(contest);

      console.log('likeCount', likeCount);
      return responseObj.success({ like_count: likeCount });
    } catch (error: any) {
      console.log('error', error);
      return responseObj.fail(error.message);
    }
  }

  async getContestRecent() {
    try {
      const result = await this.contentRepository
        .createQueryBuilder('content')
        .leftJoin(File, 'file', 'content.id = file.service_id')
        .innerJoin(Users, 'users', 'content.user_id = users.id')
        .innerJoin(
          ProfileImageFile,
          'profile_image_file',
          'users.profile_image_id = profile_image_file.id',
        )
        .select([
          'content.id AS id',
          // 'content.title AS title',
          'content.body AS body',
          'file.file_name AS src',
          'file.ext AS ext',
          'users.username AS user_name',
          'profile_image_file.path AS profile_image_path',
          'content.like_count AS like',
        ])
        .where('content.category = :category', { category: 'contest' })
        .orderBy('content.created_at', 'DESC')
        .limit(3)
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  /** 커뮤니티 > 육아정보 > 집콕 놀이 리스트 */
  async getHomePlay() {
    try {
      const result = await this.contentRepository
        .createQueryBuilder('content')
        .leftJoin(File, 'file', 'content.id = file.service_id')
        .innerJoin(Users, 'users', 'content.user_id = users.id')
        .innerJoin(
          ProfileImageFile,
          'profile_image_file',
          'users.profile_image_id = profile_image_file.id',
        )
        .select([
          'content.id AS id',
          'content.title AS title',
          'content.body AS body',
          'file.file_name AS src',
          'file.ext AS ext',
          'users.username AS user_name',
          'profile_image_file.path AS profile_image_path',
        ])
        .where('content.category = :category', { category: 'home_play' })
        .orderBy('content.created_at', 'DESC')
        .limit(3)
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async lifeInfo() {
    try {
      const result = await this.contentRepository
        .createQueryBuilder('content')
        .innerJoin(File, 'file', 'content.id = file.service_id')
        .select([
          'content.id AS id',
          'content.title AS title',
          'content.body AS body',
          'file.file_name AS src',
          'file.ext AS ext',
        ])
        .where('content.category = :category', { category: 'life_info' })
        .orderBy('content.created_at', 'DESC')
        .limit(3)
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  /** 커뮤니티 > 육아정보 > 육아상담 작성 */
  async writeCounsel(writeCounselDto: WriteCounselDto, userUUID: string) {
    try {
      const { title, content, topic_id, is_secret } = writeCounselDto;
      const counseling = this.parentingCounselingRepository.create({
        topic_id, // topic 엔티티 참조로 변경
        content,
        is_secret,
        user_id: userUUID, // user 엔티티 참조로 변경
        title,
      });
      await this.parentingCounselingRepository.save(counseling);
      return responseObj.success(counseling);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  /** 커뮤니티 > 육아정보 > 육아상담 리스트 조회 */
  async selectBoardCounsel(type: string, userUUID?: string) {
    try {
      const queryBuilder = this.parentingCounselingRepository
        .createQueryBuilder('parenting_counseling')
        .innerJoin(Users, 'users', 'parenting_counseling.user_id = users.id')
        .leftJoin(
          ProfileImageFile,
          'profile_image_file',
          'users.profile_image_id = profile_image_file.id',
        )
        .innerJoin(Topic, 'topic', 'parenting_counseling.topic_id = topic.id')
        .leftJoin(
          BoardLike,
          'board_like',
          'board_like.board_id = parenting_counseling.id',
        )
        .leftJoin(
          BoardLike,
          'my_like',
          `my_like.board_id = parenting_counseling.id AND my_like.user_id = :userUUID`,
          { userUUID },
        )
        .leftJoin(
          CounselingComment,
          'counseling_comment',
          'counseling_comment.counseling_id = parenting_counseling.id',
        )
        .select([
          'parenting_counseling.id AS id',
          'parenting_counseling.title AS title',
          'topic.name AS topic',
          'parenting_counseling.content AS content',
          'parenting_counseling.created_at AS created_at',
          'parenting_counseling.user_id AS user_id',
          'COUNT(DISTINCT board_like.id) AS like',
          'COUNT(DISTINCT counseling_comment.id) AS comment',
          'profile_image_file.path AS profile_image_path',
          'users.username AS user_name',
          'parenting_counseling.is_secret AS is_secret',
          'CASE WHEN my_like.id IS NOT NULL THEN true ELSE false END AS is_liked',
        ])
        .groupBy('parenting_counseling.id')
        .addGroupBy('topic.name')
        .addGroupBy('users.username')
        .addGroupBy('profile_image_file.path')
        .addGroupBy('my_like.id')
        .orderBy('parenting_counseling.created_at', 'DESC');

      if (type === 'my' && userUUID) {
        queryBuilder.where('parenting_counseling.user_id = :userId', {
          userId: userUUID,
        });
      } else {
        queryBuilder.where('parenting_counseling.is_visible = :isVisible', {
          isVisible: true,
        });

        if (type === 'all') {
          queryBuilder.andWhere('parenting_counseling.is_secret = :is_secret', {
            is_secret: false,
          });
        }
      }

      const result = await queryBuilder.getRawMany();
      return responseObj.success(result);
    } catch (e: any) {
      Logger.error('selectBoardCounsel', e);
      return responseObj.fail(e.message);
    }
  }

  async recentCounsel() {
    try {
      const result = await this.parentingCounselingRepository
        .createQueryBuilder('parenting_counseling')
        .innerJoin(Users, 'users', 'parenting_counseling.user_id = users.id')
        .leftJoin(
          ProfileImageFile,
          'profile_image_file',
          'users.profile_image_id = profile_image_file.id',
        )
        .innerJoin(Topic, 'topic', 'parenting_counseling.topic_id = topic.id')
        .leftJoin(
          BoardLike,
          'board_like',
          'board_like.board_id = parenting_counseling.id',
        )
        .leftJoin(
          CounselingComment,
          'counseling_comment',
          'counseling_comment.counseling_id = parenting_counseling.id',
        )
        .select([
          'parenting_counseling.id AS id',
          'parenting_counseling.title AS title',
          'topic.name AS topic',
          'parenting_counseling.content AS content',
          'parenting_counseling.created_at AS created_at',
          'parenting_counseling.user_id AS user_id',
          'COUNT(DISTINCT board_like.id) AS like',
          'COUNT(DISTINCT counseling_comment.id) AS comment',
          'profile_image_file.path AS profile_image_path',
          'users.username AS user_name',
          'parenting_counseling.is_secret AS is_secret',
        ])
        .where('parenting_counseling.is_visible = :is_visible', {
          is_visible: true,
        })
        .andWhere('parenting_counseling.is_secret = :is_secret', {
          is_secret: false,
        })
        .groupBy('parenting_counseling.id')
        .addGroupBy('topic.name')
        .addGroupBy('users.id')
        .addGroupBy('users.username')
        .addGroupBy('profile_image_file.path')
        .orderBy('parenting_counseling.created_at', 'ASC')
        .limit(5)
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      Logger.error('recentCounsel', e);
      return responseObj.fail(e.message);
    }
  }

  async getPopularCounselingByPeriod(range: 'today' | 'week' | 'month') {
    try {
      const queryBuilder = this.parentingCounselingRepository
        .createQueryBuilder('parenting_counseling')
        .innerJoin(Users, 'users', 'parenting_counseling.user_id = users.id')
        .leftJoin(
          ProfileImageFile,
          'profile_image_file',
          'users.profile_image_id = profile_image_file.id',
        )
        .innerJoin(Topic, 'topic', 'parenting_counseling.topic_id = topic.id')
        .leftJoin(
          CounselingComment,
          'counseling_comment',
          'counseling_comment.counseling_id = parenting_counseling.id',
        )
        .leftJoin(
          BoardLike,
          'board_like',
          'board_like.board_id = parenting_counseling.id',
        )
        .select([
          'parenting_counseling.id AS id',
          'parenting_counseling.title AS title',
          'topic.name AS topic',
          'parenting_counseling.content AS content',
          'parenting_counseling.created_at AS created_at',
          'parenting_counseling.user_id AS user_id',
          'COUNT(DISTINCT board_like.id) AS like',
          'COUNT(DISTINCT counseling_comment.id) AS comment',
          'profile_image_file.path AS profile_image_path',
          'users.username AS user_name',
          'parenting_counseling.is_secret AS is_secret',
        ])
        .where('parenting_counseling.is_visible = :is_visible', {
          is_visible: true,
        })
        .andWhere('parenting_counseling.is_secret = :is_secret', {
          is_secret: false,
        });

      if (range === 'today') {
        queryBuilder.andWhere(
          'DATE(parenting_counseling.created_at) = CURRENT_DATE',
        );
      } else if (range === 'week') {
        queryBuilder.andWhere(
          "parenting_counseling.created_at >= CURRENT_DATE - INTERVAL '7 days'",
        );
      } else if (range === 'month') {
        queryBuilder.andWhere(
          "parenting_counseling.created_at >= CURRENT_DATE - INTERVAL '1 month'",
        );
      }

      const result = await queryBuilder
        .groupBy('parenting_counseling.id')
        .addGroupBy('topic.name')
        .addGroupBy('users.id')
        .addGroupBy('users.username')
        .addGroupBy('profile_image_file.path')
        .orderBy('COUNT(DISTINCT board_like.id)', 'DESC') // ✅ like_count → COUNT 기반 정렬
        .limit(3)
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      Logger.error('getPopularCounselingByPeriod', e);
      return responseObj.fail(e.message);
    }
  }

  async createCounselingComment(dto: CreateCounselingCommentDto) {
    const { content, doctor_id, counseling_id } = dto;

    const counseling = await this.parentingCounselingRepository.findOne({
      where: { id: counseling_id },
    });

    if (!counseling) {
      throw new NotFoundException('해당 상담글이 존재하지 않습니다.');
    }

    const comment = this.counselingCommentRepository.create({
      content,
      doctor_id,
      counseling,
    });

    counseling.is_visible = true;

    await this.dataSource.transaction(async (manager) => {
      await manager.save(CounselingComment, comment);
      await manager.save(ParentingCounseling, counseling);
    });

    return responseObj.success(comment);
  }

  async detailCounsel(id: string, userUUID?: string) {
    try {
      Logger.log('detailCounsel', id);
      Logger.log('userUUID', userUUID);

      const postData = await this.parentingCounselingRepository
        .createQueryBuilder('parenting_counseling')
        .leftJoin(Users, 'users', 'parenting_counseling.user_id = users.id')
        .leftJoin(
          ProfileImageFile,
          'profile_image_file',
          'users.profile_image_id = profile_image_file.id',
        )
        .innerJoin(Topic, 'topic', 'parenting_counseling.topic_id = topic.id')
        .leftJoin(
          BoardLike,
          'board_like',
          'board_like.board_id = parenting_counseling.id',
        )
        .leftJoin(
          BoardLike,
          'my_like',
          'my_like.board_id = parenting_counseling.id AND my_like.user_id = :userUUID',
          { userUUID },
        )
        .leftJoin(
          CounselingComment,
          'counseling_comment',
          'counseling_comment.counseling_id = parenting_counseling.id',
        )
        .select([
          'parenting_counseling.id AS id',
          'parenting_counseling.title AS title',
          'topic.name AS topic',
          'parenting_counseling.content AS content',
          'parenting_counseling.created_at AS created_at',
          'parenting_counseling.user_id AS user_id',
          'COUNT(DISTINCT board_like.id) AS like',
          'COUNT(DISTINCT counseling_comment.id) AS comment',
          'profile_image_file.path AS profile_image_path',
          'users.username AS user_name',
          'CASE WHEN my_like.id IS NOT NULL THEN true ELSE false END AS is_liked',
        ])
        .where('parenting_counseling.id = :id', { id })
        .groupBy('parenting_counseling.id')
        .addGroupBy('topic.name')
        .addGroupBy('users.id')
        .addGroupBy('users.username')
        .addGroupBy('profile_image_file.path')
        .addGroupBy('my_like.id')
        .getRawOne();

      const commentData = await this.counselingCommentRepository
        .createQueryBuilder('counseling_comment')
        .leftJoin(Doctor, 'doctor', 'counseling_comment.doctor_id = doctor.id')
        .leftJoin(
          File,
          'profile_image_file',
          'doctor.id = profile_image_file.service_id',
        )
        .leftJoin(
          BoardLike,
          'board_like',
          'board_like.board_id = counseling_comment.id',
        )
        .leftJoin(
          BoardLike,
          'my_like',
          'my_like.board_id = counseling_comment.id AND my_like.user_id = :userUUID',
          { userUUID },
        )
        .select([
          'counseling_comment.id AS id',
          'counseling_comment.content AS content',
          'counseling_comment.created_at AS created_at',
          'COUNT(DISTINCT board_like.id) AS like',
          'doctor.name AS doctor_name',
          'profile_image_file.id AS profile_image_path',
          'profile_image_file.ext AS ext',
          'CASE WHEN my_like.id IS NOT NULL THEN true ELSE false END AS is_liked',
        ])
        .where('counseling_comment.counseling_id = :id', { id })
        .groupBy('counseling_comment.id')
        .addGroupBy('doctor.name')
        .addGroupBy('profile_image_file.id')
        .addGroupBy('my_like.id')
        .andWhere('counseling_comment.deleted_at IS NULL')
        .andWhere('doctor.deleted_at IS NULL')
        .andWhere('profile_image_file.deleted_at IS NULL')
        .getRawMany();

      console.log('postData', postData);
      console.log('commentData', commentData);
      return responseObj.success({ postData, commentData });
    } catch (e: any) {
      Logger.error('detailCounsel', e);
      return responseObj.fail(e.message);
    }
  }

  async toggleLike(postId: string, userUUID: string) {
    try {
      const counseling = await this.parentingCounselingRepository.findOne({
        where: { id: postId },
      });
      if (!counseling) {
        throw new NotFoundException('게시글이 존재하지 않습니다');
      }

      const existingLike = await this.boardLikeRepository.findOne({
        where: {
          user: { id: userUUID },
          board_id: postId,
        },
      });

      let likeCount = 0;
      if (existingLike) {
        // 좋아요 취소
        await this.boardLikeRepository.remove(existingLike);
        likeCount = await this.boardLikeRepository.count({
          where: { board_id: postId },
        });
      } else {
        // 좋아요 추가
        const like = this.boardLikeRepository.create({
          user: { id: userUUID },
          board_id: postId,
        });
        await this.boardLikeRepository.save(like);
        likeCount = await this.boardLikeRepository.count({
          where: { board_id: postId },
        });
      }

      await this.parentingCounselingRepository.save(counseling);
      return responseObj.success({ like_count: likeCount });
    } catch (error: any) {
      return responseObj.fail(error.message);
    }
  }
  async commentLike(commentId: string, userUUID: string) {
    try {
      const comment = await this.counselingCommentRepository.findOne({
        where: { id: commentId },
      });
      if (!comment) {
        throw new NotFoundException('댓글이 존재하지 않습니다');
      }

      const existingLike = await this.boardLikeRepository.findOne({
        where: {
          user: { id: userUUID },
          board_id: commentId,
        },
      });

      let likeCount = 0;
      if (existingLike) {
        // 좋아요 취소
        await this.boardLikeRepository.remove(existingLike);
        likeCount = await this.boardLikeRepository.count({
          where: { board_id: commentId },
        });
      } else {
        // 좋아요 추가
        const like = this.boardLikeRepository.create({
          user: { id: userUUID },
          board_id: commentId,
        });
        await this.boardLikeRepository.save(like);
        likeCount = await this.boardLikeRepository.count({
          where: { board_id: commentId },
        });
      }

      await this.counselingCommentRepository.save(comment);
      return responseObj.success({ like_count: likeCount });
    } catch (error: any) {
      return responseObj.fail(error.message);
    }
  }

  /** 커뮤니티 > 도서 섹터 */

  async hotBook() {
    try {
      const result = await this.bookRepository
        .createQueryBuilder('book')
        .innerJoin(File, 'file', 'book.id = file.service_id')
        .select([
          'book.title AS title',
          'book.id AS id',
          'file.file_name AS src',
          'file.ext AS ext',
        ])
        .where('book.hot_book =:hot_book', { hot_book: true })
        .orderBy('book.created_at', 'ASC')
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async recommendBook() {
    try {
      const result = await this.bookRepository
        .createQueryBuilder('book')
        .innerJoin(File, 'file', 'book.id = file.service_id')
        .select([
          'book.title AS title',
          'book.id AS id',
          'book.author AS author',
          'book.publisher AS publisher',
          'book.book AS book',
          'book.rating AS rating',
          'file.file_name AS src',
          'file.ext AS ext',
        ])
        .where('book.recommend_book =:recommend_book', {
          recommend_book: true,
        })
        .orderBy('book.created_at', 'ASC')
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async detailBook(id: string) {
    try {
      const result = await this.bookRepository
        .createQueryBuilder('book')
        .innerJoin(File, 'file', 'book.id = file.service_id')
        .select([
          'book.title AS title',
          'book.id AS id',
          'book.body AS body',
          'book.author AS author',
          'book.publisher AS publisher',
          'book.book AS book',
          'book.rating AS rating',
          'file.file_name AS src',
          'file.ext AS ext',
        ])
        .where('book.id =:id', { id })
        .orderBy('book.created_at', 'ASC')
        .getRawOne();
      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  /** 커뮤니티 > 여행지 */

  async nearby(search: string) {
    try {
      const query = this.travelRepository
        .createQueryBuilder('travel')
        .leftJoin('file', 'file', 'travel.id = file.service_id')
        .select([
          'travel.id AS id',
          'travel.title AS title',
          'travel.address AS address',
          'travel.contact AS contact',
          "COALESCE(json_agg(json_build_object('id', file.id, 'src', file.file_name, 'ext', file.ext, 'type', file.type)) FILTER (WHERE file.id IS NOT NULL), '[]') AS files",
        ])
        .where('travel.in_used = :in_used', { in_used: 'T' });

      // search 값이 있는 경우 title 검색 조건 추가
      if (search && search.trim() !== '') {
        query.andWhere('travel.title ILIKE :search', { search: `%${search}%` });
      }

      const result = await query
        .groupBy('travel.id')
        .orderBy('travel.created_at', 'ASC')
        .limit(3)
        .getRawMany();

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }

  async detailTravel(id: string) {
    try {
      const result = await this.travelRepository
        .createQueryBuilder('travel')
        .leftJoin('file', 'file', 'travel.id = file.service_id')
        .select([
          'travel.id AS id',
          'travel.title AS title',
          'travel.address AS address',
          'travel.contact AS contact',
          'travel.homepage AS homepage',
          'travel.business_hours AS business_hours',
          'travel.closeday_notice AS closeday_notice',
          'travel.parking AS parking',
          'travel.notice AS notice',
          'travel.introduction AS introduction',
          'travel.rating AS rating',
          'travel.latitude AS latitude',
          'travel.longitude AS longitude',
          "COALESCE(json_agg(json_build_object('id', file.id, 'src', file.file_name, 'ext', file.ext, 'type', file.type)) FILTER (WHERE file.id IS NOT NULL), '[]') AS files",
        ])
        .where('travel.id = :id', { id })
        .andWhere('travel.in_used = :in_used', { in_used: 'T' })
        .groupBy('travel.id')
        .orderBy('travel.created_at', 'ASC')
        .getRawOne();

      return responseObj.success(result);
    } catch (e: any) {
      return responseObj.fail(e.message);
    }
  }
}
