# 🐹 Netlify DB Migration Guide

## Статус миграции на Netlify DB

✅ **Завершено:**
- Schema определена в `db/schema.ts`
- Миграции сгенерированы в `migrations/0000_eager_chimera.sql`
- Netlify Functions созданы в `netlify/functions/`
- API интегрирован в новый `capybara-script-api.js`
- Все изменения загружены на GitHub

## Что дальше?

Когда Netlify DB будет готова к использованию:

### 1. Получите connection string
- Перейдите в [Netlify Admin](https://app.netlify.com)
- Откройте проект `capycommunity`
- Найдите Netlify DB раздел
- Скопируйте PostgreSQL connection string

### 2. Установите переменную окружения
```bash
# В терминале Netlify
npx netlify dev

# Или в netlify.toml добавьте:
[build.environment]
NETLIFY_DATABASE_URL = "ваш_connection_string"
```

### 3. Запустите миграции
```bash
export NETLIFY_DATABASE_URL="ваш_connection_string"
npx drizzle-kit migrate
```

### 4. Разверните на production
При пуше в main на GitHub, Netlify автоматически:
1. Установит dependencies
2. Создаст базу данных
3. Запустит миграции
4. Развернет функции

## Структура БД

**Таблицы:**
- `users` - Пользователи (с id, username, email, password, isAdmin)
- `posts` - Посты администратора (title, content, authorId)
- `comments` - Общие комментарии (userId, text, page)
- `post_comments` - Комментарии к постам (postId, userId, text)
- `likes` - Лайки (userId, itemId, itemType)

**Связи (Foreign Keys):**
- comments.userId → users.id
- posts.authorId → users.id
- post_comments.postId → posts.id
- post_comments.userId → users.id
- likes.userId → users.id

## API Endpoints

### Аутентификация
- `POST /.netlify/functions/auth/register` - Регистрация
- `POST /.netlify/functions/auth/login` - Вход
- `POST /.netlify/functions/auth/delete` - Удаление аккаунта

### Комментарии
- `GET /.netlify/functions/comments?page=home` - Получить комментарии
- `POST /.netlify/functions/comments` - Создать комментарий
- `DELETE /.netlify/functions/comments/delete` - Удалить комментарий

### Посты
- `GET /.netlify/functions/posts` - Получить все посты
- `POST /.netlify/functions/posts` - Создать пост (только админ)
- `GET /.netlify/functions/posts/{postId}/comments` - Комментарии поста
- `POST /.netlify/functions/posts/{postId}/comments` - Добавить комментарий

### Лайки
- `POST /.netlify/functions/likes/toggle` - Добавить/удалить лайк
- `GET /.netlify/functions/likes/count?itemId={id}` - Получить количество лайков

## Тестирование локально

```bash
# 1. Убедитесь, что используется API в скриптах
# (index.html и другие файлы ссылаются на capybara-script-api.js)

# 2. Запустите Netlify dev
npx netlify dev

# 3. Откройте http://localhost:8888
# Функции будут доступны по адресу /.netlify/functions/...
```

## Миграция данных (если нужно)

Если у вас есть старые данные в localStorage, можно экспортировать их:

```javascript
// В браузерной консоли:
JSON.stringify(JSON.parse(localStorage.getItem('users')))
JSON.stringify(JSON.parse(localStorage.getItem('comments')))
// ... и так далее
```

Затем импортируйте в БД через API или прямо в SQL.

## Безопасность

⚠️ **Важно:** Текущая реализация использует plaintext пароли. 
Для production нужно:
1. Использовать bcrypt для хеширования паролей
2. Добавить JWT токены для аутентификации
3. Использовать CORS и защиту от CSRF
4. Добавить rate limiting

## Проблемы и решения

**Ошибка: "db:push не найден"**
- Используйте `npx drizzle-kit migrate` вместо `npx netlify db:push`

**Ошибка: "NETLIFY_DATABASE_URL undefined"**
- Установите переменную: `export NETLIFY_DATABASE_URL="..."`

**Миграции не применяются**
- Проверьте, что у вас есть доступ к БД
- Убедитесь, что connection string правильный
- Посмотрите логи: `npx netlify dev`

---

**Статус:** ✅ Готово к развёртыванию!

Все файлы загружены на GitHub. Когда Netlify DB будет инициализирована,
просто запустите миграции и приложение будет полностью функционально!
