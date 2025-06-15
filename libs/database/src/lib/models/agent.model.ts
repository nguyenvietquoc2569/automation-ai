import mongoose, { Schema, Document, Model } from 'mongoose';

// Temporary inline definitions until agent types export issue is resolved
interface IAgent {
  _id?: string;
  agentName: string;
  description?: string;
  serviceId: string;
  organizationId: string;
  isActive: boolean;
  configuration: Record<string, unknown>;
  credentials?: Record<string, string | number | boolean>;
  metadata?: {
    version?: string;
    lastSync?: Date;
    syncInterval?: number;
    retryCount?: number;
    maxRetries?: number;
    [key: string]: string | number | boolean | Date | undefined;
  };
  permissions?: Array<string>;
  restrictions?: {
    rateLimits?: {
      requestsPerMinute?: number;
      requestsPerHour?: number;
      requestsPerDay?: number;
    };
    allowedOperations?: Array<string>;
    forbiddenOperations?: Array<string>;
    timeConstraints?: {
      startTime?: string;
      endTime?: string;
      timezone?: string;
      allowedDays?: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
    };
  };
  status: AgentStatus;
  lastActivity?: Date;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  ERROR = 'error',
  SYNCING = 'syncing',
  CONFIGURING = 'configuring',
  SUSPENDED = 'suspended'
}

// Extend IAgent with MongoDB Document properties
export interface IAgentDocument extends Omit<IAgent, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  activate(): Promise<IAgentDocument>;
  deactivate(): Promise<IAgentDocument>;
  pause(): Promise<IAgentDocument>;
  updateConfiguration(newConfig: Record<string, unknown>): Promise<IAgentDocument>;
  canPerformOperation(operation: string): boolean;
}

// Define static methods interface
export interface IAgentModel extends Model<IAgentDocument> {
  findByOrganization(organizationId: string, activeOnly?: boolean): Promise<IAgentDocument[]>;
  findByService(serviceId: string): Promise<IAgentDocument[]>;
  findByStatus(status: AgentStatus): Promise<IAgentDocument[]>;
  countByOrganization(organizationId: string): Promise<number>;
}

const rateLimitsSchema = new Schema({
  requestsPerMinute: { type: Number, min: 0 },
  requestsPerHour: { type: Number, min: 0 },
  requestsPerDay: { type: Number, min: 0 }
}, { _id: false });

const timeConstraintsSchema = new Schema({
  startTime: { 
    type: String, 
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  endTime: { 
    type: String, 
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  timezone: { 
    type: String,
    default: 'UTC'
  },
  allowedDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }]
}, { _id: false });

const restrictionsSchema = new Schema({
  rateLimits: {
    type: rateLimitsSchema,
    default: {}
  },
  allowedOperations: [{
    type: String,
    trim: true
  }],
  forbiddenOperations: [{
    type: String,
    trim: true
  }],
  timeConstraints: {
    type: timeConstraintsSchema,
    default: {}
  }
}, { _id: false });

const metadataSchema = new Schema({
  version: { type: String, trim: true },
  lastSync: { type: Date },
  syncInterval: { 
    type: Number, 
    min: [1, 'Sync interval must be at least 1 minute']
  },
  retryCount: { 
    type: Number, 
    min: 0,
    default: 0
  },
  maxRetries: { 
    type: Number, 
    min: 0,
    default: 3
  }
}, { 
  _id: false,
  strict: false // Allow additional fields
});

const agentSchema = new Schema<IAgentDocument>({
  agentName: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true,
    maxlength: [100, 'Agent name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  serviceId: {
    type: String,
    required: [true, 'Service ID is required'],
    trim: true
  },
  organizationId: {
    type: String,
    required: [true, 'Organization ID is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  configuration: {
    type: Schema.Types.Mixed,
    default: {}
  },
  credentials: {
    type: Schema.Types.Mixed,
    select: false, // Don't include credentials in queries by default for security
    default: {}
  },
  metadata: {
    type: metadataSchema,
    default: {}
  },
  permissions: [{
    type: String,
    trim: true
  }],
  restrictions: {
    type: restrictionsSchema,
    default: {}
  },
  status: {
    type: String,
    enum: Object.values(AgentStatus),
    default: AgentStatus.INACTIVE
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'agents'
});

// Indexes for better performance
agentSchema.index({ serviceId: 1 });
agentSchema.index({ organizationId: 1 });
agentSchema.index({ status: 1 });
agentSchema.index({ isActive: 1 });
agentSchema.index({ createdBy: 1 });
agentSchema.index({ organizationId: 1, isActive: 1 }); // Compound index
agentSchema.index({ serviceId: 1, status: 1 }); // Compound index

// Virtual for id field (to match the interface)
agentSchema.virtual('id').get(function(this: IAgentDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
agentSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc: unknown, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware to update lastActivity
agentSchema.pre('save', function(this: IAgentDocument, next) {
  if (this.isModified('status') || this.isModified('configuration')) {
    this.lastActivity = new Date();
  }
  next();
});

// Static method to find agents by organization
agentSchema.statics.findByOrganization = function(organizationId: string, activeOnly = true) {
  const query: { organizationId: string; isActive?: boolean } = { organizationId };
  if (activeOnly) {
    query.isActive = true;
  }
  return this.find(query);
};

// Static method to find agents by service
agentSchema.statics.findByService = function(serviceId: string) {
  return this.find({ serviceId, isActive: true });
};

// Static method to find agents by status
agentSchema.statics.findByStatus = function(status: AgentStatus) {
  return this.find({ status, isActive: true });
};

// Static method to count agents by organization
agentSchema.statics.countByOrganization = function(organizationId: string) {
  return this.countDocuments({ organizationId, isActive: true });
};

// Instance method to activate agent
agentSchema.methods.activate = function(this: IAgentDocument) {
  this.status = AgentStatus.ACTIVE;
  this.isActive = true;
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to deactivate agent
agentSchema.methods.deactivate = function(this: IAgentDocument) {
  this.status = AgentStatus.INACTIVE;
  this.isActive = false;
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to pause agent
agentSchema.methods.pause = function(this: IAgentDocument) {
  this.status = AgentStatus.PAUSED;
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to update configuration
agentSchema.methods.updateConfiguration = function(this: IAgentDocument, newConfig: Record<string, unknown>) {
  this.configuration = { ...this.configuration, ...newConfig };
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to check if agent can perform operation
agentSchema.methods.canPerformOperation = function(this: IAgentDocument, operation: string): boolean {
  if (this.restrictions?.forbiddenOperations?.includes(operation)) {
    return false;
  }
  
  if (this.restrictions?.allowedOperations?.length) {
    return this.restrictions.allowedOperations.includes(operation);
  }
  
  return true; // If no restrictions specified, allow all operations
};

export const Agent = mongoose.model<IAgentDocument, IAgentModel>('Agent', agentSchema);
export { AgentStatus };
export default Agent;
