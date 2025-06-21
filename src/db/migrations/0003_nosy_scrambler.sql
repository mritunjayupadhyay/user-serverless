ALTER TABLE "users" RENAME TO "members";--> statement-breakpoint
ALTER TABLE "members" DROP CONSTRAINT "users_clerk_id_unique";--> statement-breakpoint
ALTER TABLE "members" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_members_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_clerk_id_unique" UNIQUE("clerk_id");--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_email_unique" UNIQUE("email");