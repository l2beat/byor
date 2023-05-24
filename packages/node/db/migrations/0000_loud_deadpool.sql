CREATE TABLE `accounts` (
	`address` text PRIMARY KEY NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`nonce` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer NOT NULL,
	`from` text NOT NULL,
	`to` text NOT NULL,
	`value` integer NOT NULL,
	`nonce` integer NOT NULL,
	`fee` integer NOT NULL,
	`feeReceipent` text NOT NULL,
	PRIMARY KEY(`from`, `nonce`)
);
