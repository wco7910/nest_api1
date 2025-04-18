import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
  UseGuards,
  Req,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Bind,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RequestWithUser } from 'src/types/requestWithUser.types';
import { WriteCounselDto } from './dto/write-counsel.dto';
import { WriteContestDto } from './dto/write-contest.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerDiskOptions } from 'src/common/multerOptions';
import { CreateCounselingCommentDto } from './dto/create-counseling-comment.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  /** 커뮤니티 > 콘테스트 */
  @ApiOperation({ summary: '커뮤니티 이미지 업로드' })
  @ApiResponse({ status: 200, type: Array })
  @Post('image/upload')
  @UseInterceptors(FilesInterceptor('files', 10, multerDiskOptions))
  @Bind(UploadedFiles())
  uploadCheckListImage(filesData: Array<Express.Multer.File>, @Req() req: any) {
    Logger.log('filesData', filesData);
    return filesData;
  }

  @ApiOperation({ summary: '콘테스트 작성' })
  @ApiResponse({ status: 200, type: Array })
  @UseGuards(AccessTokenGuard)
  @Post('/contest/write')
  writeContest(
    @Body() writeContestDto: WriteContestDto,
    @Req() req: RequestWithUser,
  ) {
    const { id: userUUID } = req.user;
    return this.communityService.writeContest(writeContestDto, userUUID);
  }
  /** 커뮤니티 > 콘테스트 > 게시판 */
  @ApiOperation({ summary: '콘테스트 게시판 리스트' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/contest/board')
  getContestBoardPaginated(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    Logger.log('page', page);
    Logger.log('limit', limit);
    return this.communityService.getContestBoardPaginated(page, limit);
  }

  @ApiOperation({ summary: '콘테스트 상세 페이지' })
  @ApiResponse({ status: 200, type: Array })
  @UseGuards(AccessTokenGuard)
  @Get('/contest/detail/:id')
  getContestDetail(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { id: userUUID } = req.user;
    return this.communityService.getContestDetail(id, userUUID);
  }

  @ApiOperation({ summary: '콘테스트 베스트 리스트' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/contest/best')
  getContestBest() {
    return this.communityService.getContestBest();
  }

  @ApiOperation({ summary: '콘테스트 게시글 좋아요 추가/취소' })
  @ApiResponse({ status: 200, type: Array })
  @Post('/contest/like/:id')
  @UseGuards(AccessTokenGuard)
  async contestBoardLike(
    @Param('id') postId: string,
    @Req() req: RequestWithUser,
  ) {
    const { id: userUUID } = req.user;
    return this.communityService.contestBoardLike(postId, userUUID);
  }

  @ApiOperation({ summary: '콘테스트 최근 리스트' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/contest/recent')
  getContestRecent() {
    return this.communityService.getContestRecent();
  }

  /** 커뮤니티 > 육아정보 */

  @ApiOperation({ summary: '발달 메인 - 집콕 놀이 리스트' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/parenting-info/homeplay')
  getHomePlay() {
    return this.communityService.getHomePlay();
  }

  @ApiOperation({ summary: '육아상담 작성' })
  @ApiResponse({ status: 200, type: Array })
  @UseGuards(AccessTokenGuard)
  @Post('/parenting-info/counsel/write')
  writeCounsel(
    @Body() writeCounselDto: WriteCounselDto,
    @Req() req: RequestWithUser,
  ) {
    const { id: userUUID } = req.user;
    return this.communityService.writeCounsel(writeCounselDto, userUUID);
  }

  @ApiOperation({ summary: '육아상담 디테일 페이지' })
  @ApiResponse({ status: 200, type: Array })
  @UseGuards(AccessTokenGuard)
  @Get('/parenting-info/counsel/detail/:id')
  detailCounsel(@Param('id') id: string, @Req() req: RequestWithUser) {
    Logger.log('detailCounsel', id);
    const { id: userUUID } = req.user;
    return this.communityService.detailCounsel(id, userUUID);
  }

  @ApiOperation({ summary: '육아상담 게시글 좋아요 추가/취소' })
  @ApiResponse({ status: 200, type: Array })
  @Post('/parenting-info/counsel/like/:id')
  @UseGuards(AccessTokenGuard)
  async toggleLike(@Param('id') postId: string, @Req() req: RequestWithUser) {
    const { id: userUUID } = req.user;
    return this.communityService.toggleLike(postId, userUUID);
  }

  @ApiOperation({ summary: '육아상담 댓글(전문가 답변) 좋아요 추가/취소' })
  @ApiResponse({ status: 200, type: Array })
  @Post('/parenting-info/counsel/comment/like/:id')
  @UseGuards(AccessTokenGuard)
  async commentLike(
    @Param('id') commentId: string,
    @Req() req: RequestWithUser,
  ) {
    const { id: userUUID } = req.user;
    return this.communityService.commentLike(commentId, userUUID);
  }

  @ApiOperation({ summary: '육아상담 [ 전체 상담글 :1 | 내가 쓴글 :2 ]' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/parenting-info/counsel/select/:type')
  @UseGuards(AccessTokenGuard)
  selectBoardCounsel(@Param('type') type: string, @Req() req: RequestWithUser) {
    Logger.log('type', type);
    const { id: userUUID } = req.user;
    return this.communityService.selectBoardCounsel(type, userUUID);
  }

  @ApiOperation({ summary: '생활정보통 리스트' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/parenting-info/life_info')
  lifeInfo() {
    return this.communityService.lifeInfo();
  }

  @ApiOperation({
    summary: '최근 육아상담 썸네일 리스트( 육아정보 메인 페이지 )',
  })
  @ApiResponse({ status: 200, type: Array })
  @Get('/parenting-info/counsel')
  recentCounsel() {
    return this.communityService.recentCounsel();
  }

  @ApiOperation({
    summary: '육아상담 인기 리스트( 육아정보 메인 페이지 )',
  })
  @ApiResponse({ status: 200, type: Array })
  @Get('/parenting-info/counsel/popular')
  getPopularCounselingByPeriod(
    @Query('range') range: 'today' | 'week' | 'month',
  ) {
    return this.communityService.getPopularCounselingByPeriod(range);
  }

  @ApiOperation({ summary: '육아상담 댓글 작성' })
  @ApiResponse({ status: 200, type: Array })
  @Post('/parenting-info/counsel/comment')
  async createComment(@Body() dto: CreateCounselingCommentDto) {
    return this.communityService.createCounselingComment(dto);
  }

  /** 커뮤니티 > 여행지 */
  @ApiOperation({ summary: '카테고리 여행지 메인 간단 리스트' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/travel/nearby')
  nearby(@Query('search') search: string) {
    return this.communityService.nearby(search);
  }

  @ApiOperation({ summary: '여행지 상세 페이지 데이터' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/travel/detail/:id')
  detailTravel(@Param('id') id: string) {
    return this.communityService.detailTravel(id);
  }

  /** 커뮤니티 > 도서 조회 */
  @ApiOperation({ summary: '커뮤니티 지금 주목받는 도서' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/book/hot_book')
  hotBook() {
    return this.communityService.hotBook();
  }

  @ApiOperation({ summary: '커뮤니티 추천도서' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/book/recommend_book')
  recommendBook() {
    return this.communityService.recommendBook();
  }

  @ApiOperation({ summary: '도서 상세 데이터' })
  @ApiResponse({ status: 200, type: Array })
  @Get('/book/detail/:id')
  detailBook(@Param('id') id: string) {
    return this.communityService.detailBook(id);
  }
}
