import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileServiceDto } from './dto/create-profile-service.dto';
import { UpdateProfileServiceDto } from './dto/update-profile-service.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { ListProfilesDto } from './dto/list-profiles.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Profile already exists for this user');

    const region = await this.prisma.region.findUnique({ where: { id: dto.regionId } });
    if (!region) throw new NotFoundException('Region not found');

    const city = await this.prisma.city.findUnique({ where: { id: dto.cityId } });
    if (!city) throw new NotFoundException('City not found');
    if (city.regionId !== dto.regionId) throw new BadRequestException('City does not belong to the specified region');

    return this.prisma.profile.create({
      data: { userId, ...dto },
      include: this.profileIncludes(),
    });
  }

  async findAll(dto: ListProfilesDto) {
    const { skip, take, regionId, cityId, serviceId, minRating, orderBy, featuredFirst } = dto;

    const where: any = { isPublished: true, deletedAt: null };
    if (regionId) where.regionId = regionId;
    if (cityId) where.cityId = cityId;
    if (minRating) where.rating = { gte: minRating };
    if (serviceId) {
      where.services = { some: { serviceId, isActive: true } };
    }

    const validOrderFields = ['rating', 'reviewCount', 'createdAt'];
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'rating';

    const orderByClause: any[] = [];
    if (featuredFirst) orderByClause.push({ isFeatured: 'desc' });
    orderByClause.push({ [orderField]: 'desc' });

    const [profiles, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip: skip || 0,
        take: take || 20,
        orderBy: orderByClause,
        include: this.profileIncludes(),
      }),
      this.prisma.profile.count({ where }),
    ]);

    return { profiles, total };
  }

  async findById(id: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { id, deletedAt: null },
      include: this.profileIncludes(),
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async findMyProfile(userId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId, deletedAt: null },
      include: this.profileIncludes(),
    });
    if (!profile) throw new NotFoundException('Profile not found. Create one first.');
    return profile;
  }

  async update(userId: string, dto: UpdateProfileDto) {
    const profile = await this.getMyProfile(userId);

    if (dto.regionId || dto.cityId) {
      const regionId = dto.regionId || profile.regionId;
      const cityId = dto.cityId || profile.cityId;

      if (dto.regionId) {
        const region = await this.prisma.region.findUnique({ where: { id: regionId } });
        if (!region) throw new NotFoundException('Region not found');
      }
      if (dto.cityId) {
        const city = await this.prisma.city.findUnique({ where: { id: cityId } });
        if (!city) throw new NotFoundException('City not found');
        if (city.regionId !== regionId) throw new BadRequestException('City does not belong to the specified region');
      }
    }

    return this.prisma.profile.update({
      where: { id: profile.id },
      data: dto,
      include: this.profileIncludes(),
    });
  }

  async publish(userId: string) {
    const profile = await this.getMyProfile(userId);

    const serviceCount = await this.prisma.profileService.count({
      where: { profileId: profile.id, isActive: true },
    });
    if (serviceCount === 0) {
      throw new BadRequestException('You must add at least one active service before publishing');
    }

    return this.prisma.profile.update({
      where: { id: profile.id },
      data: { isPublished: true, publicationDate: new Date() },
      include: this.profileIncludes(),
    });
  }

  async unpublish(userId: string) {
    const profile = await this.getMyProfile(userId);
    return this.prisma.profile.update({
      where: { id: profile.id },
      data: { isPublished: false },
      include: this.profileIncludes(),
    });
  }

  async softDelete(userId: string) {
    const profile = await this.getMyProfile(userId);
    return this.prisma.profile.update({
      where: { id: profile.id },
      data: { deletedAt: new Date(), isPublished: false },
    });
  }

  // ── Profile Services ──

  async addService(userId: string, dto: CreateProfileServiceDto) {
    const profile = await this.getMyProfile(userId);

    const service = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
    if (!service) throw new NotFoundException('Service type not found');

    const existing = await this.prisma.profileService.findUnique({
      where: { profileId_serviceId: { profileId: profile.id, serviceId: dto.serviceId } },
    });
    if (existing) throw new ConflictException('This service is already added to your profile');

    return this.prisma.profileService.create({
      data: { profileId: profile.id, ...dto },
      include: { service: true, availability: true },
    });
  }

  async updateService(userId: string, serviceId: string, dto: UpdateProfileServiceDto) {
    const profileService = await this.getMyProfileService(userId, serviceId);

    const { serviceId: newServiceId, ...rest } = dto;

    return this.prisma.profileService.update({
      where: { id: profileService.id },
      data: rest,
      include: { service: true, availability: true },
    });
  }

  async deleteService(userId: string, serviceId: string) {
    const profileService = await this.getMyProfileService(userId, serviceId);
    await this.prisma.profileService.delete({ where: { id: profileService.id } });
  }

  async setAvailability(userId: string, profileServiceId: string, dto: SetAvailabilityDto) {
    const profileService = await this.getMyProfileService(userId, profileServiceId);

    const existing = await this.prisma.availability.findUnique({
      where: { profileServiceId: profileService.id },
    });

    if (existing) {
      await this.prisma.specialDate.deleteMany({ where: { availabilityId: existing.id } });
      await this.prisma.availability.update({
        where: { id: existing.id },
        data: {
          schedule: dto.schedule as any,
          specialDates: dto.specialDates
            ? {
                create: dto.specialDates.map((d) => ({
                  date: new Date(d.date),
                  isOpen: d.isOpen,
                  startTime: d.startTime,
                  endTime: d.endTime,
                })),
              }
            : undefined,
        },
        include: { specialDates: true },
      });
    } else {
      await this.prisma.availability.create({
        data: {
          profileServiceId: profileService.id,
          schedule: dto.schedule as any,
          specialDates: dto.specialDates
            ? {
                create: dto.specialDates.map((d) => ({
                  date: new Date(d.date),
                  isOpen: d.isOpen,
                  startTime: d.startTime,
                  endTime: d.endTime,
                })),
              }
            : undefined,
        },
        include: { specialDates: true },
      });
    }

    return this.prisma.profileService.findUnique({
      where: { id: profileService.id },
      include: { service: true, availability: { include: { specialDates: true } } },
    });
  }

  // ── Helpers ──

  private async getMyProfile(userId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!profile) throw new NotFoundException('Profile not found. Create one first.');
    return profile;
  }

  private async getMyProfileService(userId: string, profileServiceId: string) {
    const profile = await this.getMyProfile(userId);
    const ps = await this.prisma.profileService.findFirst({
      where: { id: profileServiceId, profileId: profile.id },
    });
    if (!ps) throw new NotFoundException('Service not found in your profile');
    return ps;
  }

  private profileIncludes() {
    return {
      region: true,
      city: true,
      services: {
        include: {
          service: true,
          availability: { include: { specialDates: true } },
        },
      },
      photos: true,
      videos: true,
    };
  }
}
