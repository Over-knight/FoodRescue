// Quick script to check categories in MongoDB
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

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('Database:', mongoose.connection.db.databaseName);
        
        const categories = await Category.find({}).sort({ name: 1 });
        console.log(`\n📊 Total categories: ${categories.length}\n`);
        
        categories.forEach(cat => {
            console.log(`  ${cat.isActive ? '✓' : '✗'} ${cat.name} (${cat.slug})`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkCategories();
