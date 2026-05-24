import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import { Category } from './models/category.model.js';
import { Product } from './models/product.model.js';

dotenv.config();

const categoriesData = [
  { name: 'Living Room' },
  { name: 'Bedroom' },
  { name: 'Office' },
  { name: 'Dining Room' }
];

const productsData = (categories) => [
  {
    title: 'Elegance Lounge Chair',
    description: 'A handcrafted luxury lounge chair with premium soft linen cushioning and an ergonomic solid oak wood frame. Perfect for statement lounging in the living room.',
    price: 349.99,
    discountedPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80',
    category: categories['Living Room']
  },
  {
    title: 'Classic Walnut Dining Table',
    description: 'Crafted from premium American Walnut wood, this dining table seats up to 6 people comfortably. Features fine organic grain lines and a modern soft satin protective coat.',
    price: 899.99,
    discountedPrice: 0,
    image: 'https://images.unsplash.com/photo-1530018607912-eff2df114f12?auto=format&fit=crop&w=600&q=80',
    category: categories['Dining Room']
  },
  {
    title: 'Minimalist Velvet Sofa',
    description: 'A luxurious three-seater sofa wrapped in deep emerald velvet. Features pocket-sprung cushioning and sleek rose gold steel legs.',
    price: 1199.99,
    discountedPrice: 999.99,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    category: categories['Living Room']
  },
  {
    title: 'Nordic Wooden Desk Lamp',
    description: 'An elegant adjustable wooden table lamp featuring a frosted ceramic shade and dynamic gold accents. Emits a soft, warm ambiance perfect for concentration.',
    price: 89.99,
    discountedPrice: 69.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    category: categories['Office']
  },
  {
    title: 'Ergonomic Leather Desk Chair',
    description: 'Stay productive in comfort with premium high-back full-grain leather desk chair. Complete with fully adjustable lumbar support and solid brushed metal armrests.',
    price: 450.00,
    discountedPrice: 0,
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80',
    category: categories['Office']
  },
  {
    title: 'Retro Velvet Dining Chair',
    description: 'Featuring high-density cushioning and structural iron framework, this retro-inspired dining chair adds immediate sophistication to any dining table setting.',
    price: 149.99,
    discountedPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80',
    category: categories['Dining Room']
  }
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/e-commerce';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected successfully!');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Database collections cleared successfully!');

    // Seed default admin user
    console.log('Seeding default users...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@lux.com',
      password: 'adminpassword',
      role: 'admin'
    });
    const regularUser = await User.create({
      name: 'Customer User',
      email: 'customer@lux.com',
      password: 'customerpassword',
      role: 'user'
    });
    console.log('Users seeded successfully!');
    console.log('-----------------------------');
    console.log(`Admin Login Email: ${adminUser.email}`);
    console.log(`Admin Login Password: adminpassword`);
    console.log('-----------------------------');

    // Seed Categories
    console.log('Seeding categories...');
    const createdCategories = {};
    for (const cat of categoriesData) {
      const savedCat = await Category.create(cat);
      createdCategories[savedCat.name] = savedCat._id;
    }
    console.log('Categories seeded successfully!');

    // Seed Products
    console.log('Seeding products...');
    const list = productsData(createdCategories);
    for (const prod of list) {
      await Product.create(prod);
    }
    console.log('Products seeded successfully!');

    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed with error:', error);
    process.exit(1);
  }
};

seed();
