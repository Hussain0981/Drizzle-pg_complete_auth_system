import { relations } from "drizzle-orm";
import { pgTable, serial, text, varchar, uniqueIndex, pgEnum, uuid, boolean, integer, timestamp } from "drizzle-orm/pg-core";

// Enum Definition
export const userRole = pgEnum("user_role", ['Admin', 'User']);

// User Table
export const UserTable = pgTable("user_table", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRole("role").default("User").notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    emailIndex: uniqueIndex("email_idx").on(table.email)
  };
});

// OTP Table
export const UserOtp = pgTable('user_otp', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => UserTable.id, { onDelete: 'cascade' }).notNull(),
  hashedOtp: varchar('hashed_otp', { length: 255 }).notNull(),
  temporaryBlock: boolean('temporary_block').default(false),
  retryAttempts: integer('retry_attempts').notNull().default(0),
  otpExpiry: timestamp('otp_expiry').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const UserOtpRelations = relations(UserOtp, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserOtp.userId],
    references: [UserTable.id],
  }),
}));