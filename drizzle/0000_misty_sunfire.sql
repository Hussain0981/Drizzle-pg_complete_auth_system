CREATE TYPE "public"."admin_role" AS ENUM('super_admin');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('Admin', 'User');--> statement-breakpoint
CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "admin_role" DEFAULT 'super_admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "main_menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"path" varchar(500) NOT NULL,
	"order_by" serial NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "main_menu_order_by_unique" UNIQUE("order_by")
);
--> statement-breakpoint
CREATE TABLE "sub_menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"path" varchar(500) NOT NULL,
	"icon" varchar(100),
	"is_active" boolean DEFAULT true,
	"requires_auth" boolean DEFAULT false,
	"roles" varchar(500)[],
	"order_by" serial NOT NULL,
	"main_menu_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sub_menu_order_by_unique" UNIQUE("order_by")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'User' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_otp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"hashed_otp" varchar(255) NOT NULL,
	"temporary_block" boolean DEFAULT false,
	"blocked_until" timestamp,
	"retry_attempts" integer DEFAULT 0 NOT NULL,
	"otp_expiry" timestamp NOT NULL,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "sub_menu" ADD CONSTRAINT "sub_menu_main_menu_id_main_menu_id_fk" FOREIGN KEY ("main_menu_id") REFERENCES "public"."main_menu"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_otp" ADD CONSTRAINT "users_otp_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "admin_email_idx" ON "admin" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE INDEX "otp_user_id_idx" ON "users_otp" USING btree ("user_id");