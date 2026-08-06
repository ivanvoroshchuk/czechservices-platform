import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Contacts')
@ApiBearerAuth('JWT')
@Controller('api/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all my contacts (including private)' })
  getMyContacts(@CurrentUser('id') userId: string) {
    return this.contactsService.getMyContacts(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get public contacts of a user' })
  getPublicContacts(@Param('userId') userId: string) {
    return this.contactsService.getPublicContacts(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new contact' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateContactDto) {
    return this.contactsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a contact' })
  delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.contactsService.delete(userId, id);
  }
}
