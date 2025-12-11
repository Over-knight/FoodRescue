import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    description?: string;
    slug: string;
    image?: string[];
    isActive: boolean;
    productCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },

    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    image: {
        type: [String], 
        required: false
    },

    productCount: {
        type: Number,
        default: 0,
        min: 0
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

CategorySchema.index({ isActive: 1 });

CategorySchema.pre('save', function() {
    if (this.isModified('name') || this.isNew) {
        // Generate slug from name
        let slug = (this as any).name.toLowerCase().trim();
        // Replace spaces with hyphens
        slug = slug.split(' ').join('-');
        // Remove special characters manually
        let cleanSlug = '';
        for (let i = 0; i < slug.length; i++) {
            const char = slug[i];
            if ((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char === '-') {
                cleanSlug += char;
            }
        }
        (this as any).slug = cleanSlug;
    }
});

CategorySchema.methods.updateProductCount = async function() {
    const Product = mongoose.model('Product');
    this.productCount = await Product.countDocuments({ 
        category: this._id, 
        status: { $ne: 'inactive' } 
    });
    return this.save();
};

export const Category = mongoose.model<ICategory>('Category', CategorySchema);