import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';
import {
  ISession,
  SessionStatus,
  SessionType,
  LoginMethod,
  IDeviceInfo,
  ISessionSecurity
} from '@automation-ai/types';

// Extend ISession with MongoDB Document properties
export interface ISessionDocument extends Omit<ISession, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
  generateRefreshToken(): string;
  isExpired(): boolean;
  updateActivity(): Promise<ISessionDocument>;
  revokeSession(): Promise<ISessionDocument>;
  switchOrganization(newOrgId: string): Promise<ISessionDocument>;
}

// Define static methods interface
export interface ISessionModel extends Model<ISessionDocument> {
  findByToken(sessionToken: string): Promise<ISessionDocument | null>;
  findActiveByUser(userId: string): Promise<ISessionDocument[]>;
  findByUserAndOrg(userId: string, orgId: string): Promise<ISessionDocument[]>;
  revokeAllByUser(userId: string): Promise<void>;
  revokeExpiredSessions(): Promise<number>;
  createSession(sessionData: Partial<ISession>): Promise<ISessionDocument>;
  validateToken(sessionToken: string): Promise<ISessionDocument | null>;
}

// Device info sub-schema
const deviceInfoSchema = new Schema<IDeviceInfo>({
  userAgent: { type: String, trim: true },
  ip: { 
    type: String, 
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic IP validation (supports both IPv4 and IPv6)
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return !v || ipv4Regex.test(v) || ipv6Regex.test(v);
      },
      message: 'Invalid IP address format'
    }
  },
  platform: { type: String, trim: true },
  browser: { type: String, trim: true },
  version: { type: String, trim: true },
  os: { type: String, trim: true },
  deviceId: { type: String, trim: true },
  fingerprint: { type: String, trim: true }
}, { _id: false });

// Geolocation sub-schema
const geoLocationSchema = new Schema({
  country: { type: String, trim: true },
  region: { type: String, trim: true },
  city: { type: String, trim: true },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 }
}, { _id: false });

// Session security sub-schema
const sessionSecuritySchema = new Schema<ISessionSecurity>({
  loginMethod: {
    type: String,
    enum: Object.values(LoginMethod),
    required: true,
    default: LoginMethod.PASSWORD
  },
  mfaVerified: { type: Boolean, default: false },
  riskScore: { 
    type: Number, 
    min: 0, 
    max: 100,
    default: 0
  },
  geoLocation: {
    type: geoLocationSchema,
    default: {}
  },
  lastActivity: { type: Date, default: Date.now },
  deviceTrusted: { type: Boolean, default: false }
}, { _id: false });

// Main session schema
const sessionSchema = new Schema<ISessionDocument>({
  sessionToken: {
    type: String,
    required: [true, 'Session token is required'],
    unique: true,
    index: true
  },
  refreshToken: {
    type: String,
    index: true,
    sparse: true // Allow multiple null values
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  currentOrgId: {
    type: String,
    required: [true, 'Current organization ID is required'],
    index: true
  },
  status: {
    type: String,
    enum: Object.values(SessionStatus),
    default: SessionStatus.ACTIVE,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(SessionType),
    default: SessionType.WEB
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: true
  },
  lastAccessAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Cached user data (subset for performance)
  user: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // Cached current organization data
  currentOrg: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // Available organizations for the user
  availableOrgs: [{
    type: Schema.Types.Mixed
  }],
  
  // Security and device information
  security: {
    type: sessionSecuritySchema,
    default: {}
  },
  device: {
    type: deviceInfoSchema,
    default: {}
  },
  
  // Permissions and roles
  permissions: [{
    type: String,
    trim: true
  }],
  roles: [{
    type: String,
    trim: true
  }],
  
  // Session metadata
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'sessions'
});

// Indexes for better performance
sessionSchema.index({ sessionToken: 1 }, { unique: true });
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ userId: 1, currentOrgId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup
sessionSchema.index({ 'security.lastActivity': 1 });
sessionSchema.index({ status: 1, expiresAt: 1 }); // Compound index for cleanup queries

// Virtual for id field (to match the interface)
sessionSchema.virtual('id').get(function(this: ISessionDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
sessionSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc: unknown, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    // Don't expose sensitive tokens in JSON
    delete ret.refreshToken;
    return ret;
  }
});

