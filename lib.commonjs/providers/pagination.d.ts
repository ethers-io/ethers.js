export interface PaginationResult<R> extends Array<R> {
    next(): Promise<PaginationResult<R>>;
    totalResults: null | number;
    done: boolean;
}
