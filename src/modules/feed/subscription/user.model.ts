import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  id: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  expireDate: { type: Date, required: true },
  quota: { type: Number, default: 30 },
  token: { type: String, unique: true, required: true },
});

export const User = model('User', userSchema, 'user');