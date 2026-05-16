CREATE TYPE "public"."user_role" AS ENUM('admin', 'customer', 'delivery', 'staff');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."service_request_status" AS ENUM('pending', 'booked', 'in_progress', 'editing', 'ready', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('koshat', 'photography', 'albums', 'graduation', 'research', 'distributions', 'gifts');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('confirmed', 'awaiting_payment', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."gallery_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."account_name" AS ENUM('cash', 'bank', 'zain_cash', 'master_card', 'asia_hawala');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('receipt', 'expense', 'transfer');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text,
	"phone" text NOT NULL,
	"password_hash" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text,
	"description_ar" text,
	"price" numeric(10, 2) NOT NULL,
	"discount_price" numeric(10, 2),
	"category" text NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"colors" jsonb DEFAULT '[]'::jsonb,
	"in_stock" boolean DEFAULT true NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"has_customization" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"tracking_code" text NOT NULL,
	"customer_id" integer,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"delivery_fee" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"delivery_zone_id" integer,
	"delivery_zone" text,
	"delivery_address" text,
	"delivery_agent_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_tracking_code_unique" UNIQUE("tracking_code")
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_type" "service_type" NOT NULL,
	"customer_id" integer,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"status" "service_request_status" DEFAULT 'pending' NOT NULL,
	"event_date" text,
	"event_time" text,
	"location" text,
	"details" jsonb DEFAULT '{}'::jsonb,
	"notes" text,
	"total_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "service_type" NOT NULL,
	"name_ar" text NOT NULL,
	"description_ar" text,
	"image" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"customer_id" integer,
	"service_type" text,
	"date" text NOT NULL,
	"time" text,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"color" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "gallery_type" DEFAULT 'image' NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"category" text NOT NULL,
	"title_ar" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"customer_id" integer,
	"customer_name" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_ar" text NOT NULL,
	"category" text,
	"quantity" integer DEFAULT 0 NOT NULL,
	"min_quantity" integer DEFAULT 5 NOT NULL,
	"purchase_price" numeric(10, 2) NOT NULL,
	"selling_price" numeric(10, 2) NOT NULL,
	"unit" text DEFAULT 'قطعة' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "transaction_type" NOT NULL,
	"account" "account_name" NOT NULL,
	"to_account" "account_name",
	"amount" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"reference_id" text,
	"date" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"province" text NOT NULL,
	"area" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"estimated_days" integer DEFAULT 2 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_agent_id_users_id_fk" FOREIGN KEY ("delivery_agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;