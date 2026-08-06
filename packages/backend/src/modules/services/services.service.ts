import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

interface ServiceType {
  name: string;
  label: string;
  description?: string;
  icon?: string;
  displayOrder: number;
}

@Injectable()
export class ServicesService implements OnModuleInit {
  private readonly serviceTypes: ServiceType[] = [
    {
      name: 'MASSAGE',
      label: 'Masáž',
      description: 'Professional massage services including relaxation, therapeutic, and wellness massages',
      icon: '💆',
      displayOrder: 1,
    },
    {
      name: 'CONSULTATION',
      label: 'Konzultace',
      description: 'Personal consultations in various fields including beauty, health, and wellness',
      icon: '👥',
      displayOrder: 2,
    },
    {
      name: 'PHOTO_SESSION',
      label: 'Fotografická sezóna',
      description: 'Professional photo sessions including portraits, events, and creative photography',
      icon: '📸',
      displayOrder: 3,
    },
    {
      name: 'STUDIO_RECORDING',
      label: 'Studiové nahrávání',
      description: 'Professional studio recording services for music, podcasts, and audio content',
      icon: '🎙️',
      displayOrder: 4,
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize service types in database
   */
  async onModuleInit() {
    try {
      const existingServices = await this.prisma.service.count();

      if (existingServices === 0) {
        console.log('🛠️  Seeding service types...');

        for (const serviceType of this.serviceTypes) {
          await this.prisma.service.create({
            data: {
              name: serviceType.name,
              label: serviceType.label,
              description: serviceType.description,
              icon: serviceType.icon,
              displayOrder: serviceType.displayOrder,
            },
          });
        }

        console.log('✅ Service types seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding service types:', error);
    }
  }

  /**
   * Get all service types
   */
  async getAllServices() {
    return await this.prisma.service.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Get service by ID
   */
  async getServiceById(serviceId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  /**
   * Get service by name
   */
  async getServiceByName(serviceName: string) {
    const service = await this.prisma.service.findUnique({
      where: { name: serviceName },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  /**
   * Get service details with stats
   */
  async getServiceDetails(serviceId: string) {
    const service = await this.getServiceById(serviceId);

    const profileServices = await this.prisma.profileService.count({
      where: { serviceId },
    });

    const bookings = await this.prisma.booking.count({
      where: {
        profileService: {
          serviceId,
        },
      },
    });

    return {
      ...service,
      providers: profileServices,
      bookings,
    };
  }
}
