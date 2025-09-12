 // Initialize the page
    document.addEventListener("DOMContentLoaded", function () {
        lucide.createIcons(); // Initialize icons

        loadDataPaginated(1, default_page_size);

        // Set user information
        document.getElementById('announcementUserName').textContent = userName;
        document.getElementById('userInitials').textContent = getUserInitials(userName);
        console.log("Initials: "+ userName)

        // Update class info if classroomId is available
        if (classroomId) {
            document.getElementById('announcementClassInfo').textContent =
            `Posting to: Classroom ${classroomId}`;
        }
    });

    // API configuration
     const api = "http://localhost:8080/api/v1/edusphere/classrooms/";
     const classroomId = new URLSearchParams(window.location.search).get("classroomId");
     const default_page_size = 10;
     const max_visible_pages = 7;

     // Get user info from localStorage or default
     const userId = localStorage.getItem("userId");
     const userName = localStorage.getItem("userName");


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
             //alert('Please add a title to your announcement.');
             showMessage("warning", "Please add a title to your announcement.")
             titleInput.focus();
             return;
         }

         if (!content || content === '<p><br></p>') {
             //alert('Please write something before posting.');
             showMessage("warning", "Please write something before posting.");
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
                     //alert("Announcement created successfully!");
                     showMessage("success", "Announcement created successfully!");
                     closeModal();
                     loadDataPaginated(state.page, state.size);
                 } else {
                     //alert(data.message || "Failed to create announcement.");
                     showMessage("error", data.message || "Failed to create announcement.");
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
        if (!name || typeof name !== "string") return "?";  // fallback
        return name.trim().charAt(0).toUpperCase();
    }


    /* // Token refresh function (if needed)
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
    }*/


    // ====================== AJAX with Token ======================
