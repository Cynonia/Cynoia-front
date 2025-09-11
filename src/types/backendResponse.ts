export type BackendResponse<T> = {
      success: boolean;
      message: string;
      data: T | T[];
}