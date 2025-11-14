-- Add search indices for products table to improve search performance

CREATE INDEX `products_sku_idx` ON `products` (`sku`);
--> statement-breakpoint
CREATE INDEX `products_gtin_idx` ON `products` (`gtin`);
--> statement-breakpoint
CREATE INDEX `products_description_idx` ON `products` (`description`);
--> statement-breakpoint
CREATE INDEX `products_dun14_idx` ON `products` (`dun14`);
--> statement-breakpoint
CREATE INDEX `products_balanca_idx` ON `products` (`codigo_balanca`);
