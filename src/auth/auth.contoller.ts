import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { Request, Response } from 'express';
import { AccessTokenMaxAge } from 'src/util/getTokenMaxAge';
import { CreateUserDto } from './dto/create-user.dto';
import { CreatePurchaseVerificationDto } from './dto/purchase-verification.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RequestWithUser } from 'src/types/requestWithUser.types';

// import { SiginUpDto } from './dto/sign-up.dto';
@ApiBearerAuth() // 이 컨트롤러의 모든 엔드포인트에서 인증을 요구함을 Swagger에 알립니다.
@ApiTags('[App] Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 200,
    description: '회원가입',
    type: Boolean,
  })
  @Post('/sign-up')
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log('createUserDto : ', createUserDto);
    return this.authService.createUser(createUserDto);
  }

  @ApiOperation({ summary: '유저(부모) 아이디 중복 확인' })
  @ApiResponse({
    status: 200,
    description: '유저(부모) 아이디 중복 확인',
    type: Boolean,
  })
  @Get('/duplicate-check/:user_id')
  isAdminIdUnique(@Param('user_id') user_id: string) {
    return this.authService.isUserIdUnique(user_id);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  @Post('sign-in')
  siginIn(@Body() siginInDto: SignInDto) {
    return this.authService.signIn(siginInDto);
  }

  @ApiOperation({ summary: '그로우러닝 구매 인증' })
  @ApiResponse({
    status: 200,
    description: '그로우러닝 구매 인증',
    type: Boolean,
  })
  @UseGuards(AccessTokenGuard)
  @Post('/purchase-verification')
  findPurchaseVerification(
    @Body() createPurchaseVerificationDto: CreatePurchaseVerificationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.authService.findPurchaseVerification(
      createPurchaseVerificationDto,
      req,
    );
  }

  @ApiOperation({ summary: '그로우러닝 앱 인증 번호 저장' })
  @ApiResponse({
    status: 200,
    description: '그로우러닝 앱 인증 번호 저장',
    type: Boolean,
  })
  @UseGuards(AccessTokenGuard)
  @Put('/grow-learning-password')
  saveUserLearningPassword(
    @Body()
    grow_learning_data: { grow_learning_password: string },
    @Req() req: RequestWithUser,
  ) {
    const { grow_learning_password } = grow_learning_data;

    return this.authService.saveUserLearningPassword(
      grow_learning_password,
      req.user,
    );
  }

  @Post('/logout')
  logout(@Res() res: Response) {
    res.clearCookie(process.env.ACCESS_TOKEN_NAME);
    res.clearCookie(process.env.REFRESH_TOKEN_NAME);
    res.send({ success: true });
  }

  /**
   * ==========================================================================================
   *                                  수정 부분 구분
   * ==========================================================================================
   */

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies[process.env.REFRESH_TOKEN_NAME];
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 존재하지 않습니다.');
    }
    const tokens = await this.authService.refreshToken(refreshToken);
    res
      .cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        maxAge: AccessTokenMaxAge, // 1분 (60초 * 1000밀리초)
      })
      .send({ success: true });
  }

  @ApiOperation({ summary: '유저 정보 획득' })
  @UseGuards(AccessTokenGuard)
  @Get('info')
  async getCurrentUser(@Req() req: RequestWithUser) {
    return this.authService.getCurrentUser(req);
  }

  @Get('check')
  @UseGuards(AccessTokenGuard)
  async check(@Req() req: Request) {
    // 인증 미들웨어를 통과했으므로 유효한 토큰이 존재함
    return { success: true };
  }
}
