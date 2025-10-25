import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  nutrition: router({
    // Get all foods with optional search
    getFoods: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          category: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        if (input.search) {
          return await db.searchFoods(input.search);
        }
        if (input.category) {
          return await db.getFoodsByCategory(input.category);
        }
        return await db.getAllFoods();
      }),

    // Get food categories
    getCategories: publicProcedure.query(async () => {
      const allFoods = await db.getAllFoods();
      const categoriesSet = new Set(allFoods.map(f => f.category));
      const categories = Array.from(categoriesSet);
      return categories.sort();
    }),

    // Add food to today's consumption
    addFoodConsumption: publicProcedure
      .input(
        z.object({
          foodId: z.number(),
          portionSizeGrams: z.number().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get food details
        const allFoods = await db.getAllFoods();
        const food = allFoods.find(f => f.id === input.foodId);
        
        if (!food) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Alimento não encontrado",
          });
        }

        // Calculate calories
        const calories = Math.round((food.caloriesPer100g * input.portionSizeGrams) / 100);

        // Add to consumption (usando ID de usuário anônimo: 1)
        await db.addFoodConsumption(
          1,
          input.foodId,
          input.portionSizeGrams,
          calories
        );

        return { success: true, calories };
      }),

    // Get today's consumption
    getTodayConsumption: publicProcedure.query(async () => {
      const consumption = await db.getTodayConsumption(1);
      const allFoods = await db.getAllFoods();

      // Enrich consumption with food details
      const enriched = consumption.map(c => {
        const food = allFoods.find(f => f.id === c.foodId);
        return {
          ...c,
          food: food || null,
        };
      });

      // Calculate totals
      const totalCalories = enriched.reduce((sum, c) => sum + c.calories, 0);
      const totalProtein = enriched.reduce((sum, c) => {
        if (!c.food || !c.food.protein) return sum;
        return sum + Math.round((c.food.protein * c.portionSizeGrams) / 100);
      }, 0);
      const totalCarbs = enriched.reduce((sum, c) => {
        if (!c.food || !c.food.carbs) return sum;
        return sum + Math.round((c.food.carbs * c.portionSizeGrams) / 100);
      }, 0);
      const totalFat = enriched.reduce((sum, c) => {
        if (!c.food || !c.food.fat) return sum;
        return sum + Math.round((c.food.fat * c.portionSizeGrams) / 100);
      }, 0);

      // Calculate estimated weight gain (7700 calories = 1kg)
      const estimatedWeightGainGrams = Math.round((totalCalories / 7700) * 1000);

      return {
        items: enriched,
        totals: {
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          estimatedWeightGainGrams,
        },
      };
    }),

    // Remove food from consumption
    removeFoodConsumption: publicProcedure
      .input(
        z.object({
          consumptionId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await db.deleteFoodConsumption(input.consumptionId);
        return { success: true };
      }),

    // Calculate weight gain for custom calories
    calculateWeightGain: publicProcedure
      .input(
        z.object({
          totalCalories: z.number().min(0),
        })
      )
      .query(({ input }) => {
        // 7700 calories = 1kg of body weight
        const weightGainGrams = Math.round((input.totalCalories / 7700) * 1000);
        const weightGainKg = (weightGainGrams / 1000).toFixed(2);
        return { weightGainGrams, weightGainKg };
      }),
  }),
});

export type AppRouter = typeof appRouter;
