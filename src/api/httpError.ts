import axios from 'axios';

export interface HttpError {
  message: string;
  status?: number;
  details?: unknown;
}

export const toHttpError = (error: unknown): HttpError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string; title?: string } | undefined;
    return {
      status,
      details: error.response?.data,
      message: data?.message ?? data?.title ?? error.message ?? 'Request failed',
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Unexpected error occurred' };
};
