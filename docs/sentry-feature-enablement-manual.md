# Как включать нужные Sentry-фичи для web-app

Дата актуализации: 1 марта 2026.

## 1. Error Monitoring

### Что включить

1. Создать проект в Sentry с платформой `Next.js`.
2. Добавить `NEXT_PUBLIC_SENTRY_DSN` в `.env.local`.
3. Инициализировать `Sentry.init(...)` в:
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`
4. Подключить `instrumentation.ts`.
5. Обернуть `next.config` через `withSentryConfig`.

### Зачем

Это базовый слой. Без него не будет reliable захвата ошибок по runtime'ам Next.

## 2. Handled errors с тегами

### Что включить

В доменных местах использовать:

```ts
Sentry.captureException(error, {
  tags: {
    module: "booking",
    feature: "create-booking",
    severity: "critical",
  },
  extra: {
    courtId,
    bookingDate,
    slot,
  },
});
```

### Где полезно

- `addBooking`
- `approveBookingByAdmin`
- `rejectBookingByAdmin`
- `partialCancelBooking`
- file upload

### Зачем

Это не аварийные runtime-crash, а бизнес-сбои с высокой ценностью для команды.

## 3. User context

### Что включить

После успешной авторизации:

```ts
Sentry.setUser({
  id: user.id,
  username: user.name,
});
```

### Зачем

Позволяет понять, ошибка массовая или локальна у одного оператора/клуба.

## 4. Tags

### Что включить

Стандартизировать набор тегов:

```ts
Sentry.setTag("surface", "web-admin");
Sentry.setTag("module", "booking");
Sentry.setTag("organization_id", organizationId);
```

### Зачем

Теги превращают список событий в управляемый инструмент triage.

## 5. Breadcrumbs

### Что включить

На ключевые действия пользователя и realtime-события:

```ts
Sentry.addBreadcrumb({
  category: "booking",
  message: "Open create booking modal",
  level: "info",
});
```

И для SignalR:

```ts
Sentry.addBreadcrumb({
  category: "signalr",
  message: "PaymentStatusUpdate received",
  data: { bookingId, paymentStatus },
});
```

### Зачем

Показывает последовательность событий перед падением или бизнес-сбоем.

## 6. Tracing

### Что включить

В `Sentry.init(...)`:

```ts
tracesSampleRate: 1
```

Для production потом снизить, например до `0.1` или `0.2`.

Для кастомных бизнес-операций:

```ts
await Sentry.startSpan(
  { name: "booking.checkout", op: "business.transaction" },
  async () => {
    // load price
    // create booking
    // refresh list
  },
);
```

### Зачем

Показывает, где сценарий "бронь корта" стал медленным: сеть, backend, UI, повторные запросы.

## 7. Session Replay

### Что включить

В client config:

```ts
replaysSessionSampleRate: 0.05,
replaysOnErrorSampleRate: 1,
```

### Зачем

Для MVP лучше снимать replay в основном на ошибки, чтобы не тратить квоту без пользы.

## 8. Alerts

### Что включить в Sentry UI

1. Открыть `Alerts`.
2. Создать правило на:
   - spike ошибок в `module=booking`
   - рост ошибок `feature=refresh-token`
   - unhandled errors в production

### Зачем

Sentry полезен только если о критичных проблемах команда узнает быстро.

## Демонстрационный код в этом репозитории

См.:

- `src/components/ErrorTriggerButton.tsx`
- `src/app/api/debug-sentry/route.ts`

Что демонстрируется:

1. `Send tagged booking error`
2. `Throw unhandled UI error`
3. `Send business warning`
4. `Run booking trace demo`
