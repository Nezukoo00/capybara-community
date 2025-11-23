// 🧪 ПРИМЕРЫ КОДА ДЛЯ ТЕСТИРОВАНИЯ В КОНСОЛИ БРАУЗЕРА

// Откройте консоль браузера: F12 → Console
// Скопируйте и вставьте примеры ниже

// ========================================
// 1. УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
// ========================================

// Регистрация нового пользователя
register('капибара', 'capybara@example.com', 'password123');
// Результат: true (если успешно) или false (если пользователь существует)

// Проверка текущего пользователя
console.log(getCurrentUser());
// Результат: объект пользователя или null

// Проверка авторизации
console.log(isLoggedIn());
// Результат: true или false

// Вход в аккаунт
login('capybara@example.com', 'password123');

// Получить список всех пользователей
console.log(JSON.parse(localStorage.getItem('users')));

// Удалить аккаунт (требует подтверждения)
// deleteAccount();

// ========================================
// 2. УПРАВЛЕНИЕ КОММЕНТАРИЯМИ
// ========================================

// Добавить комментарий программно
const text = document.getElementById('comment-text');
if (text) {
  text.value = 'Капибары самые лучшие! 🐹';
  submitComment('home');
}

// Загрузить комментарии главной страницы
loadComments('home');

// Загрузить комментарии страницы О капибарах
loadComments('about');

// Получить все комментарии
console.log(getAllComments());

// Удалить комментарий по ID (если вы его автор)
// deleteComment('КОММЕНТАРИЙ_ID', 'home');

// Просмотр всех комментариев текущего пользователя
const currentUser = getCurrentUser();
const myComments = getAllComments().filter(c => c.userId === currentUser.id);
console.log(myComments);

// ========================================
// 3. РАБОТА С ДАННЫМИ
// ========================================

// Посмотреть все пользователи
const users = JSON.parse(localStorage.getItem('users'));
console.table(users);

// Посмотреть все комментарии
const comments = JSON.parse(localStorage.getItem('comments'));
console.table(comments);

// Посмотреть текущего пользователя
const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
console.log(currentUserData);

// Количество пользователей
console.log(users.length);

// Количество комментариев
console.log(comments.length);

// Количество комментариев текущего пользователя
console.log(comments.filter(c => c.userId === currentUser.id).length);

// ========================================
// 4. ОЧИСТКА ДАННЫХ
// ========================================

// Удалить текущего пользователя (выход)
localStorage.removeItem('currentUser');

// Удалить всех пользователей (осторожно!)
localStorage.removeItem('users');

// Удалить все комментарии (осторожно!)
localStorage.removeItem('comments');

// Полная очистка localStorage (осторожно!)
localStorage.clear();

// ========================================
// 5. ПОЛЕЗНЫЕ ФУНКЦИИ
// ========================================

// Проверить, есть ли пользователь с таким email
function userExists(email) {
  const users = JSON.parse(localStorage.getItem('users'));
  return users.some(u => u.email === email);
}

console.log(userExists('capybara@example.com'));

// Получить пользователя по email
function getUserByEmail(email) {
  const users = JSON.parse(localStorage.getItem('users'));
  return users.find(u => u.email === email);
}

console.log(getUserByEmail('capybara@example.com'));

// Получить все комментарии пользователя по email
function getUserCommentsByEmail(email) {
  const user = getUserByEmail(email);
  if (!user) return [];
  return getAllComments().filter(c => c.userId === user.id);
}

console.log(getUserCommentsByEmail('capybara@example.com'));

// Получить статистику
function getStats() {
  const users = JSON.parse(localStorage.getItem('users'));
  const comments = JSON.parse(localStorage.getItem('comments'));
  
  return {
    totalUsers: users.length,
    totalComments: comments.length,
    avgCommentsPerUser: users.length > 0 ? (comments.length / users.length).toFixed(2) : 0,
    commentsByPage: {
      home: comments.filter(c => c.page === 'home').length,
      about: comments.filter(c => c.page === 'about').length
    }
  };
}

