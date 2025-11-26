// ===== API CONFIGURATION =====
const API_BASE = '/.netlify/functions';

// ===== UTILITY FUNCTIONS =====
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

// ===== AUTHENTICATION =====

async function register(username, email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`❌ ${error.error}`);
            return false;
        }

        const data = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        alert('✓ Регистрация успешна!');
        return true;
    } catch (error) {
        console.error('Register error:', error);
        alert('❌ Ошибка регистрации');
        return false;
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            alert('❌ Неверный email или пароль');
            return false;
        }

        const data = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        alert('✓ Успешный вход!');
        return true;
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Ошибка входа');
        return false;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    alert('✓ Вы вышли из аккаунта');
}

function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function isAdmin() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.isAdmin === true;
}

async function deleteAccount() {
    if (!confirm('Вы уверены? Это действие необратимо!')) {
        return false;
    }

    if (!confirm('Подтвердите удаление аккаунта еще раз')) {
        return false;
    }

    try {
        const currentUser = getCurrentUser();
        const response = await fetch(`${API_BASE}/auth/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
        });

        if (!response.ok) {
            alert('❌ Ошибка удаления');
            return false;
        }

        logout();
        alert('✓ Аккаунт удален');
        window.location.href = 'index.html';
        return true;
    } catch (error) {
        console.error('Delete account error:', error);
        alert('❌ Ошибка удаления');
        return false;
    }
}

// ===== MODERATION FUNCTIONS =====

function filterBadWords(text) {
    const badWords = [
        'дурак', 'идиот', 'мудак', 'пидор', 'говно', 'блядь', 'сука', 'хуй', 'ебать',
        'лох', 'мудила', 'засранец', 'паразит', 'выблядок', 'ублюдок'
    ];

    let filtered = text;
    badWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '*'.repeat(word.length));
    });

    return filtered;
}

function isSpam(text) {
    // Проверка на ссылки
    if (/(http|https|ftp|www)/i.test(text)) return true;

    // Проверка на повторяющиеся символы (более 5)
    if (/(.)\1{4,}/.test(text)) return true;

    // Проверка на чрезмерные заглавные буквы
    const caps = (text.match(/[А-ЯA-Z]/g) || []).length;
    if (caps > text.length * 0.7) return true;

    return false;
}

// ===== COMMENTS MANAGEMENT =====

async function loadComments(page = 'home') {
    try {
        const response = await fetch(`${API_BASE}/comments?page=${page}`);
        const data = await response.json();

        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;

        if (data.data.length === 0) {
            commentsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Пока нет комментариев. Будьте первым!</div>';
            return;
        }

        const currentUser = getCurrentUser();

        commentsList.innerHTML = data.data.map(comment => {
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
                            <div class="comment-avatar">${comment.username?.charAt(0).toUpperCase() || '?'}</div>
                            <div class="comment-user-details">
                                <h4>${escapeHtml(comment.username || 'Anonymous')}</h4>
                                <div class="comment-date">${formattedDate}</div>
                            </div>
                        </div>
                        ${isOwner ? `<button class="comment-delete" onclick="deleteComment('${comment.id}', '${page}')">Удалить</button>` : ''}
                    </div>
                    <div class="comment-text">${escapeHtml(comment.text)}</div>
                    <div class="comment-footer">
                        <button class="like-btn" onclick="toggleLike('${comment.id}', 'comment')" title="Нравится">
                            🐹 <span id="like-count-${comment.id}">0</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Load like counts
        data.data.forEach(comment => loadLikeCount(comment.id, 'comment'));

    } catch (error) {
        console.error('Load comments error:', error);
    }
}

async function submitComment(text, page = 'home') {
    if (!isLoggedIn()) {
        window.location.href = 'capybara-register.html';
        return;
    }

    if (!text.trim()) {
        alert('Пожалуйста, введите текст комментария');
        return;
    }

    if (text.length > 500) {
        alert('Комментарий не должен превышать 500 символов');
        return;
    }

    if (isSpam(text)) {
        alert('⚠️ Ваш комментарий выглядит как спам. Пожалуйста, измените текст.');
        return;
    }

    const currentUser = getCurrentUser();
    const filteredText = filterBadWords(text);

    try {
        const response = await fetch(`${API_BASE}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                text: filteredText,
                page: page
            })
        });

        if (!response.ok) {
            alert('❌ Ошибка добавления комментария');
            return;
        }

        document.getElementById('comment-text').value = '';
        document.getElementById('char-count').textContent = '0/500';

        if (filteredText !== text) {
            alert('✓ Комментарий добавлен! (Некоторые слова были заменены на *)');
        } else {
            alert('✓ Комментарий успешно добавлен!');
        }

        loadComments(page);
    } catch (error) {
        console.error('Submit comment error:', error);
        alert('❌ Ошибка добавления комментария');
    }
}

async function deleteComment(commentId, page = 'home') {
    if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/comments/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: commentId })
        });

        if (!response.ok) {
            alert('❌ Ошибка удаления');
            return;
        }

        loadComments(page);
    } catch (error) {
        console.error('Delete comment error:', error);
    }
}

// ===== POSTS MANAGEMENT =====

