document.addEventListener('DOMContentLoaded', () => {
    const historyRecordsElement = document.getElementById('historyRecords');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Load attendance records
    loadAttendanceHistory();
    
    function loadAttendanceHistory() {
        // Show loading overlay
        loadingOverlay.classList.remove('hidden');
        
        // Get all attendance records
        const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
        
        // Filter records for current user
        const userRecords = allRecords.filter(record => 
            record.userId === currentUser.id
        );
        
        // Sort by timestamp (newest first)
        userRecords.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        // Group records by date
        const recordsByDate = {};
        userRecords.forEach(record => {
            const date = new Date(record.timestamp).toLocaleDateString();
            if (!recordsByDate[date]) {
                recordsByDate[date] = [];
            }
            recordsByDate[date].push(record);
        });
        
        // Hide loading overlay
        loadingOverlay.classList.add('hidden');
        
        // Display records
        if (Object.keys(recordsByDate).length > 0) {
            historyRecordsElement.innerHTML = '';
            
            Object.entries(recordsByDate).forEach(([date, dateRecords]) => {
                const dateSection = document.createElement('div');
                dateSection.innerHTML = `<h3 class="history-date">${date}</h3>`;
                
                const table = document.createElement('table');
                table.className = 'history-table';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;
                
                const tbody = table.querySelector('tbody');
                
                dateRecords.forEach(record => {
                    const recordTime = new Date(record.timestamp).toLocaleTimeString();
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="activity-record-type">${record.type}</td>
                        <td>${recordTime}</td>
                        <td>
                            <span class="activity-record-status status-${record.type}">
                                ${record.type === 'check-in' ? 'Arrived' : 'Left'}
                            </span>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                
                dateSection.appendChild(table);
                historyRecordsElement.appendChild(dateSection);
            });
        } else {
            historyRecordsElement.innerHTML = '<p class="empty-state">No attendance records found.</p>';
        }
    }
});