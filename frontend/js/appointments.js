class Appointments {
    constructor(auth) {
        this.auth = auth;
    }

    async getDoctors() {
        try {
            console.log('🔄 Запрос врачей...');
            const response = await fetch('http://localhost:3000/api/doctors', {
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            });
            
            console.log('📡 Ответ сервера:', response.status);
            const data = await response.json();
            console.log('📊 Данные врачей:', data);
            
            return data.doctors || [];
        } catch (error) {
            console.error('❌ Ошибка загрузки врачей:', error);
            return [];
        }
    }

    async createAppointment(appointmentData) {
        try {
            const response = await fetch('http://localhost:3000/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.token}`
                },
                body: JSON.stringify(appointmentData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating appointment:', error);
            return { success: false, error: 'Ошибка соединения' };
        }
    }

    async getUserAppointments() {
        try {
            const response = await fetch('http://localhost:3000/api/appointments/user', {
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            });
            const data = await response.json();
            return data.appointments || [];
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return [];
        }
    }
}