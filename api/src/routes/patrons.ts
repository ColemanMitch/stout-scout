import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreatePatronRequest, UpdatePatronRequest, PatronResponse } from '../types';

const router = Router();
const prisma = new PrismaClient();

// GET /api/patrons - List patrons with optional search
router.get('/', async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    
    const where = search 
      ? {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' as const } },
            { email: { contains: search as string, mode: 'insensitive' as const } }
          ]
        }
      : {};

    const patrons = await prisma.patron.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      orderBy: { totalPints: 'desc' }
    });

    const response: PatronResponse[] = patrons.map((patron: any) => ({
      id: patron.id,
      name: patron.name,
      email: patron.email,
      birthday: patron.birthday,
      joinedAt: patron.joinedAt,
      loyaltyProgramJoinedAt: patron.loyaltyProgramJoinedAt,
      totalPints: patron.totalPints,
      avatarUrl: patron.avatarUrl
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching patrons:', error);
    res.status(500).json({ error: 'Failed to fetch patrons' });
  }
});

// GET /api/patrons/:id - Get patron details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const patron = await prisma.patron.findUnique({
      where: { id },
      include: {
        pints: {
          orderBy: { pouredAt: 'desc' },
          take: 10
        }
      }
    });

    if (!patron) {
      return res.status(404).json({ error: 'Patron not found' });
    }

    const response: PatronResponse = {
      id: patron.id,
      name: patron.name,
      email: patron.email,
      birthday: patron.birthday,
      joinedAt: patron.joinedAt,
      loyaltyProgramJoinedAt: patron.loyaltyProgramJoinedAt,
      totalPints: patron.totalPints,
      avatarUrl: patron.avatarUrl
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching patron:', error);
    res.status(500).json({ error: 'Failed to fetch patron' });
  }
});

// POST /api/patrons - Create new patron
router.post('/', async (req, res) => {
  try {
    const { name, email, birthday }: CreatePatronRequest = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const patron = await prisma.patron.create({
      data: { 
        name, 
        email,
        birthday: birthday ? new Date(birthday) : undefined
      }
    });

    const response: PatronResponse = {
      id: patron.id,
      name: patron.name,
      email: patron.email,
      birthday: patron.birthday,
      joinedAt: patron.joinedAt,
      loyaltyProgramJoinedAt: patron.loyaltyProgramJoinedAt,
      totalPints: patron.totalPints,
      avatarUrl: patron.avatarUrl
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating patron:', error);
    res.status(500).json({ error: 'Failed to create patron' });
  }
});

// PATCH /api/patrons/:id - Update patron
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdatePatronRequest = req.body;

    const updateData: any = { ...updates };
    if (updates.birthday) {
      updateData.birthday = new Date(updates.birthday);
    }

    const patron = await prisma.patron.update({
      where: { id },
      data: updateData
    });

    const response: PatronResponse = {
      id: patron.id,
      name: patron.name,
      email: patron.email,
      birthday: patron.birthday,
      joinedAt: patron.joinedAt,
      loyaltyProgramJoinedAt: patron.loyaltyProgramJoinedAt,
      totalPints: patron.totalPints,
      avatarUrl: patron.avatarUrl
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating patron:', error);
    res.status(500).json({ error: 'Failed to update patron' });
  }
});

export default router; 