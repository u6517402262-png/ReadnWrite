import { Schema, model, Document } from 'mongoose';

export interface IParty extends Document {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PartySchema = new Schema<IParty>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    createdBy: {
      type: String,
      required: true,
      ref: 'User',
    },
    members: {
      type: [String],
      default: [],
      ref: 'User',
    },
    documents: {
      type: [String],
      default: [],
      ref: 'Document',
    },
  },
  { timestamps: true }
);

export default model<IParty>('Party', PartySchema);
