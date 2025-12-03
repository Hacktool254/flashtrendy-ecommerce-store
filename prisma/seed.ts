import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file
config({ path: resolve(process.cwd(), ".env") });

// Verify DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set in .env file");
  process.exit(1);
}

console.log("🔗 Connecting to database...");

// Use standard PostgreSQL Pool for seeding (works with Neon)
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👤 Creating users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@flashtrendy.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "john@example.com",
      name: "John Doe",
      password: hashedPassword,
      role: "USER",
      emailVerified: new Date(),
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "jane@example.com",
      name: "Jane Smith",
      password: hashedPassword,
      role: "USER",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Users created");

  // Create categories
  console.log("📁 Creating categories...");
  
  const tshirtCategory = await prisma.category.create({
    data: {
      name: "T-shirts",
      slug: "t-shirts",
      description: "Comfortable and stylish t-shirts for every occasion",
      image: "/images/c-tshirts.jpg",
    },
  });

  const jeansCategory = await prisma.category.create({
    data: {
      name: "Jeans",
      slug: "jeans",
      description: "Classic and modern jeans in various styles",
      image: "/images/c-jeans.jpg",
    },
  });

  const shoesCategory = await prisma.category.create({
    data: {
      name: "Shoes",
      slug: "shoes",
      description: "Trendy and comfortable footwear for all occasions",
      image: "/images/c-shoes.jpg",
    },
  });

  console.log("✅ Categories created");

  // Create products
  console.log("🛍️ Creating products...");

  // T-shirts products (p11, p12)
  const tshirt1 = await prisma.product.create({
    data: {
      name: "Classic White T-Shirt",
      description: "A timeless classic white t-shirt made from 100% organic cotton. Perfect for everyday wear, this comfortable and breathable shirt features a relaxed fit and soft fabric that gets better with every wash.",
      price: 29.99,
      images: [
        "/images/p11-1.jpg",
        "/images/p11-2.jpg",
      ],
      stock: 50,
      sku: "TSH-001",
      categoryId: tshirtCategory.id,
    },
  });

  const tshirt2 = await prisma.product.create({
    data: {
      name: "Premium Black T-Shirt",
      description: "A premium black t-shirt with a modern slim fit. Made from high-quality cotton blend, this versatile shirt is perfect for both casual and semi-formal occasions. Features reinforced seams for durability.",
      price: 39.99,
      images: [
        "/images/p12-1.jpg",
        "/images/p12-2.jpg",
      ],
      stock: 35,
      sku: "TSH-002",
      categoryId: tshirtCategory.id,
    },
  });

  // Jeans products (p21, p22)
  const jeans1 = await prisma.product.create({
    data: {
      name: "Classic Blue Jeans",
      description: "Classic blue denim jeans with a straight leg fit. Made from premium denim, these jeans offer comfort and style. Perfect for everyday wear with a timeless design that never goes out of fashion.",
      price: 79.99,
      images: [
        "/images/p21-1.jpg",
        "/images/p21-2.jpg",
      ],
      stock: 40,
      sku: "JNS-001",
      categoryId: jeansCategory.id,
    },
  });

  const jeans2 = await prisma.product.create({
    data: {
      name: "Slim Fit Black Jeans",
      description: "Modern slim fit black jeans with stretch fabric for comfort. These versatile jeans can be dressed up or down and are perfect for any occasion. Features a contemporary fit and premium quality.",
      price: 89.99,
      images: [
        "/images/p22-1.jpg",
        "/images/p22-2.jpg",
      ],
      stock: 30,
      sku: "JNS-002",
      categoryId: jeansCategory.id,
    },
  });

  // Shoes products (p31, p32)
  const shoes1 = await prisma.product.create({
    data: {
      name: "Classic White Sneakers",
      description: "Iconic white sneakers with a clean, minimalist design. Made from premium materials, these comfortable sneakers feature a cushioned insole and durable rubber outsole. Perfect for everyday wear.",
      price: 99.99,
      images: [
        "/images/p31-1.jpg",
        "/images/p31-2.jpg",
      ],
      stock: 25,
      sku: "SHO-001",
      categoryId: shoesCategory.id,
    },
  });

  const shoes2 = await prisma.product.create({
    data: {
      name: "Premium Leather Boots",
      description: "Stylish leather boots with a modern design. Made from genuine leather with a comfortable inner lining, these boots are perfect for both casual and formal occasions. Features a durable sole for long-lasting wear.",
      price: 149.99,
      images: [
        "/images/p32-1.jpg",
        "/images/p32-2.jpg",
      ],
      stock: 20,
      sku: "SHO-002",
      categoryId: shoesCategory.id,
    },
  });

  console.log("✅ Products created");

  // Create some reviews
  console.log("⭐ Creating reviews...");
  
  await prisma.review.createMany({
    data: [
      {
        userId: customer1.id,
        productId: tshirt1.id,
        rating: 5,
        comment: "Great quality t-shirt! Very comfortable and fits perfectly.",
      },
      {
        userId: customer2.id,
        productId: tshirt1.id,
        rating: 4,
        comment: "Good value for money. The fabric is soft and durable.",
      },
      {
        userId: customer1.id,
        productId: jeans1.id,
        rating: 5,
        comment: "Perfect fit! These jeans are exactly what I was looking for.",
      },
      {
        userId: customer2.id,
        productId: shoes1.id,
        rating: 5,
        comment: "Comfortable and stylish. Highly recommend!",
      },
    ],
  });

  console.log("✅ Reviews created");

  console.log("🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Users: 3 (1 admin, 2 customers)`);
  console.log(`   - Categories: 3`);
  console.log(`   - Products: 6`);
  console.log(`   - Reviews: 4`);
  console.log("\n🔑 Login credentials:");
  console.log(`   Admin: admin@flashtrendy.com / password123`);
  console.log(`   Customer: john@example.com / password123`);
  console.log(`   Customer: jane@example.com / password123`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

