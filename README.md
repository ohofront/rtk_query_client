# RTK Query Todo Client

> **Redux Toolkit Query(RTK Query)**와 **TypeScript**, **Styled-components**를 기반으로 구축된 Todo 관리 웹 애플리케이션입니다.  
> 서버 상태 관리, 캐싱, 자동 재검증(Cache Invalidation)을 학습하고 실무에 적용하기 위한 레퍼런스 프로젝트입니다.

---

## 📌 주요 특징

- **RTK Query 기반 서버 상태 관리**:
  - `createApi` 및 `injectEndpoints`를 활용한 모듈식 API 관리
  - 커스텀 `axiosBaseQuery`를 구현하여 Axios 인스턴스와 RTK Query의 강력한 캐싱 기능 결합
  - `providesTags`와 `invalidatesTags`를 통한 데이터 변경 시 자동 캐시 무효화 및 리패칭(Auto-refetching)
- **엄격한 TypeScript 타이핑**:
  - Todo 모델, API 요청/응답, Redux RootState/AppDispatch의 완전한 타입 안정성 확보
  - RTK Query 자동 생성 훅 (`useTodoListQuery`, `useTodoAddMutation` 등)의 타입 추론
- **사용자 경험(UX) 최적화**:
  - React Router v6 기반 SPA 라우팅
  - 할 일 추가(Enter 키 지원), 완료 여부 토글, 삭제 기능
  - 로딩 스피너 및 에러 상태 시 재시도(Retry) 처리
  - styled-components를 활용한 직관적이고 깔끔한 UI/UX

---

## 🛠 기술 스택

| 분류 | 기술 |
| :--- | :--- |
| **Frontend Core** | React 18, TypeScript 4.x |
| **State Management** | Redux Toolkit (RTK), RTK Query |
| **HTTP Client** | Axios |
| **Routing** | React Router DOM v6 |
| **Styling** | styled-components, polished |

---

## 📂 프로젝트 구조

```text
rtk_query_client/
├── public/                 # 정적 리소스 (HTML, 파비콘, 매니페스트)
├── src/
│   ├── models/             # 데이터 타입 및 인터페이스
│   │   └── todo.ts         # Todo, TodoInput, 응답 DTO 정의
│   ├── module/             # Redux 및 RTK Query 모듈
│   │   ├── baseApi.ts      # Axios 기반 BaseQuery 및 baseApi 인스턴스 생성
│   │   ├── addApi.ts       # Todo 관련 엔드포인트(CRUD) 주입 및 자동 생성 훅
│   │   └── store.ts        # Redux 스토어 설정 및 타입 정의 (RootState, AppDispatch)
│   ├── pages/              # 라우트 컴포넌트
│   │   ├── Home.tsx        # 메인 진입 페이지
│   │   └── TodoList.tsx    # 할 일 목록, 등록, 토글, 삭제 페이지
│   ├── App.tsx             # 라우팅 설정
│   └── index.tsx           # Redux Provider 연동 및 앱 부트스트랩
├── .gitignore              # Git 무시 파일 설정
├── package.json            # 프로젝트 의존성 및 스크립트
├── tsconfig.json           # TypeScript 설정
└── README.md               # 프로젝트 문서
```

---

## ⚡️ RTK Query 핵심 구현

### 1. 커스텀 Axios BaseQuery (`src/module/baseApi.ts`)
RTK Query 기본 `fetchBaseQuery` 대신 `axios`를 사용하는 커스텀 `BaseQueryFn`을 작성하여 HTTP 요청/응답을 처리하며, RTK Query 에러 규격에 맞춰 `{ error: { status, data, message } }` 구조를 반환합니다.

```typescript
export const axiosBaseQuery = ({ baseUrl }: { baseUrl: string }) =>
  async ({ url, method = 'get', data, params, headers }: AxiosBaseQueryArgs) => {
    try {
      const response = await axios({ url: baseUrl + url, method, data, params, headers });
      return { data: response.data };
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
```

### 2. 태그 기반 캐시 무효화 (`src/module/addApi.ts`)
Todo 항목 추가(`todoAdd`), 수정/토글(`todoToggle`), 삭제(`todoRemove`) 시 `TODO` 태그를 무효화(`invalidatesTags`)하여 컴포넌트에서 수동으로 리패치할 필요 없이 자동으로 최신 목록을 갱신합니다.

```typescript
// 목록 조회 시 태그 등록
providesTags: (result) =>
  result
    ? [...result.map(({ id }) => ({ type: 'TODO' as const, id })), { type: 'TODO', id: 'LIST' }]
    : [{ type: 'TODO', id: 'LIST' }]

// 추가 / 수정 / 삭제 시 태그 무효화
invalidatesTags: [{ type: 'TODO', id: 'LIST' }]
```

---

## 🚀 시작 가이드

### 1. 의존성 설치
```bash
yarn install
# 또는
npm install
```

### 2. 환경 변수 설정 (선택 사항)
프로젝트 루트 경로에 `.env` 파일을 생성하여 API 서버 주소를 지정할 수 있습니다.
```env
REACT_APP_API_BASE_URL=http://localhost:8000
```

### 3. 개발 서버 실행
```bash
yarn start
# 또는
npm start
```
기본적으로 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속할 수 있습니다.

### 4. 빌드
```bash
yarn build
# 또는
npm run build
```

---

## 📡 예상 백엔드 API 명세

본 클라이언트가 연동하는 REST API 예시 명세입니다:

| 엔드포인트 | 메서드 | 설명 | 요청 바디 | 응답 |
| :--- | :--- | :--- | :--- | :--- |
| `/todo/list` | `GET` | 할 일 목록 전체 조회 | 없음 | `Todo[]` 또는 `{ todoList: Todo[] }` |
| `/todo/add` | `POST` | 새로운 할 일 추가 | `{ description: string }` | 생성된 `Todo` |
| `/todo/toggle/:id` | `PATCH` | 할 일 완료 여부 토글 | `{ completed: boolean }` | 수정된 `Todo` |
| `/todo/remove/:id` | `DELETE` | 할 일 삭제 | `{ id: number }` | `{ success: boolean, id: number }` |

---

## 📝 커밋 컨벤션

- `feat`: 새로운 기능 추가
- `refactor`: 코드 리팩터링 및 구조 개선
- `chore`: 빌드, 패키지 설정 및 환경 파일 수정
- `docs`: 문서 추가 및 수정
