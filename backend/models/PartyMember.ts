import { Schema, model, Document } from 'mongoose';

export interface IPartyMember extends Document {
  id: string;
  partyId: string;
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
  updatedAt: Date;
}

const PartyMemberSchema = new Schema<IPartyMember>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    partyId: {
      type: String,
      required: true,
      ref: 'Party',
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer',
    },
  },
  { timestamps: true }
);

PartyMemberSchema.index({ partyId: 1, userId: 1 }, { unique: true });

export default model<IPartyMember>('PartyMember', PartyMemberSchema);
