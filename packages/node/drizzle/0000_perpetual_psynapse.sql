CREATE TABLE IF NOT EXISTS "accounts" (
	"address" text PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"nonce" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "fetcherStates" (
	"chainId" integer PRIMARY KEY NOT NULL,
	"lastFetchedBlock" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "transactions" (
	"id" integer,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"value" integer NOT NULL,
	"nonce" integer NOT NULL,
	"fee" integer NOT NULL,
	"feeReceipent" text NOT NULL,
	"l1SubmittedDate" timestamp NOT NULL,
	"hash" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_nonce" PRIMARY KEY("from","nonce");
