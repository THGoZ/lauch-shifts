CREATE TABLE `available_day` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_name` text NOT NULL,
	`updated_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `available_day_day_name_unique` ON `available_day` (`day_name`);--> statement-breakpoint
CREATE TABLE `available_time` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_id` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`updated_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`deleted_at` integer,
	FOREIGN KEY (`day_id`) REFERENCES `available_day`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `patient` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`lastname` text NOT NULL,
	`dni` text NOT NULL,
	`updated_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `patient_dni_unique` ON `patient` (`dni`);--> statement-breakpoint
CREATE TABLE `shift` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`duration` integer DEFAULT 60 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reason_incomplete` text,
	`updated_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`deleted_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON UPDATE no action ON DELETE no action
);
