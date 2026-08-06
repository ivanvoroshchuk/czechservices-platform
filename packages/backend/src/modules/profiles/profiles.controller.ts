import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileServiceDto } from './dto/create-profile-service.dto';
import { UpdateProfileServiceDto } from './dto/update-profile-service.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { ListProfilesDto } from './dto/list-profiles.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Profiles')
@ApiBearerAuth('JWT')
@Controller('api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create my profile' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateProfileDto) {
    return this.profilesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all published profiles' })
  findAll(@Query() query: ListProfilesDto) {
    return this.profilesService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.profilesService.findMyProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  update(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete my profile' })
  remove(@CurrentUser('id') userId: string) {
    return this.profilesService.softDelete(userId);
  }

  @Post('me/publish')
  @ApiOperation({ summary: 'Publish my profile (requires at least 1 active service)' })
  publish(@CurrentUser('id') userId: string) {
    return this.profilesService.publish(userId);
  }

  @Post('me/unpublish')
  @ApiOperation({ summary: 'Unpublish my profile' })
  unpublish(@CurrentUser('id') userId: string) {
    return this.profilesService.unpublish(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profile by ID' })
  findOne(@Param('id') id: string) {
    return this.profilesService.findById(id);
  }

  // ── Profile Services ──

  @Post('me/services')
  @ApiOperation({ summary: 'Add a service offering to my profile' })
  addService(@CurrentUser('id') userId: string, @Body() dto: CreateProfileServiceDto) {
    return this.profilesService.addService(userId, dto);
  }

  @Patch('me/services/:id')
  @ApiOperation({ summary: 'Update a service offering' })
  updateService(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProfileServiceDto,
  ) {
    return this.profilesService.updateService(userId, id, dto);
  }

  @Delete('me/services/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a service offering from my profile' })
  deleteService(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.profilesService.deleteService(userId, id);
  }

  @Post('me/services/:id/availability')
  @ApiOperation({ summary: 'Set weekly availability for a service' })
  setAvailability(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.profilesService.setAvailability(userId, id, dto);
  }
}
