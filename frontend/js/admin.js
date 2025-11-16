class AdminPanel {
    constructor() {
        this.auth = new Auth();
        this.currentSection = 'doctors';
        this.doctors = [];
        this.users = [];
        this.isEditing = false;
    }

    async init() {
        // Проверяем авторизацию
        if (!this.auth.isAuthenticated()) {
            window.location.href = '/';
            return;
        }

        console.log('✅ Админ-панель инициализирована для пользователя:', this.auth.user.username);
        this.setupEventListeners();
        await this.loadDoctors();
    }

    setupEventListeners() {
        // Навигация по секциям
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        // Форма врача
        const doctorForm = document.getElementById('doctor-form-element');
        if (doctorForm) {
            doctorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveDoctor();
            });
        }

        // Кнопка отмены в форме
        const cancelBtn = document.querySelector('button[onclick="hideDoctorForm()"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideDoctorForm();
            });
        }
    }

    showSection(section) {
        // Обновляем активные кнопки
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Показываем активную секцию
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        this.currentSection = section;

        // Загружаем данные для активной секции
        if (section === 'doctors') {
            this.loadDoctors();
        } else if (section === 'users') {
            this.loadUsers();
        }
    }

    async loadDoctors() {
        try {
            console.log('🔄 Загрузка врачей для админки...');
            const response = await fetch('http://localhost:3000/api/admin/doctors', {
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            });
            
            console.log('📡 Статус ответа:', response.status);
            
            if (response.status === 401) {
                this.showError('Сессия истекла. Пожалуйста, войдите снова.');
                setTimeout(() => {
                    logout();
                }, 2000);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Ответ от сервера:', data);
            
            if (data.success) {
                this.doctors = data.doctors || [];
                this.renderDoctorsTable();
            } else {
                console.error('Ошибка загрузки врачей:', data.error);
                this.showError('Ошибка загрузки врачей: ' + data.error);
            }
        } catch (error) {
            console.error('Ошибка загрузки врачей:', error);
            this.showError('Ошибка соединения: ' + error.message);
        }
    }

    renderDoctorsTable() {
        const tbody = document.getElementById('doctors-table-body');
        
        if (!tbody) {
            console.error('❌ Не найден tbody для таблицы врачей');
            return;
        }

        if (this.doctors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px; color: #666;">Нет врачей в базе данных</td></tr>';
            return;
        }

        console.log('🎨 Отрисовка таблицы врачей:', this.doctors);
        
        tbody.innerHTML = this.doctors.map(doctor => `
            <tr>
                <td><strong>${doctor.name || doctor.full_name || 'Не указано'}</strong></td>
                <td>${doctor.specialization || 'Не указана'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="adminPanel.editDoctor(${doctor.id})">
                        ✏️ Редактировать
                    </button>
                    <button class="action-btn delete-btn" onclick="adminPanel.deleteDoctor(${doctor.id})">
                        🗑️ Удалить
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadUsers() {
        try {
            console.log('🔄 Загрузка пользователей для админки...');
            const response = await fetch('http://localhost:3000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            });
            
            console.log('📡 Статус ответа:', response.status);
            
            if (response.status === 401) {
                this.showError('Сессия истекла. Пожалуйста, войдите снова.');
                setTimeout(() => {
                    logout();
                }, 2000);
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Пользователи:', data);
            
            if (data.success) {
                this.users = data.users || [];
                this.renderUsersTable();
            } else {
                console.error('Ошибка загрузки пользователей:', data.error);
                this.showError('Ошибка загрузки пользователей: ' + data.error);
            }
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            this.showError('Ошибка соединения: ' + error.message);
        }
    }

    renderUsersTable() {
        const tbody = document.getElementById('users-table-body');
        
        if (!tbody) {
            console.error('❌ Не найден tbody для таблицы пользователей');
            return;
        }

        if (this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #666;">Нет пользователей</td></tr>';
            return;
        }

        console.log('🎨 Отрисовка таблицы пользователей:', this.users);
        
        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td><strong>${user.username}</strong></td>
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>
                    <select class="role-select" data-user-id="${user.id}" onchange="adminPanel.changeUserRole(${user.id}, this.value)">
                        <option value="patient" ${user.role === 'patient' ? 'selected' : ''}>Пациент</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Админ</option>
                    </select>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                    <button class="action-btn delete-btn" onclick="adminPanel.deleteUser(${user.id})" 
                            ${user.id === this.auth.user.id ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        🗑️ Удалить
                    </button>
                </td>
            </tr>
        `).join('');
    }

    showAddDoctorForm() {
        console.log('📝 Показ формы добавления врача');
        this.isEditing = false;
        document.getElementById('doctor-form-title').textContent = 'Добавить врача';
        document.getElementById('doctor-form-element').reset();
        document.getElementById('doctor-id').value = '';
        document.getElementById('doctor-form').style.display = 'block';
        
        // Фокус на первое поле
        setTimeout(() => {
            const nameField = document.getElementById('doctor-fullname');
            if (nameField) nameField.focus();
        }, 100);
    }

    hideDoctorForm() {
        console.log('❌ Скрытие формы врача');
        document.getElementById('doctor-form').style.display = 'none';
        this.isEditing = false;
    }

    async editDoctor(doctorId) {
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
        
        // Фокус на первое поле
        setTimeout(() => {
            if (nameField) nameField.focus();
        }, 100);
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
            if (nameField) nameField.focus();
            return;
        }

        if (!specialization) {
            this.showError('Введите специализацию врача');
            if (specializationField) specializationField.focus();
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

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
            }

            const result = await response.json();
            console.log('📊 Результат сохранения:', result);

            if (result.success) {
                this.showSuccess(doctorId ? 'Врач обновлен!' : 'Врач добавлен!');
                this.hideDoctorForm();
                await this.loadDoctors(); // Перезагружаем список
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Врач удален!');
                await this.loadDoctors(); // Обновляем таблицу
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.showSuccess(`Роль пользователя изменена на "${newRole}"`);
                await this.loadUsers(); // Обновляем таблицу
            } else {
                this.showError('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
                // Восстанавливаем предыдущее значение
                await this.loadUsers();
            }
        } catch (error) {
            console.error('❌ Ошибка изменения роли:', error);
            this.showError('Ошибка изменения роли: ' + error.message);
            // Восстанавливаем предыдущее значение
            await this.loadUsers();
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Пользователь удален!');
                await this.loadUsers(); // Обновляем таблицу
            } else {
                this.showError('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('❌ Ошибка удаления пользователя:', error);
            this.showError('Ошибка удаления пользователя: ' + error.message);
        }
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