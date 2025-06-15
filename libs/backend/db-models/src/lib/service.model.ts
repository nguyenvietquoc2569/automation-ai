import mongoose, { Schema, Document } from 'mongoose';
import { IService, ServiceCategory } from '@automation-ai/types';

// Extend IService with MongoDB Document properties
export interface IServiceDocument extends Omit<IService, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const serviceSchema = new Schema<IServiceDocument>({
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxLength: [100, 'Service name cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: {
      values: Object.values(ServiceCategory),
      message: 'Invalid service category'
    },
    index: true
  },
  serviceShortName: {
    type: String,
    required: [true, 'Service short name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [1, 'Service short name must be at least 1 character'],
    maxLength: [20, 'Service short name cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9-_]+$/, 'Service short name can only contain letters, numbers, hyphens, and underscores'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxLength: [50, 'Tag cannot exceed 50 characters']
  }]
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'services'
});

// Indexes for better performance
serviceSchema.index({ category: 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ serviceShortName: 1 });

// Text index for search functionality
serviceSchema.index({
  serviceName: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    serviceName: 10,
    description: 5,
    tags: 3
  }
});

// Ensure virtual fields are serialized
serviceSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware
serviceSchema.pre('save', function(next) {
  // Ensure tags are unique and clean
  if (this.tags && Array.isArray(this.tags)) {
    this.tags = [...new Set(this.tags.filter((tag: string) => tag && tag.trim()))];
  }
  
  next();
});

// Static method to find by category
serviceSchema.statics.findByCategory = function(category: string) {
  return this.find({ category }).sort({ serviceName: 1 });
};

// Static method to search services
serviceSchema.statics.searchServices = function(searchTerm: string, options: Record<string, unknown> = {}) {
  const {
    category,
    tags,
    limit = 20,
    page = 1
  } = options;

  const query: Record<string, unknown> = {};
  
  if (category) query.category = category;
  if (tags && Array.isArray(tags) && tags.length > 0) query.tags = { $in: tags };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  return this.find(query)
    .sort(searchTerm ? { score: { $meta: 'textScore' } } : { serviceName: 1 })
    .limit(limit as number)
    .skip(((page as number) - 1) * (limit as number));
};

export const Service = mongoose.model<IServiceDocument>('Service', serviceSchema);

// Export type for the model
export type ServiceModel = typeof Service;
