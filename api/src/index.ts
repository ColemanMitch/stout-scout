import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// TODO: Add Clerk JWT middleware here

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test endpoints with direct Prisma usage
app.get('/api/patrons', async (req, res) => {
  try {
    const patrons = await prisma.patron.findMany({
      take: 10,
      orderBy: { totalPints: 'desc' }
    });
    res.json(patrons);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const patrons = await prisma.patron.findMany({
      take: 10,
      orderBy: { totalPints: 'desc' },
      select: {
        id: true,
        name: true,
        totalPints: true
      }
    });
    
    const leaderboard = patrons.map((patron, index) => ({
      patronId: patron.id,
      patronName: patron.name,
      totalPints: patron.totalPints,
      rank: index + 1
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/milestones', async (req, res) => {
  try {
    const milestones = await prisma.milestone.findMany({
      orderBy: { pintTarget: 'asc' }
    });
    res.json(milestones);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/pints - Log multiple pints at once
app.post('/api/pints', async (req, res) => {
  try {
    const { pints } = req.body;
    
    if (!Array.isArray(pints) || pints.length === 0) {
      return res.status(400).json({ error: 'Pints array is required and must not be empty' });
    }

    // Validate each pint entry
    for (const pint of pints) {
      if (!pint.patronId || !pint.bartenderId || !pint.quantity || pint.quantity < 1) {
        return res.status(400).json({ 
          error: 'Each pint must have patronId, bartenderId, and quantity (minimum 1)' 
        });
      }
    }

    // Verify all patrons and bartenders exist
    const patronIds = [...new Set(pints.map(p => p.patronId))];
    const bartenderIds = [...new Set(pints.map(p => p.bartenderId))];

    const patrons = await prisma.patron.findMany({
      where: { id: { in: patronIds } }
    });

    const bartenders = await prisma.user.findMany({
      where: { id: { in: bartenderIds } }
    });

    if (patrons.length !== patronIds.length) {
      return res.status(404).json({ error: 'One or more patrons not found' });
    }

    if (bartenders.length !== bartenderIds.length) {
      return res.status(404).json({ error: 'One or more bartenders not found' });
    }

    // Create pint records and update patron totals
    const createdPints = [];
    const patronUpdates = new Map<string, number>();

    // Calculate total pints per patron
    for (const pint of pints) {
      const current = patronUpdates.get(pint.patronId) || 0;
      patronUpdates.set(pint.patronId, current + pint.quantity);
    }

    // Create all pint records
    for (const pint of pints) {
      for (let i = 0; i < pint.quantity; i++) {
        const createdPint = await prisma.pint.create({
          data: {
            patronId: pint.patronId,
            bartenderId: pint.bartenderId,
            pouredAt: pint.pouredAt ? new Date(pint.pouredAt) : new Date()
          },
          include: {
            patron: true,
            bartender: true
          }
        });
        createdPints.push(createdPint);
      }
    }

    // Update patron totals
    for (const [patronId, additionalPints] of patronUpdates) {
      await prisma.patron.update({
        where: { id: patronId },
        data: { totalPints: { increment: additionalPints } }
      });
    }

    // Format response
    const response = createdPints.map(pint => ({
      id: pint.id,
      patronId: pint.patronId,
      patronName: pint.patron.name,
      pouredAt: pint.pouredAt,
      bartenderId: pint.bartenderId,
      bartenderName: `Bartender ${pint.bartender.id.slice(0, 8)}`
    }));

    res.status(201).json({
      message: `Successfully logged ${createdPints.length} pints`,
      pints: response,
      summary: {
        totalPints: createdPints.length,
        patronsUpdated: patronUpdates.size,
        bartenders: bartenderIds.length
      }
    });

  } catch (error) {
    console.error('Error logging pints:', error);
    res.status(500).json({ error: 'Failed to log pints' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
}); 