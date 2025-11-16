-- Add userId and adjustmentReason columns to inventory table
-- Task 3.1 & 3.2: Add user tracking and adjustment reason fields

ALTER TABLE `inventory` ADD `user_id` text REFERENCES users(id);
--> statement-breakpoint
ALTER TABLE `inventory` ADD `adjustment_reason` text;
