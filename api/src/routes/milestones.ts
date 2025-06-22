import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { MilestoneResponse } from '../types';

const router = Router();
const prisma = new PrismaClient();

// GET /api/milestones - Get configured milestone tiers
router.get('/', async (req: Request, res: Response) => {
  try {
    const milestones = await prisma.milestone.findMany({
      orderBy: { pintTarget: 'asc' }
    });

    const response: MilestoneResponse[] = milestones.map((milestone: any) => ({
      id: milestone.id,
      name: milestone.name,
      pintTarget: milestone.pintTarget,
      rewardText: milestone.rewardText
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

export default router; 