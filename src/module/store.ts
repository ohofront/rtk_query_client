import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { baseApi } from './baseApi';

export const store = configureStore({
  reducer: {
    // 특정 top-level slice에서 생성된 리듀서를 추가
    [baseApi.reducerPath]: baseApi.reducer,
  },
  // 캐싱, 요청 취소, 폴링 등 유용한 RTK Query 기능들을 위한 api 미들웨어 추가
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// refetchOnFocus/refetchOnReconnect 기능 지원
setupListeners(store.dispatch);

// Redux 스토어 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 타입이 적용된 커스텀 훅
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
