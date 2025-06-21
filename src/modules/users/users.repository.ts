import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { CreateUserWithClerkDto, UpdateUserDto, UserDto } from './dto/user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DATABASE') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // Assuming you have a questions table defined in your schema
  async findAllUsers(limit = 100, offset = 0): Promise<UserDto[]> {
    // Using the schema you defined earlier
    // Note: Update the table name to match your actual schema
    return this.db.select().from(schema.members).limit(limit).offset(offset);
  }

  async findById(id: string): Promise<UserDto | null> {
    const results = await this.db
      .select()
      .from(schema.members)
      .where(eq(schema.members.id, id))
      .limit(1);

    return results.length ? results[0] : null;
  }
  async findByClerkId(clerkId: string): Promise<UserDto | null> {
    const results = await this.db
      .select()
      .from(schema.members)
      .where(eq(schema.members.clerkId, clerkId))
      .limit(1);

    return results.length ? results[0] : null;
  }
  async createUser(data: CreateUserWithClerkDto): Promise<UserDto> {
    // Create an object with only the fields that exist in the schema
    const memberData = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: data.isActive ?? true,
      clerkId: data.clerkId,
      phone: data.phone || null, // Phone is optional, set to null if not provided
    };

    // Remove phone as it's not in the schema
    const [user] = await this.db
      .insert(schema.members)
      .values(memberData)
      .returning();

    return user;
  }
  async updateUser(id: string, data: Partial<UpdateUserDto>): Promise<UserDto> {
    const [user] = await this.db
      .update(schema.members)
      .set(data)
      .where(eq(schema.members.id, id))
      .returning();

    return user;
  }
}
