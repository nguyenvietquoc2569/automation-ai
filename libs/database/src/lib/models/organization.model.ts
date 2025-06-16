import mongoose, { Schema, Document, Model } from 'mongoose';
import { IOrg } from '@automation-ai/types';

// Extend IOrg with MongoDB Document properties
export interface IOrgDocument extends Omit<IOrg, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
  // Override the metaData type for better Mongoose compatibility
  metaData?: Record<string, unknown>;
  canAddUsers(additionalUsers?: number): boolean;
  upgradeSubscription(newPlan: string, newMaxUsers?: number): Promise<IOrgDocument>;
}

// Define static methods interface
export interface IOrgModel extends Model<IOrgDocument> {
  findBySubscriptionPlan(plan: string): Promise<IOrgDocument[]>;
  findByDomain(domain: string): Promise<IOrgDocument | null>;
  countActive(): Promise<number>;
}

const addressSchema = new Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  zipCode: { type: String, trim: true }
}, { _id: false });

const contactInfoSchema = new Schema({
  email: { 
    type: String, 
    trim: true, 
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: { type: String, trim: true }
}, { _id: false });

const settingsSchema = new Schema({
  timezone: { 
    type: String, 
    trim: true,
    default: 'UTC'
  },
  currency: { 
    type: String, 
    trim: true,
    default: 'USD',
    maxlength: [3, 'Currency code should be 3 characters']
  },
  locale: { 
    type: String, 
    trim: true,
    default: 'en'
  }
}, { _id: false });

const subscriptionSchema = new Schema({
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  maxUsers: {
    type: Number,
    min: [1, 'Max users must be at least 1'],
    default: 5
  },
  features: [{
    type: String,
    trim: true
  }],
  validUntil: {
    type: Date
  }
}, { _id: false });

const orgSchema = new Schema<IOrgDocument>({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [2, 'Organization name must be at least 2 characters'],
    maxlength: [50, 'Organization name cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Organization name can only contain letters, numbers, hyphens, and underscores']
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, 'Please provide a valid domain']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+$/, 'Please provide a valid URL']
  },
  logo: {
    type: String,
    trim: true
  },
  address: {
    type: addressSchema,
    default: {}
  },
  contactInfo: {
    type: contactInfoSchema,
    default: {}
  },
  settings: {
    type: settingsSchema,
    default: {}
  },
  subscription: {
    type: subscriptionSchema,
    default: {}
  },
  active: {
    type: Boolean,
    default: true
  },
  metaData: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'organizations'
});

// Indexes for better performance (excluding name as it already has a unique index)
orgSchema.index({ domain: 1 });
orgSchema.index({ active: 1 });
orgSchema.index({ 'subscription.plan': 1 });

// Virtual for id field (to match the interface)
orgSchema.virtual('id').get(function(this: IOrgDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
orgSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc: unknown, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Static method to find organizations by subscription plan
orgSchema.statics.findBySubscriptionPlan = function(plan: string) {
  return this.find({ 'subscription.plan': plan, active: true });
};

// Static method to find organizations by domain
orgSchema.statics.findByDomain = function(domain: string) {
  return this.findOne({ domain: domain.toLowerCase(), active: true });
};

// Static method to count active organizations
orgSchema.statics.countActive = function() {
  return this.countDocuments({ active: true });
};

// Instance method to check if organization can add more users
orgSchema.methods.canAddUsers = function(this: IOrgDocument, additionalUsers = 1): boolean {
  // Note: You would need to count current users separately and compare with maxUsers
  // This is a placeholder implementation that always returns true
  // In a real implementation, you would:
  // 1. Count current users in this organization
  // 2. Check if (currentUsers + additionalUsers) <= maxUsers
  console.log(`Checking if organization can add ${additionalUsers} users`);
  return true; // Return actual check based on current user count
};

// Instance method to upgrade subscription
orgSchema.methods.upgradeSubscription = function(this: IOrgDocument, newPlan: string, newMaxUsers?: number) {
  if (this.subscription) {
    this.subscription.plan = newPlan as 'free' | 'basic' | 'premium' | 'enterprise';
    if (newMaxUsers) {
      this.subscription.maxUsers = newMaxUsers;
    }
  }
  return this.save();
};

// Export the model using the safe pattern to avoid overwrite errors
const _model = () => mongoose.model<IOrgDocument, IOrgModel>('Organization', orgSchema);
export const Organization = (mongoose.models.Organization || _model()) as ReturnType<typeof _model>;
export default Organization;