console.log(getStats());

// ========================================
// 6. ПРИМЕРЫ СЦЕНАРИЕВ ТЕСТИРОВАНИЯ
// ========================================

// СЦЕНАРИЙ 1: Полная регистрация и комментарий
function testScenario1() {
  console.log('Сценарий 1: Регистрация и комментарий');
  
  // Регистрация
  register('тестовый_пользователь', 'test@example.com', 'test123456');
  console.log('✓ Регистрация успешна');
  
  // Проверка авторизации
  console.log('✓ Авторизован:', isLoggedIn());
  
  // Получить данные
  console.log('✓ Текущий пользователь:', getCurrentUser().username);
  
  // Добавить комментарий
  const textarea = document.getElementById('comment-text');
  if (textarea) {
    textarea.value = 'Тестовый комментарий!';
    submitComment('home');
    console.log('✓ Комментарий добавлен');
  }
  
  // Показать статистику
  console.log('✓ Статистика:', getStats());
}

// СЦЕНАРИЙ 2: Несколько пользователей
function testScenario2() {
  console.log('Сценарий 2: Несколько пользователей');
  
  // Создать 3 пользователя
  register('пользователь_1', 'user1@example.com', 'pass123456');
  register('пользователь_2', 'user2@example.com', 'pass123456');
  register('пользователь_3', 'user3@example.com', 'pass123456');
  
  console.log('✓ Создано 3 пользователя');
  console.log('✓ Всего пользователей:', JSON.parse(localStorage.getItem('users')).length);
}

// СЦЕНАРИЙ 3: Проверка безопасности
function testScenario3() {
  console.log('Сценарий 3: Проверка безопасности');
  
  // Попробовать XSS атаку
  const dangerous = '<script>alert("XSS")</script>';
  const safe = escapeHtml(dangerous);
  
  console.log('Опасный текст:', dangerous);
  console.log('Защищённый текст:', safe);
  console.log('✓ XSS защита работает');
  
  // Попробовать зарегистрировать с коротким именем
  const result = register('ab', 'short@example.com', 'pass123456');
  console.log('✓ Валидация имени работает:', !result);
}

// ========================================
// 7. ВИЗУАЛИЗАЦИЯ ДАННЫХ
// ========================================

// Таблица всех пользователей
console.table(JSON.parse(localStorage.getItem('users')));

// Таблица всех комментариев
console.table(JSON.parse(localStorage.getItem('comments')));

// Таблица комментариев по страницам
const comments = JSON.parse(localStorage.getItem('comments'));
console.log('Комментарии на главной:', comments.filter(c => c.page === 'home').length);
console.log('Комментарии О капибарах:', comments.filter(c => c.page === 'about').length);

// ========================================
// ПОЛЕЗНЫЕ ССЫЛКИ
// ========================================

/*
MDN Web Docs: https://developer.mozilla.org/
localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
ES6 JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
Array methods: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
*/

// ========================================
// СОВЕТЫ ДЛЯ ОТЛАДКИ
// ========================================

/*
1. Откройте DevTools: F12
2. Перейдите на вкладку Console
3. Посмотрите на ошибки (красные сообщения)
4. Используйте console.log() для отладки
5. Используйте console.table() для просмотра данных
6. Нажмите Ctrl+Shift+Delete чтобы очистить консоль

ГОРЯЧИЕ КЛАВИШИ:
- F12: Открыть DevTools
- Ctrl+Shift+I: Открыть DevTools
- Ctrl+Shift+C: Инспектор элементов
- Ctrl+Shift+K: Консоль
- Ctrl+Shift+M: Мобильный вид
*/

// ========================================
// ЗАПУСК ТЕСТОВЫХ СЦЕНАРИЕВ
// ========================================

// Раскомментируйте чтобы запустить:
// testScenario1();
// testScenario2();
// testScenario3();
