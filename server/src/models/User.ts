import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  displayName: string;
  avatar: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  email:    { type: String, required: true },
  displayName: { type: String, required: true },
  avatar:   { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
