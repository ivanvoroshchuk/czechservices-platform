import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import regionsData from '../src/modules/locations/data/czech-regions.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── Regions & Cities ──
  console.log('📍 Seeding regions and cities...');
  const regionMap = new Map<string, string>();
  const cityMap = new Map<string, string>();

  for (const r of regionsData.regions) {
    const region = await prisma.region.upsert({
      where: { code: r.id },
      create: { name: r.name, code: r.id, displayOrder: r.displayOrder },
      update: { name: r.name, displayOrder: r.displayOrder },
    });
    regionMap.set(r.id, region.id);

    for (const c of r.cities) {
      const city = await prisma.city.upsert({
        where: { regionId_name: { regionId: region.id, name: c.name } },
        create: { name: c.name, regionId: region.id, zipCode: c.zipCode },
        update: { zipCode: c.zipCode },
      });
      cityMap.set(`${r.id}:${c.name}`, city.id);
    }
  }
  console.log(`✅ ${regionMap.size} regions, ${cityMap.size} cities`);

  // ── Service Types ──
  console.log('🛠  Seeding service types...');
  const services = [
    { name: 'MASSAGE', label: 'Masáž', description: 'Různé druhy masáží', icon: '💆', displayOrder: 1 },
    { name: 'CONSULTATION', label: 'Konzultace', description: 'Odborné konzultace', icon: '💬', displayOrder: 2 },
    { name: 'PHOTO_SESSION', label: 'Focení', description: 'Profesionální focení', icon: '📸', displayOrder: 3 },
    { name: 'STUDIO_RECORDING', label: 'Nahrávání', description: 'Studiové nahrávání', icon: '🎙️', displayOrder: 4 },
    { name: 'FITNESS', label: 'Fitness', description: 'Osobní trénink', icon: '💪', displayOrder: 5 },
    { name: 'YOGA', label: 'Jóga', description: 'Jóga a meditace', icon: '🧘', displayOrder: 6 },
    { name: 'BEAUTY', label: 'Kosmetika', description: 'Kosmetické služby', icon: '💄', displayOrder: 7 },
    { name: 'DANCE', label: 'Tanec', description: 'Taneční lekce', icon: '💃', displayOrder: 8 },
  ];

  const serviceMap = new Map<string, string>();
  for (const s of services) {
    const svc = await prisma.service.upsert({
      where: { name: s.name },
      create: s,
      update: { label: s.label, displayOrder: s.displayOrder },
    });
    serviceMap.set(s.name, svc.id);
  }
  console.log(`✅ ${serviceMap.size} service types`);

  // ── Users ──
  console.log('👤 Seeding users...');
  const hash = await bcrypt.hash('Password123!', 10);

  const pragueRegionId = regionMap.get('CZ010')!;
  const pragueCityId = cityMap.get('CZ010:Praha 1')!;
  const brnoCityId = cityMap.get('CZ064:Brno')!;
  const brnoRegionId = regionMap.get('CZ064')!;

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@czechservices.cz' },
    create: {
      email: 'admin@czechservices.cz',
      phone: '+420700000001',
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'Czech',
      dateOfBirth: new Date('1985-01-01'),
      role: 'ADMIN',
      isAgeVerified: true,
      ageVerificationStatus: 'VERIFIED',
    },
    update: {},
  });

  // Provider users
  const providers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'katerina@example.com' },
      create: {
        email: 'katerina@example.com',
        phone: '+420777111111',
        passwordHash: hash,
        firstName: 'Kateřina',
        lastName: 'Nováková',
        dateOfBirth: new Date('1992-03-15'),
        isAgeVerified: true,
        ageVerificationStatus: 'VERIFIED',
      },
      update: {},
    }),
    prisma.user.upsert({
      where: { email: 'jakub@example.com' },
      create: {
        email: 'jakub@example.com',
        phone: '+420777222222',
        passwordHash: hash,
        firstName: 'Jakub',
        lastName: 'Dvořák',
        dateOfBirth: new Date('1988-07-22'),
        isAgeVerified: true,
        ageVerificationStatus: 'VERIFIED',
      },
      update: {},
    }),
    prisma.user.upsert({
      where: { email: 'lucie@example.com' },
      create: {
        email: 'lucie@example.com',
        phone: '+420777333333',
        passwordHash: hash,
        firstName: 'Lucie',
        lastName: 'Procházková',
        dateOfBirth: new Date('1995-11-08'),
        isAgeVerified: true,
        ageVerificationStatus: 'VERIFIED',
      },
      update: {},
    }),
  ]);

  // Client user
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    create: {
      email: 'client@example.com',
      phone: '+420777444444',
      passwordHash: hash,
      firstName: 'Petr',
      lastName: 'Klimánek',
      dateOfBirth: new Date('1990-05-20'),
    },
    update: {},
  });

  console.log(`✅ ${providers.length + 2} users created`);

  // ── Profiles ──
  console.log('📋 Seeding profiles...');

  const profileData = [
    {
      user: providers[0],
      regionId: pragueRegionId,
      cityId: pragueCityId,
      bio: 'Certifikovaná masérka s 8 lety zkušeností. Specializuji se na sportovní a relaxační masáže. Absolvovala jsem kurzy v Praze a Vídni.',
      title: 'Certifikovaná masérka',
      yearsExperience: 8,
      address: 'Václavské náměstí 15, Praha 1',
      services: [
        { name: 'MASSAGE', title: 'Sportovní masáž', price: 150000, duration: 60 },
        { name: 'FITNESS', title: 'Osobní trénink', price: 100000, duration: 60 },
      ],
    },
    {
      user: providers[1],
      regionId: pragueRegionId,
      cityId: cityMap.get('CZ010:Praha 2')!,
      bio: 'Profesionální fotograf s 12 lety praxe. Specializuji se na portréty, módní focení a komerční fotografii.',
      title: 'Profesionální fotograf',
      yearsExperience: 12,
      address: 'Náměstí Míru 8, Praha 2',
      services: [
        { name: 'PHOTO_SESSION', title: 'Portrétní focení', price: 300000, duration: 120 },
        { name: 'PHOTO_SESSION', title: 'Módní focení', price: 500000, duration: 180 },
      ],
    },
    {
      user: providers[2],
      regionId: brnoRegionId,
      cityId: brnoCityId,
      bio: 'Instruktorka jógy a meditace s 6 lety zkušeností. Lekce přizpůsobuji každému individuálně - od začátečníků po pokročilé.',
      title: 'Instruktorka jógy',
      yearsExperience: 6,
      address: 'Náměstí Svobody 3, Brno',
      services: [
        { name: 'YOGA', title: 'Individuální lekce jógy', price: 80000, duration: 60 },
        { name: 'YOGA', title: 'Meditační sezení', price: 60000, duration: 45 },
      ],
    },
  ];

  for (const pd of profileData) {
    const existingProfile = await prisma.profile.findUnique({ where: { userId: pd.user.id } });
    if (existingProfile) continue;

    const profile = await prisma.profile.create({
      data: {
        userId: pd.user.id,
        bio: pd.bio,
        title: pd.title,
        yearsExperience: pd.yearsExperience,
        regionId: pd.regionId,
        cityId: pd.cityId,
        address: pd.address,
        isPublished: true,
        publicationDate: new Date(),
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 20) + 5,
      },
    });

    // Add profile services
    for (const svc of pd.services) {
      const serviceId = serviceMap.get(svc.name)!;
      const existing = await prisma.profileService.findUnique({
        where: { profileId_serviceId: { profileId: profile.id, serviceId } },
      });
      if (existing) continue;

      const ps = await prisma.profileService.create({
        data: {
          profileId: profile.id,
          serviceId,
          title: svc.title,
          pricePerHour: svc.price,
          durationMinutes: svc.duration,
          languages: ['cs', 'en'],
          isActive: true,
        },
      });

      // Add weekly availability
      await prisma.availability.create({
        data: {
          profileServiceId: ps.id,
          schedule: {
            monday: { start: '09:00', end: '18:00', isOpen: true },
            tuesday: { start: '09:00', end: '18:00', isOpen: true },
            wednesday: { start: '09:00', end: '18:00', isOpen: true },
            thursday: { start: '09:00', end: '18:00', isOpen: true },
            friday: { start: '09:00', end: '16:00', isOpen: true },
            saturday: { isOpen: false },
            sunday: { isOpen: false },
          },
        },
      });
    }

    console.log(`  ✓ Profile: ${pd.user.firstName} ${pd.user.lastName}`);
  }

  // ── Contacts ──
  console.log('📞 Seeding contacts...');
  for (const provider of providers) {
    await prisma.contact.upsert({
      where: { id: `contact_${provider.id}_telegram` },
      create: {
        id: `contact_${provider.id}_telegram`,
        userId: provider.id,
        type: 'TELEGRAM',
        value: `@${provider.firstName.toLowerCase()}`,
        isPublic: true,
        isPrimary: true,
      },
      update: {},
    }).catch(() => {});

    await prisma.contact.upsert({
      where: { id: `contact_${provider.id}_whatsapp` },
      create: {
        id: `contact_${provider.id}_whatsapp`,
        userId: provider.id,
        type: 'WHATSAPP',
        value: provider.phone,
        isPublic: true,
      },
      update: {},
    }).catch(() => {});
  }

  // ── Subscription for providers ──
  console.log('💳 Seeding subscriptions...');
  for (const provider of providers) {
    await prisma.subscription.upsert({
      where: { userId: provider.id },
      create: {
        userId: provider.id,
        tier: 'BASIC',
        stripeCustomerId: `mock_${provider.id}`,
        isActive: true,
        pricePerMonth: 49900,
        maxPhotos: 10,
        maxVideos: 2,
        maxServices: 5,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {},
    });
  }

  console.log('\n✅ Seed completed!\n');
  console.log('Test accounts (password: Password123!):');
  console.log('  Admin:    admin@czechservices.cz');
  console.log('  Provider: katerina@example.com');
  console.log('  Provider: jakub@example.com');
  console.log('  Provider: lucie@example.com');
  console.log('  Client:   client@example.com');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
