import { integer, pgTable, varchar, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

// Таблица пользователей
export const users = pgTable('users', {
    id: uuid().primaryKey().defaultRandom(),
    username: varchar({ length: 255 }).notNull().unique(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    isAdmin: boolean().default(false),
    joinDate: timestamp().defaultNow()
});

// Таблица постов администратора
export const posts = pgTable('posts', {
    id: uuid().primaryKey().defaultRandom(),
    authorId: uuid().notNull().references(() => users.id),
    title: varchar({ length: 500 }).notNull(),
    content: text().notNull(),
    createdAt: timestamp().defaultNow(),
    commentsCount: integer().default(0)
});

// Таблица общих комментариев
export const comments = pgTable('comments', {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid().notNull().references(() => users.id),
    text: text().notNull(),
    page: varchar({ length: 50 }).default('home'),
    date: timestamp().defaultNow(),
    isModerated: boolean().default(false)
});

// Таблица комментариев к постам
export const postComments = pgTable('post_comments', {
    id: uuid().primaryKey().defaultRandom(),
    postId: uuid().notNull().references(() => posts.id),
    userId: uuid().notNull().references(() => users.id),
    text: text().notNull(),
    createdAt: timestamp().defaultNow()
});

// Таблица лайков
export const likes = pgTable('likes', {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid().notNull().references(() => users.id),
    itemId: varchar({ length: 255 }).notNull(),
    itemType: varchar({ length: 50 }).notNull(), // 'comment' | 'postComment' | 'post'
    createdAt: timestamp().defaultNow()
});