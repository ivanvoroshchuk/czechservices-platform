import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { Public } from '@common/decorators/public.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Services')
@Controller('api/services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Get all service types
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all service types',
    description: 'Retrieve all available service types (Massage, Consultation, Photo Session, Studio Recording)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of service types',
  })
  async getAllServices() {
    return this.servicesService.getAllServices();
  }

  /**
   * Get service by ID
   */
  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get service by ID',
    description: 'Retrieve a specific service type by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Service type details',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async getServiceById(@Param('id') serviceId: string) {
    return this.servicesService.getServiceById(serviceId);
  }

  /**
   * Get service details with statistics
   */
  @Get(':id/details')
  @Public()
  @ApiOperation({
    summary: 'Get service details with statistics',
    description: 'Retrieve service type with provider and booking statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Service details with stats',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async getServiceDetails(@Param('id') serviceId: string) {
    return this.servicesService.getServiceDetails(serviceId);
  }
}
