// ===== УПРАВЛЕНИЕ ЛАЙКАМИ =====

// Инициализация хранилища лайков
function initLikes() {
    if (!localStorage.getItem('likes')) {
        localStorage.setItem('likes', JSON.stringify({
            comments: {},    // commentId -> [userId1, userId2, ...]
            postComments: {}, // postCommentId -> [userId1, userId2, ...]
            posts: {}         // postId -> [userId1, userId2, ...]
        }));
    }
}

// Добавить или удалить лайк
function toggleLike(itemId, type) {
    if (!isLoggedIn()) {
        alert('Пожалуйста, войдите в аккаунт');
        return;
    }

    initLikes();
    const likes = JSON.parse(localStorage.getItem('likes'));
    const currentUser = getCurrentUser();
    const category = type === 'comment' ? 'comments' : type === 'postComment' ? 'postComments' : 'posts';

    if (!likes[category][itemId]) {
        likes[category][itemId] = [];
    }

    const userIndex = likes[category][itemId].indexOf(currentUser.id);
    if (userIndex > -1) {
        likes[category][itemId].splice(userIndex, 1); // Удалить лайк
    } else {
        likes[category][itemId].push(currentUser.id); // Добавить лайк
    }

    localStorage.setItem('likes', JSON.stringify(likes));
    
    // Обновить UI
    if (type === 'comment') {
        loadComments(document.body.dataset.currentPage || 'home');
    } else if (type === 'postComment') {
        const postId = document.getElementById(`like-btn-${itemId}`)?.dataset.postId;
        if (postId) loadPostComments(postId);
    } else if (type === 'post') {
        loadPosts();
    }
}

// Получить количество лайков
function getLikeCount(itemId, type) {
    initLikes();
    const likes = JSON.parse(localStorage.getItem('likes'));
    const category = type === 'comment' ? 'comments' : type === 'postComment' ? 'postComments' : 'posts';
    return likes[category][itemId]?.length || 0;
}

// Проверить, лайкнул ли текущий пользователь
function userHasLiked(itemId, type) {
    if (!isLoggedIn()) return false;
    
    initLikes();
    const likes = JSON.parse(localStorage.getItem('likes'));
    const currentUser = getCurrentUser();
    const category = type === 'comment' ? 'comments' : type === 'postComment' ? 'postComments' : 'posts';
    return likes[category][itemId]?.includes(currentUser.id) || false;
}

// ===== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ =====

// Инициализация хранилища пользователей
function initUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
        
        // Создаем администратора при первой инициализации
        const adminUser = {
            id: 'admin-001',
            username: '🐹 Админ Капибара',
            email: 'viktoruapogiba@gmail.com',
            password: 'admin123', // В реальном приложении использовать хеш!
            joinDate: new Date().toISOString(),
            isAdmin: true
        };
        
        const users = [adminUser];
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Регистрация нового пользователя
function register(username, email, password) {
    initUsers();
    const users = JSON.parse(localStorage.getItem('users'));

    // Проверка существования пользователя с таким email
    if (users.some(u => u.email === email)) {
        return false;
    }

    const newUser = {
        id: Date.now().toString(),
        username: username,
        email: email,
        password: password, // В реальном приложении нужно хешировать пароль!
        joinDate: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Автоматический вход после регистрации
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return true;
}

// Вход в аккаунт
function login(email, password) {
    initUsers();
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }

    return false;
}

// Выход из аккаунта
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'capybara-community.html';
}

// Удаление аккаунта
function deleteAccount() {
    if (!isLoggedIn()) {
        alert('Пожалуйста, войдите в аккаунт');
        return false;
    }

    if (!confirm('⚠️ Вы уверены, что хотите удалить аккаунт? Это действие необратимо!\n\nВсе ваши комментарии останутся, но будут привязаны к удаленному аккаунту.')) {
        return false;
    }

    if (!confirm('Это действие НЕЛЬЗЯ отменить. Вы уверены?')) {
        return false;
    }

    const currentUser = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users'));

    // Удаляем пользователя
    const filteredUsers = users.filter(u => u.id !== currentUser.id);
    localStorage.setItem('users', JSON.stringify(filteredUsers));

    // Выходим
    logout();
    return true;
}

