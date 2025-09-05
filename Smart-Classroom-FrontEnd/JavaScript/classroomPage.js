document.addEventListener("DOMContentLoaded", function () {
    // Initialize Lucide icons
    lucide.createIcons();
})

// Initialize Quill editor
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{'header': [1, 2, 3, 4, 5, 6, false]}],
            ['bold', 'italic', 'underline', 'strike'],
            [{'color': []}, {'background': []}],
            ['blockquote', 'code-block'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'image'],
            ['clean']
        ]
    },
    placeholder: 'Write your announcement here...'
});

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', function () {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(t => {
            t.classList.remove('bg-white', 'dark:bg-gray-600', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm');
            t.classList.add('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
        });

        // Add active class to clicked tab
        this.classList.remove('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
        this.classList.add('bg-white', 'dark:bg-gray-600', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm');

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('block'));

        // Show the corresponding tab content
        const tabId = this.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        document.getElementById(`${tabId}-tab`).classList.add('block');
    });
});

// Modal functionality
const modal = document.getElementById('announcementModal');
const createBtn = document.getElementById('createAnnouncementBtn');
const cancelBtn = document.getElementById('cancelAnnouncementBtn');
const postBtn = document.getElementById('postAnnouncementBtn');

createBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
});

cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    quill.setText(''); // Clear editor
});

postBtn.addEventListener('click', () => {
    const content = quill.root.innerHTML;
    if (content === '<p><br></p>' || content === '') {
        alert('Please write something before posting.');
        return;
    }

    // Here you would typically send the content to your backend
    alert('Announcement posted successfully!');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    quill.setText(''); // Clear editor

    // In a real application, you would add the new announcement to the list
});

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        quill.setText(''); // Clear editor
    }
});
