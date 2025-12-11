import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  images?: string[];
  helpful: number;
  reported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true
  },
  
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Restaurant is required'],
    index: true
  },
  
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required'],
    index: true
  },
  
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr: string[]) {
        return arr.length <= 5;
      },
      message: 'Review can have maximum 5 images'
    }
  },
  
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  
  reported: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// Indexes for efficient queries
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ restaurant: 1, rating: -1 });
ReviewSchema.index({ customer: 1, product: 1 }, { unique: true }); // One review per customer per product

// Virtual: Check if review is recent (within 30 days)
ReviewSchema.virtual('isRecent').get(function(this: IReview) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.createdAt > thirtyDaysAgo;
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
