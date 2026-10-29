CREATE TABLE "products" (
	"id" text PRIMARY KEY,
	"cat" text NOT NULL,
	"name" text NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"best" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL
);
