document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = sessionStorage.getItem('currentUser');

    // Get current path (e.g., "/login", "/register")
    const currentPage = window.location.pathname;

    // Define public pages
    const publicPages = ['/', '/login', '/register'];

    // If not logged in and trying to access a private page
    if (!currentUser && !publicPages.includes(currentPage)) {
        window.location.href = '/login';
    }

    // If logged in, update UI and bind logout
    if (currentUser) {
        const user = JSON.parse(currentUser);
        
        const welcomeUser = document.getElementById('welcomeUser');
        if (welcomeUser) {
            welcomeUser.textContent = `Welcome, ${user.name}`;
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('currentUser');
                window.location.href = '/login';
            });
        }
    }
});
