import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { foods } from "./drizzle/schema";

const foodsData = [
  // Frutas
  { name: "Maçã", category: "Frutas", caloriesPer100g: 52, protein: 0, carbs: 14, fat: 0, fiber: 2 },
  { name: "Banana", category: "Frutas", caloriesPer100g: 89, protein: 1, carbs: 23, fat: 0, fiber: 3 },
  { name: "Laranja", category: "Frutas", caloriesPer100g: 47, protein: 1, carbs: 12, fat: 0, fiber: 2 },
  { name: "Morango", category: "Frutas", caloriesPer100g: 32, protein: 1, carbs: 8, fat: 0, fiber: 2 },
  { name: "Melancia", category: "Frutas", caloriesPer100g: 30, protein: 1, carbs: 8, fat: 0, fiber: 0 },
  { name: "Abacaxi", category: "Frutas", caloriesPer100g: 50, protein: 0, carbs: 13, fat: 0, fiber: 1 },
  { name: "Uva", category: "Frutas", caloriesPer100g: 67, protein: 1, carbs: 17, fat: 0, fiber: 1 },
  { name: "Pêra", category: "Frutas", caloriesPer100g: 57, protein: 0, carbs: 15, fat: 0, fiber: 2 },
  
  // Vegetais
  { name: "Alface", category: "Vegetais", caloriesPer100g: 15, protein: 1, carbs: 3, fat: 0, fiber: 1 },
  { name: "Tomate", category: "Vegetais", caloriesPer100g: 18, protein: 1, carbs: 4, fat: 0, fiber: 1 },
  { name: "Cenoura", category: "Vegetais", caloriesPer100g: 41, protein: 1, carbs: 10, fat: 0, fiber: 3 },
  { name: "Brócolis", category: "Vegetais", caloriesPer100g: 34, protein: 3, carbs: 7, fat: 0, fiber: 2 },
  { name: "Couve-flor", category: "Vegetais", caloriesPer100g: 25, protein: 2, carbs: 5, fat: 0, fiber: 2 },
  { name: "Espinafre", category: "Vegetais", caloriesPer100g: 23, protein: 3, carbs: 4, fat: 0, fiber: 1 },
  { name: "Abóbora", category: "Vegetais", caloriesPer100g: 26, protein: 1, carbs: 6, fat: 0, fiber: 1 },
  { name: "Batata", category: "Vegetais", caloriesPer100g: 77, protein: 2, carbs: 17, fat: 0, fiber: 2 },
  
  // Proteínas
  { name: "Peito de Frango", category: "Proteínas", caloriesPer100g: 165, protein: 31, carbs: 0, fat: 4, fiber: 0 },
  { name: "Carne Vermelha", category: "Proteínas", caloriesPer100g: 250, protein: 26, carbs: 0, fat: 17, fiber: 0 },
  { name: "Peixe Salmão", category: "Proteínas", caloriesPer100g: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  { name: "Ovo", category: "Proteínas", caloriesPer100g: 155, protein: 13, carbs: 1, fat: 11, fiber: 0 },
  { name: "Iogurte Grego", category: "Proteínas", caloriesPer100g: 59, protein: 10, carbs: 3, fat: 0, fiber: 0 },
  { name: "Queijo", category: "Proteínas", caloriesPer100g: 402, protein: 25, carbs: 1, fat: 33, fiber: 0 },
  { name: "Leite Integral", category: "Proteínas", caloriesPer100g: 61, protein: 3, carbs: 5, fat: 3, fiber: 0 },
  { name: "Feijão", category: "Proteínas", caloriesPer100g: 127, protein: 9, carbs: 23, fat: 0, fiber: 6 },
  
  // Carboidratos
  { name: "Arroz Branco", category: "Carboidratos", caloriesPer100g: 130, protein: 3, carbs: 28, fat: 0, fiber: 0 },
  { name: "Arroz Integral", category: "Carboidratos", caloriesPer100g: 111, protein: 3, carbs: 23, fat: 1, fiber: 4 },
  { name: "Pão Branco", category: "Carboidratos", caloriesPer100g: 265, protein: 9, carbs: 49, fat: 3, fiber: 2 },
  { name: "Pão Integral", category: "Carboidratos", caloriesPer100g: 247, protein: 9, carbs: 41, fat: 3, fiber: 7 },
  { name: "Macarrão", category: "Carboidratos", caloriesPer100g: 131, protein: 5, carbs: 25, fat: 1, fiber: 2 },
  { name: "Batata-doce", category: "Carboidratos", caloriesPer100g: 86, protein: 2, carbs: 20, fat: 0, fiber: 3 },
  { name: "Aveia", category: "Carboidratos", caloriesPer100g: 389, protein: 17, carbs: 66, fat: 7, fiber: 11 },
  { name: "Mel", category: "Carboidratos", caloriesPer100g: 304, protein: 0, carbs: 82, fat: 0, fiber: 0 },
  
  // Gorduras e Óleos
  { name: "Azeite de Oliva", category: "Gorduras", caloriesPer100g: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { name: "Amendoim", category: "Gorduras", caloriesPer100g: 567, protein: 26, carbs: 20, fat: 49, fiber: 6 },
  { name: "Castanha de Caju", category: "Gorduras", caloriesPer100g: 553, protein: 18, carbs: 30, fat: 44, fiber: 3 },
  { name: "Abacate", category: "Gorduras", caloriesPer100g: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  { name: "Nozes", category: "Gorduras", caloriesPer100g: 654, protein: 9, carbs: 14, fat: 65, fiber: 7 },
  { name: "Manteiga", category: "Gorduras", caloriesPer100g: 717, protein: 1, carbs: 0, fat: 81, fiber: 0 },
  
  // Bebidas
  { name: "Suco de Laranja", category: "Bebidas", caloriesPer100g: 45, protein: 1, carbs: 11, fat: 0, fiber: 0 },
  { name: "Café", category: "Bebidas", caloriesPer100g: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  { name: "Chá Verde", category: "Bebidas", caloriesPer100g: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  { name: "Refrigerante", category: "Bebidas", caloriesPer100g: 42, protein: 0, carbs: 11, fat: 0, fiber: 0 },
];

async function seedFoods() {
  let connection;
  try {
    // Criar conexão com pool
    const pool = await mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "Nutrimath",
      password: process.env.DB_PASSWORD || "559090",
      database: process.env.DB_NAME || "nutrition",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    connection = await pool.getConnection();
    const db = drizzle(connection);
    
    console.log("🔄 Iniciando população do banco de dados com alimentos...");
    
    for (const food of foodsData) {
      await db.insert(foods).values(food);
    }
    
    console.log(`✅ ${foodsData.length} alimentos adicionados com sucesso!`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao popular banco de dados:", error);
    process.exit(1);
  }
}

seedFoods();

