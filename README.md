# VPN Portal 🗽

Веб-приложение для удобного просмотра VPN-конфигов из [igareck/vpn-configs-for-russia](https://github.com/igareck/vpn-configs-for-russia).

## Возможности

- Навигация по категориям: Чёрный список / Белый список (РФ) / Tor Bridges
- Объяснение каждого списка — что это и когда использовать
- Копирование ссылки подписки в один клик
- QR-код для быстрого импорта с телефона
- Открыть в клиенте: v2Box, v2RayNG, Happ, Streisand, NekoBox, Shadowrocket
- Просмотр конфигов с поиском и фильтром по протоколу
- Автообновление через GitHub Actions каждые 2 часа
- Mobile Friendly

## Быстрый старт

```bash
npm install
npm run dev
```

## Деплой на GitHub Pages

1. Форкни этот репозиторий
2. Перейди в Settings → Pages → Source: GitHub Actions
3. Сделай пуш в main — деплой автоматически
4. Сайт пересобирается каждые 2 часа

## Стек

- React + TypeScript + Vite
- Чистый CSS (DEVS-эстетика)
- qrcode — QR в браузере
- GitHub Actions — CI/CD + cron

## Добавить новый файл конфигов

В `src/data/configs.ts` добавь объект в `CONFIG_FILES`.
