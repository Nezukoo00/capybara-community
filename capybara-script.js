// ===== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ =====

// Инициализация хранилища пользователей
function initUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
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

    initComments();
    const comments = JSON.parse(localStorage.getItem('comments'));
    const currentUser = getCurrentUser();

    const newComment = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        text: text,
        date: new Date().toISOString(),
        page: page
    };

    comments.push(newComment);
    localStorage.setItem('comments', JSON.stringify(comments));

    commentText.value = '';
    document.getElementById('char-count').textContent = '0/500';

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
