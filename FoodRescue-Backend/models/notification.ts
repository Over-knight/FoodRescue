import mongoose, { Document, Schema } from 'mongoose';

type NotificationType = 
  | 'order_confirmed' 
  | 'order_ready' 
  | 'order_completed' 
  | 'order_cancelled'
  | 'restaurant_verified'
  | 'restaurant_rejected'
  | 'product_low_stock'
  | 'deal_created'
  | 'deal_ending_soon'
  | 'system';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    orderId?: mongoose.Types.ObjectId;
    productId?: mongoose.Types.ObjectId;
    dealId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  
  type: {
    type: String,
    enum: [
      'order_confirmed',
      'order_ready',
      'order_completed',
      'order_cancelled',
      'restaurant_verified',
      'restaurant_rejected',
      'product_low_stock',
      'deal_created',
      'deal_ending_soon',
      'system'
    ],
    required: [true, 'Notification type is required']
  },
  
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readAt: {
    type: Date
  }
  
}, {
  timestamps: true
});

// Indexes for efficient queries
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, createdAt: -1 });

// Helper method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
