/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  Put,
  Param,
  Body,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  ValidationPipe,
  ParseUUIDPipe,
  Get,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  CreateUserWithClerkDto,
  UpdateUserDto,
  UserDto,
} from './dto/user.dto';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ResponseInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserDto],
  })
  async findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async createUser(
    @Body(new ValidationPipe({ transform: true })) createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    return this.usersService.createUser(createUserDto);
  }

  @Get('clerk/:clerkId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a user by Clerk ID' })
  @ApiParam({
    name: 'clerkId',
    description: 'Clerk user ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findByClerkId(@Param('clerkId') clerkId: string): Promise<UserDto> {
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException(`User with Clerk ID ${clerkId} not found`);
    }
    return user;
  }

  @Post('clerk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user with Clerk integration' })
  @ApiBody({ type: CreateUserWithClerkDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully with Clerk ID',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email or Clerk ID already exists',
  })
  async createUserWithClerk(
    @Body(new ValidationPipe({ transform: true }))
    createUserWithClerkDto: CreateUserWithClerkDto,
  ): Promise<UserDto> {
    return this.usersService.createUserWithClerk(createUserWithClerkDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or invalid UUID format',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email or Clerk ID already exists',
  })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ transform: true, skipMissingProperties: true }))
    updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.updateUser(id, updateUserDto);
  }
}
