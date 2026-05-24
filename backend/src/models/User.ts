import { InferSchemaType, Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, default: null, select: false },
    authProvider: { type: String, enum: ['local', 'clerk'], default: 'local' },
    clerkId: { type: String, default: null, unique: true, sparse: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: { type: [Number], default: [0, 0] }
    },
    lastActive: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.index({ location: '2dsphere' });

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };
export const UserModel = model('User', userSchema);
