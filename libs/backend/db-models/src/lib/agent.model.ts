import mongoose, { Schema, Document } from 'mongoose';
import { IAgent, AgentStatus } from '@automation-ai/types';

// Extend IAgent with MongoDB Document properties
export interface IAgentDocument extends Omit<IAgent, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
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
  rateLimits: rateLimitsSchema,
  allowedOperations: [{ type: String, trim: true }],
  forbiddenOperations: [{ type: String, trim: true }],
  timeConstraints: timeConstraintsSchema
}, { _id: false });

const metadataSchema = new Schema({
  version: { type: String, default: '1.0.0' },
  lastSync: { type: Date },
  syncInterval: { 
    type: Number, 
    min: [1, 'Sync interval must be at least 1 minute'],
    default: 30
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
}, { _id: false, strict: false }); // Allow additional fields

const agentSchema = new Schema<IAgentDocument>({
  agentName: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true,
    maxLength: [100, 'Agent name cannot exceed 100 characters'],
    match: [/^[a-zA-Z0-9\s\-_.]+$/, 'Agent name can only contain alphanumeric characters, spaces, hyphens, underscores, and dots']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  serviceId: {
    type: String,
    required: [true, 'Service ID is required'],
    index: true
  },
  organizationId: {
    type: String,
    required: [true, 'Organization ID is required'],
    index: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  configuration: {
    type: Schema.Types.Mixed,
    required: [true, 'Configuration is required'],
    default: {}
  },
  credentials: {
    type: Schema.Types.Mixed,
    select: false // Don't include credentials in queries by default
  },
  metadata: {
    type: metadataSchema,
    default: () => ({})
  },
  permissions: [{
    type: String,
    trim: true
  }],
  restrictions: restrictionsSchema,
  status: {
    type: String,
    enum: {
      values: Object.values(AgentStatus),
      message: 'Invalid agent status'
    },
    required: true,
    default: AgentStatus.CONFIGURING,
    index: true
  },
  lastActivity: {
    type: Date,
    index: true
  },
  createdBy: {
    type: String
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'agents'
});

// Compound indexes for better query performance
agentSchema.index({ serviceId: 1, organizationId: 1 });
agentSchema.index({ organizationId: 1, isActive: 1 });
agentSchema.index({ serviceId: 1, status: 1 });
agentSchema.index({ status: 1, lastActivity: -1 });
agentSchema.index({ createdBy: 1, createdAt: -1 });

// Ensure virtual fields are serialized
agentSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc, ret) {
    delete ret.__v;
    // Don't expose credentials in JSON
    delete ret.credentials;
    return ret;
  }
});

// Pre-save middleware
agentSchema.pre('save', function(next) {
  // Update lastActivity when agent is modified
  if (this.isModified() && !this.isModified('lastActivity')) {
    this.lastActivity = new Date();
  }
  
  next();
});

// Static method to find agents by service
agentSchema.statics.findByService = function(serviceId: string, active?: boolean) {
  const query: Record<string, unknown> = { serviceId };
  if (active !== undefined) query.isActive = active;
  return this.find(query).populate('serviceId', 'serviceName serviceShortName');
};

// Static method to find agents by organization
agentSchema.statics.findByOrganization = function(organizationId: string, active?: boolean) {
  const query: Record<string, unknown> = { organizationId };
  if (active !== undefined) query.isActive = active;
  return this.find(query)
    .populate('serviceId', 'serviceName serviceShortName category')
    .sort({ lastActivity: -1 });
};

// Static method to find agents by status
agentSchema.statics.findByStatus = function(status: AgentStatus) {
  return this.find({ status })
    .populate('serviceId', 'serviceName')
    .populate('organizationId', 'name displayName')
    .sort({ lastActivity: -1 });
};

// Static method to find active agents
agentSchema.statics.findActive = function() {
  return this.find({ 
    isActive: true, 
    status: { $in: [AgentStatus.ACTIVE, AgentStatus.SYNCING] }
  });
};

// Instance method to activate agent
agentSchema.methods.activate = function() {
  this.isActive = true;
  this.status = AgentStatus.ACTIVE;
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to deactivate agent
agentSchema.methods.deactivate = function() {
  this.isActive = false;
  this.status = AgentStatus.INACTIVE;
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to pause agent
agentSchema.methods.pause = function() {
  this.status = AgentStatus.PAUSED;
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to resume agent
agentSchema.methods.resume = function() {
  this.isActive = true;
  this.status = AgentStatus.ACTIVE;
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to set error status
agentSchema.methods.setError = function() {
  this.status = AgentStatus.ERROR;
  this.lastActivity = new Date();
  return this.save();
};

export const Agent = mongoose.model<IAgentDocument>('Agent', agentSchema);

// Export type for the model
export type AgentModel = typeof Agent;
