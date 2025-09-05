    document.addEventListener("DOMContentLoaded", function () {
        // Initialize Lucide icons
        lucide.createIcons();
    })

    // Tab functionality
    document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active classes from all tabs
        document.querySelectorAll('.tab-btn').forEach(t => {
            t.classList.remove('bg-white', 'dark:bg-gray-600', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm');
            t.classList.add('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
        });

        // Add active classes to clicked tab
        this.classList.remove('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
        this.classList.add('bg-white', 'dark:bg-gray-600', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm');

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('block');
            content.classList.add('hidden');
        });

        // Show the corresponding tab content
        const tabId = this.getAttribute('data-tab');
        const targetContent = document.getElementById(`${tabId}-tab`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.classList.add('block');
        }
    });
});

    // Floating action button functionality
    document.getElementById('createClassroomFab').addEventListener('click', function() {
    alert('Create new classroom modal would open here.');
});
