PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_shift` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`duration` integer DEFAULT 60 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reason_incomplete` text,
	`details` text,
	`reprogramed` integer DEFAULT false NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_shift`("id", "patient_id", "date", "start_time", "duration", "status", "reason_incomplete", "details", "reprogramed", "updated_at", "created_at", "deleted_at") SELECT "id", "patient_id", "date", "start_time", "duration", "status", "reason_incomplete", "details", "reprogramed", "updated_at", "created_at", "deleted_at" FROM `shift`;--> statement-breakpoint
DROP TABLE `shift`;--> statement-breakpoint
ALTER TABLE `__new_shift` RENAME TO `shift`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_available_day` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_name` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_available_day`("id", "day_name", "updated_at", "created_at", "deleted_at") SELECT "id", "day_name", "updated_at", "created_at", "deleted_at" FROM `available_day`;--> statement-breakpoint
DROP TABLE `available_day`;--> statement-breakpoint
ALTER TABLE `__new_available_day` RENAME TO `available_day`;--> statement-breakpoint
CREATE UNIQUE INDEX `available_day_day_name_unique` ON `available_day` (`day_name`);--> statement-breakpoint
CREATE TABLE `__new_available_time` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_id` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`day_id`) REFERENCES `available_day`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_available_time`("id", "day_id", "start_time", "end_time", "updated_at", "created_at", "deleted_at") SELECT "id", "day_id", "start_time", "end_time", "updated_at", "created_at", "deleted_at" FROM `available_time`;--> statement-breakpoint
DROP TABLE `available_time`;--> statement-breakpoint
ALTER TABLE `__new_available_time` RENAME TO `available_time`;--> statement-breakpoint
CREATE TABLE `__new_patient` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`lastname` text NOT NULL,
	`dni` text NOT NULL,
	`updated_at` integer,
	`created_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_patient`("id", "name", "lastname", "dni", "updated_at", "created_at", "deleted_at") SELECT "id", "name", "lastname", "dni", "updated_at", "created_at", "deleted_at" FROM `patient`;--> statement-breakpoint
DROP TABLE `patient`;--> statement-breakpoint
ALTER TABLE `__new_patient` RENAME TO `patient`;--> statement-breakpoint
CREATE UNIQUE INDEX `patient_dni_unique` ON `patient` (`dni`);