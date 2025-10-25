import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Foods table storing nutritional information
 */
export const foods = mysqlTable("foods", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Frutas", "Proteínas", "Carboidratos"
  caloriesPer100g: int("caloriesPer100g").notNull(), // Calorias por 100g
  protein: int("protein"), // Proteína em gramas por 100g
  carbs: int("carbs"), // Carboidratos em gramas por 100g
  fat: int("fat"), // Gordura em gramas por 100g
  fiber: int("fiber"), // Fibra em gramas por 100g
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Food = typeof foods.$inferSelect;
export type InsertFood = typeof foods.$inferInsert;

/**
 * Food consumption log for each user
 */
export const foodConsumption = mysqlTable("foodConsumption", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  foodId: int("foodId").notNull(),
  portionSizeGrams: int("portionSizeGrams").notNull(), // Tamanho da porção em gramas
  calories: int("calories").notNull(), // Calorias calculadas
  consumedAt: timestamp("consumedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FoodConsumption = typeof foodConsumption.$inferSelect;
export type InsertFoodConsumption = typeof foodConsumption.$inferInsert;

/**
 * Daily nutrition summary for tracking
 */
export const dailyNutritionSummary = mysqlTable("dailyNutritionSummary", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  totalCalories: int("totalCalories").notNull().default(0),
  totalProtein: int("totalProtein").notNull().default(0),
  totalCarbs: int("totalCarbs").notNull().default(0),
  totalFat: int("totalFat").notNull().default(0),
  estimatedWeightGainGrams: int("estimatedWeightGainGrams").notNull().default(0), // Ganho de peso estimado em gramas
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyNutritionSummary = typeof dailyNutritionSummary.$inferSelect;
export type InsertDailyNutritionSummary = typeof dailyNutritionSummary.$inferInsert;