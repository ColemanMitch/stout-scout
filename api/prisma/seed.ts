import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.pint.deleteMany();
  await prisma.patron.deleteMany();
  await prisma.user.deleteMany();
  await prisma.milestone.deleteMany();

  // Create milestones
  console.log('Creating milestones...');
  const milestones = await Promise.all([
    prisma.milestone.create({
      data: {
        name: '25 Pints Club',
        pintTarget: 25,
        rewardText: 'Free Dead Poet T-shirt'
      }
    }),
    prisma.milestone.create({
      data: {
        name: '50 Pints Club',
        pintTarget: 50,
        rewardText: 'Free appetizer with next visit'
      }
    }),
    prisma.milestone.create({
      data: {
        name: '75 Pints Club',
        pintTarget: 75,
        rewardText: 'Free round for your table'
      }
    }),
    prisma.milestone.create({
      data: {
        name: '100 Pints Club',
        pintTarget: 100,
        rewardText: 'Photo on the wall + free dinner'
      }
    }),
    prisma.milestone.create({
      data: {
        name: '250 Pints Club',
        pintTarget: 250,
        rewardText: 'Private party for 10 people'
      }
    }),
    prisma.milestone.create({
      data: {
        name: '500 Pints Club',
        pintTarget: 500,
        rewardText: 'Legendary status + lifetime 10% discount'
      }
    })
  ]);

  // Create bartenders
  console.log('Creating bartenders...');
  const bartenders = await Promise.all([
    prisma.user.create({
      data: {
        role: 'BARTENDER'
      }
    }),
    prisma.user.create({
      data: {
        role: 'BARTENDER'
      }
    }),
    prisma.user.create({
      data: {
        role: 'MANAGER'
      }
    })
  ]);

  // Create patrons with realistic data
  console.log('Creating patrons...');
  const patrons = await Promise.all([
    prisma.patron.create({
      data: {
        name: 'James O\'Connor',
        email: 'james.oconnor@email.com',
        birthday: new Date('1985-03-15'),
        loyaltyProgramJoinedAt: new Date('2023-01-15'),
        totalPints: 127
      }
    }),
    prisma.patron.create({
      data: {
        name: 'Sarah Murphy',
        email: 'sarah.murphy@email.com',
        birthday: new Date('1992-07-22'),
        loyaltyProgramJoinedAt: new Date('2023-02-03'),
        totalPints: 89
      }
    }),
    prisma.patron.create({
      data: {
        name: 'Michael Walsh',
        email: 'michael.walsh@email.com',
        birthday: new Date('1978-11-08'),
        loyaltyProgramJoinedAt: new Date('2022-11-20'),
        totalPints: 203
      }
    }),
    prisma.patron.create({
      data: {
        name: 'Emma Fitzgerald',
        email: 'emma.fitzgerald@email.com',
        birthday: new Date('1990-04-12'),
        loyaltyProgramJoinedAt: new Date('2023-03-10'),
        totalPints: 45
      }
    }),
    prisma.patron.create({
      data: {
        name: 'Patrick Byrne',
        email: 'patrick.byrne@email.com',
        birthday: new Date('1983-09-30'),
        loyaltyProgramJoinedAt: new Date('2022-08-15'),
        totalPints: 156
      }
    }),
    prisma.patron.create({
      data: {
        name: 'Aoife Kennedy',
        email: 'aoife.kennedy@email.com',
        birthday: new Date('1995-12-05'),
        loyaltyProgramJoinedAt: new Date('2023-04-22'),
        totalPints: 23
      }
    }),
    prisma.patron.create({
      data: {
        name: 'Sean Gallagher',
        email: 'sean.gallagher@email.com',
        birthday: new Date('1987-06-18'),
        loyaltyProgramJoinedAt: new Date('2022-12-01'),
        totalPints: 78
      }
    }),
    prisma.patron.create({
      data: {
        name: 'Ciara O\'Brien',
        email: 'ciara.obrien@email.com',
        birthday: new Date('1991-01-25'),
        loyaltyProgramJoinedAt: new Date('2023-01-08'),
        totalPints: 112
      }
    }),
    prisma.patron.create({
      data: {
        name: 'Thomas Ryan',
        email: 'thomas.ryan@email.com',
        birthday: new Date('1980-08-14'),
        loyaltyProgramJoinedAt: new Date('2022-09-12'),
        totalPints: 189
      }
    }),
    prisma.patron.create({
      data: {
        name: 'Niamh Connolly',
        email: 'niamh.connolly@email.com',
        birthday: new Date('1988-05-03'),
        loyaltyProgramJoinedAt: new Date('2023-02-28'),
        totalPints: 67
      }
    })
  ]);

  // Create sample pint records (last 30 days)
  console.log('Creating sample pint records...');
  const pintRecords: Array<{
    patronId: string;
    bartenderId: string;
    pouredAt: Date;
  }> = [];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const patron = patrons[Math.floor(Math.random() * patrons.length)];
    const bartender = bartenders[Math.floor(Math.random() * bartenders.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    
    const pouredAt = new Date(now);
    pouredAt.setDate(pouredAt.getDate() - daysAgo);
    pouredAt.setHours(pouredAt.getHours() - hoursAgo);
    pouredAt.setMinutes(pouredAt.getMinutes() - minutesAgo);

    pintRecords.push({
      patronId: patron.id,
      bartenderId: bartender.id,
      pouredAt
    });
  }

  await prisma.pint.createMany({
    data: pintRecords
  });

  console.log('✅ Seed completed successfully!');
  console.log(`Created ${milestones.length} milestones`);
  console.log(`Created ${bartenders.length} users (bartenders/managers)`);
  console.log(`Created ${patrons.length} patrons`);
  console.log(`Created ${pintRecords.length} pint records`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 