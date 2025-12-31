import { Schema, model, Document } from 'mongoose';

export interface IDocument extends Document {
  id: string;
  title: string;
  content: string;
  partyId: string;
  createdBy: string;
  collaborators: string[];
  status: 'draft' | 'in-review' | 'approved' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    partyId: {
      type: String,
      required: true,
      ref: 'Party',
    },
    createdBy: {
      type: String,
      required: true,
      ref: 'User',
    },
    collaborators: {
      type: [String],
      default: [],
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['draft', 'in-review', 'approved', 'archived'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export default model<IDocument>('Document', DocumentSchema);
