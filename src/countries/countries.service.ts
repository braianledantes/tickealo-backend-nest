import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as soap from 'soap';
import { CountryInfoSoapClient } from './types/soap-client.types';

@Injectable()
export class CountriesService implements OnModuleInit {
  private readonly logger = new Logger(CountriesService.name);

  private client: CountryInfoSoapClient | null = null;
  private readonly WSDL =
    'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL';

  private countries: { name: string; isoCode: string }[] | null = null;

  async onModuleInit() {
    try {
      this.client = (await soap.createClientAsync(
        this.WSDL,
      )) as CountryInfoSoapClient;
    } catch (err) {
      this.logger.error('Error creando cliente SOAP CountryInfo', err);
    }
  }

  /**
   * Obtiene la lista de nombres de países ordenados por nombre.
   * @returns Lista de países con su nombre y código ISO.
   */
  async getListOfCountriesNamesByName(): Promise<{
    countries: { name: string; isoCode: string }[];
    total: number;
  }> {
    if (this.countries) {
      return { countries: this.countries, total: this.countries.length };
    }

    if (!this.client) {
      throw new InternalServerErrorException('SOAP client no inicializado');
    }
    const [result] = await this.client.ListOfCountryNamesByNameAsync({});
    this.countries =
      result.ListOfCountryNamesByNameResult.tCountryCodeAndName.map(
        (country) => ({
          name: country.sName,
          isoCode: country.sISOCode,
        }),
      );

    return { countries: this.countries, total: this.countries.length };
  }

  /**
   * Obtiene información completa de un país por su código ISO.
   * @param isoCode Código ISO del país.
   * @returns Información completa del país.
   */
  async getFullCountryInfoByISO(isoCode: string) {
    if (!this.client) {
      throw new InternalServerErrorException('SOAP client no inicializado');
    }
    const args = { sCountryISOCode: isoCode.toUpperCase() };
    try {
      const [result] = await this.client.FullCountryInfoAsync(args);
      return result.FullCountryInfoResult;
    } catch (err) {
      this.logger.error('Error llamando FullCountryInfo', err);
      throw err;
    }
  }

  /**
   * Obtiene la moneda de un país por su código ISO.
   * @param isoCode Código ISO del país.
   * @returns Información de la moneda del país.
   */
  async getCurrencyByISO(isoCode: string) {
    const info = await this.getFullCountryInfoByISO(isoCode);
    return {
      countryName: info.sName,
      currencyISO: info.sCurrencyISOCode,
      currencyName: info.sCurrencyName,
      capital: info.sCapitalCity,
    };
  }
}
