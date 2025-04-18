import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express/multer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { validate } from 'src/util/env.validation';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './app/profile/profile.module';
// import { BlockModule } from './app/block/block.module';
import { BlockContentModule } from './app/block-content/block-content.module';
import { MathContentModule } from './app/math-content/math-content.module';
import { KoreanContentModule } from './app/korean-content/korean-content.module';
import { ArtContentModule } from './app/art-content/art-content.module';
import { EnglishContentModule } from './app/english-content/english-content.module';
import { ModelsModule } from './app/models/models.module';
import { AdminStrokeModule } from './admin/stroke/stroke.module';
import { AdminAuthModule } from './admin/auth/auth.module';
import { PointModule } from './app/point/point.module';
import { CouponModule } from './app/coupon/coupon.module';
import { QuestionsModule } from './app/questions/questions.module';
import { CommunityModule } from './app/community/community.module';
import { DiagnosticTestModule } from './app/diagnostic-test/diagnostic-test.module';
import { AnalysisModule } from './app/analysis/analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validate,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
      logging: false,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../', 'uploads'),
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    ProfileModule,
    // BlockModule,
    BlockContentModule,
    KoreanContentModule,
    EnglishContentModule,
    MathContentModule,
    ArtContentModule,
    ModelsModule,
    AdminAuthModule,
    AdminStrokeModule,
    PointModule,
    CouponModule,
    QuestionsModule,
    CommunityModule,
    DiagnosticTestModule,
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