async function createPost(title, content) {
    if (!isAdmin()) {
        alert('❌ Только администратор может создавать посты');
        return false;
    }

    if (!title.trim() || !content.trim()) {
        alert('Пожалуйста, заполните название и содержание поста');
        return false;
    }

    const currentUser = getCurrentUser();

    try {
        const response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authorId: currentUser.id,
                title: title.trim(),
                content: filterBadWords(content.trim()),
                isAdmin: true
            })
        });

        if (!response.ok) {
            alert('❌ Ошибка создания поста');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Create post error:', error);
        return false;
    }
}

async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE}/posts`);
        const data = await response.json();

        const postsContainer = document.getElementById('posts-container');
        if (!postsContainer) return;

        if (data.data.length === 0) {
            postsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Пока нет постов</p>';
            return;
        }

        postsContainer.innerHTML = data.data.map(post => {
            const createdDate = new Date(post.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="post-card">
                    <div class="post-header">
                        <h3>${escapeHtml(post.title)}</h3>
                        <span class="post-date">${createdDate}</span>
                    </div>
                    <p class="post-meta">👤 ${escapeHtml(post.author || 'Admin')}</p>
                    <div class="post-content">${escapeHtml(post.content).replace(/\n/g, '<br>')}</div>
                    <div class="post-footer">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <button class="like-btn" onclick="toggleLike('${post.id}', 'post')" title="Нравится">
                                🐹 <span id="like-count-${post.id}">0</span>
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

        // Load post comments
        data.data.forEach(post => loadPostComments(post.id));
        data.data.forEach(post => loadLikeCount(post.id, 'post'));

    } catch (error) {
        console.error('Load posts error:', error);
    }
}

function togglePostComments(postId) {
    const commentsDiv = document.getElementById(`post-comments-${postId}`);
    if (commentsDiv) {
        commentsDiv.style.display = commentsDiv.style.display === 'none' ? 'block' : 'none';
    }
}

async function submitPostComment(postId) {
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

    try {
        const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                text: filterBadWords(text)
            })
        });

        if (!response.ok) {
            alert('❌ Ошибка добавления комментария');
            return;
        }

        textarea.value = '';
        loadPostComments(postId);
        loadPosts();
    } catch (error) {
        console.error('Submit post comment error:', error);
    }
}

async function loadPostComments(postId) {
    try {
        const response = await fetch(`${API_BASE}/posts/${postId}/comments`);
        const data = await response.json();

        const container = document.getElementById(`post-comments-list-${postId}`);
        if (!container) return;

        if (data.data.length === 0) {
            container.innerHTML = '<p style="color: #999; padding: 1rem;">Нет комментариев</p>';
            return;
        }

        container.innerHTML = data.data.map(comment => {
            const createdDate = new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="post-comment">
                    <div class="post-comment-header">
                        <strong>${escapeHtml(comment.username)}</strong>
                        <span class="post-comment-date">${createdDate}</span>
                    </div>
                    <p class="post-comment-text">${escapeHtml(comment.text)}</p>
                    <div class="post-comment-footer">
                        <button class="like-btn" onclick="toggleLike('${comment.id}', 'postComment')" data-post-id="${postId}" title="Нравится">
                            🐹 <span id="like-count-${comment.id}">0</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        data.data.forEach(comment => loadLikeCount(comment.id, 'postComment'));

    } catch (error) {
        console.error('Load post comments error:', error);
    }
}

// ===== LIKES MANAGEMENT =====

async function toggleLike(itemId, itemType) {
    if (!isLoggedIn()) {
        alert('Пожалуйста, войдите в аккаунт');
        return;
    }

    const currentUser = getCurrentUser();

    try {
        const response = await fetch(`${API_BASE}/likes/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                itemId,
                itemType
            })
        });

        if (!response.ok) {
            alert('❌ Ошибка');
            return;
        }

        await loadLikeCount(itemId, itemType);

        // Update UI
        if (itemType === 'comment') {
            loadComments(document.body.dataset.currentPage || 'home');
        } else if (itemType === 'postComment') {
            const postId = document.getElementById(`like-btn-${itemId}`)?.dataset.postId;
            if (postId) loadPostComments(postId);
        } else if (itemType === 'post') {
            loadPosts();
        }
    } catch (error) {
        console.error('Toggle like error:', error);
    }
}

async function loadLikeCount(itemId, itemType) {
    try {
        const response = await fetch(`${API_BASE}/likes/count?itemId=${itemId}`);
        const data = await response.json();

        const countElement = document.getElementById(`like-count-${itemId}`);
        if (countElement) {
            countElement.textContent = data.count;
        }
    } catch (error) {
        console.error('Load like count error:', error);
    }
}

// ===== UI MANAGEMENT =====

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const profileLink = document.getElementById('profile-link');
    const logoutBtn = document.getElementById('logout-btn');

    if (!authButtons) return;

    if (isLoggedIn()) {
        const user = getCurrentUser();
        authButtons.innerHTML = `
            <span style="color: #8b7355; font-weight: 600;">🐹 ${escapeHtml(user.username)}</span>
            <a href="capybara-profile.html" style="color: #d4a574; text-decoration: none; margin-left: 1rem;">Профиль</a>
            <button onclick="logout()" style="background: none; border: none; color: #d4a574; cursor: pointer; text-decoration: underline; margin-left: 1rem;">Выход</button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="capybara-login.html" style="color: #8b7355; text-decoration: none; margin-right: 1rem;">Вход</a>
            <a href="capybara-register.html" style="color: #8b7355; text-decoration: none;">Регистрация</a>
        `;
    }
}

// ===== PAGE INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
});
