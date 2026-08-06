import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isAgeVerified: true,
        ageVerificationStatus: true,
        verificationId: true,
        verificationDocument: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async submit(userId: string, dto: SubmitVerificationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.isAgeVerified) {
      throw new ConflictException('User is already verified');
    }

    const existing = await this.prisma.verificationDocument.findUnique({ where: { userId } });
    if (existing && existing.veriffStatus === 'PENDING') {
      throw new ConflictException('Verification already submitted and is pending review');
    }

    const veriffSessionId = randomUUID();

    const doc = await this.prisma.verificationDocument.upsert({
      where: { userId },
      create: {
        userId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        country: dto.country || 'CZ',
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        veriffSessionId,
        documentImageUrl: dto.documentImageUrl,
        selfieImageUrl: dto.selfieImageUrl,
        veriffStatus: 'PENDING',
      },
      update: {
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        country: dto.country || 'CZ',
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        veriffSessionId,
        documentImageUrl: dto.documentImageUrl,
        selfieImageUrl: dto.selfieImageUrl,
        veriffStatus: 'PENDING',
        veriffNotes: null,
        verifiedAt: null,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ageVerificationStatus: 'PENDING',
        verificationId: veriffSessionId,
      },
    });

    return {
      message: 'Verification submitted successfully. Under review.',
      sessionId: veriffSessionId,
      status: 'PENDING',
    };
  }

  async approve(userId: string, adminId: string) {
    const doc = await this.prisma.verificationDocument.findUnique({ where: { userId } });
    if (!doc) throw new NotFoundException('No verification document found');
    if (doc.veriffStatus === 'APPROVED') throw new ConflictException('Already approved');

    await this.prisma.verificationDocument.update({
      where: { userId },
      data: {
        veriffStatus: 'APPROVED',
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2), // 2 years
      },
    });

    return this.prisma.user.update({
      where: { id: userId },
      data: { isAgeVerified: true, ageVerificationStatus: 'VERIFIED' },
      select: {
        id: true,
        isAgeVerified: true,
        ageVerificationStatus: true,
      },
    });
  }

  async reject(userId: string, adminId: string, reason: string) {
    const doc = await this.prisma.verificationDocument.findUnique({ where: { userId } });
    if (!doc) throw new NotFoundException('No verification document found');

    await this.prisma.verificationDocument.update({
      where: { userId },
      data: { veriffStatus: 'REJECTED', veriffNotes: reason },
    });

    return this.prisma.user.update({
      where: { id: userId },
      data: { isAgeVerified: false, ageVerificationStatus: 'REJECTED' },
      select: {
        id: true,
        isAgeVerified: true,
        ageVerificationStatus: true,
      },
    });
  }

  async listPending(skip = 0, take = 20) {
    const [documents, total] = await Promise.all([
      this.prisma.verificationDocument.findMany({
        where: { veriffStatus: 'PENDING' },
        skip,
        take,
        orderBy: { submittedAt: 'asc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, dateOfBirth: true },
          },
        },
      }),
      this.prisma.verificationDocument.count({ where: { veriffStatus: 'PENDING' } }),
    ]);
    return { documents, total };
  }
}
