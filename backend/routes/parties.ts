import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware, { AuthenticatedRequest } from '../middleware/auth';
import Party from '../models/Party';
import PartyMember from '../models/PartyMember';

const router = Router();

// Create a new party
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Party name is required' });
    }

    const partyId = uuidv4();
    const newParty = new Party({
      id: partyId,
      name,
      description,
      createdBy: req.userId,
      members: [req.userId],
    });

    await newParty.save();

    const membershipId = uuidv4();
    const newMembership = new PartyMember({
      id: membershipId,
      partyId,
      userId: req.userId,
      role: 'admin',
    });

    await newMembership.save();

    res.status(201).json({
      message: 'Party created successfully',
      party: newParty,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get all parties for a user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parties = await Party.find({ members: req.userId });
    res.json({ parties });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get a specific party
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const party = await Party.findOne({ id: req.params.id, members: req.userId });

    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }

    res.json({ party });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Add a member to a party
router.post('/:id/members', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, role } = req.body;

    const party = await Party.findOne({ id: req.params.id, createdBy: req.userId });
    if (!party) {
      return res.status(403).json({ message: 'Only the party creator can add members' });
    }

    if (party.members.includes(userId)) {
      return res.status(409).json({ message: 'User is already a member' });
    }

    party.members.push(userId);
    await party.save();

    const membershipId = uuidv4();
    const newMembership = new PartyMember({
      id: membershipId,
      partyId: req.params.id,
      userId,
      role: role || 'viewer',
    });

    await newMembership.save();

    res.json({
      message: 'Member added successfully',
      party,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
