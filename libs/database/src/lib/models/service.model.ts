import mongoose, { Schema, Document, Model } from 'mongoose';
import { IService, ServiceCategory } from '@automation-ai/types';

// Extend IService with MongoDB Document properties
export interface IServiceDocument extends Omit<IService, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  addTag(tag: string): Promise<IServiceDocument>;
  removeTag(tag: string): Promise<IServiceDocument>;
}

// Define static methods interface
export interface IServiceModel extends Model<IServiceDocument> {
  findByCategory(category: ServiceCategory): Promise<IServiceDocument[]>;
  findByTags(tags: string[]): Promise<IServiceDocument[]>;
  searchByText(searchText: string): Promise<IServiceDocument[]>;
  getPopular(limit?: number): Promise<IServiceDocument[]>;
}

const serviceSchema = new Schema<IServiceDocument>({
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: Object.values(ServiceCategory),
    default: ServiceCategory.OTHER
  },
  serviceShortName: {
    type: String,
    required: [true, 'Service short name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [2, 'Service short name must be at least 2 characters'],
    maxlength: [20, 'Service short name cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Service short name can only contain letters, numbers, hyphens, and underscores']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'services'
});

// Indexes for better performance (excluding serviceShortName as it already has a unique index)
serviceSchema.index({ category: 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ serviceName: 'text', description: 'text' }); // Text search index

// Virtual for id field (to match the interface)
serviceSchema.virtual('id').get(function(this: IServiceDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
serviceSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc: unknown, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Static method to find services by category
serviceSchema.statics.findByCategory = function(category: ServiceCategory) {
  return this.find({ category });
};

// Static method to find services by tags
serviceSchema.statics.findByTags = function(tags: string[]) {
  return this.find({ tags: { $in: tags.map(tag => tag.toLowerCase()) } });
};

// Static method to search services by text
serviceSchema.statics.searchByText = function(searchText: string) {
  return this.find({
    $text: { $search: searchText }
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method to get popular services (placeholder implementation)
serviceSchema.statics.getPopular = function(limit = 10) {
  // In a real implementation, this could be based on usage statistics
  return this.find({}).limit(limit).sort({ createdAt: -1 });
};

// Instance method to add tag
serviceSchema.methods.addTag = function(this: IServiceDocument, tag: string) {
  const normalizedTag = tag.toLowerCase().trim();
  if (!this.tags.includes(normalizedTag)) {
    this.tags.push(normalizedTag);
  }
  return this.save();
};

// Instance method to remove tag
serviceSchema.methods.removeTag = function(this: IServiceDocument, tag: string) {
  const normalizedTag = tag.toLowerCase().trim();
  this.tags = this.tags.filter(t => t !== normalizedTag);
  return this.save();
};

// Export the model using the safe pattern to avoid overwrite errors
const _model = () => mongoose.model<IServiceDocument, IServiceModel>('Service', serviceSchema);
export const Service = (mongoose.models.Service || _model()) as ReturnType<typeof _model>;
export default Service;
