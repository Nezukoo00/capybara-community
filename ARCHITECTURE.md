# 🐹 Capybara Community - Netlify DB Architecture

## Обзор

Мы успешно перешли с **localStorage** на **Netlify DB** (PostgreSQL). 

Вот как это работает:

## 📊 Архитектура системы

```
┌─────────────────────────────────────────────────────────┐
│                    Браузер (Frontend)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │     HTML pages (index.html, etc)                │   │
│  │     capybara-script-api.js (API клиент)         │   │
│  │     localStorage (только для currentUser)        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
           ↓ HTTP Requests (JSON)
           ↑ HTTP Responses (JSON)
┌─────────────────────────────────────────────────────────┐
│              Netlify Functions (Backend)                │
│  ┌────────────────────────────────────────────────┐    │
│  │  POST /auth/register    ← Регистрация         │    │
│  │  POST /auth/login       ← Вход                │    │
│  │  POST /auth/delete      ← Удаление            │    │
│  ├────────────────────────────────────────────────┤    │
│  │  GET  /comments         ← Получить            │    │
│  │  POST /comments         ← Создать             │    │
│  │  DEL  /comments/delete  ← Удалить             │    │
│  ├────────────────────────────────────────────────┤    │
│  │  GET  /posts            ← Все посты           │    │
│  │  POST /posts            ← Создать пост        │    │
│  │  GET  /posts/{id}/com   ← Комменты к посту   │    │
│  │  POST /posts/{id}/com   ← Добавить комент     │    │
│  ├────────────────────────────────────────────────┤    │
│  │  POST /likes/toggle     ← Лайк                │    │
│  │  GET  /likes/count      ← Количество лайков   │    │
│  └────────────────────────────────────────────────┘    │
│     (TypeScript Functions with Drizzle ORM)            │
└─────────────────────────────────────────────────────────┘
           ↓ SQL Queries
           ↑ Query Results
┌─────────────────────────────────────────────────────────┐
│          Netlify DB (PostgreSQL via Neon)              │
│  ┌────────────────────────────────────────────────┐    │
│  │  users                                         │    │
│  │  ├─ id (UUID)                                 │    │
│  │  ├─ username (VARCHAR)                        │    │
│  │  ├─ email (VARCHAR)                           │    │
│  │  ├─ password (VARCHAR)                        │    │
│  │  ├─ isAdmin (BOOLEAN)                         │    │
│  │  └─ joinDate (TIMESTAMP)                      │    │
│  ├────────────────────────────────────────────────┤    │
│  │  posts                                         │    │
│  │  ├─ id (UUID)                                 │    │
│  │  ├─ authorId (UUID FK → users)                │    │
│  │  ├─ title (VARCHAR)                           │    │
│  │  ├─ content (TEXT)                            │    │
│  │  ├─ commentsCount (INTEGER)                   │    │
│  │  └─ createdAt (TIMESTAMP)                     │    │
│  ├────────────────────────────────────────────────┤    │
│  │  comments                                      │    │
│  │  ├─ id (UUID)                                 │    │
│  │  ├─ userId (UUID FK → users)                  │    │
│  │  ├─ text (TEXT)                               │    │
│  │  ├─ page (VARCHAR)                            │    │
│  │  ├─ date (TIMESTAMP)                          │    │
│  │  └─ isModerated (BOOLEAN)                     │    │
│  ├────────────────────────────────────────────────┤    │
│  │  post_comments                                 │    │
│  │  ├─ id (UUID)                                 │    │
│  │  ├─ postId (UUID FK → posts)                  │    │
│  │  ├─ userId (UUID FK → users)                  │    │
│  │  ├─ text (TEXT)                               │    │
│  │  └─ createdAt (TIMESTAMP)                     │    │
│  ├────────────────────────────────────────────────┤    │
│  │  likes                                         │    │
│  │  ├─ id (UUID)                                 │    │
│  │  ├─ userId (UUID FK → users)                  │    │
│  │  ├─ itemId (VARCHAR)                          │    │
│  │  ├─ itemType (VARCHAR)                        │    │
│  │  └─ createdAt (TIMESTAMP)                     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Поток данных (пример: добавление комментария)

### Старый способ (localStorage):
```
1. Пользователь пишет комментарий ✍️
   ↓
2. submitComment() вызывается
   ↓
3. Загружаем JSON из localStorage
   ↓
4. Добавляем новый комментарий в массив
   ↓