// Получить текущего пользователя
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Проверка авторизации
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Обновление UI в зависимости от статуса авторизации
function updateAuthUI() {
    const guestDiv = document.getElementById('auth-guest');
    const userDiv = document.getElementById('auth-user');
    const userNameEl = document.getElementById('user-name');

    if (guestDiv && userDiv) {
        if (isLoggedIn()) {
            guestDiv.style.display = 'none';
            userDiv.style.display = 'flex';
            if (userNameEl) {
                userNameEl.textContent = getCurrentUser().username;
            }
        } else {
            guestDiv.style.display = 'flex';
            userDiv.style.display = 'none';
        }
    }

    // Обновление видимости формы комментариев
    const commentForm = document.getElementById('comment-form');
    const loginPrompt = document.getElementById('login-prompt');

    if (commentForm && loginPrompt) {
        if (isLoggedIn()) {
            commentForm.style.display = 'block';
            loginPrompt.style.display = 'none';
        } else {
            commentForm.style.display = 'none';
            loginPrompt.style.display = 'block';
        }
    }
}

// ===== УПРАВЛЕНИЕ КОММЕНТАРИЯМИ =====

// Инициализация хранилища комментариев
function initComments() {
    if (!localStorage.getItem('comments')) {
        localStorage.setItem('comments', JSON.stringify([]));
    }
}

// ===== МОДЕРАЦИЯ КОММЕНТАРИЕВ =====

// Список запрещённых слов (цензура)
const bannedWords = [
    'ругань', 'мат', 'оскорбление', 'спам', 'реклама',
    'xxx', 'nsfw', 'насилие', 'ненависть', 'дискриминация'
];

// Функция проверки комментария на нецензурные слова
function filterBadWords(text) {
    let filteredText = text;
    bannedWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });
    return filteredText;
}

// Функция проверки на спам (много символов, много ссылок и т.д.)
function isSpam(text) {
    // Проверка на много ссылок
    const linkCount = (text.match(/https?:\/\/|www\./gi) || []).length;
    if (linkCount > 2) return true;

    // Проверка на повторяющиеся символы
    if (/(.)\1{9,}/.test(text)) return true;

    // Проверка на капс (более 70% заглавных букв)
    const capsRatio = (text.match(/[A-ZА-Я]/g) || []).length / text.length;
    if (capsRatio > 0.7) return true;

    return false;
}

// Добавить комментарий
function submitComment(page = 'home') {
    if (!isLoggedIn()) {
        alert('Пожалуйста, войдите в аккаунт');
        return;
    }

    const commentText = document.getElementById('comment-text');
    const text = commentText.value.trim();

    if (!text) {
        alert('Пожалуйста, введите текст комментария');
        return;
    }

    // Проверка на спам
    if (isSpam(text)) {
        alert('⚠️ Ваш комментарий выглядит как спам. Пожалуйста, измените текст.');
        return;
    }

    initComments();
    const comments = JSON.parse(localStorage.getItem('comments'));
    const currentUser = getCurrentUser();

    // Фильтрация нецензурных слов
    let filteredText = filterBadWords(text);

    const newComment = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        text: filteredText,
        date: new Date().toISOString(),
        page: page,
        isModerated: filteredText !== text // Флаг: был ли отфильтрован текст
    };

    comments.push(newComment);
    localStorage.setItem('comments', JSON.stringify(comments));

    commentText.value = '';
    document.getElementById('char-count').textContent = '0/500';

    // Уведомление если текст был отфильтрован
    if (newComment.isModerated) {
        alert('✓ Комментарий добавлен! (Некоторые слова были заменены на *)');
    } else {
        alert('✓ Комментарий успешно добавлен!');
    }

    // Перезагрузить комментарии
    loadComments(page);
}

