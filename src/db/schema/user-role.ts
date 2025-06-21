import { pgTable, pgEnum, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { members } from './user';
import { organizations } from './organization';

export const roleEnum = pgEnum('role', [
  'super_admin',
  'admin',
  'teacher',
  'student',
]);

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: roleEnum('role').default('student').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  userId: uuid('user_id')
    .references(() => members.id)
    .notNull(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(members, {
    fields: [userRoles.userId],
    references: [members.id],
  }),
  organization: one(organizations, {
    fields: [userRoles.organizationId],
    references: [organizations.id],
  }),
}));
