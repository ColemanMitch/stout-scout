import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreatePintRequest, PintResponse } from '../types';

const router = Router();
const prisma = new PrismaClient();

// POST /api/pints - Log a new pint
router.post('/', async (req: Request, res: Response) => {
  try {
    const { patronId, bartenderId }: CreatePintRequest = req.body;

    if (!patronId || !bartenderId) {
      return res.status(400).json({ error: 'Patron ID and Bartender ID are required' });
    }

    // Verify patron exists
    const patron = await prisma.patron.findUnique({
      where: { id: patronId }
    });

    if (!patron) {
      return res.status(404).json({ error: 'Patron not found' });
    }

    // Verify bartender exists
    const bartender = await prisma.user.findUnique({
      where: { id: bartenderId }
    });

    if (!bartender) {
      return res.status(404).json({ error: 'Bartender not found' });
    }

    // Create pint and update patron's total
    const pint = await prisma.pint.create({
      data: { patronId, bartenderId },
      include: {
        patron: true,
        bartender: true
      }
    });

    // Update patron's total pints
    await prisma.patron.update({
      where: { id: patronId },
      data: { totalPints: { increment: 1 } }
    });

    const response: PintResponse = {
      id: pint.id,
      patronId: pint.patronId,
      patronName: pint.patron.name,
      pouredAt: pint.pouredAt,
      bartenderId: pint.bartenderId,
      bartenderName: `Bartender ${pint.bartender.id.slice(0, 8)}`
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error logging pint:', error);
    res.status(500).json({ error: 'Failed to log pint' });
  }
});

// GET /api/pints - List pints with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { patronId, limit = 50, offset = 0 } = req.query;
    
    const where = patronId ? { patronId: patronId as string } : {};

    const pints = await prisma.pint.findMany({
      where,
      include: {
        patron: true,
        bartender: true
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { pouredAt: 'desc' }
    });

    const response: PintResponse[] = pints.map((pint: any) => ({
      id: pint.id,
      patronId: pint.patronId,
      patronName: pint.patron.name,
      pouredAt: pint.pouredAt,
      bartenderId: pint.bartenderId,
      bartenderName: `Bartender ${pint.bartender.id.slice(0, 8)}`
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching pints:', error);
    res.status(500).json({ error: 'Failed to fetch pints' });
  }
});

// PATCH /api/pints/:id - Correct/delete a pint (bartender only)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'delete' or 'correct'

    const pint = await prisma.pint.findUnique({
      where: { id },
      include: { patron: true }
    });

    if (!pint) {
      return res.status(404).json({ error: 'Pint not found' });
    }

    if (action === 'delete') {
      // Delete pint and decrement patron's total
      await prisma.pint.delete({ where: { id } });
      await prisma.patron.update({
        where: { id: pint.patronId },
        data: { totalPints: { decrement: 1 } }
      });
      
      res.json({ message: 'Pint deleted successfully' });
    } else {
      res.status(400).json({ error: 'Invalid action. Use "delete" to remove a pint.' });
    }
  } catch (error) {
    console.error('Error updating pint:', error);
    res.status(500).json({ error: 'Failed to update pint' });
  }
});

export default router; 