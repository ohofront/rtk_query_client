import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { handleMockRequest } from './mockApi';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
}

export interface AxiosBaseQueryError {
  status?: number;
  data?: unknown;
  message?: string;
}

const defaultBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: defaultBaseUrl }
  ): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method = 'get', data, params, headers }) => {
    // 별도 백엔드 URL이 없으면 브라우저 LocalStorage 기반 Mock 핸들러 사용
    if (!baseUrl) {
      try {
        const mockResult = await handleMockRequest({ url, method, data, params, headers });
        return { data: mockResult.data };
      } catch (mockError: any) {
        return {
          error: {
            status: mockError.status || 500,
            data: mockError.message,
            message: mockError.message,
          },
        };
      }
    }

    // 백엔드 API URL이 설정되어 있는 경우 실제 Axios 호출
    try {
      const response = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });

      return {
        data: response.data,
      };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
          message: err.message,
        },
      };
    }
  };

// RTK Query의 baseApi 정의
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['TODO'],
  endpoints: () => ({}),
});