// Получить все комментарии
function getAllComments() {
    initComments();
    return JSON.parse(localStorage.getItem('comments'));
}

// Загрузить комментарии для страницы
function loadComments(page = 'home') {
    initComments();
    const allComments = JSON.parse(localStorage.getItem('comments'));
    const pageComments = allComments
        .filter(c => c.page === page)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    const currentUser = getCurrentUser();

    if (pageComments.length === 0) {
        commentsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Пока нет комментариев. Будьте первым!</div>';
        return;
    }

    commentsList.innerHTML = pageComments.map(comment => {
        const isOwner = currentUser && currentUser.id === comment.userId;
        const date = new Date(comment.date);
        const formattedDate = date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const likeCount = getLikeCount(comment.id, 'comment');
        const userLiked = userHasLiked(comment.id, 'comment');

        return `
            <div class="comment-card">
                <div class="comment-header">
                    <div class="comment-user-info">
                        <div class="comment-avatar">${comment.username.charAt(0).toUpperCase()}</div>
                        <div class="comment-user-details">
                            <h4>${escapeHtml(comment.username)}</h4>
                            <div class="comment-date">${formattedDate}</div>
                        </div>
                    </div>
                    ${isOwner ? `<button class="comment-delete" onclick="deleteComment('${comment.id}', '${page}')">Удалить</button>` : ''}
                </div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
                <div class="comment-footer">
                    <button class="like-btn ${userLiked ? 'liked' : ''}" onclick="toggleLike('${comment.id}', 'comment')" title="Нравится">
                        🐹 ${likeCount}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Удалить комментарий
function deleteComment(commentId, page = 'home') {
    if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
        return;
    }

    removeComment(commentId);
    loadComments(page);
}

// Удалить комментарий из хранилища
function removeComment(commentId) {
    initComments();
    const comments = JSON.parse(localStorage.getItem('comments'));
    const filtered = comments.filter(c => c.id !== commentId);
    localStorage.setItem('comments', JSON.stringify(filtered));
}

// ===== УПРАВЛЕНИЕ ПОСТАМИ (для админа) =====

// Инициализация хранилища постов
function initPosts() {
    if (!localStorage.getItem('posts')) {
        localStorage.setItem('posts', JSON.stringify([]));
    }
}

// Проверка является ли пользователь администратором
function isAdmin() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.isAdmin === true;
}

// Создать новый пост (только для админа)
function createPost(title, content) {
    if (!isAdmin()) {
        alert('❌ Только администратор может создавать посты');
        return false;
    }

    if (!title.trim() || !content.trim()) {
        alert('Пожалуйста, заполните название и содержание поста');
        return false;
    }

    initPosts();
    const posts = JSON.parse(localStorage.getItem('posts'));
    const currentUser = getCurrentUser();

    const newPost = {
        id: Date.now().toString(),
        title: title.trim(),
        content: filterBadWords(content.trim()),
        author: currentUser.username,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        commentsCount: 0
    };

    posts.unshift(newPost); // Новый пост в начало
    localStorage.setItem('posts', JSON.stringify(posts));

    return true;
}

// Получить все посты
function getAllPosts() {
    initPosts();
    return JSON.parse(localStorage.getItem('posts'));
}

// Загрузить посты на страницу
function loadPosts() {
    const posts = getAllPosts();
    const postsContainer = document.getElementById('posts-container');

    if (!postsContainer) return;

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Пока нет постов</p>';
        return;
    }

    postsContainer.innerHTML = posts.map(post => {
        const createdDate = new Date(post.createdAt).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const likeCount = getLikeCount(post.id, 'post');
        const userLiked = userHasLiked(post.id, 'post');

        return `
            <div class="post-card">
                <div class="post-header">
                    <h3>${escapeHtml(post.title)}</h3>
                    <span class="post-date">${createdDate}</span>
                </div>
                <p class="post-meta">👤 ${escapeHtml(post.author)}</p>
                <div class="post-content">${escapeHtml(post.content).replace(/\n/g, '<br>')}</div>
                <div class="post-footer">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <button class="like-btn ${userLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}', 'post')" title="Нравится">
                            🐹 ${likeCount}
                        </button>
                        <button onclick="togglePostComments('${post.id}')" class="btn-small">💬 Комментарии (${post.commentsCount})</button>
                    </div>
                </div>
                <div id="post-comments-${post.id}" class="post-comments" style="display: none;">
                    <div class="post-comment-form" id="post-comment-form-${post.id}">
                        <textarea placeholder="Ваш комментарий..." class="post-comment-text" maxlength="500"></textarea>
                        <button onclick="submitPostComment('${post.id}')" class="btn-small">Отправить</button>
                    </div>
                    <div id="post-comments-list-${post.id}" class="post-comments-list"></div>
                </div>
            </div>
        `;
    }).join('');

    // Загрузить комментарии к постам
    posts.forEach(post => loadPostComments(post.id));
}

// Переключить видимость комментариев
function togglePostComments(postId) {
    const commentsDiv = document.getElementById(`post-comments-${postId}`);
    if (commentsDiv) {
        commentsDiv.style.display = commentsDiv.style.display === 'none' ? 'block' : 'none';
    }
}

// Добавить комментарий к посту
function submitPostComment(postId) {
    if (!isLoggedIn()) {
        alert('Пожалуйста, войдите в аккаунт');
        return;
    }

    const textarea = document.querySelector(`#post-comment-form-${postId} .post-comment-text`);
    const text = textarea.value.trim();

    if (!text) {
        alert('Пожалуйста, введите текст комментария');
        return;
    }

    if (isSpam(text)) {
        alert('⚠️ Ваш комментарий выглядит как спам');
        return;
    }

    const currentUser = getCurrentUser();
    const posts = getAllPosts();
    const post = posts.find(p => p.id === postId);

    if (post) {
        const postComment = {
            id: Date.now().toString(),
            postId: postId,
            username: currentUser.username,
            userId: currentUser.id,
            text: filterBadWords(text),
            createdAt: new Date().toISOString()
        };

        if (!localStorage.getItem('post-comments')) {
            localStorage.setItem('post-comments', JSON.stringify([]));
        }

        const comments = JSON.parse(localStorage.getItem('post-comments'));
        comments.push(postComment);
        localStorage.setItem('post-comments', JSON.stringify(comments));

        post.commentsCount = (post.commentsCount || 0) + 1;
        localStorage.setItem('posts', JSON.stringify(posts));

        textarea.value = '';
        loadPostComments(postId);
        loadPosts(); // Обновить счётчик
    }
}

// Загрузить комментарии к посту
function loadPostComments(postId) {
    const comments = JSON.parse(localStorage.getItem('post-comments') || '[]');
    const postComments = comments.filter(c => c.postId === postId);
    const container = document.getElementById(`post-comments-list-${postId}`);

    if (!container) return;

    if (postComments.length === 0) {
        container.innerHTML = '<p style="color: #999; padding: 1rem;">Нет комментариев</p>';
        return;
    }

    container.innerHTML = postComments.map(comment => {
        const createdDate = new Date(comment.createdAt).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const likeCount = getLikeCount(comment.id, 'postComment');
        const userLiked = userHasLiked(comment.id, 'postComment');

        return `
            <div class="post-comment">
                <div class="post-comment-header">
                    <strong>${escapeHtml(comment.username)}</strong>
                    <span class="post-comment-date">${createdDate}</span>
                </div>
                <p class="post-comment-text">${escapeHtml(comment.text)}</p>
                <div class="post-comment-footer">
                    <button class="like-btn ${userLiked ? 'liked' : ''}" onclick="toggleLike('${comment.id}', 'postComment')" data-post-id="${comment.postId}" title="Нравится">
                        🐹 ${likeCount}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initUsers();
    initComments();
    updateAuthUI();
});
