import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import * as czechData from './data/czech-regions.json';

@Injectable()
export class LocationsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize Czech regions and cities in database
   * Runs once when module is loaded
   */
  async onModuleInit() {
    try {
      // Check if regions already exist
      const existingRegions = await this.prisma.region.count();
      
      if (existingRegions === 0) {
        console.log('📍 Seeding Czech regions and cities...');
        
        for (const regionData of czechData.regions) {
          // Create region
          const region = await this.prisma.region.create({
            data: {
              name: regionData.name,
              code: regionData.id,
              displayOrder: regionData.displayOrder,
            },
          });

          // Create cities for this region
          if (regionData.cities) {
            for (const cityData of regionData.cities) {
              await this.prisma.city.create({
                data: {
                  name: cityData.name,
                  zipCode: cityData.zipCode,
                  regionId: region.id,
                },
              });
            }
          }
        }

        console.log('✅ Czech regions and cities seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding Czech regions:', error);
    }
  }

  /**
   * Get all Czech regions
   */
  async getAllRegions() {
    return await this.prisma.region.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        cities: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  /**
   * Get region by ID
   */
  async getRegionById(regionId: string) {
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
      include: {
        cities: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    return region;
  }

  /**
   * Get cities by region ID
   */
  async getCitiesByRegion(regionId: string) {
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    const cities = await this.prisma.city.findMany({
      where: { regionId },
      orderBy: { name: 'asc' },
    });

    return {
      region,
      cities,
      total: cities.length,
    };
  }

  /**
   * Get city by ID
   */
  async getCityById(cityId: string) {
    const city = await this.prisma.city.findUnique({
      where: { id: cityId },
      include: {
        region: true,
      },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    return city;
  }

  /**
   * Search cities by name
   */
  async searchCities(query: string) {
    const cities = await this.prisma.city.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        region: true,
      },
      orderBy: { name: 'asc' },
      take: 20,
    });

    return {
      query,
      cities,
      total: cities.length,
    };
  }

  /**
   * Get all cities (with pagination)
   */
  async getAllCities(skip: number = 0, take: number = 50) {
    const [cities, total] = await Promise.all([
      this.prisma.city.findMany({
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          region: true,
        },
      }),
      this.prisma.city.count(),
    ]);

    return {
      cities,
      total,
      skip,
      take,
    };
  }
}
