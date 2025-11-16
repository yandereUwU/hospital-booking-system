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
        this.setupEventListeners();
        this.loadDoctors();
        this.generateCalendar();
        this.generateTimeSlots();
    }

    setupEventListeners() {
        // Фильтры специализаций
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterDoctors(e.target.dataset.specialization);
            });
        });

        // Навигация по шагам
        document.querySelectorAll('.step').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNumber = parseInt(e.currentTarget.dataset.step);
                if (stepNumber <= this.currentStep) {
                    this.goToStep(stepNumber);
                }
            });
        });

        // Навигация по месяцам
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.generateCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.generateCalendar();
        });
    }

    async loadDoctors() {
        const doctors = await this.appointments.getDoctors();
        this.renderDoctors(doctors);
        this.renderFullDoctorsGrid(doctors);
    }

    renderDoctors(doctors) {
        const grid = document.getElementById('doctors-grid');
        grid.innerHTML = doctors.map(doctor => `
            <div class="doctor-card" data-doctor-id="${doctor.id}" data-specialization="${doctor.specialization}">
                <div class="doctor-avatar">${doctor.full_name.split(' ').map(n => n[0]).join('')}</div>
                <h4>${doctor.full_name}</h4>
                <div class="doctor-specialization">${doctor.specialization}</div>
                <div class="doctor-rating">⭐ 4.8</div>
                <div class="doctor-contact">📞 ${doctor.phone}</div>
                <div class="doctor-contact">✉️ ${doctor.email}</div>
            </div>
        `).join('');

        // Добавляем обработчики выбора врача
        grid.querySelectorAll('.doctor-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedDoctor = card.dataset.doctorId;
                this.goToStep(2);
                this.updateSummary();
            });
        });
    }

    renderFullDoctorsGrid(doctors) {
        const grid = document.getElementById('doctors-grid-full');
        grid.innerHTML = doctors.map(doctor => `
            <div class="doctor-card">
                <div class="doctor-avatar">${doctor.full_name.split(' ').map(n => n[0]).join('')}</div>
                <h4>${doctor.full_name}</h4>
                <div class="doctor-specialization">${doctor.specialization}</div>
                <div class="doctor-rating">⭐ 4.8</div>
                <div class="doctor-contact">📞 ${doctor.phone}</div>
                <div class="doctor-contact">✉️ ${doctor.email}</div>
                <button class="book-btn" data-doctor-id="${doctor.id}">Записаться</button>
            </div>
        `).join('');

        // Обработчики для кнопок записи
        grid.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedDoctor = btn.dataset.doctorId;
                document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
                this.goToStep(1);
                // Прокрутка к системе записи
                document.querySelector('.quick-booking').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    filterDoctors(specialization) {
        const cards = document.querySelectorAll('.doctor-card');
        cards.forEach(card => {
            if (specialization === 'all' || card.dataset.specialization === specialization) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    generateCalendar() {
        const calendar = document.getElementById('calendar');
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                           'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        
        document.getElementById('current-month').textContent = 
            `${monthNames[this.currentMonth]} ${this.currentYear}`;

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
        for (let i = 0; i < firstDay.getDay(); i++) {
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
        // Обновляем шаги
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        document.querySelector(`.step[data-step="${step}"]`).classList.add('active');

        // Обновляем панели
        document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`step-${step}`).classList.add('active');

        this.currentStep = step;
    }

    updateSummary() {
        const summary = document.getElementById('appointment-summary');
        
        if (this.selectedDoctor && this.selectedDate && this.selectedTime) {
            const doctorName = document.querySelector('.doctor-card.selected h4')?.textContent || 'Врач';
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
            showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }

        const appointmentData = {
            doctor_id: this.selectedDoctor,
            appointment_date: this.selectedDate.toISOString().split('T')[0],
            appointment_time: this.selectedTime
        };

        const result = await this.appointments.createAppointment(appointmentData);
        
        if (result.success) {
            showNotification('Запись успешно создана!', 'success');
            // Сбрасываем форму
            this.selectedDoctor = null;
            this.selectedDate = null;
            this.selectedTime = null;
            this.goToStep(1);
            this.generateCalendar();
            this.generateTimeSlots();
            this.updateSummary();
            
            // Обновляем список записей
            if (window.loadUserAppointments) {
                window.loadUserAppointments();
            }
        } else {
            showNotification('Ошибка: ' + result.error, 'error');
        }
    }
}

// Инициализация системы записи
let bookingSystem;

function initBookingSystem(auth, appointments) {
    bookingSystem = new BookingSystem(auth, appointments);
    bookingSystem.init();
}