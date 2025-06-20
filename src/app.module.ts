import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { DatabaseModule } from './db/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, DatabaseModule, SubjectsModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
