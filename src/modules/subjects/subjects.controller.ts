/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubjectDto } from './dto/subject.dto';
import { SubjectsService } from './subjects.service';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@ApiTags('subjects')
@Controller('subjects')
@UseInterceptors(ResponseInterceptor)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}
  @Get('/')
  get() {
    return this.subjectsService.getSubject();
  }
  @Get('/sub')
  create(@Query() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.createSubject(createSubjectDto);
  }
}
