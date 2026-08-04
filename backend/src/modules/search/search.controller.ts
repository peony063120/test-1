import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  @UseGuards(RolesGuard)
  @Roles('product.read')
  @ApiOperation({ summary: 'Search products' })
  searchProducts(@Query() query: SearchQueryDto) {
    return this.searchService.search(query.q ?? '', query);
  }

  @Get('autocomplete')
  @UseGuards(RolesGuard)
  @Roles('product.read')
  @ApiOperation({ summary: 'Autocomplete products' })
  autocomplete(@Query('q') q: string) {
    return this.searchService.autoComplete(q);
  }
}
