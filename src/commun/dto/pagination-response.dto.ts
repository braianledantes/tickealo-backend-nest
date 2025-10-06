export class PaginatioResponseDto<T> {
  pagination: {
    total: number;
    page: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  data: Array<T>;
}
