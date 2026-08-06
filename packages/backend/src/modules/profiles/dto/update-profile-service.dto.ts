import { PartialType } from '@nestjs/swagger';
import { CreateProfileServiceDto } from './create-profile-service.dto';

export class UpdateProfileServiceDto extends PartialType(CreateProfileServiceDto) {}
