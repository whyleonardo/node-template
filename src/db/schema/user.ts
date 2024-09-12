import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex
} from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    name: text("name"),
    email: text("email").notNull(),
    avatarUrl: text("avatarUrl"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const providerEnum = pgEnum("provider", ["github"])

export const accounts = pgTable(
    "account",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        provider: providerEnum("provider").notNull(),
        providerAccountId: text("provider_account_id").notNull(),
        userId: text("user_id").notNull()
    },
    (table) => ({
        provider: uniqueIndex("provider_idx").on(table.userId)
    })
)

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts)
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
    userId: one(users, { fields: [accounts.userId], references: [users.id] })
}))
