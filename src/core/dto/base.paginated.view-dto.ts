export class PaginatedViewDto<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];

  static mapToView<T>(data: {
    items: T[];
    page: number;
    size: number;
    totalCount: number;
  }): PaginatedViewDto<T> {
    const dto = new PaginatedViewDto<T>();

    dto.pagesCount = Math.ceil(data.totalCount / data.size);
    dto.page = data.page;
    dto.pageSize = data.size;
    dto.totalCount = data.totalCount;
    dto.items = data.items;

    return dto;
  }
}
