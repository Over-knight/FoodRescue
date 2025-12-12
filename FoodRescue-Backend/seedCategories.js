// Script to seed categories in MongoDB
// Run this with: node seedCategories.js

const mongoose = require('mongoose');
require('dotenv').config();

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    productCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

const categories = [
    {
        name: 'Rice & Grains',
        slug: 'rice-grains',
        description: 'Rice dishes, pasta, and grain-based meals',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
        isActive: true
    },
    {
        name: 'Soups & Stews',
        slug: 'soups-stews',
        description: 'Traditional Nigerian soups and stews',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        isActive: true
    },
    {
        name: 'Proteins',
        slug: 'proteins',
        description: 'Meat, fish, chicken, and protein dishes',
        image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
        isActive: true
    },
    {
        name: 'Vegetables',
        slug: 'vegetables',
        description: 'Fresh vegetables and vegetable dishes',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
        isActive: true
    },
    {
        name: 'Snacks',
        slug: 'snacks',
        description: 'Small chops, pastries, and snacks',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
        isActive: true
    },
    {
        name: 'Swallow',
        slug: 'swallow',
        description: 'Eba, fufu, pounded yam, and other swallows',
        image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400',
        isActive: true
    },
    {
        name: 'Bakery',
        slug: 'bakery',
        description: 'Bread, cakes, pastries, and baked goods',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
        isActive: true
    },
    {
        name: 'Beverages',
        slug: 'beverages',
        description: 'Drinks, juices, and beverages',
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',
        isActive: true
    },
    {
        name: 'Ready Meals',
        slug: 'ready-meals',
        description: 'Complete ready-to-eat meals',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        isActive: true
    },
    {
        name: 'Fruits',
        slug: 'fruits',
        description: 'Fresh fruits and fruit products',
        image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
        isActive: true
    }
];

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing categories (optional - comment out if you want to keep existing)
        // await Category.deleteMany({});
        // console.log('Cleared existing categories');

        // Insert categories
        const result = await Category.insertMany(categories, { ordered: false });
        console.log(`✅ Successfully inserted ${result.length} categories`);

        // Display created categories
        const allCategories = await Category.find({}).sort({ name: 1 });
        console.log('\nCategories in database:');
        allCategories.forEach(cat => {
            console.log(`  - ${cat.name} (${cat.slug})`);
        });

        process.exit(0);
    } catch (error) {
        if (error.code === 11000) {
            console.log('⚠️  Some categories already exist, skipping duplicates');
            
            // Show existing categories
            const allCategories = await Category.find({}).sort({ name: 1 });
            console.log('\nCategories in database:');
            allCategories.forEach(cat => {
                console.log(`  - ${cat.name} (${cat.slug})`);
            });
            
            process.exit(0);
        } else {
            console.error('Error seeding categories:', error);
            process.exit(1);
        }
    }
}

seedCategories();