5. Сохраняем обратно в localStorage
   ↓
6. Перезагружаем UI
   ↓
7. Обновляются только на этом браузере 💻
```

### Новый способ (API + БД):
```
1. Пользователь пишет комментарий ✍️
   ↓
2. submitComment() вызывается
   ↓
3. Отправляем POST запрос к /.netlify/functions/comments
   ↓
4. Netlify Function получает запрос
   ↓
5. Drizzle ORM конвертирует в SQL: 
   INSERT INTO comments (userId, text, page, date, isModerated)
   VALUES (?, ?, ?, NOW(), false)
   ↓
6. PostgreSQL выполняет запрос и возвращает новый комментарий
   ↓
7. Netlify Function отправляет JSON ответ
   ↓
8. Frontend обновляет UI
   ↓
9. Все пользователи видят обновление в реальном времени! 🌐
```

## 📝 Примеры API вызовов

### Регистрация
```javascript
POST /.netlify/functions/auth/register
{
  "username": "капибара123",
  "email": "capy@example.com",
  "password": "secret123"
}

// Ответ:
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "капибара123",
    "email": "capy@example.com",
    "isAdmin": false
  }
}
```

### Создание поста (только админ)
```javascript
POST /.netlify/functions/posts
{
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Мой первый пост",
  "content": "Капибары - отличные животные!",
  "isAdmin": true
}

// БД выполняет:
INSERT INTO posts (authorId, title, content, commentsCount, createdAt)
VALUES ('550e8400...', 'Мой первый пост', 'Капибары...', 0, NOW())
```

### Добавление лайка
```javascript
POST /.netlify/functions/likes/toggle
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "itemId": "comment-123",
  "itemType": "comment"
}

// БД выполняет:
INSERT INTO likes (userId, itemId, itemType, createdAt)
VALUES ('550e8400...', 'comment-123', 'comment', NOW())
// Или DELETE если лайк уже существует
```

## 🔐 Безопасность

**Текущая реализация:**
- Простые пароли в plain text ❌ (не для production)
- API функции на Netlify (защищены)
- CORS ограничения (только от своего сайта)

**Что нужно добавить:**
- Bcrypt для хеширования паролей
- JWT токены для аутентификации
- Rate limiting
- Input validation
- HTTPS (автоматически на Netlify)

## 📦 Файловая структура

```
capybara-community/
├── db/
│   ├── schema.ts           # Определение таблиц (Drizzle ORM)
│   └── index.ts            # Инициализация БД
├── netlify/
│   └── functions/
│       ├── auth/
│       │   ├── register.ts
│       │   ├── login.ts
│       │   └── delete.ts
│       ├── comments/
│       │   ├── index.ts
│       │   └── delete.ts
│       ├── posts/
│       │   ├── index.ts
│       │   └── comments.ts
│       └── likes/
│           ├── toggle.ts
│           └── count.ts
├── migrations/
│   └── 0000_eager_chimera.sql  # SQL миграции
├── capybara-script-api.js  # Клиент для API
├── capybara-*.html         # HTML страницы
├── drizzle.config.ts       # Drizzle конфиг
└── .env.local              # Локальные переменные
```

## 🚀 Развёртывание

### На Netlify:
1. Загрузить код на GitHub ✅
2. Netlify автоматически:
   - Установит зависимости
   - Создаст PostgreSQL БД
   - Запустит миграции
   - Развернёт функции
   - Разместит frontend

### Локальная разработка:
```bash
# Установить зависимости
npm install

# Запустить Netlify Dev (с функциями и БД)
npx netlify dev

# Открыть http://localhost:8888
```

## 💡 Ключевые различия

| Аспект | localStorage | Netlify DB |
|--------|-------------|-----------|
| **Хранение** | Браузер | Сервер (PostgreSQL) |
| **Синхронизация** | Локально | В реальном времени |
| **Масштабируемость** | До 5MB | Неограниченно |
| **Безопасность** | Низкая | Высокая |
| **Доступность** | Оффлайн | Только онлайн |
| **Архитектура** | Монолит (SPA) | Client-Server |
| **Производительность** | Очень быстро | Быстро (с задержкой сети) |

## 📚 Документация

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [NETLIFY_DB_MIGRATION.md](./NETLIFY_DB_MIGRATION.md) - Инструкции по миграции

---

**Статус:** ✅ **Миграция завершена!**

Приложение готово к работе с реальной базой данных PostgreSQL через Netlify!
