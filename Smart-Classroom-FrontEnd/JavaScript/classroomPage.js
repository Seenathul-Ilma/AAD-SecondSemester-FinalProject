 // API configuration
    const api = "http://localhost:8080/api/v1/edusphere/classrooms/";
    const classroomId = new URLSearchParams(window.location.search).get("classroomId");

    // Get user info from localStorage or default
    const userId = localStorage.getItem("userId") || "user123";
    const userName = localStorage.getItem("userName") || "Mirzan Musawwir";

    // Initialize the page
    document.addEventListener("DOMContentLoaded", function () {
        lucide.createIcons(); // Initialize icons

        // Set user information
        document.getElementById('announcementUserName').textContent = userName;
        document.getElementById('userInitials').textContent = getUserInitials(userName);

        // Update class info if classroomId is available
        if (classroomId) {
            document.getElementById('announcementClassInfo').textContent =
            `Posting to: Classroom ${classroomId}`;
        }
    });

    // Initialize Quill editor
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ]
    },
        placeholder: 'Write your announcement content here...'
    });

    // Modal elements
    const modal = document.getElementById('announcementModal');
    const createBtn = document.getElementById('createAnnouncementBtn');
    const cancelBtn = document.getElementById('cancelAnnouncementBtn');
    const postBtn = document.getElementById('postAnnouncementBtn');
    const titleInput = document.getElementById('announcementTitleInput');

    // File handling elements
    const fileInput = document.getElementById('fileInput');
    const fileSelectBtn = document.getElementById('fileSelectBtn');
    const fileCount = document.getElementById('fileCount');
    const filePreviews = document.getElementById('filePreviews');
    let selectedFiles = [];

    // Open modal
    createBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });

    // Close modal
    cancelBtn.addEventListener('click', () => {
        closeModal();
    });

    // File selection handling
    fileSelectBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        updateFilePreviews();
    });

    // Post announcement
    postBtn.addEventListener('click', () => {
         const content = quill.root.innerHTML.trim();
         const title = titleInput.value.trim();

         if (!title) {
             alert('Please add a title to your announcement.');
             titleInput.focus();
             return;
         }

         if (!content || content === '<p><br></p>') {
             alert('Please write something before posting.');
             return;
         }

         // Prepare FormData
         const formData = new FormData();
         formData.append("title", title);
         formData.append("content", content);

         // Add files if any were selected
         selectedFiles.forEach(file => {
             formData.append("files", file);
         });

         // Make API request with ajaxWithToken
         ajaxWithToken({
             url: `${api}${classroomId}/announcements/${userId}/create`,
             method: "POST",
             data: formData,
             processData: false,  // important for FormData
             contentType: false,  // important for FormData
             success: function (data) {
                 if (data.status === 201) {
                     alert("Announcement created successfully!");
                     closeModal();
                     // TODO: refresh announcements list
                     // loadAnnouncements();
                 } else {
                     alert(data.message || "Failed to create announcement.");
                 }
             }
         });
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Helper functions
    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        quill.setText('');
        titleInput.value = '';
        selectedFiles = [];
        updateFilePreviews();
    }

    function updateFilePreviews() {
        // Clear previous previews
        filePreviews.innerHTML = '';

        if (selectedFiles.length > 0) {
            fileCount.textContent = `${selectedFiles.length} file(s) selected`;
            fileCount.classList.remove('hidden');
            filePreviews.classList.remove('hidden');

            selectedFiles.forEach((file, index) => {
                const preview = document.createElement('div');
                preview.className = 'file-preview flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg';

                // File icon based on type
                let icon = 'file';
                if (file.type.includes('image')) icon = 'image';
                if (file.type.includes('pdf')) icon = 'file-text';
                if (file.type.includes('zip')) icon = 'archive';

                preview.innerHTML = `
                            <div class="flex items-center gap-2">
                                <i data-lucide="${icon}" class="w-4 h-4 text-gray-500"></i>
                                <span class="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">${file.name}</span>
                                <span class="text-xs text-gray-500">(${formatFileSize(file.size)})</span>
                            </div>
                            <button type="button" class="text-red-500 hover:text-red-700" data-index="${index}">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        `;

                filePreviews.appendChild(preview);
            });

            // Add event listeners to remove buttons
            document.querySelectorAll('#filePreviews button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.getAttribute('data-index'));
                    selectedFiles.splice(index, 1);
                    updateFilePreviews();
                });
            });

            // Update icons for new elements
            lucide.createIcons();
        } else {
            fileCount.classList.add('hidden');
            filePreviews.classList.add('hidden');
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function getUserInitials(name) {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
    }

    // Token refresh function (if needed)
    // ====================== Token Refresh ======================
    function refreshAccessToken() {
        return $.ajax({
            url: "http://localhost:8080/api/v1/auth/refresh",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") })
        }).done(function(response) {
            localStorage.setItem("accessToken", response.accessToken);
        });
    }


 // ====================== AJAX with Token ======================
 function ajaxWithToken(options) {
     const accessToken = localStorage.getItem("accessToken");
     options.headers = options.headers || {};
     options.headers["Authorization"] = "Bearer " + accessToken;

     const originalError = options.error;
     options.error = function(xhr, status, error) {
         if (xhr.status === 401) {
             // Unauthorized -> refresh token
             refreshAccessToken().done(function() {
                 ajaxWithToken(options);
             }).fail(function() {
                 alert("Session expired. Please log in again.");
                 window.location.href = "login.html";
             });
         } else if (xhr.status === 403) {
             // Forbidden -> show proper message
             alert(xhr.responseJSON?.message || "Only creator can edit classrooms. You're not the creator of this classroom.");
         }else if (xhr.status === 400) {
             alert(xhr.responseJSON?.message || "Failed to update the classroom..");
         } else if (originalError) {
             originalError(xhr, status, error);
         }
     };
     return $.ajax(options);
 }

