import {
  Controller,
  Post,
  Body,
  Headers,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Webhook } from 'svix';
import { isValidGender } from 'src/helpers/gender.helper';

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    birthday: string | null;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    gender: string | null;
    profile_image_url: string | null;
    phone_numbers: Array<{
      phone_number: string;
      id: string;
    }>;
    created_at: number;
    updated_at: number;
  };
}

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('clerk')
  async handleClerkWebhook(
    @Body() payload: ClerkWebhookEvent,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    // Verify webhook signature
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new HttpException(
        'Webhook secret not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const wh = new Webhook(webhookSecret);
      const evt = wh.verify(JSON.stringify(payload), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;

      this.logger.log(`Received webhook event: ${evt.type}`);

      switch (evt.type) {
        case 'user.created':
          await this.handleUserCreated(evt);
          break;
        case 'user.updated':
          await this.handleUserUpdated(evt);
          break;
        default:
          this.logger.log(`Unhandled event type: ${evt.type}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Webhook verification failed:', error);
      throw new HttpException(
        'Webhook verification failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async handleUserCreated(event: ClerkWebhookEvent) {
    try {
      const { data } = event;

      // Extract primary email
      const primaryEmail = data.email_addresses.find(
        (email) => email.email_address,
      )?.email_address;

      if (!primaryEmail) {
        this.logger.warn('No email found for user creation');
        return;
      }

      // Extract primary phone (if available)
      const primaryPhone = data.phone_numbers.find(
        (phone) => phone.phone_number,
      )?.phone_number;

      const createUserDto = {
        email: primaryEmail,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phone: primaryPhone || null,
        clerkId: data.id,
        isActive: true,
        birthday: data.birthday || null,
        gender: data.gender && isValidGender(data.gender) ? data.gender : null,
        profilePic: data.profile_image_url || null,
      };

      const user = await this.usersService.createUserWithClerk(createUserDto);
      this.logger.log(`User created successfully: ${user.id}`);
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      // Don't throw here to avoid webhook retries for business logic errors
      // Clerk will retry failed webhooks automatically
    }
  }

  private async handleUserUpdated(event: ClerkWebhookEvent) {
    try {
      const { data } = event;

      // Find existing user by clerkId
      const existingUser = await this.usersService.findByClerkId(data.id);

      if (!existingUser) {
        this.logger.warn(`User with clerkId ${data.id} not found for update`);
        // Optionally create the user if it doesn't exist
        await this.handleUserCreated(event);
        return;
      }

      // Extract updated data
      const primaryEmail = data.email_addresses.find(
        (email) => email.email_address,
      )?.email_address;

      const primaryPhone = data.phone_numbers.find(
        (phone) => phone.phone_number,
      )?.phone_number;

      const updateUserDto = {
        email: primaryEmail,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phone: primaryPhone || null,
      };

      const updatedUser = await this.usersService.updateUser(
        existingUser.id,
        updateUserDto,
      );
      this.logger.log(`User updated successfully: ${updatedUser.id}`);
    } catch (error) {
      this.logger.error('Failed to update user:', error);
    }
  }
}
