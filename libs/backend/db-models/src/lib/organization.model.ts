import mongoose, { Schema, Document } from 'mongoose';
import type { IOrg } from '@automation-ai/types';

// Extend IOrg with MongoDB Document properties
export interface IOrgDocument extends Omit<IOrg, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
  // Override the metaData type for better Mongoose compatibility
  metaData?: Record<string, unknown>;
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
    uppercase: true,
    default: 'USD'
  },
  locale: { 
    type: String, 
    trim: true,
    default: 'en-US'
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
    min: [1, 'Maximum users must be at least 1'],
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

const organizationSchema = new Schema<IOrgDocument>({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    unique: true,
    trim: true,
    maxLength: [100, 'Organization name cannot exceed 100 characters']
  },
  displayName: {
    type: String,
    trim: true,
    maxLength: [100, 'Display name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, 'Please provide a valid domain']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Website must be a valid URL']
  },
  logo: {
    type: String,
    trim: true
  },
  address: addressSchema,
  contactInfo: contactInfoSchema,
  settings: settingsSchema,
  subscription: subscriptionSchema,
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

// Indexes for better performance
organizationSchema.index({ name: 1 });
organizationSchema.index({ domain: 1 });
organizationSchema.index({ active: 1 });
organizationSchema.index({ 'subscription.plan': 1 });

// Virtual for id field (to match the interface)
organizationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
organizationSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware
organizationSchema.pre('save', function(next) {
  // Set displayName to name if not provided
  if (!this.displayName) {
    this.displayName = this.name;
  }
  
  // Set default subscription features based on plan
  if (this.subscription && this.isModified('subscription.plan')) {
    const plan = this.subscription.plan;
    switch (plan) {
      case 'free':
        this.subscription.maxUsers = 5;
        this.subscription.features = ['basic_automation', 'email_support'];
        break;
      case 'basic':
        this.subscription.maxUsers = 25;
        this.subscription.features = ['basic_automation', 'advanced_automation', 'email_support', 'chat_support'];
        break;
      case 'premium':
        this.subscription.maxUsers = 100;
        this.subscription.features = ['basic_automation', 'advanced_automation', 'custom_integrations', 'priority_support', 'analytics'];
        break;
      case 'enterprise':
        this.subscription.maxUsers = -1; // Unlimited
        this.subscription.features = ['all_features', 'dedicated_support', 'custom_development', 'sla_guarantee'];
        break;
    }
  }
  
  next();
});

// Static method to find by domain
organizationSchema.statics.findByDomain = function(domain: string) {
  return this.findOne({ domain: domain.toLowerCase(), active: true });
};

// Static method to find active organizations
organizationSchema.statics.findActive = function() {
  return this.find({ active: true }).sort({ name: 1 });
};

// Static method to find organizations by subscription plan
organizationSchema.statics.findBySubscriptionPlan = function(plan: string) {
  return this.find({ 
    'subscription.plan': plan, 
    active: true 
  }).sort({ createdAt: -1 });
};

// Instance method to check if organization can add more users
organizationSchema.methods.canAddUsers = function(): boolean {
  if (!this.subscription || this.subscription.maxUsers === -1) {
    return true; // Unlimited users
  }
  // Note: This would need to be combined with actual user count from User model
  return true; // Placeholder - implement actual user counting logic
};

// Instance method to upgrade subscription
organizationSchema.methods.upgradeSubscription = function(newPlan: string, validUntil?: Date) {
  this.subscription = this.subscription || {};
  this.subscription.plan = newPlan;
  if (validUntil) {
    this.subscription.validUntil = validUntil;
  }
  return this.save();
};

export const Organization = mongoose.model<IOrgDocument>('Organization', organizationSchema);

// Export type for the model
export type OrganizationModel = typeof Organization;
