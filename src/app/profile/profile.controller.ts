import {
  Bind,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SelectTopicDto } from './dto/selectTopic.dto';
import { RequestWithUser } from 'src/types/requestWithUser.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CreateChildProfileDto } from './dto/createChildProfile.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerDiskOptions } from 'src/common/multerOptions';

@ApiBearerAuth() // 이 컨트롤러의 모든 엔드포인트에서 인증을 요구함을 Swagger에 알립니다.
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: '로그인한 유저(부모)의 자녀 프로필 findAll' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Get()
  getUserProfiles(@Req() req: RequestWithUser) {
    const { id: userUUID } = req.user;
    return this.profileService.getUserProfiles(userUUID);
  }

  @ApiOperation({
    summary: '프로필 생성 화면의 제공되는 프로필 이미지 리스트',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Get('icons')
  getDefaultUserProfile() {
    return this.profileService.getDefaultUserProfile();
  }

  @ApiOperation({ summary: '관심주제(토픽) 리스트 조회' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @Get('topics')
  getTopics(@Query('in_used') in_used: string) {
    return this.profileService.getTopics(in_used);
  }

  @ApiOperation({ summary: '로그인한 유저(부모)의 관심주제 설정 저장' })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Post('topics')
  setUserTopics(
    @Body() selectTopicDto: SelectTopicDto,
    @Req() req: RequestWithUser,
  ) {
    return this.profileService.setUserTopics(selectTopicDto, req);
  }

  @ApiOperation({
    summary: '선택한 자녀의 프로필 findOne [헤더에 profile_id 필요]',
  })
  @ApiResponse({
    status: 200,
    type: Array,
  })
  @UseGuards(AccessTokenGuard)
  @Get('selected/:childId')
  getSelectedChildProfile(
    @Req() req: RequestWithUser,
    @Param('childId') childId: string,
  ) {
    const { id: userUUID } = req.user;
    return this.profileService.getSelectedChildProfile(userUUID, childId);
  }

  @ApiOperation({ summary: '자녀 프로필 추가' })
  @ApiResponse({
    status: 200,
    description: '자녀 프로필 추가',
    type: Boolean,
  })
  @UseGuards(AccessTokenGuard)
  @Post('/create')
  createChildProfile(
    @Body() createChildProfileDto: CreateChildProfileDto,
    @Req() req: RequestWithUser,
  ) {
    return this.profileService.createChildProfile(createChildProfileDto, req);
  }

  @ApiOperation({ summary: '프로필 이미지 업로드' })
  @ApiOkResponse({
    description: '프로필 이미지 업로드 성공',
    type: Array<Express.Multer.File>,
  })
  @Post('image/upload')
  @UseInterceptors(FilesInterceptor('files', null, multerDiskOptions))
  @Bind(UploadedFiles())
  uploadCheckListImage(filesData: Array<Express.Multer.File>, @Req() req: any) {
    return filesData;
  }
}
