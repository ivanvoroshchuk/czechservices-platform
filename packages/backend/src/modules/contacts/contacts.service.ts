import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyContacts(userId: string) {
    return this.prisma.contact.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getPublicContacts(userId: string) {
    return this.prisma.contact.findMany({
      where: { userId, isPublic: true },
      orderBy: [{ isPrimary: 'desc' }, { type: 'asc' }],
    });
  }

  async create(userId: string, dto: CreateContactDto) {
    const existing = await this.prisma.contact.findFirst({
      where: { userId, type: dto.type, value: dto.value },
    });
    if (existing) throw new ConflictException('This contact already exists');

    // If setting as primary — unset previous primary of same type
    if (dto.isPrimary) {
      await this.prisma.contact.updateMany({
        where: { userId, type: dto.type, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.contact.create({
      data: {
        userId,
        type: dto.type,
        value: dto.value,
        isPublic: dto.isPublic ?? true,
        isPrimary: dto.isPrimary ?? false,
      },
    });
  }

  async update(userId: string, contactId: string, dto: UpdateContactDto) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) throw new NotFoundException('Contact not found');
    if (contact.userId !== userId) throw new ForbiddenException('Access denied');

    if (dto.isPrimary && !contact.isPrimary) {
      await this.prisma.contact.updateMany({
        where: { userId, type: contact.type, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.contact.update({
      where: { id: contactId },
      data: dto,
    });
  }

  async delete(userId: string, contactId: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) throw new NotFoundException('Contact not found');
    if (contact.userId !== userId) throw new ForbiddenException('Access denied');
    await this.prisma.contact.delete({ where: { id: contactId } });
  }
}
