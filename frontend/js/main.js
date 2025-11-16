document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MedBook инициализирован');
    
    const auth = new Auth();
    const appointments = new Appointments(auth);
    
    // Элементы DOM
    const authPage = document.getElementById('auth-page');
    const mainPage = document.getElementById('main-page');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form-element');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Инициализация
    init();

    function init() {
        console.log('🔧 Инициализация приложения...');
        if (auth.isAuthenticated()) {
            console.log('✅ Пользователь авторизован');
            showMainPage();
        } else {
            console.log('❌ Пользователь не авторизован');
            showAuthPage();
        }
        
        setupEventListeners();
    }

    function setupEventListeners() {
        console.log('📝 Настройка обработчиков событий...');
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        showRegisterBtn.addEventListener('click', () => toggleAuthForms('register'));
        showLoginBtn.addEventListener('click', () => toggleAuthForms('login'));
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        console.log('🔐 Попытка входа...');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const result = await auth.login(username, password);
        
        if (result.success) {
            showNotification('Вход выполнен успешно!', 'success');
            showMainPage();
        } else {
            showNotification('Ошибка входа: ' + result.error, 'error');
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        console.log('📝 Попытка регистрации...');
        
        const userData = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            full_name: document.getElementById('reg-fullname').value,
            birth_date: document.getElementById('reg-birthdate').value,
            phone: document.getElementById('reg-phone').value
        };
        
        const result = await auth.register(userData);
        
        if (result.success) {
            showNotification('Регистрация успешна! Теперь войдите в систему.', 'success');
            toggleAuthForms('login');
        } else {
            showNotification('Ошибка регистрации: ' + result.error, 'error');
        }
    }

    function handleLogout() {
        console.log('🚪 Выход из системы...');
        auth.logout();
        showNotification('Вы вышли из системы', 'success');
        showAuthPage();
    }

    function toggleAuthForms(form) {
        const loginFormElement = document.querySelector('#auth-page .auth-form');
        const registerFormElement = document.getElementById('register-form');
        
        if (form === 'register') {
            loginFormElement.style.display = 'none';
            registerFormElement.style.display = 'block';
        } else {
            loginFormElement.style.display = 'block';
            registerFormElement.style.display = 'none';
        }
    }

    function showAuthPage() {
        console.log('👤 Показ страницы авторизации');
        if (authPage) authPage.style.display = 'flex';
        if (mainPage) mainPage.style.display = 'none';
    }

    async function showMainPage() {
        console.log('🏠 Показ главной страницы');
        if (authPage) authPage.style.display = 'none';
        if (mainPage) mainPage.style.display = 'block';
        
        // Обновляем приветствие
        const welcomeMessage = document.getElementById('welcome-message');
        const userName = document.getElementById('user-name');
        const adminLink = document.getElementById('admin-link');
        
        if (welcomeMessage && auth.user) {
            welcomeMessage.textContent = `Добро пожаловать, ${auth.user.full_name}!`;
        }
        if (userName && auth.user) {
            userName.textContent = auth.user.full_name;
        }
        
        // Показываем админ-панель только для администраторов
        if (adminLink && auth.user && auth.user.role === 'admin') {
            adminLink.style.display = 'inline-block';
            console.log('✅ Показываем кнопку админ-панели для администратора');
        } else {
            adminLink.style.display = 'none';
            console.log('❌ Скрываем кнопку админ-панели для обычного пользователя');
        }
        
        // Загружаем данные
        await loadDoctors();
        await loadUserAppointments();
        
        // Инициализируем систему записи
        initBookingSystem();
        
        // Обновляем счетчик записей
        await updateAppointmentsCount();
        
        // Анимация появления
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }

    async function loadDoctors() {
        console.log('👨‍⚕️ Загрузка списка врачей...');
        const doctorsGrid = document.getElementById('doctors-grid');
        const doctorsGridFull = document.getElementById('doctors-grid-full');
        
        try {
            const doctors = await appointments.getDoctors();
            console.log('✅ Врачи загружены:', doctors);
            
            // Для системы записи (компактные карточки)
            if (doctorsGrid) {
                doctorsGrid.innerHTML = doctors.map(doctor => `
                    <div class="compact-doctor-card" data-doctor-id="${doctor.id}" data-specialization="${doctor.specialization}">
                        <div class="compact-doctor-avatar">${doctor.full_name.split(' ').map(n => n[0]).join('')}</div>
                        <h4>${doctor.full_name}</h4>
                        <div class="compact-doctor-specialization">${doctor.specialization}</div>
                        <div class="compact-doctor-contact">⭐ 4.8</div>
                    </div>
                `).join('');
            }
            
            // Для полной сетки (компактные карточки без кнопки)
            if (doctorsGridFull) {
                doctorsGridFull.innerHTML = doctors.map(doctor => `
                    <div class="compact-doctor-card">
                        <div class="compact-doctor-avatar">${doctor.full_name.split(' ').map(n => n[0]).join('')}</div>
                        <h4>${doctor.full_name}</h4>
                        <div class="compact-doctor-specialization">${doctor.specialization}</div>
                        <div class="compact-doctor-contact">📞 ${doctor.phone}</div>
                        <div class="compact-doctor-contact">✉️ ${doctor.email}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки врачей:', error);
            if (doctorsGrid) doctorsGrid.innerHTML = '<div class="loading">Ошибка загрузки врачей</div>';
            if (doctorsGridFull) doctorsGridFull.innerHTML = '<div class="loading">Ошибка загрузки врачей</div>';
        }
    }

    async function loadUserAppointments() {
        console.log('📋 Загрузка записей пользователя...');
        const container = document.getElementById('appointments-container');
        
        if (!container) return;
        
        try {
            const userAppointments = await appointments.getUserAppointments();
            console.log('✅ Записи загружены:', userAppointments);
            
            if (userAppointments.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">У вас нет активных записей</p>';
                return;
            }
            
            container.innerHTML = userAppointments.map(appointment => `
                <div class="appointment-item fade-in">
                    <h4>${appointment.doctor_name}</h4>
                    <p><strong>Специализация:</strong> ${appointment.doctor_specialization}</p>
                    <p><strong>Дата:</strong> ${new Date(appointment.appointment_date).toLocaleDateString('ru-RU')}</p>
                    <p><strong>Время:</strong> ${appointment.appointment_time}</p>
                    <p><strong>Статус:</strong> <span class="status-${appointment.status}">${appointment.status}</span></p>
                </div>
            `).join('');
        } catch (error) {
            console.error('❌ Ошибка загрузки записей:', error);
            container.innerHTML = '<div class="loading">Ошибка загрузки записей</div>';
        }
    }

    async function updateAppointmentsCount() {
        try {
            const userAppointments = await appointments.getUserAppointments();
            const activeAppointments = userAppointments.filter(apt => apt.status === 'scheduled');
            const countElement = document.getElementById('appointments-count');
            if (countElement) {
                countElement.textContent = activeAppointments.length;
            }
        } catch (error) {
            console.error('❌ Ошибка обновления счетчика:', error);
        }
    }

    function showNotification(message, type) {
        // Удаляем старые уведомления
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Система бронирования
    function initBookingSystem() {
        console.log('🎯 Инициализация системы бронирования...');
        window.bookingSystem = new BookingSystem(auth, appointments);
        window.bookingSystem.init();
    }

    // Делаем функции глобальными
    window.loadUserAppointments = loadUserAppointments;
    window.updateAppointmentsCount = updateAppointmentsCount;
});

// Класс системы бронирования
class BookingSystem {
    constructor(auth, appointments) {
        this.auth = auth;
        this.appointments = appointments;
        this.currentStep = 1;
        this.selectedDoctor = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    init() {
        console.log('🎯 BookingSystem инициализирован');
        this.setupEventListeners();
        this.generateCalendar();
        this.generateTimeSlots();
    }

    setupEventListeners() {
        console.log('📝 Настройка обработчиков бронирования...');
        
        // Фильтры специализаций
        const filterBtns = document.querySelectorAll('.specialization-filter .filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterDoctors(e.target.dataset.specialization);
            });
        });

        // Навигация по шагам
        const steps = document.querySelectorAll('.booking-steps .step');
        steps.forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNumber = parseInt(e.currentTarget.dataset.step);
                if (stepNumber <= this.currentStep) {
                    this.goToStep(stepNumber);
                }
            });
        });

        // Навигация по месяцам
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => this.previousMonth());
        }
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => this.nextMonth());
        }

        // Выбор врача в системе записи
        const doctorsGrid = document.getElementById('doctors-grid');
        if (doctorsGrid) {
            doctorsGrid.addEventListener('click', (e) => {
                const doctorCard = e.target.closest('.compact-doctor-card');
                if (doctorCard) {
                    this.selectDoctor(doctorCard.dataset.doctorId);
                }
            });
        }

        // Фильтры статусов записей
        document.querySelectorAll('.appointment-filter .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.appointment-filter .filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterAppointments(e.target.dataset.status);
            });
        });
    }

    selectDoctor(doctorId) {
        console.log('👨‍⚕️ Выбран врач:', doctorId);
        document.querySelectorAll('#doctors-grid .compact-doctor-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`#doctors-grid .compact-doctor-card[data-doctor-id="${doctorId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedDoctor = doctorId;
            this.goToStep(2);
            this.updateSummary();
        }
    }

    filterDoctors(specialization) {
        const cards = document.querySelectorAll('#doctors-grid .compact-doctor-card');
        cards.forEach(card => {
            if (specialization === 'all' || card.dataset.specialization === specialization) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.generateCalendar();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.generateCalendar();
    }

    generateCalendar() {
        const calendar = document.getElementById('calendar');
        if (!calendar) return;

        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                           'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        
        const monthTitle = document.getElementById('current-month');
        if (monthTitle) {
            monthTitle.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const today = new Date();

        let calendarHTML = '';

        // Заголовки дней недели
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-header">${day}</div>`;
        });

        // Пустые ячейки до первого дня
        const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day disabled"></div>';
        }

        // Дни месяца
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today && !isToday;
            const isAvailable = !isPast && date.getDay() !== 0; // Не воскресенье

            let className = 'calendar-day';
            if (isPast) {
                className += ' disabled';
            } else if (isAvailable) {
                className += ' available';
            }

            if (this.selectedDate && date.toDateString() === this.selectedDate.toDateString()) {
                className += ' selected';
            }

            calendarHTML += `
                <div class="${className}" data-date="${date.toISOString().split('T')[0]}">
                    ${day}
                    ${isToday ? '<div style="font-size:10px;color:#667eea;">сегодня</div>' : ''}
                </div>
            `;
        }

        calendar.innerHTML = calendarHTML;

        // Обработчики выбора даты
        calendar.querySelectorAll('.calendar-day.available').forEach(day => {
            day.addEventListener('click', () => {
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                day.classList.add('selected');
                this.selectedDate = new Date(day.dataset.date);
                this.goToStep(3);
                this.updateSummary();
            });
        });
    }

    generateTimeSlots() {
        const slotsContainer = document.getElementById('time-slots');
        if (!slotsContainer) return;

        const timeSlots = [];
        
        // Генерируем слоты с 9:00 до 18:00 с интервалом 30 минут
        for (let hour = 9; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                timeSlots.push(timeString);
            }
        }

        slotsContainer.innerHTML = timeSlots.map(time => `
            <div class="time-slot" data-time="${time}">${time}</div>
        `).join('');

        // Обработчики выбора времени
        slotsContainer.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                this.selectedTime = slot.dataset.time;
                this.updateSummary();
            });
        });
    }

    goToStep(step) {
        console.log('➡️ Переход к шагу:', step);
        
        // Обновляем шаги
        document.querySelectorAll('.booking-steps .step').forEach(s => s.classList.remove('active'));
        const currentStep = document.querySelector(`.booking-steps .step[data-step="${step}"]`);
        if (currentStep) currentStep.classList.add('active');

        // Обновляем панели
        document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
        const currentPanel = document.getElementById(`step-${step}`);
        if (currentPanel) currentPanel.classList.add('active');

        this.currentStep = step;
    }

    updateSummary() {
        const summary = document.getElementById('appointment-summary');
        if (!summary) return;
        
        if (this.selectedDoctor && this.selectedDate && this.selectedTime) {
            const doctorCard = document.querySelector('.compact-doctor-card.selected');
            const doctorName = doctorCard ? doctorCard.querySelector('h4').textContent : 'Врач';
            const dateString = this.selectedDate.toLocaleDateString('ru-RU');
            
            summary.innerHTML = `
                <h4>Подтверждение записи</h4>
                <div class="summary-item">
                    <span>Врач:</span>
                    <span>${doctorName}</span>
                </div>
                <div class="summary-item">
                    <span>Дата:</span>
                    <span>${dateString}</span>
                </div>
                <div class="summary-item">
                    <span>Время:</span>
                    <span>${this.selectedTime}</span>
                </div>
                <button class="confirm-btn" id="confirm-booking">Подтвердить запись</button>
            `;

            document.getElementById('confirm-booking').addEventListener('click', () => {
                this.confirmBooking();
            });
        } else {
            summary.innerHTML = '<p>Выберите врача, дату и время для записи</p>';
        }
    }

    async confirmBooking() {
    if (!this.selectedDoctor || !this.selectedDate || !this.selectedTime) {
        this.showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }

    // Проверяем, не является ли пользователь админом
    if (this.auth.user.role === 'admin') {
        this.showNotification('Администраторы не могут создавать записи на прием', 'error');
        return;
    }

    const appointmentData = {
        doctor_id: this.selectedDoctor,
        appointment_date: this.selectedDate.toISOString().split('T')[0],
        appointment_time: this.selectedTime
    };

    console.log('📝 Данные для записи:', appointmentData);

    const result = await this.appointments.createAppointment(appointmentData);
    
    if (result.success) {
        this.showNotification('Запись успешно создана!', 'success');
        // Сбрасываем форму
        this.selectedDoctor = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.goToStep(1);
        this.generateCalendar();
        this.generateTimeSlots();
        this.updateSummary();
        
        // Обновляем список записей и счетчик
        if (window.loadUserAppointments) {
            window.loadUserAppointments();
        }
        if (window.updateAppointmentsCount) {
            window.updateAppointmentsCount();
        }
    } else {
        this.showNotification('Ошибка: ' + result.error, 'error');
        console.error('❌ Ошибка создания записи:', result);
    }
}

    filterAppointments(status) {
        const appointments = document.querySelectorAll('.appointment-item');
        appointments.forEach(apt => {
            if (status === 'all') {
                apt.style.display = 'block';
            } else {
                const aptStatus = apt.querySelector('.status-scheduled') ? 'scheduled' : 
                                apt.querySelector('.status-completed') ? 'completed' : 'scheduled';
                apt.style.display = aptStatus === status ? 'block' : 'none';
            }
        });
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}