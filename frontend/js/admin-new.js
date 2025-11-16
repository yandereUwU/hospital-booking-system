class AdminPanel {
    constructor() {
        this.auth = new Auth();
        this.currentSection = 'doctors';
        this.doctors = [];
        this.users = [];
        this.filteredUsers = [];
        this.isEditing = false;
        this.init();
    }

    async init() {
        console.log('🚀 Инициализация админ-панели...');
        
        if (!this.auth.isAuthenticated()) {
            console.log('❌ Пользователь не авторизован');
            window.location.href = '/';
            return;
        }

        console.log('✅ Админ-панель для пользователя:', this.auth.user.username);
        
        this.setupEventListeners();
        await this.loadDoctors();
        await this.loadUsers();
        await this.loadStats();
        
        window.adminPanel = this;
    }

    setupEventListeners() {
    console.log('📝 Настройка обработчиков событий...');
    
    // Навигация по секциям
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.closest('.admin-nav-btn').dataset.section;
            console.log('🔄 Переключение на секцию:', section);
            this.showSection(section);
        });
    });

    // Форма врача
    const doctorForm = document.getElementById('doctor-form-element');
    if (doctorForm) {
        doctorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('💾 Отправка формы врача');
            this.saveDoctor();
        });
    }

    // Кнопка добавления врача
    const addDoctorBtn = document.querySelector('.add-btn');
    if (addDoctorBtn) {
        addDoctorBtn.addEventListener('click', () => {
            console.log('➕ Добавление врача');
            this.showAddDoctorForm();
        });
    }

    // Фильтры пользователей
    const roleFilter = document.getElementById('role-filter');
    const userSearch = document.getElementById('user-search');
    
    if (roleFilter) {
        roleFilter.addEventListener('change', () => {
            this.filterUsers();
        });
    }
    
    if (userSearch) {
        userSearch.addEventListener('input', () => {
            this.filterUsers();
        });
    }

        // Кнопка выхода
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    showSection(section) {
        console.log('🎯 Показ секции:', section);
        
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-section="${section}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const activeSection = document.getElementById(`${section}-section`);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        this.currentSection = section;

        if (section === 'doctors') {
            this.loadDoctors();
        } else if (section === 'users') {
            this.loadUsers();
        } else if (section === 'stats') {
            this.loadStats();
        }
    }

    async loadUsers() {
        try {
            console.log('🔄 Загрузка пользователей...');
            const response = await fetch('http://localhost:3000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            });
            
            if (response.status === 401) {
                this.showError('Сессия истекла. Пожалуйста, войдите снова.');
                setTimeout(() => {
                    this.logout();
                }, 2000);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Данные пользователей:', data);
            
            if (data.success) {
                this.users = data.users || [];
                this.filteredUsers = [...this.users];
                this.renderUsersTable();
                this.updateUserStats();
            } else {
                this.showError('Ошибка загрузки пользователей: ' + data.error);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки пользователей:', error);
            this.showError('Ошибка соединения: ' + error.message);
        }
    }

    filterUsers() {
        const roleFilter = document.getElementById('role-filter');
        const searchInput = document.getElementById('user-search');
        
        const selectedRole = roleFilter ? roleFilter.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        this.filteredUsers = this.users.filter(user => {
            const matchesRole = selectedRole === 'all' || user.role === selectedRole;
            const matchesSearch = !searchTerm || 
                user.username.toLowerCase().includes(searchTerm) ||
                user.full_name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);
            
            return matchesRole && matchesSearch;
        });
        
        this.renderUsersTable();
    }

    renderUsersTable() {
        const tbody = document.getElementById('users-table-body');
        
        if (!tbody) {
            console.error('❌ Не найден tbody для пользователей');
            return;
        }

        if (this.filteredUsers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #666;">Пользователи не найдены</td></tr>';
            return;
        }

        console.log('🎨 Отрисовка таблицы пользователей:', this.filteredUsers.length, 'пользователей');
        
        tbody.innerHTML = this.filteredUsers.map(user => {
            const initials = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
            const isCurrentUser = user.id === this.auth.user.id;
            
            return `
            <tr>
                <td>${user.id}</td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-details">
                            <h4>${user.full_name}</h4>
                            <div class="user-email">@${user.username}</div>
                            <div class="user-phone">${user.phone}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="user-contact">📧 ${user.email}</div>
                    <div class="user-contact">📞 ${user.phone}</div>
                </td>
                <td>
                    <select class="role-select" data-user-id="${user.id}" ${isCurrentUser ? 'disabled' : ''}>
                        <option value="patient" ${user.role === 'patient' ? 'selected' : ''}>Пациент</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                    </select>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm btn-reset" data-user-id="${user.id}" ${isCurrentUser ? 'disabled' : ''}>
                            🔄 Сбросить пароль
                        </button>
                        <button class="btn-sm btn-delete" data-user-id="${user.id}" ${isCurrentUser ? 'disabled' : ''}>
                            🗑️ Удалить
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');

        // Обработчики для селектов ролей
        tbody.querySelectorAll('.role-select').forEach(select => {
            if (!select.disabled) {
                select.addEventListener('change', (e) => {
                    const userId = parseInt(e.target.dataset.userId);
                    const newRole = e.target.value;
                    this.changeUserRole(userId, newRole);
                });
            }
        });

        // Обработчики для кнопок сброса пароля
        tbody.querySelectorAll('.btn-reset').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', (e) => {
                    const userId = parseInt(e.target.dataset.userId);
                    this.resetUserPassword(userId);
                });
            }
        });

        // Обработчики для кнопок удаления
        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', (e) => {
                    const userId = parseInt(e.target.dataset.userId);
                    this.deleteUser(userId);
                });
            }
        });
    }

    updateUserStats() {
        const totalUsers = this.users.length;
        const patientCount = this.users.filter(u => u.role === 'patient').length;
        const adminCount = this.users.filter(u => u.role === 'admin').length;

        // Обновляем статистику в секции пользователей
        document.getElementById('total-users').textContent = totalUsers;
        document.getElementById('patient-count').textContent = patientCount;
        document.getElementById('admin-count').textContent = adminCount;

        // Обновляем статистику в футере
        document.getElementById('footer-user-count').textContent = totalUsers;
        document.getElementById('footer-doctor-count').textContent = this.doctors.length;
    }

    async resetUserPassword(userId) {
        if (!confirm('Вы уверены, что хотите сбросить пароль пользователя?\nНовый пароль будет: "password123"')) {
            return;
        }

        console.log('🔄 Сброс пароля пользователя:', userId);

        try {
            const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Пароль пользователя сброшен! Новый пароль: password123');
            } else {
                this.showError('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('❌ Ошибка сброса пароля:', error);
            this.showError('Ошибка сброса пароля: ' + error.message);
        }
    }

    async loadStats() {
        try {
            // Здесь можно добавить загрузку статистики с сервера
            // Пока используем локальные данные
            this.updateStatsDisplay();
        } catch (error) {
            console.error('❌ Ошибка загрузки статистики:', error);
        }
    }

    updateStatsDisplay() {
        // Обновляем отображение статистики
        document.getElementById('stats-total-users').textContent = this.users.length;
        document.getElementById('stats-total-doctors').textContent = this.doctors.length;
        document.getElementById('stats-total-appointments').textContent = '0'; // Можно добавить реальные данные
        document.getElementById('stats-today-appointments').textContent = '0'; // Можно добавить реальные данные
    }

    async loadDoctors() {
        try {
            console.log('🔄 Загрузка врачей...');
            const response = await fetch('http://localhost:3000/api/admin/doctors', {
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            });
            
            console.log('📡 Статус ответа:', response.status);
            
            if (response.status === 401) {
                this.showError('Сессия истекла. Пожалуйста, войдите снова.');
                setTimeout(() => {
                    this.logout();
                }, 2000);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Данные врачей:', data);
            
            if (data.success) {
                this.doctors = data.doctors || [];
                this.renderDoctorsTable();
            } else {
                this.showError('Ошибка загрузки врачей: ' + data.error);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки врачей:', error);
            this.showError('Ошибка соединения: ' + error.message);
        }
    }

    renderDoctorsTable() {
        const tbody = document.getElementById('doctors-table-body');
        
        if (!tbody) {
            console.error('❌ Не найден tbody для врачей');
            return;
        }

        if (this.doctors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px; color: #666;">Нет врачей в базе данных</td></tr>';
            return;
        }

        console.log('🎨 Отрисовка таблицы врачей:', this.doctors.length, 'врачей');
        
        tbody.innerHTML = this.doctors.map(doctor => `
            <tr>
                <td><strong>${doctor.name || doctor.full_name || 'Не указано'}</strong></td>
                <td>${doctor.specialization || 'Не указана'}</td>
                <td>
                    <button class="action-btn edit-btn" data-doctor-id="${doctor.id}">
                        ✏️ Редактировать
                    </button>
                    <button class="action-btn delete-btn" data-doctor-id="${doctor.id}">
                        🗑️ Удалить
                    </button>
                </td>
            </tr>
        `).join('');

        // Добавляем обработчики для кнопок в таблице
        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const doctorId = e.target.dataset.doctorId;
                console.log('✏️ Редактирование врача:', doctorId);
                this.editDoctor(parseInt(doctorId));
            });
        });

        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const doctorId = e.target.dataset.doctorId;
                console.log('🗑️ Удаление врача:', doctorId);
                this.deleteDoctor(parseInt(doctorId));
            });
        });
    }

    async loadUsers() {
        try {
            console.log('🔄 Загрузка пользователей...');
            const response = await fetch('http://localhost:3000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            });
            
            console.log('📡 Статус ответа:', response.status);
            
            if (response.status === 401) {
                this.showError('Сессия истекла. Пожалуйста, войдите снова.');
                setTimeout(() => {
                    this.logout();
                }, 2000);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Данные пользователей:', data);
            
            if (data.success) {
                this.users = data.users || [];
                this.renderUsersTable();
            } else {
                this.showError('Ошибка загрузки пользователей: ' + data.error);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки пользователей:', error);
            this.showError('Ошибка соединения: ' + error.message);
        }
    }

    renderUsersTable() {
        const tbody = document.getElementById('users-table-body');
        
        if (!tbody) {
            console.error('❌ Не найден tbody для пользователей');
            return;
        }

        if (this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #666;">Нет пользователей</td></tr>';
            return;
        }

        console.log('🎨 Отрисовка таблицы пользователей:', this.users.length, 'пользователей');
        
        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td><strong>${user.username}</strong></td>
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>
                    <select class="role-select" data-user-id="${user.id}">
                        <option value="patient" ${user.role === 'patient' ? 'selected' : ''}>Пациент</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Админ</option>
                    </select>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                    <button class="action-btn delete-btn" data-user-id="${user.id}" 
                            ${user.id === this.auth.user.id ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        🗑️ Удалить
                    </button>
                </td>
            </tr>
        `).join('');

        // Добавляем обработчики для селектов ролей
        tbody.querySelectorAll('.role-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const userId = parseInt(e.target.dataset.userId);
                const newRole = e.target.value;
                console.log('🔄 Изменение роли пользователя:', userId, newRole);
                this.changeUserRole(userId, newRole);
            });
        });

        // Добавляем обработчики для кнопок удаления
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', (e) => {
                    const userId = parseInt(e.target.dataset.userId);
                    console.log('🗑️ Удаление пользователя:', userId);
                    this.deleteUser(userId);
                });
            }
        });
    }

    showAddDoctorForm() {
        console.log('📝 Показ формы добавления врача');
        this.isEditing = false;
        document.getElementById('doctor-form-title').textContent = 'Добавить врача';
        document.getElementById('doctor-form-element').reset();
        document.getElementById('doctor-id').value = '';
        document.getElementById('doctor-form').style.display = 'block';
    }

    hideDoctorForm() {
        console.log('❌ Скрытие формы врача');
        document.getElementById('doctor-form').style.display = 'none';
        this.isEditing = false;
    }

    editDoctor(doctorId) {
        console.log('✏️ Редактирование врача:', doctorId);
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) {
            this.showError('Врач не найден');
            return;
        }

        this.isEditing = true;
        document.getElementById('doctor-form-title').textContent = 'Редактировать врача';
        document.getElementById('doctor-id').value = doctor.id;
        
        const nameField = document.getElementById('doctor-fullname');
        const specializationField = document.getElementById('doctor-specialization');
        
        if (nameField) nameField.value = doctor.name || doctor.full_name || '';
        if (specializationField) specializationField.value = doctor.specialization || '';
        
        document.getElementById('doctor-form').style.display = 'block';
    }

    async saveDoctor() {
        const doctorId = document.getElementById('doctor-id').value;
        const nameField = document.getElementById('doctor-fullname');
        const specializationField = document.getElementById('doctor-specialization');
        
        const fullName = nameField ? nameField.value.trim() : '';
        const specialization = specializationField ? specializationField.value.trim() : '';

        // Валидация
        if (!fullName) {
            this.showError('Введите ФИО врача');
            return;
        }

        if (!specialization) {
            this.showError('Введите специализацию врача');
            return;
        }

        const doctorData = {
            name: fullName,
            specialization: specialization
        };

        console.log('💾 Сохранение врача:', { doctorId, doctorData });

        try {
            const url = doctorId ? 
                `http://localhost:3000/api/admin/doctors/${doctorId}` : 
                'http://localhost:3000/api/admin/doctors';
            
            const method = doctorId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.token}`
                },
                body: JSON.stringify(doctorData)
            });

            const result = await response.json();
            console.log('📊 Результат сохранения:', result);

            if (result.success) {
                this.showSuccess(doctorId ? 'Врач обновлен!' : 'Врач добавлен!');
                this.hideDoctorForm();
                await this.loadDoctors();
            } else {
                this.showError('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения врача:', error);
            this.showError('Ошибка сохранения врача: ' + error.message);
        }
    }

    async deleteDoctor(doctorId) {
        if (!confirm('Вы уверены, что хотите удалить этого врача?')) {
            return;
        }

        console.log('🗑️ Удаление врача:', doctorId);

        try {
            const response = await fetch(`http://localhost:3000/api/admin/doctors/${doctorId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Врач удален!');
                await this.loadDoctors();
            } else {
                this.showError('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('❌ Ошибка удаления врача:', error);
            this.showError('Ошибка удаления врача: ' + error.message);
        }
    }

    async changeUserRole(userId, newRole) {
        try {
            console.log('🔄 Изменение роли пользователя:', userId, newRole);
            
            const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess(`Роль пользователя изменена на "${newRole}"`);
                await this.loadUsers();
            } else {
                this.showError('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('❌ Ошибка изменения роли:', error);
            this.showError('Ошибка изменения роли: ' + error.message);
        }
    }

    async deleteUser(userId) {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?\nВсе его записи также будут удалены.')) {
            return;
        }

        console.log('🗑️ Удаление пользователя:', userId);

        try {
            const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Пользователь удален!');
                await this.loadUsers();
            } else {
                this.showError('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('❌ Ошибка удаления пользователя:', error);
            this.showError('Ошибка удаления пользователя: ' + error.message);
        }
    }

    logout() {
        this.auth.logout();
        window.location.href = '/';
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Удаляем старые уведомления
        const oldNotifications = document.querySelectorAll('.admin-notification');
        oldNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type} admin-notification`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '10000';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
}

// Глобальные функции для HTML атрибутов
function showAddDoctorForm() {
    if (window.adminPanel) {
        window.adminPanel.showAddDoctorForm();
    }
}

function hideDoctorForm() {
    if (window.adminPanel) {
        window.adminPanel.hideDoctorForm();
    }
}

function logout() {
    if (window.adminPanel) {
        window.adminPanel.logout();
    } else {
        localStorage.clear();
        window.location.href = '/';
    }
}

// Глобальная функция для перехода на главную
function goToMainPage() {
    window.location.href = '/';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM загружен, инициализация админ-панели...');
    new AdminPanel();
});