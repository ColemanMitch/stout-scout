import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { LeaderboardEntry } from '../types';

const router = Router();
const prisma = new PrismaClient();

// GET /api/leaderboard - Get top patrons by total pints
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const patrons = await prisma.patron.findMany({
      take: Number(limit),
      skip: Number(offset),
      orderBy: { totalPints: 'desc' },
      select: {
        id: true,
        name: true,
        totalPints: true
      }
    });

    const response: LeaderboardEntry[] = patrons.map((patron: any, index: number) => ({
      patronId: patron.id,
      patronName: patron.name,
      totalPints: patron.totalPints,
      rank: Number(offset) + index + 1
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router; 