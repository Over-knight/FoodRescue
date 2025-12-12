import mongoose, { Document, Schema } from 'mongoose';

type OrderStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type OrderType = 'retail' | 'bulk';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  subtotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  orderType: OrderType;
  
  items: IOrderItem[];
  
  totalAmount: number;
  
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paidAt?: Date;
  
  status: OrderStatus;
  
  pickupCode: string;
  pickupLocation: {
    address: string;
    city: string;
    coordinates?: { lat: number; lng: number; }
  };
  
  scheduledPickupTime?: Date;
  pickedUpAt?: Date;
  
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  confirmOrder(): Promise<any>;
  markReadyForPickup(): Promise<any>;
  completePickup(): Promise<any>;
  cancelOrder(reason: string): Promise<any>;
  markAsPaid(paymentRef: string): Promise<any>;
}

const OrderItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const OrderSchema: Schema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  orderType: {
    type: String,
    enum: ['retail', 'bulk'],
    required: true
  },
  
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: {
      validator: function(items: IOrderItem[]) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  paymentReference: {
    type: String,
    index: true
  },
  
  paidAt: {
    type: Date
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  pickupCode: {
    type: String,
    required: true,
    length: 4,
    uppercase: true,
    index: true
  },
  
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  scheduledPickupTime: {
    type: Date
  },
  
  pickedUpAt: {
    type: Date
  },
  
  notes: {
    type: String,
    maxlength: 500
  },
  
  cancellationReason: {
    type: String,
    maxlength: 200
  },
  
  cancelledAt: {
    type: Date
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ restaurant: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ pickupCode: 1, restaurant: 1 });

// Generate order number and pickup code before validation
OrderSchema.pre('validate', function() {
  if (this.isNew) {
    // Generate order number
    if (!(this as any).orderNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      (this as any).orderNumber = `FR-${timestamp}-${random}`;
    }
    // Generate 4-digit pickup code
    if (!(this as any).pickupCode) {
      (this as any).pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
    }
  }
});

// Virtual: Check if order is pickup ready
OrderSchema.virtual('isPickupReady').get(function(this: IOrder) {
  return this.status === 'ready_for_pickup' && this.paymentStatus === 'paid';
});

// Virtual: Check if order is expired (24 hours after creation, not picked up)
OrderSchema.virtual('isExpired').get(function(this: IOrder) {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  const hoursSinceCreation = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation > 24;
});

// Method: Mark order as confirmed
OrderSchema.methods.confirmOrder = function() {
  this.status = 'confirmed';
  return this.save();
};

// Method: Mark order as ready for pickup
OrderSchema.methods.markReadyForPickup = function() {
  if (this.paymentStatus !== 'paid') {
    throw new Error('Order must be paid before marking ready for pickup');
  }
  this.status = 'ready_for_pickup';
  return this.save();
};

// Method: Complete pickup
OrderSchema.methods.completePickup = function() {
  this.status = 'completed';
  this.pickedUpAt = new Date();
  return this.save();
};

// Method: Cancel order
OrderSchema.methods.cancelOrder = function(reason: string) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Method: Mark payment as successful
OrderSchema.methods.markAsPaid = function(paymentRef: string) {
  this.paymentStatus = 'paid';
  this.paymentReference = paymentRef;
  this.paidAt = new Date();
  
  if (this.status === 'pending') {
    this.status = 'confirmed';
  }
  
  return this.save();
};

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
