import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countryInfoService: CountriesService) {}

  @Public()
  @Get(':iso')
  async getByIso(@Param('iso') iso: string) {
    return this.countryInfoService.getFullCountryInfoByISO(iso);
  }

  @Public()
  @Get(':iso/currency')
  async getCurrency(@Param('iso') iso: string) {
    return this.countryInfoService.getCurrencyByISO(iso);
  }

  @Public()
  @Get()
  async getAllCountries() {
    return this.countryInfoService.getListOfCountriesNamesByName();
  }
}
