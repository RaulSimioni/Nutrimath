CREATE TABLE `dailyNutritionSummary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`totalCalories` int NOT NULL DEFAULT 0,
	`totalProtein` int NOT NULL DEFAULT 0,
	`totalCarbs` int NOT NULL DEFAULT 0,
	`totalFat` int NOT NULL DEFAULT 0,
	`estimatedWeightGainGrams` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailyNutritionSummary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `foodConsumption` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`foodId` int NOT NULL,
	`portionSizeGrams` int NOT NULL,
	`calories` int NOT NULL,
	`consumedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `foodConsumption_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `foods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`caloriesPer100g` int NOT NULL,
	`protein` int,
	`carbs` int,
	`fat` int,
	`fiber` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `foods_id` PRIMARY KEY(`id`)
);
