CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "gender" "gender" DEFAULT 'male' NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "profile_pic" varchar;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "birthday" varchar(50);