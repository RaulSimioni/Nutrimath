import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, foods, foodConsumption, dailyNutritionSummary } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllFoods() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get foods: database not available");
    return [];
  }

  try {
    return await db.select().from(foods);
  } catch (error) {
    console.error("[Database] Failed to get foods:", error);
    throw error;
  }
}

export async function getFoodsByCategory(category: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get foods: database not available");
    return [];
  }

  try {
    return await db.select().from(foods).where(eq(foods.category, category));
  } catch (error) {
    console.error("[Database] Failed to get foods by category:", error);
    throw error;
  }
}

export async function searchFoods(query: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search foods: database not available");
    return [];
  }

  try {
    // Simple search by name
    return await db.select().from(foods).where(
      sql`LOWER(${foods.name}) LIKE LOWER(${`%${query}%`})`
    );
  } catch (error) {
    console.error("[Database] Failed to search foods:", error);
    throw error;
  }
}

export async function addFoodConsumption(
  userId: number,
  foodId: number,
  portionSizeGrams: number,
  calories: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add food consumption: database not available");
    return;
  }

  try {
    await db.insert(foodConsumption).values({
      userId,
      foodId,
      portionSizeGrams,
      calories,
    });
  } catch (error) {
    console.error("[Database] Failed to add food consumption:", error);
    throw error;
  }
}

export async function getTodayConsumption(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get consumption: database not available");
    return [];
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(foodConsumption)
      .where(
        sql`${foodConsumption.userId} = ${userId} AND DATE(${foodConsumption.consumedAt}) = ${today}`
      );
  } catch (error) {
    console.error("[Database] Failed to get today consumption:", error);
    throw error;
  }
}

export async function deleteFoodConsumption(consumptionId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete consumption: database not available");
    return;
  }

  try {
    await db.delete(foodConsumption).where(eq(foodConsumption.id, consumptionId));
  } catch (error) {
    console.error("[Database] Failed to delete consumption:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.
