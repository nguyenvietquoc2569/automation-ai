import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '@automation-ai/types';

// Extend IUser with MongoDB Document properties
export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateResetToken(): string;
}

// Define static methods interface
export interface IUserModel extends Model<IUserDocument> {
  findByEmailOrUsername(identifier: string): Promise<IUserDocument | null>;
  findActiveInOrganization(orgId: string): Promise<IUserDocument[]>;
  countByPermission(permission: string): Promise<number>;
}

const userSchema = new Schema<IUserDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores']
  },
  ename: {
    type: String,
    required: [true, 'English name is required'],
    trim: true,
    maxlength: [100, 'English name cannot exceed 100 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  emailid: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  permissions: [{
    type: String,
    trim: true
  }],
  active: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  avatar: {
    type: String,
    trim: true
  },

  currentOrgId: {
    type: String,
    trim: true
  },
  metaData: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'users'
});

// Indexes for better performance (excluding username and emailid as they already have unique indexes)
userSchema.index({ active: 1 });
userSchema.index({ currentOrgId: 1 });

// Virtual for id field (to match the interface)
userSchema.virtual('id').get(function(this: IUserDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc: unknown, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(this: IUserDocument, next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(this: IUserDocument, candidatePassword: string): Promise<boolean> {
  try {
    if (!candidatePassword || !this.password) {
      throw new Error('Password data is required for comparison');
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Instance method to generate reset token
userSchema.methods.generateResetToken = function(this: IUserDocument): string {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  return token;
};

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = function(identifier: string) {
  return this.findOne({
    $or: [
      { emailid: identifier.toLowerCase() },
      { username: identifier.toLowerCase() }
    ]
  });
};

// Static method to find active users in organization using UserRole
userSchema.statics.findActiveInOrganization = async function(orgId: string) {
  const userRoles = await mongoose.model('UserRole').find({
    organizationId: orgId,
    isActive: true
  });
  
  const userIds = userRoles.map(ur => ur.userId);
  
  return this.find({
    _id: { $in: userIds },
    active: true
  });
};

// Static method to count users by permissions
userSchema.statics.countByPermission = function(permission: string) {
  return this.countDocuments({ permissions: permission });
};

// Export the model using the safe pattern to avoid overwrite errors
const _model = () => mongoose.model<IUserDocument, IUserModel>('User', userSchema);
export const User = (mongoose.models.User || _model()) as ReturnType<typeof _model>;
export default User;
