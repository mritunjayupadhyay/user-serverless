/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class CreateUserDto {
  @ApiProperty({
    type: String,
    default: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(Gender, {
    message: 'Gender must be one of: male, female, other',
  })
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  profilePic?: string;

  @IsString()
  @IsOptional()
  birthday?: string;
}

export class CreateUserWithClerkDto extends CreateUserDto {
  @ApiProperty({
    type: String,
    description: 'Clerk user identifier',
  })
  @IsString()
  @IsNotEmpty()
  clerkId: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsEnum(Gender, {
    message: 'Gender must be one of: male, female, other',
  })
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  profilePic?: string;

  @IsString()
  @IsOptional()
  birthday?: string;
}

export class UserDto {
  id: string;
  email: string;
  firstName: string;
  clerkId?: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
