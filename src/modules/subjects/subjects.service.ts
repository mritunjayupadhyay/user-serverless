import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  private readonly mode: any;
  private readonly awsParams: string = '';
  constructor(private configService: ConfigService) {}

  getSubject() {
    return {
      status: 'success',
    };
  }
  createSubject(data: CreateSubjectDto) {
    return {
      ...data,
    };
  }
}
