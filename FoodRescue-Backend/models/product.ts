import mongoose, { Document, Schema } from 'mongoose';

type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'draft';

export interface IProduct extends Document {
  status: ProductStatus;
  name: string;
  description: string;
  images: string[];
  category: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  visibleTo: 'consumer' | 'ngo' | 'both';

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

  location?: {
    address: string;
    city: string;
    coordinates?: { lat: number; lng: number; }
  }

  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
  
  updateStock(quantityOrdered: number, operation: 'decrease' | 'increase'): Promise<any>;
  canFulfillOrder(quantity: number, orderType: 'retail' | 'bulk'): boolean;
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

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // or 'Restaurant' if you create separate model
    required: [true, 'Restaurant/seller is required'],
    index: true
  },

  visibleTo: {
    type: String,
    enum: ['consumer', 'ngo', 'both'],
    default: 'consumer',
    required: true
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
  },

  expiryDate: {
    type: Date,
    required: [true, "Expiry date is required"],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: "Expiry date must be in the future"
    },
    index: true
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
ProductSchema.pre('validate', function() {
  // Generate slug
  if (this.isNew || this.isModified('name')) {
    const name = (this as any).name;
    // Convert to lowercase and replace spaces with hyphens
    let slug = name.toLowerCase().trim();
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
  
  // CRITICAL: Validate expiry date is not in the past
  if (this.isModified('expiryDate')) {
    const expiryDate = (this as any).expiryDate;
    const now = new Date();
    // Allow up to 1 hour in the past to account for timezone/clock drift
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    
    if (expiryDate && expiryDate < oneHourAgo) {
      this.invalidate('expiryDate', 'Expiry date cannot be in the past.');
    }
  }
  
  // Auto-update status based on stock
  const availableStock = (this as any).inventory.availableStock;
  const currentStatus = (this as any).get('status');
  
  if (availableStock <= 0) {
    (this as any).set('status', 'out_of_stock');
  } else if (currentStatus === 'out_of_stock' && availableStock > 0) {
    (this as any).set('status', 'active');
  }
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
  
  // Allow both 'active' and 'draft' for hackathon demo
  const allowedStatuses = ['active', 'draft'];
  return quantity >= minQty && this.inventory.availableStock >= quantity && allowedStatuses.includes(this.status);
};

export const Product = mongoose.model<IProduct>('Product', ProductSchema);