/*
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
*/

 function renderAnnouncements(items) {
     const $div = $("#announcement-cards-container");
     $div.empty();

     if (!items || items.length === 0) {
         $div.html(`
            <p class="text-center text-gray-500 dark:text-gray-400">No announcements yet.</p>
        `);
         return;
     }

     const userId = localStorage.getItem("userId");

     items.forEach((announcement) => {

         const actionButtons = (announcement.announcedUserId === userId) ? `
            <div class="absolute top-4 right-4 dropdown">
                <button class="action-btn p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <i data-lucide="more-horizontal" class="w-5 h-5"></i>
                </button>
                <div class="dropdown-menu hidden absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                    <div class="menu-item px-3 py-2 text-gray-700 dark:text-gray-200 cursor-pointer" data-action="edit" data-id="${announcement.announcementId}">
                        <i data-lucide="edit-3" class="w-4 h-4 inline-block mr-1"></i>Edit
                    </div>
                    <div class="menu-item px-3 py-2 text-gray-700 dark:text-gray-200 cursor-pointer" data-action="delete" data-id="${announcement.announcementId}">
                        <i data-lucide="trash-2" class="w-4 h-4 inline-block mr-1"></i>Delete
                    </div>
                </div>
            </div>
        ` : "";

         const card = `
            <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-5 shadow-sm relative">
                ${actionButtons}
                <div class="flex items-start gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        ${getUserInitials(announcement.announcedUserName || announcement.creator?.name)}
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-800 dark:text-white">${announcement.announcedUserName}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            ${formatRelativeTime(announcement.createdAt)}
                        </p>
                    </div>
                </div>
                <div class="text-gray-700 dark:text-gray-300 mb-4 announcement-content">
                    <h4 class="font-medium text-lg mb-2">${announcement.title}</h4>
                    <div>${announcement.content}</div>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <button class="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 show-comments" data-id="${announcement.announcementId}">
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                    <span>${announcement.comments?.length || 0} comments</span>
                  </button>
                </div>


                <!-- Comment Input Field -->
                <div class="flex items-center gap-2 mt-2">
                    <input type="text" placeholder="Write a comment..." 
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
                        data-announcement-id="${announcement.announcementId}" />
                    <button class="comment-submit-btn px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center" data-announcement-id="${announcement.announcementId}">
                      <i data-lucide="send" class="w-4 h-4 mr-2"></i>
                      Comment
                    </button>
                </div>
            </div>
        `;

         $div.append(card);
     });

     // Refresh icons after dynamic render
     if (window.lucide?.createIcons) lucide.createIcons();
 }

     // Toggle dropdown visibility
     $("#announcement-cards-container").on('click', '.action-btn', function (e) {
         e.stopPropagation(); // prevent click from bubbling up
         const $menu = $(this).siblings('.dropdown-menu');
         $('.dropdown-menu').not($menu).addClass('hidden');
         $menu.toggleClass('hidden');
     });

     // Close dropdown if clicked outside
     $(document).on('click', () => {
         $('.dropdown-menu').addClass('hidden');
     });

    function loadDataPaginated(page1 = 1, size = state.size) {
        const zeroBasedPage = Math.max(0, page1 - 1);

        ajaxWithToken({
             url: `${api}${classroomId}/view/announcements?page=${zeroBasedPage}&size=${size}`,
             method: "GET",
             dataType: "json",
             success: function (response) {
                 const data = response.data || {};  // unwrap the ApiResponse

                 const {
                     content = [],
                     number = 0,
                     size: respSize = size,
                     totalPages = 1,
                     totalElements = 0,
                 } = data;   // destructure from data

                 state.page = (number ?? 0) + 1; // convert 0-based -> 1-based
                 state.size = respSize ?? size;
                 state.totalPages = totalPages ?? 1;
                 state.totalElements = totalElements ?? 0;

                 state.currentPageData = data;

                 // Correct
                 renderAnnouncements(data.content);
                 renderPaginationFooter();

             },
             error: function (xhr) {
                 console.error("Error loading announcements:", xhr.responseJSON || xhr);
                 if (xhr.status === 401) {
                     //alert("Session expired. Please log in again.");
                     showMessage("error", "Session expired. Please log in again.");
                     window.location.href = "login.html";
                 }
             }
         });
    }

    function formatRelativeTime(dateString) {
     if (!dateString) return "";

     const date = new Date(dateString);
     const now = new Date();
     const diffMs = now - date;

     const seconds = Math.floor(diffMs / 1000);
     const minutes = Math.floor(seconds / 60);
     const hours   = Math.floor(minutes / 60);
     const days    = Math.floor(hours / 24);

     if (seconds < 60) {
         return "Just now";
     } else if (minutes < 60) {
         return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
     } else if (hours < 24) {
         return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
     } else if (days < 7) {
         return `${days} day${days !== 1 ? "s" : ""} ago`;
     } else {
         // fallback to a readable date
         return date.toLocaleDateString(undefined, {
             year: "numeric",
             month: "short",
             day: "numeric"
         });
     }
 }

 // Open comments modal when clicking the comment icon
 $("#announcement-cards-container").on("click", ".show-comments", function () {
     const announcementId = $(this).data("id");
     loadComments(announcementId);
 });

 function loadComments(announcementId) {
     console.log("announcementId:", announcementId);
     ajaxWithToken({
         url: `${api}announcements/comments/announcement/${announcementId}`,
         method: "GET",
         success: function (response) {
             const comments = response;  // because backend returns a raw array

             renderComments(comments);
             $("#commentModal").removeClass("hidden").addClass("flex");
         },
         error: function (xhr) {
             console.error("Failed to load comments", xhr.responseJSON || xhr);
             //alert("Failed to load comments.");
             showMessage("error", "Failed to load comments.");
         }
     });
 }

 function renderComments(comments) {
     const $list = $("#commentsList");
     $list.empty();

     if (!comments || comments.length === 0) {
         $list.html(`<p class="text-gray-500 dark:text-gray-400">No comments yet.</p>`);
         return;
     }

     const userId = localStorage.getItem("userId"); // logged-in user

     comments.forEach(c => {
         // Show edit/delete only if logged-in user is the commenter
         const actionDropdown = (c.commenterId === userId) ? `
            <div class="absolute top-2 right-2 dropdown">
                <button class="action-btn p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <i data-lucide="more-horizontal" class="w-4 h-4"></i>
                </button>
                <div class="dropdown-menu hidden absolute right-0 mt-1 w-24 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                    <div class="menu-item flex items-center px-3 py-1 text-gray-700 dark:text-gray-200 cursor-pointer comment-delete-btn" data-id="${c.commentId}">
                        <i data-lucide="trash-2" class="w-4 h-4 mr-1"></i>
                        Delete
                    </div>
                </div>
            </div>
        ` : "";

         $list.append(`
            <div class="relative p-3 border rounded-lg dark:border-gray-600 mb-2">
                <p class="font-semibold text-gray-800 dark:text-white">${c.commenterName || "Unknown"}</p>
                <p class="text-gray-700 dark:text-gray-300 comment-content">${c.content}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${formatRelativeTime(c.createdAt)}</p>
                ${actionDropdown}
            </div>
        `);
     });

     // Refresh Lucide icons after rendering
     if (window.lucide?.createIcons) lucide.createIcons();
 }

 $("#closeCommentModal").on("click", function () {
     $("#commentModal").addClass("hidden").removeClass("flex");
 });

 $(document).on("click", function (e) {
     if ($(e.target).is("#commentModal")) {
         $("#commentModal").addClass("hidden").removeClass("flex");
     }
 });

 // Listen for comment submissions
 $("#announcement-cards-container").on("click", ".comment-submit-btn", function() {
     const announcementId = $(this).data("announcement-id");
     const inputField = $(`input[data-announcement-id='${announcementId}']`);
     const content = inputField.val().trim();
     const userId = localStorage.getItem("userId");

     if (!content) {
         //alert("Please write something before commenting.");
         showMessage("waring", "Please write something before commenting.");
         return;
     }

     // Prepare payload
     const payload = {
         content: content
     };

     // Make AJAX request to create comment
     ajaxWithToken({
         url: `${api}announcements/comments/announcement/${announcementId}/user/${userId}/add`,
         method: "POST",
         contentType: "application/json",
         data: JSON.stringify(payload),
         success: function(response) {
             //alert("Comment added successfully!");
             showMessage("success","Comment added successfully!");
             inputField.val(""); // Clear input
             loadDataPaginated(state.page, state.size); // Reload announcements to refresh comments
         },
         error: function(xhr) {
             console.error("Failed to create comment", xhr.responseJSON || xhr);
             //alert("Failed to create comment.");
             showMessage("error","Failed to create comment.");
         }
     });
 });




 // After renderComments
 $(document).on("click", ".action-btn", function(e) {
     e.stopPropagation(); // prevent closing parent dropdowns
     const $menu = $(this).siblings(".dropdown-menu");
     $(".dropdown-menu").not($menu).addClass("hidden"); // hide others
     $menu.toggleClass("hidden"); // toggle this one
 });

 // Optional: click outside to close
 $(document).on("click", function() {
     $(".dropdown-menu").addClass("hidden");
 });

 // Delete comment using AJAX with token
 $(document).on("click", ".comment-delete-btn", function() {
     const commentId = $(this).data("id");
     const userId = localStorage.getItem("userId");

     console.log("Deleting commentId:", commentId, "userId:", userId);

     if (!commentId) return;

     if (!confirm("Are you sure you want to delete this comment?")) return;

     ajaxWithToken({
         url: `http://localhost:8080/api/v1/edusphere/classrooms/announcements/comments/delete/${commentId}?userId=${userId}`,
         method: "DELETE",
         success: function(response) {
             if (response.status === 200 && response.data === true) {
                 // Remove the entire comment block
                 $(`.comment-delete-btn[data-id="${commentId}"]`).closest(".relative").remove();
                 //alert(response.message || "Comment deleted successfully!");
                 showMessage("success", response.message || "Comment deleted successfully!");
             } else {
                 //alert("Failed to delete comment: " + (response.message || "Unknown error"));
                 showMessage("error", "Failed to delete comment: " + (response.message || "Unknown error"));
             }
         },
         error: function(xhr) {
             console.error("Delete comment error:", xhr.responseJSON || xhr.responseText || xhr);
             //alert("An error occurred while deleting the comment.");
             showMessage("error","An error occurred while deleting the comment.");
         }
     });
 });

 function showMessage(type, text, duration = 5000) {
     let messageId, textId;

     if (type === "success") {
         messageId = "successMessage";
         textId = "successText"; // <- dynamic now
     } else if (type === "error") {
         messageId = "errorMessage";
         textId = "errorText";
     } else if (type === "warning") {
         messageId = "warningMessage";
         textId = "warningText";
     }

     const $msg = $("#" + messageId);

     if (textId && text) {
         $("#" + textId).text(text); // update dynamic text
     }

     $msg.removeClass("hidden");

     setTimeout(() => {
         $msg.addClass("hidden");
     }, duration);

     if (window.lucide?.createIcons) lucide.createIcons();
 }


