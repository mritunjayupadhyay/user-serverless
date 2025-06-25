import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { pick } from 'lodash';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './users.repository';
import {
  CreateUserDto,
  CreateUserWithClerkDto,
  UpdateUserDto,
  UserDto,
} from './dto/user.dto';
import { isDatabaseError } from 'src/helpers/error.helper';

@Injectable()
export class UsersService {
  private readonly mode: any;
  private readonly awsParams: string = '';
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {}

  async findAll(): Promise<UserDto[]> {
    return this.userRepository.findAllUsers();
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async findByClerkId(clerkId: string): Promise<UserDto> {
    const user = await this.userRepository.findByClerkId(clerkId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      const userData: CreateUserWithClerkDto = {
        ...createUserDto,
        clerkId: null, // Handle optional clerkId
      };

      return await this.userRepository.createUser(userData);
    } catch (error: unknown) {
      this.handleDatabaseError(error);
    }
  }

  async createUserWithClerk(
    createUserWithClerkDto: CreateUserWithClerkDto,
  ): Promise<UserDto> {
    try {
      return await this.userRepository.createUser(createUserWithClerkDto);
    } catch (error: unknown) {
      this.handleDatabaseError(error);
    }
  }

  async updateUser(
    id: string,
    updateUserDto: Partial<UpdateUserDto>,
  ): Promise<UserDto> {
    try {
      const allowedFields: (keyof UpdateUserDto)[] = [
        'firstName',
        'lastName',
        'phone',
        'isActive',
        'gender',
        'profilePic',
        'birthday',
      ];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const updateData = pick(
        updateUserDto,
        allowedFields,
      ) as Partial<UpdateUserDto>;

      // Optional: Remove undefined values
      const cleanedData = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(updateData).filter(([_, value]) => value !== undefined),
      );
      const updatedUser = await this.userRepository.updateUser(id, cleanedData);

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return updatedUser;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException as-is
      }
      this.handleDatabaseError(error);
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (isDatabaseError(error)) {
      // PostgreSQL error codes
      switch (error.code) {
        case '23505': // unique_violation
          if (error.constraint?.includes('email')) {
            throw new ConflictException('User with this email already exists');
          }
          if (error.constraint?.includes('clerk_id')) {
            throw new ConflictException(
              'User with this Clerk ID already exists',
            );
          }
          throw new ConflictException('Duplicate entry found');

        case '23502': // not_null_violation
          throw new ConflictException('Required field is missing');

        case '23514': // check_violation
          throw new ConflictException('Invalid data provided');

        default:
          console.error('Database error:', error);
          throw new InternalServerErrorException('Database operation failed');
      }
    }

    // Handle other types of errors
    if (error instanceof Error) {
      console.error('Application error:', error.message);
      throw new InternalServerErrorException('Failed to create user');
    }

    // Unknown error type
    console.error('Unknown error:', error);
    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
