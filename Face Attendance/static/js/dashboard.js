document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    // Redirect to login if no user is logged in
    if (!currentUser) {
        alert("You are not logged in. Redirecting to login...");
        window.location.href = "/login";
        return;
    }

    // DOM elements
    const currentDateElement = document.getElementById('currentDate');
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    const todayRecordsElement = document.getElementById('todayRecords');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const toast = document.getElementById('toast');
    const welcomeUser = document.getElementById('welcomeUser');
    const logoutBtn = document.getElementById('logoutBtn');

    welcomeUser.textContent = `Welcome, ${currentUser.name}`;

    // Show current date
    const now = new Date();
    currentDateElement.textContent = `Today is ${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;

    // Load today's attendance records
    loadTodayRecords();

    // Event listeners
    checkInBtn.addEventListener('click', () => handleAttendance('check-in'));
    checkOutBtn.addEventListener('click', () => handleAttendance('check-out'));
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = '/login';
    });

    function handleAttendance(type) {
        loadingOverlay.classList.remove('hidden');

        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
        const today = new Date().toISOString().split('T')[0];

        const alreadyMarked = allRecords.some(record => {
            const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
            return record.userId === currentUser.id && recordDate === today && record.type === type;
        });

        if (alreadyMarked) {
            loadingOverlay.classList.add('hidden');
            showToast('Error', `You already ${type === 'check-in' ? 'checked in' : 'checked out'} today.`, 'error');
            return;
        }

        // Simulate recognition delay
        setTimeout(() => {
            const newRecord = {
                id: Date.now().toString(),
                userId: currentUser.id,
                userName: currentUser.name,
                timestamp: new Date().toISOString(),
                type: type
            };

            allRecords.push(newRecord);
            localStorage.setItem('attendanceRecords', JSON.stringify(allRecords));

            loadTodayRecords();
            loadingOverlay.classList.add('hidden');
            showToast('Success', `You have ${type === 'check-in' ? 'checked in' : 'checked out'} at ${new Date().toLocaleTimeString()}`, 'success');
        }, 1000);
    }

    function loadTodayRecords() {
        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
        const today = new Date().toISOString().split('T')[0];

        const todayRecords = allRecords.filter(record => {
            const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
            return record.userId === currentUser.id && recordDate === today;
        });

        todayRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        todayRecordsElement.innerHTML = '';

        if (todayRecords.length === 0) {
            todayRecordsElement.innerHTML = '<p class="empty-state">No activity recorded today.</p>';
        } else {
            todayRecords.forEach(record => {
                const recordTime = new Date(record.timestamp).toLocaleTimeString();
                const div = document.createElement('div');
                div.className = 'activity-record';
                div.innerHTML = `
                    <div>
                        <span class="activity-record-type">${record.type}</span>
                        <span class="activity-record-time">${recordTime}</span>
                    </div>
                    <div class="activity-record-status status-${record.type}">
                        ${record.type === 'check-in' ? 'Arrived' : 'Left'}
                    </div>
                `;
                todayRecordsElement.appendChild(div);
            });
        }
    }

    function showToast(title, message, type = 'success') {
        const toastTitle = toast.querySelector('.toast-title');
        const toastDescription = toast.querySelector('.toast-description');

        toastTitle.textContent = title;
        toastDescription.textContent = message;

        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
});
