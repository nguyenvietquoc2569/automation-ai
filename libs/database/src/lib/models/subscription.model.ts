import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  _id: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  status: 'active' | 'inactive' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'subscriptions'
});

// Compound index for efficient queries
subscriptionSchema.index({ serviceId: 1, userId: 1 }, { unique: true });
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ serviceId: 1, status: 1 });

// Export the model using the safe pattern to avoid overwrite errors
const _model = () => mongoose.model<ISubscription>('Subscription', subscriptionSchema);
export const Subscription = (mongoose.models.Subscription || _model()) as ReturnType<typeof _model>;
export default Subscription;
