import * as soap from 'soap';

// Estructura de datos devuelta por el servicio SOAP
export interface CountryCodeAndName {
  sName: string;
  sISOCode: string;
}

export interface ListOfCountryNamesByNameResult {
  ListOfCountryNamesByNameResult: {
    tCountryCodeAndName: CountryCodeAndName[];
  };
}

export interface FullCountryInfo {
  sISOCode: string;
  sName: string;
  sCapitalCity: string;
  sPhoneCode: string;
  sContinentCode: string;
  sCurrencyISOCode: string;
  sCurrencyName: string;
  sCountryFlag: string;
  Languages: {
    tLanguage: Array<{
      sISOCode: string;
      sName: string;
    }>;
  };
}

export interface FullCountryInfoResult {
  FullCountryInfoResult: FullCountryInfo;
}

// Cliente SOAP tipado para CountryInfo
export interface CountryInfoSoapClient extends soap.Client {
  ListOfCountryNamesByNameAsync(
    args: Record<string, unknown>,
  ): Promise<[ListOfCountryNamesByNameResult, string, object, string]>;

  FullCountryInfoAsync(args: {
    sCountryISOCode: string;
  }): Promise<[FullCountryInfoResult, string, object, string]>;
}
