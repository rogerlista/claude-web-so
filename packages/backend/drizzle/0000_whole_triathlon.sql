CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`table_name` text NOT NULL,
	`operation` text NOT NULL,
	`record_id` text NOT NULL,
	`previous_data` text,
	`new_data` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cash_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`opening_date` integer NOT NULL,
	`closing_date` integer,
	`initial_amount_in_cents` integer NOT NULL,
	`status` text NOT NULL,
	`gross_sales_in_cents` integer DEFAULT 0 NOT NULL,
	`cancellations_in_cents` integer DEFAULT 0 NOT NULL,
	`discounts_in_cents` integer DEFAULT 0 NOT NULL,
	`additions_in_cents` integer DEFAULT 0 NOT NULL,
	`net_sales_in_cents` integer DEFAULT 0 NOT NULL,
	`withdrawals_in_cents` integer DEFAULT 0 NOT NULL,
	`expenses_in_cents` integer DEFAULT 0 NOT NULL,
	`additional_supply_in_cents` integer DEFAULT 0 NOT NULL,
	`final_balance_in_cents` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cash_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`cash_movement_id` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`amount_in_cents` integer NOT NULL,
	`user_id` text NOT NULL,
	`payment_method_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`cash_movement_id`) REFERENCES `cash_movements`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`cpf` text NOT NULL,
	`email` text,
	`phone` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_cpf_unique` ON `customers` (`cpf`);--> statement-breakpoint
CREATE UNIQUE INDEX `customers_email_unique` ON `customers` (`email`);--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`movement_type` text NOT NULL,
	`observation` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`codigo` text,
	`sku` text,
	`gtin` text,
	`dun14` text,
	`codigo_balanca` text,
	`status` text DEFAULT 'ACTIVE',
	`description` text NOT NULL,
	`unidade_medida` text DEFAULT 'UN',
	`price_in_cents` integer NOT NULL,
	`preco_promocional_in_cents` integer,
	`preco_promocional_inicio` integer,
	`preco_promocional_fim` integer,
	`origem_tributaria` text,
	`ncm` text,
	`cest` text,
	`tributacao` text,
	`aliquota_icms` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_gtin_unique` ON `products` (`gtin`);--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` text PRIMARY KEY NOT NULL,
	`sale_id` text NOT NULL,
	`product_id` text NOT NULL,
	`numero_item` integer,
	`codigo` text,
	`descricao` text,
	`quantity` integer NOT NULL,
	`unit_price_in_cents` integer,
	`total_in_cents` integer,
	`valor_unitario_in_cents` integer,
	`total_item_in_cents` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sale_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`sale_id` text NOT NULL,
	`payment_method` text NOT NULL,
	`payment_method_code` text NOT NULL,
	`amount_in_cents` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`numero_venda` integer,
	`data_hora` integer DEFAULT (unixepoch()),
	`user_id` text,
	`customer_id` text,
	`cpf_cliente` text,
	`email_cliente` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`total_in_cents` integer,
	`total_bruto_in_cents` integer,
	`desconto_in_cents` integer DEFAULT 0,
	`acrescimo_in_cents` integer DEFAULT 0,
	`total_liquido_in_cents` integer,
	`chave_nfce` text,
	`numero_nfce` integer,
	`serie_nfce` text,
	`status_nfce` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_numero_venda_unique` ON `sales` (`numero_venda`);--> statement-breakpoint
CREATE UNIQUE INDEX `sales_chave_nfce_unique` ON `sales` (`chave_nfce`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`login` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_login_unique` ON `users` (`login`);