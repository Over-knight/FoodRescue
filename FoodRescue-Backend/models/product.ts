import mongoose, { Document, Schema } from 'mongoose';

type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'draft';

export interface IProduct extends Document {
  status: ProductStatus;
  name: string;
  description: string;
  images: string[];
  category: mongoose.Types.ObjectId;

  pricing: {
    retail: {
      price: number;
      unit: string;
      minQuantity: number;
    };
    bulkTiers?: Array<{
      name: string;
      price: number;
      unit: string;
      minQuantity: number;
    }>;
  };

  inventory: {
    availableStock: number;
    lowStockThreshold: number;
    unit: string;
  };

  tags: string[];
  slug: string;

  stats: {
    viewCount: number;
    orderCount: number;
    totalSold: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr: string[]) {
        return arr.length <= 5;
      },
      message: 'Product can have maximum 5 images'
    }
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  
  pricing: {
    retail: {
      price: {
        type: Number,
        required: [true, 'Retail price is required'],
        min: [1, 'Price must be at least 1 kobo']
      },
      unit: {
        type: String,
        required: [true, 'Retail unit is required'],
        trim: true,
        maxlength: [20, 'Unit description too long']
      },
      minQuantity: {
        type: Number,
        required: [true, 'Minimum retail quantity is required'],
        min: [1, 'Minimum quantity must be at least 1']
      }
    },
    bulkTiers: [{
      name: {
        type: String,
        required: true,
        maxlength: [50, "Name is required"]
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        required: [true, "Bulk unit is required"],
        trim: true,
        maxlength: [20, 'Unit description too long']
      },
      minQuantity: {
        type: Number,
        required: [true, 'Minimum bulk quantity is required'],
        min: [20, 'Minimum quantity must be at least 20']
      }
     },
    // {
    //     name: {
    //         type: String,
    //         required: true,
    //         max: [50, "Name is required"]
    //     },
    //     price: {
    //     type: Number,
    //     required: [true, 'Discounted price is required'],
    //     min: [1, 'Price must be at least 1 kobo']
    //     },
    //     unit:  {
    //     type: String,
    //     required: [true, "Bulk unit is required"],
    //     trim: true,
    //     maxlength: [20, 'Unit description too long']
    //     },
    //     minQuantity: {
    //         type: Number,
    //         required: [true, 'Minimum retail quantity is required'],
    //         min: [20, 'Minimum quantity must be at least 20']
    //     }
    // }
    ]
  },
  
  inventory: {
    availableStock: {
      type: Number,
      required: [true, 'Available stock is required'],
      min: [0, 'Stock cannot be negative']
    },
    lowStockThreshold: {
      type: Number,
      required: [true, 'Low stock threshold is required'],
      min: [0, 'Threshold cannot be negative'],
      default: 10
    },
    unit: {
      type: String,
      required: [true, 'Inventory unit is required'],
      trim: true
    }
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'out_of_stock'],
    default: 'draft'
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag too long']
  }],
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  stats: {
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSold: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ 'stats.orderCount': -1 });

// Virtual: Check if low stock
ProductSchema.virtual('isLowStock').get(function(this: IProduct) {
  return this.inventory.availableStock <= this.inventory.lowStockThreshold;
});


// Validate hook
ProductSchema.pre<IProduct>('validate', function(next) {
  // Generate slug
  if (this.isNew || this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  
  // Auto-update status based on stock
  if (this.inventory.availableStock <= 0) {
    this.set('status', 'out_of_stock');
  } else if (this.get('status') === 'out_of_stock' && this.inventory.availableStock > 0) {
    this.set('status', 'active');
  }
  
  next();
});

// Method: Update stock when order is placed
ProductSchema.methods.updateStock = function(quantityOrdered: number, operation: 'decrease' | 'increase') {
  if (operation === 'decrease') {
    this.inventory.availableStock = Math.max(0, this.inventory.availableStock - quantityOrdered);
    this.stats.orderCount += 1;
    this.stats.totalSold += quantityOrdered;
  } else {
    this.inventory.availableStock += quantityOrdered;
    this.stats.orderCount = Math.max(0, this.stats.orderCount - 1);
    this.stats.totalSold = Math.max(0, this.stats.totalSold - quantityOrdered);
  }
  
  return this.save();
};

// Method: Check if quantity is available for ordering
ProductSchema.methods.canFulfillOrder = function(quantity: number, orderType: 'retail' | 'bulk'): boolean {
  const minQty = orderType === 'retail' ? this.pricing.retail.minQuantity : this.pricing.bulkTiers?.[0]?.minQuantity || 0;
  
  return quantity >= minQty && this.inventory.availableStock >= quantity && this.status === 'active';
};

export const Product = mongoose.model<IProduct>('Product', ProductSchema);