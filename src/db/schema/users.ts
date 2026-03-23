import { relations } from "drizzle-orm";
import { timestamps } from "./timestamps";
import {
  integer,
  pgTable,
  serial,
  varchar,
  uuid,
  index,
  pgEnum,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// Enum Definition
export const userRole = pgEnum("user_role", ["Admin", "User"]);

// User Table
export const users = pgTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: text().notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: userRole().default("User").notNull(),
  ...timestamps,
}, (t) => [
  index("user_id_idx").on(t.id),
]);

// OTP Table
export const usersOtp = pgTable("users_otp", {
  id: uuid().primaryKey().defaultRandom(),
  userId: integer()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  hashedOtp: varchar({ length: 255 }).notNull(),
  temporaryBlock: boolean().default(false),
  retryAttempts: integer().notNull().default(0),
  otpExpiry: timestamp().notNull(),
  ...timestamps,
}, (table) => [
  index("otp_user_id_idx").on(table.userId),
]);

// Relations
export const userRelationWithOTP = relations(usersOtp, ({ one }) => ({
  user: one(users, {
    fields: [usersOtp.userId],
    references: [users.id],
  }),
}));