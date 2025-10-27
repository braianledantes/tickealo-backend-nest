import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countryInfoService: CountriesService) {}

  @Get(':iso')
  async getByIso(@Param('iso') iso: string) {
    return this.countryInfoService.getFullCountryInfoByISO(iso);
  }

  @Get(':iso/currency')
  async getCurrency(@Param('iso') iso: string) {
    return this.countryInfoService.getCurrencyByISO(iso);
  }

  @Get()
  async getAllCountries() {
    return this.countryInfoService.getListOfCountriesNamesByName();
  }
}
