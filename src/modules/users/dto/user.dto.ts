/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

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

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
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
