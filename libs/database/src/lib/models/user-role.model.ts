import mongoose, { Schema, Document, Model } from 'mongoose';

// UserRole interface - junction table for User-Role relationship within an organization
export interface IUserRole {
  _id?: string;
  userId: string;
  roleId: string;
  organizationId: string;
  assignedAt?: Date;
  assignedBy?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend IUserRole with MongoDB Document properties
export interface IUserRoleDocument extends Omit<IUserRole, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Define static methods interface
export interface IUserRoleModel extends Model<IUserRoleDocument> {
  findByUser(userId: string, orgId?: string): Promise<IUserRoleDocument[]>;
  findByRole(roleId: string): Promise<IUserRoleDocument[]>;
  findByOrganization(orgId: string): Promise<IUserRoleDocument[]>;
  assignRole(userId: string, roleId: string, orgId: string, assignedBy?: string): Promise<IUserRoleDocument>;
  removeRole(userId: string, roleId: string, orgId: string): Promise<boolean>;
  getUserRolesInOrg(userId: string, orgId: string): Promise<IUserRoleDocument[]>;
}

const userRoleSchema = new Schema<IUserRoleDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  roleId: {
    type: String,
    required: true,
    index: true
  },
  organizationId: {
    type: String,
    required: true,
    index: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  assignedBy: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'user_roles'
});

// Compound indexes for better performance and to prevent duplicates
userRoleSchema.index({ userId: 1, roleId: 1, organizationId: 1 }, { unique: true });
userRoleSchema.index({ userId: 1, organizationId: 1 });
userRoleSchema.index({ roleId: 1, organizationId: 1 });
userRoleSchema.index({ organizationId: 1, isActive: 1 });

// Virtual for id field
userRoleSchema.virtual('id').get(function(this: IUserRoleDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
userRoleSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc: unknown, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Static method to find user roles
userRoleSchema.statics.findByUser = function(userId: string, orgId?: string) {
  const query: { userId: string; isActive: boolean; organizationId?: string } = { userId, isActive: true };
  if (orgId) {
    query.organizationId = orgId;
  }
  return this.find(query).populate('roleId').populate('organizationId');
};

// Static method to find users with a specific role
userRoleSchema.statics.findByRole = function(roleId: string) {
  return this.find({ roleId, isActive: true }).populate('userId').populate('organizationId');
};

// Static method to find all role assignments in an organization
userRoleSchema.statics.findByOrganization = function(orgId: string) {
  return this.find({ organizationId: orgId, isActive: true }).populate('userId').populate('roleId');
};

// Static method to assign a role to a user
userRoleSchema.statics.assignRole = function(userId: string, roleId: string, orgId: string, assignedBy?: string) {
  return this.create({
    userId,
    roleId,
    organizationId: orgId,
    assignedBy,
    assignedAt: new Date(),
    isActive: true
  });
};

// Static method to remove a role from a user
userRoleSchema.statics.removeRole = async function(userId: string, roleId: string, orgId: string) {
  const result = await this.updateOne(
    { userId, roleId, organizationId: orgId },
    { isActive: false }
  );
  return result.modifiedCount > 0;
};

// Static method to get all roles for a user in a specific organization
userRoleSchema.statics.getUserRolesInOrg = function(userId: string, orgId: string) {
  return this.find({
    userId,
    organizationId: orgId,
    isActive: true
  }).populate('roleId');
};

// Export the model using the safe pattern to avoid overwrite errors
const _model = () => mongoose.model<IUserRoleDocument, IUserRoleModel>('UserRole', userRoleSchema);
export const UserRole = (mongoose.models.UserRole || _model()) as ReturnType<typeof _model>;
export default UserRole;