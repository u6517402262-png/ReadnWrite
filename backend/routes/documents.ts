import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware, { AuthenticatedRequest } from '../middleware/auth';
import Document from '../models/Document';
import Party from '../models/Party';

const router = Router();

// Create a new document
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, partyId } = req.body;

    if (!title || !content || !partyId) {
      return res.status(400).json({ message: 'Title, content, and partyId are required' });
    }

    const party = await Party.findOne({ id: partyId, members: req.userId });
    if (!party) {
      return res.status(403).json({ message: 'You do not have access to this party' });
    }

    const documentId = uuidv4();
    const newDocument = new Document({
      id: documentId,
      title,
      content,
      partyId,
      createdBy: req.userId,
      collaborators: [req.userId],
    });

    await newDocument.save();

    party.documents.push(documentId);
    await party.save();

    res.status(201).json({
      message: 'Document created successfully',
      document: newDocument,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get all documents for a party
router.get('/party/:partyId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const party = await Party.findOne({ id: req.params.partyId, members: req.userId });
    if (!party) {
      return res.status(403).json({ message: 'You do not have access to this party' });
    }

    const documents = await Document.find({ partyId: req.params.partyId });
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get a specific document
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const document = await Document.findOne({ id: req.params.id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const party = await Party.findOne({ id: document.partyId, members: req.userId });
    if (!party) {
      return res.status(403).json({ message: 'You do not have access to this document' });
    }

    res.json({ document });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Update a document
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, status } = req.body;
    const document = await Document.findOne({ id: req.params.id });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.collaborators.includes(req.userId!) && document.createdBy !== req.userId) {
      return res.status(403).json({ message: 'You do not have permission to edit this document' });
    }

    if (title) document.title = title;
    if (content) document.content = content;
    if (status) document.status = status;

    await document.save();

    res.json({
      message: 'Document updated successfully',
      document,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Delete a document
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const document = await Document.findOne({ id: req.params.id });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.createdBy !== req.userId) {
      return res.status(403).json({ message: 'Only the creator can delete this document' });
    }

    await Document.deleteOne({ id: req.params.id });

    const party = await Party.findOne({ id: document.partyId });
    if (party) {
      party.documents = party.documents.filter((docId) => docId !== req.params.id);
      await party.save();
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
