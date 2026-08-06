import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { Public } from '@common/decorators/public.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Locations')
@Controller('api/locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  /**
   * Get all Czech regions
   */
  @Get('regions')
  @Public()
  @ApiOperation({
    summary: 'Get all Czech regions',
    description: 'Retrieve all 14 Czech regions with their cities',
  })
  @ApiResponse({
    status: 200,
    description: 'List of regions with cities',
  })
  async getAllRegions() {
    return this.locationsService.getAllRegions();
  }

  /**
   * Get region by ID
   */
  @Get('regions/:regionId')
  @Public()
  @ApiOperation({
    summary: 'Get region by ID',
    description: 'Retrieve a specific region with its cities',
  })
  @ApiResponse({
    status: 200,
    description: 'Region with cities',
  })
  @ApiResponse({
    status: 404,
    description: 'Region not found',
  })
  async getRegionById(@Param('regionId') regionId: string) {
    return this.locationsService.getRegionById(regionId);
  }

  /**
   * Get cities by region
   */
  @Get('regions/:regionId/cities')
  @Public()
  @ApiOperation({
    summary: 'Get cities by region ID',
    description: 'Retrieve all cities in a specific region',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cities in region',
  })
  @ApiResponse({
    status: 404,
    description: 'Region not found',
  })
  async getCitiesByRegion(@Param('regionId') regionId: string) {
    return this.locationsService.getCitiesByRegion(regionId);
  }

  /**
   * Get city by ID
   */
  @Get('cities/:cityId')
  @Public()
  @ApiOperation({
    summary: 'Get city by ID',
    description: 'Retrieve a specific city with its region',
  })
  @ApiResponse({
    status: 200,
    description: 'City details',
  })
  @ApiResponse({
    status: 404,
    description: 'City not found',
  })
  async getCityById(@Param('cityId') cityId: string) {
    return this.locationsService.getCityById(cityId);
  }

  /**
   * Search cities
   */
  @Get('cities/search')
  @Public()
  @ApiOperation({
    summary: 'Search cities by name',
    description: 'Search for Czech cities by name (case-insensitive)',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  async searchCities(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return {
        query,
        cities: [],
        total: 0,
        message: 'Query must be at least 2 characters long',
      };
    }

    return this.locationsService.searchCities(query);
  }

  /**
   * Get all cities
   */
  @Get('cities')
  @Public()
  @ApiOperation({
    summary: 'Get all cities',
    description: 'Retrieve all Czech cities with pagination',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of cities to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of cities to return',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cities',
  })
  async getAllCities(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.locationsService.getAllCities(
      skip || 0,
      take || 50,
    );
  }
}
