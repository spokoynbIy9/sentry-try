# Sentry для `book-and-play/web-app`

Дата актуализации: 1 марта 2026.

## Что проанализировано

Проект `web-app` выглядит как Next.js admin/frontend для бронирования кортов со следующими важными точками интеграции:

- глобальный layout и провайдеры: `src/app/layout.tsx`, `src/providers/general-provider.tsx`
- глобальный error boundary: `src/providers/error-boundary-provider.tsx`
- auth bootstrap и логин: `src/providers/auth-bootstrap.tsx`, `src/components/login/login-form/login-form.tsx`
- API слой на RTK Query: `src/api/base-api.ts`, `src/api/auth/auth-api.ts`, `src/api/booking/booking-api.ts`
- realtime-слой через SignalR: `src/api/signalr/signalr-client.ts`
- критичные доменные экраны: бронирования и аналитика

## Какие фичи Sentry реально пригодятся

| Фича | Зачем именно вам | Где применять |
|---|---|---|
| Error Monitoring | Ловить реальные фронтовые падения и runtime exceptions | глобально, через `@sentry/nextjs` + error boundary |
| Manual `captureException` | Ловить критичные handled errors, где UI не падает, но бизнес-операция сорвалась | создание брони, approve/reject booking, загрузка файлов, login bootstrap |
| Tags | Быстро фильтровать события по домену | `module=booking`, `feature=login`, `surface=web-admin` |
| User context | Понимать, у какого администратора/клуба произошла ошибка | после успешной авторизации |
| Breadcrumbs | Видеть последовательность действий пользователя перед падением | логин, открытие модалки, submit формы, SignalR reconnect |
| Tracing | Понять, где тормозит сценарий бронирования | получение слотов, расчет цены, submit брони, загрузка аналитики |
| Session Replay | Разобрать, как пользователь дошел до сбоя | страницы логина, бронирования, модалки редактирования |
| Alerts | Реагировать на всплеск ошибок в ключевых сценариях | booking, auth, payment/status sync |

## Что внедрять в первую очередь

### 1. Базовая инициализация SDK

Минимум:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`
- `withSentryConfig` в `next.config.ts` или `next.config.mjs`

Это дает базовый захват unhandled errors и базовый tracing.

### 2. ErrorBoundary + отправка ошибки в Sentry

Сейчас у вас уже есть `react-error-boundary`, но fallback только показывает сообщение.  
Правильный следующий шаг: в `onError` отправлять ошибку в Sentry с тегом UI-зоны.

Что добавить:

```tsx
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, info) => {
    Sentry.captureException(error, {
      tags: { module: "ui", feature: "error-boundary" },
      extra: { componentStack: info.componentStack },
    });
  }}
>
  {children}
</ErrorBoundary>
```

### 3. RTK Query: ручной capture только для критичных запросов

Не нужно отправлять в Sentry каждый `4xx`. Это быстро засорит проект.

Нужно отправлять:

- `5xx` от backend
- ошибки создания/подтверждения/отмены бронирования
- ошибки refresh token / bootstrap auth
- ошибки загрузки аналитики, если это важный экран для оператора

Идея:

```ts
Sentry.captureException(error, {
  tags: {
    module: "booking",
    endpoint: "Booking/create",
  },
  extra: {
    bookingId,
    courtId,
    page: "court-admin/bookings",
  },
});
```

### 4. User context после логина

После успешного получения пользователя стоит делать:

```ts
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.fullName,
});
```

Если есть multi-tenant структура, полезно добавить теги:

```ts
Sentry.setTag("organization_id", organizationId);
Sentry.setTag("surface", "web-admin");
```

### 5. Tracing на сценарии бронирования

Для вашего продукта tracing особенно полезен в таких местах:

- открытие страницы заявок
- загрузка свободных слотов
- расчет стоимости
- создание брони
- approve/reject администратором
- загрузка аналитики

Пример мышления:

1. Пользователь открывает модалку брони
2. UI делает запрос цены
3. UI отправляет create booking
4. backend отвечает
5. UI обновляет список

Если это обернуть в trace, становится видно, где реальная задержка.

### 6. Breadcrumbs на realtime-события SignalR

Ваш `SignalRClient` хороший кандидат для breadcrumbs:

```ts
Sentry.addBreadcrumb({
  category: "signalr",
  message: "PaymentStatusUpdate received",
  level: "info",
  data: { bookingId, paymentStatus },
});
```

Это полезно, когда пользователь говорит: "статус оплаты не обновился".

### 7. Session Replay только точечно

Для MVP достаточно:

- низкий `replaysSessionSampleRate`
- высокий `replaysOnErrorSampleRate`

Практически: replay нужен в логине, форме бронирования и сложных админских модалках.

## Что я бы НЕ отправлял в Sentry

- любые ожидаемые валидационные ошибки формы
- обычный `401`, если он штатно обрабатывается reauth-логикой
- предсказуемые `4xx`, которые уже показываются как бизнес-ошибки пользователю

Иначе Sentry станет шумным и потеряет ценность.

## Минимальный план внедрения в `web-app`

1. Подключить базовый `@sentry/nextjs`.
2. Интегрировать `ErrorBoundaryProvider` с `Sentry.captureException`.
3. Добавить `Sentry.setUser` после успешного bootstrap/login.
4. В критичных RTK Query mutation добавить ручной capture с тегами.
5. Добавить tracing для бронирования и аналитики.
6. Подключить Session Replay только на ошибки.
7. Настроить alerts на `booking` и `auth`.

## Какие теги рекомендую стандартизировать

| Тег | Пример | Зачем |
|---|---|---|
| `module` | `booking`, `auth`, `analytics`, `signalr` | фильтрация по доменам |
| `feature` | `create-booking`, `refresh-token`, `load-analytics` | фильтрация по сценарию |
| `surface` | `web-admin` | отделение frontend-сегмента |
| `organization_id` | `club_spb_central` | multi-tenant анализ |
| `severity` | `critical`, `warning` | triage |

## Что уже подготовлено в демо

В этом репозитории `sentry-try` добавлены:

- tagged handled error для бронирования
- unhandled UI crash
- business warning через `captureMessage`
- trace сценария бронирования
- серверная ошибка с тегами и `eventId`

См.:

- `src/components/ErrorTriggerButton.tsx`
- `src/app/api/debug-sentry/route.ts`