// Pre-save middleware to update lastAccessAt
sessionSchema.pre('save', function(this: ISessionDocument, next) {
  if (this.isModified('status') || this.isModified('currentOrgId')) {
    this.lastAccessAt = new Date();
    if (this.security) {
      this.security.lastActivity = new Date();
    }
  }
  next();
});

// Instance method to generate refresh token
sessionSchema.methods.generateRefreshToken = function(this: ISessionDocument): string {
  const refreshToken = crypto.randomBytes(32).toString('hex');
  this.refreshToken = refreshToken;
  return refreshToken;
};

// Instance method to check if session is expired
sessionSchema.methods.isExpired = function(this: ISessionDocument): boolean {
  return this.expiresAt < new Date() || this.status !== SessionStatus.ACTIVE;
};

// Instance method to update activity
sessionSchema.methods.updateActivity = function(this: ISessionDocument): Promise<ISessionDocument> {
  this.lastAccessAt = new Date();
  if (this.security) {
    this.security.lastActivity = new Date();
  }
  return this.save();
};

// Instance method to revoke session
sessionSchema.methods.revokeSession = function(this: ISessionDocument): Promise<ISessionDocument> {
  this.status = SessionStatus.REVOKED;
  this.lastAccessAt = new Date();
  return this.save();
};

// Instance method to switch organization
sessionSchema.methods.switchOrganization = function(this: ISessionDocument, newOrgId: string): Promise<ISessionDocument> {
  this.currentOrgId = newOrgId;
  this.lastAccessAt = new Date();
  // Note: In a real implementation, you'd also update the cached org data and permissions
  return this.save();
};

// Static method to find session by token
sessionSchema.statics.findByToken = function(sessionToken: string) {
  return this.findOne({ 
    sessionToken, 
    status: SessionStatus.ACTIVE,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to find active sessions by user
sessionSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ 
    userId, 
    status: SessionStatus.ACTIVE,
    expiresAt: { $gt: new Date() }
  }).sort({ lastAccessAt: -1 });
};

// Static method to find sessions by user and organization
sessionSchema.statics.findByUserAndOrg = function(userId: string, orgId: string) {
  return this.find({ 
    userId, 
    currentOrgId: orgId,
    status: SessionStatus.ACTIVE,
    expiresAt: { $gt: new Date() }
  }).sort({ lastAccessAt: -1 });
};

// Static method to revoke all sessions for a user
sessionSchema.statics.revokeAllByUser = function(userId: string) {
  return this.updateMany(
    { userId, status: SessionStatus.ACTIVE },
    { 
      status: SessionStatus.REVOKED,
      lastAccessAt: new Date()
    }
  );
};

// Static method to clean up expired sessions
sessionSchema.statics.revokeExpiredSessions = function() {
  return this.updateMany(
    { 
      $or: [
        { expiresAt: { $lt: new Date() } },
        { status: { $ne: SessionStatus.ACTIVE } }
      ],
      status: { $ne: SessionStatus.EXPIRED }
    },
    { status: SessionStatus.EXPIRED }
  ).then((result: { modifiedCount: number }) => result.modifiedCount);
};

// Static method to create a new session with proper token generation
sessionSchema.statics.createSession = function(sessionData: Partial<ISession>) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default
  
  const session = new this({
    ...sessionData,
    sessionToken,
    expiresAt: sessionData.expiresAt || defaultExpiry,
    status: SessionStatus.ACTIVE,
    lastAccessAt: new Date()
  });
  
  return session.save();
};

// Static method to validate token and return session
sessionSchema.statics.validateToken = function(sessionToken: string) {
  return this.findOne({ 
    sessionToken, 
    status: SessionStatus.ACTIVE,
    expiresAt: { $gt: new Date() }
  });
};

// Export the model using the safe pattern to avoid overwrite errors
const _model = () => mongoose.model<ISessionDocument, ISessionModel>('Session', sessionSchema);
export const Session = (mongoose.models.Session || _model()) as ReturnType<typeof _model>;
export { SessionStatus, SessionType, LoginMethod };
export default Session;
