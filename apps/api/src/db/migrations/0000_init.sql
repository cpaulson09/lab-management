CREATE TABLE `lab_test` (
	`lab_test_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`turnaround_days` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lab_test_code_unique` ON `lab_test` (`code`);--> statement-breakpoint
CREATE TABLE `order` (
	`order_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`placed_at` text NOT NULL,
	`ready_date` text NOT NULL,
	`total` real NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`patient_id`) REFERENCES `patient`(`patient_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_item` (
	`order_item_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`lab_test_id` integer NOT NULL,
	`price` real NOT NULL,
	`turnaround_days` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`order_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lab_test_id`) REFERENCES `lab_test`(`lab_test_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_item_order_id_lab_test_id_unique` ON `order_item` (`order_id`,`lab_test_id`);--> statement-breakpoint
CREATE TABLE `patient` (
	`patient_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`phone` text,
	`email` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
