import { pgTable, serial, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Main menu table
export const mainMenu = pgTable('main_menu', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    path: varchar('path', { length: 500 }).notNull(),
    orderBy: serial('order_by').notNull().unique(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Sub menu table
export const subMenu = pgTable('sub_menu', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    path: varchar('path', { length: 500 }).notNull(),
    icon: varchar('icon', { length: 100 }),
    isActive: boolean('is_active').default(true),
    requiresAuth: boolean('requires_auth').default(false),
    roles: varchar('roles', { length: 500 }).array(),
    orderBy: serial('order_by').notNull().unique(),
    mainMenuId: integer('main_menu_id')
        .notNull()
        .references(() => mainMenu.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const mainMenuRelations = relations(mainMenu, ({ many }) => ({
    subMenus: many(subMenu),
}));

export const subMenuRelations = relations(subMenu, ({ one }) => ({
    mainMenu: one(mainMenu, {
        fields: [subMenu.mainMenuId],
        references: [mainMenu.id],
    }),
}));

// Types
export type MainMenu = typeof mainMenu.$inferSelect;
export type SubMenu = typeof subMenu.$inferSelect;
