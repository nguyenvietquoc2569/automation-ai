import mongoose, { Schema, Document, Model } from 'mongoose';

// Role interface
export interface IRole {
  _id?: string;
  name: string;
  displayName?: string;
  description?: string;
  organizationId: string;
  permissions: string[];
  isActive: boolean;
  isSystemRole?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend IRole with MongoDB Document properties
export interface IRoleDocument extends Omit<IRole, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  addPermission(permission: string): Promise<IRoleDocument>;
  removePermission(permission: string): Promise<IRoleDocument>;
  hasPermission(permission: string): boolean;
}

// Define static methods interface
export interface IRoleModel extends Model<IRoleDocument> {
  findByOrganization(orgId: string): Promise<IRoleDocument[]>;
  findOwnerRole(orgId: string): Promise<IRoleDocument | null>;
  createOwnerRole(orgId: string): Promise<IRoleDocument>;
}

const roleSchema = new Schema<IRoleDocument>({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true,
    maxlength: [50, 'Role name cannot exceed 50 characters']
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
  organizationId: {
    type: String,
    required: true,
    index: true
  },
  permissions: [{
    type: String,
    trim: true,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystemRole: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'roles'
});

// Compound indexes for better performance
roleSchema.index({ organizationId: 1, name: 1 }, { unique: true });
roleSchema.index({ organizationId: 1, isActive: 1 });

// Virtual for id field
roleSchema.virtual('id').get(function(this: IRoleDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
roleSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc: unknown, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Instance method to add permission
roleSchema.methods.addPermission = function(this: IRoleDocument, permission: string) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this.save();
};

// Instance method to remove permission
roleSchema.methods.removePermission = function(this: IRoleDocument, permission: string) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this.save();
};

// Instance method to check permission
roleSchema.methods.hasPermission = function(this: IRoleDocument, permission: string) {
  return this.permissions.includes(permission);
};

// Static method to find roles by organization
roleSchema.statics.findByOrganization = function(orgId: string) {
  return this.find({
    organizationId: orgId,
    isActive: true
  });
};

// Static method to find owner role
roleSchema.statics.findOwnerRole = function(orgId: string) {
  return this.findOne({
    organizationId: orgId,
    name: 'owner',
    isSystemRole: true,
    isActive: true
  });
};

// Static method to create owner role
roleSchema.statics.createOwnerRole = function(orgId: string) {
  return this.create({
    name: 'owner',
    displayName: 'Organization Owner',
    description: 'Full administrative access to the organization',
    organizationId: orgId,
    permissions: [
      'org.owner',
      'org.service.subscribe', 
      'org.service.unsubscribe',
      'org.manage',
      'org.delete',
      'org.users.manage',
      'org.roles.manage',
      'org.billing.manage'
    ],
    isActive: true,
    isSystemRole: true
  });
};

// Export the model using the safe pattern to avoid overwrite errors
const _model = () => mongoose.model<IRoleDocument, IRoleModel>('Role', roleSchema);
export const Role = (mongoose.models.Role || _model()) as ReturnType<typeof _model>;
export default Role;