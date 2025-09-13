// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  lucide.createIcons(); // Initialize icons

  loadDataPaginated(1, default_page_size);

  // Set user information
  document.getElementById("announcementUserName").textContent = userName;
  document.getElementById("userInitials").textContent =
    getUserInitials(userName);
  console.log("Initials: " + userName);

  // Update class info if classroomId is available
  if (classroomId) {
    document.getElementById(
      "announcementClassInfo"
    ).textContent = `Posting to: Classroom ${classroomId}`;
  }
});

// API configuration
const api = "http://localhost:8080/api/v1/edusphere/classrooms/";
const classroomId = new URLSearchParams(window.location.search).get(
  "classroomId"
);

const default_page_size = 10;
const max_visible_pages = 7;
let editingAnnouncementId = null;

// Get user info from localStorage or default
const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName");

// Initialize Quill editor
const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  },
  placeholder: "Write your announcement content here...",
});

// Modal elements
const modal = document.getElementById("announcementModal");
const createBtn = document.getElementById("createAnnouncementBtn");
const cancelBtn = document.getElementById("cancelAnnouncementBtn");
const postBtn = document.getElementById("postAnnouncementBtn");
const titleInput = document.getElementById("announcementTitleInput");

// File handling elements
const fileInput = document.getElementById("fileInput");
const fileSelectBtn = document.getElementById("fileSelectBtn");
const fileCount = document.getElementById("fileCount");
const filePreviews = document.getElementById("filePreviews");
let selectedFiles = [];

// Open modal
createBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  document.getElementById("announcementModalTitle").textContent = "Create New Announcement";

  postBtn.textContent = "Post Announcement";

});

// Close modal
cancelBtn.addEventListener("click", () => {
  closeModal();
});

// File selection handling
fileSelectBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  selectedFiles = Array.from(e.target.files);
  updateFilePreviews();
});

// Post announcement
postBtn.addEventListener("click", () => {
  const content = quill.root.innerHTML.trim();
  const title = titleInput.value.trim();

  if (!title) {
    showMessage("warning", "Please add a title to your announcement.");
    titleInput.focus();
    return;
  }

  if (!content || content === "<p><br></p>") {
    showMessage("warning", "Please write something before posting.");
    return;
  }

  const announcementData = new FormData();
  announcementData.append("title", title);
  announcementData.append("content", content);
  selectedFiles.forEach(file => announcementData.append("files", file));

  if (editingAnnouncementId) {
    updateAnnouncement(editingAnnouncementId, announcementData);
  } else {
    createAnnouncement(announcementData);
  }
});

$("#announcement-cards-container").on("click", ".menu-item", function(e) {
  e.stopPropagation();
  const action = $(this).data("action");
  const announcementId = $(this).data("id");

  if (action === "edit") {
    // 1. Load announcement data into modal
    const announcement = state.currentPageData.content.find(a => a.announcementId === announcementId);
    if (announcement) {
      titleInput.value = announcement.title;
      quill.root.innerHTML = announcement.content;

      // Keep track of which announcement is being edited
      editingAnnouncementId = announcementId;

      // Update modal UI
      document.getElementById("announcementModalTitle").textContent = "Edit Announcement";
      postBtn.textContent = "Update Announcement";

      // Open modal
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  } else if (action === "delete") {
    deleteAnnouncement(announcementId);
  }
});

function updateAnnouncement(announcementId, announcementData) {
  ajaxWithToken({
    url: `${api}${userId}/announcements/${announcementId}/update`,
    method: "PUT",
    data: announcementData,
    processData: false,
    contentType: false,
    success: function (response, textStatus, xhr) {
      // check HTTP status or backend payload
      if (xhr.status === 201 || response.status === 201 || response.data === true) {
        showMessage("success", "Announcement updated successfully!");
        closeModal();
        loadDataPaginated(state.page, state.size);
        editingAnnouncementId = null;
      } else {
        showMessage("error", response.message || "Failed to update announcement.");
      }
    },
    error: function (xhr) {
      showMessage("error", xhr.responseJSON?.message || "Failed to update announcement.");
    }
  });
}

function createAnnouncement(announcementData){
  ajaxWithToken({
    url: `${api}${classroomId}/announcements/${userId}/create`,
    method: "POST",
    data: announcementData,
    processData: false, // important for FormData
    contentType: false, // important for FormData
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
    },
  });
}

// Close modal when clicking outside
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// Helper functions
function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  quill.setText("");
  titleInput.value = "";
  selectedFiles = [];
  updateFilePreviews();

  document.getElementById("announcementModalTitle").textContent = "Create New Announcement";
  postBtn.textContent = "Post Announcement";
}

function updateFilePreviews() {
  // Clear previous previews
  filePreviews.innerHTML = "";

  if (selectedFiles.length > 0) {
    fileCount.textContent = `${selectedFiles.length} file(s) selected`;
    fileCount.classList.remove("hidden");
    filePreviews.classList.remove("hidden");

    selectedFiles.forEach((file, index) => {
      const preview = document.createElement("div");
      preview.className =
        "file-preview flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg";

      // File icon based on type
      let icon = "file";
      if (file.type.includes("image")) icon = "image";
      if (file.type.includes("pdf")) icon = "file-text";
      if (file.type.includes("zip")) icon = "archive";

      preview.innerHTML = `
                            <div class="flex items-center gap-2">
                                <i data-lucide="${icon}" class="w-4 h-4 text-gray-500"></i>
                                <span class="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">${
                                  file.name
                                }</span>
                                <span class="text-xs text-gray-500">(${formatFileSize(
                                  file.size
                                )})</span>
                            </div>
                            <button type="button" class="text-red-500 hover:text-red-700" data-index="${index}">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        `;

      filePreviews.appendChild(preview);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll("#filePreviews button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.getAttribute("data-index"));
        selectedFiles.splice(index, 1);
        updateFilePreviews();
      });
    });

    // Update icons for new elements
    lucide.createIcons();
  } else {
    fileCount.classList.add("hidden");
    filePreviews.classList.add("hidden");
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getUserInitials(name) {
  if (!name || typeof name !== "string") return "?"; // fallback
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

/*
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
    const actionButtons =
      announcement.announcedUserId === userId
        ? `
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
        `
        : "";

    const card = `
            <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-5 shadow-sm relative">
                ${actionButtons}
                <div class="flex items-start gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        ${getUserInitials(
                          announcement.announcedUserName ||
                            announcement.creator?.name
                        )}
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-800 dark:text-white">${
                          announcement.announcedUserName
                        }</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            ${formatRelativeTime(announcement.createdAt)}
                        </p>
                    </div>
                </div>
                <div class="text-gray-700 dark:text-gray-300 mb-4 announcement-content">
                    <h4 class="font-medium text-lg mb-2">${
                      announcement.title
                    }</h4>
                    <div>${announcement.content}</div>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <button class="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 show-comments" data-id="${
                    announcement.announcementId
                  }">
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                    <span>${announcement.comments?.length || 0} comments</span>
                  </button>
                </div>


                <!-- Comment Input Field -->
                <div class="flex items-center gap-2 mt-2">
                    <input type="text" placeholder="Write a comment..." 
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
                        data-announcement-id="${announcement.announcementId}" />
                    <button class="comment-submit-btn px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center" data-announcement-id="${
                      announcement.announcementId
                    }">
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
*/


function renderAnnouncements(items) {
  const $div = $("#announcement-cards-container");
  $div.empty();

  if (!items || items.length === 0) {
    $div.html(`
      <div class="text-center py-12">
        <i data-lucide="megaphone" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"></i>
        <p class="text-gray-500 dark:text-gray-400 text-lg">No announcements yet.</p>
        <p class="text-gray-400 dark:text-gray-500 text-sm">Create your first announcement to get started!</p>
      </div>
    `);
    return;
  }

  const userId = localStorage.getItem("userId");

  items.forEach((announcement) => {
    const actionButtons =
        announcement.announcedUserId === userId
            ? `
          <div class="absolute top-4 right-4 dropdown">
            <button class="action-btn p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200">
              <i data-lucide="more-horizontal" class="w-5 h-5"></i>
            </button>
            <div class="dropdown-menu hidden absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
              <div class="menu-item px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200 rounded-t-lg" data-action="edit" data-id="${announcement.announcementId}">
                <i data-lucide="edit-3" class="w-4 h-4 inline-block mr-2"></i>Edit
              </div>
              <div class="menu-item px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors duration-200 rounded-b-lg" data-action="delete" data-id="${announcement.announcementId}">
                <i data-lucide="trash-2" class="w-4 h-4 inline-block mr-2"></i>Delete
              </div>
            </div>
          </div>`
            : "";

    // Render file cards only if files exist
    let fileSection = "";
    if (announcement.fileUrls && announcement.fileUrls.length > 0) {
      const validFiles = announcement.fileUrls
          .map((url, idx) => {
            const name = announcement.fileNames ? announcement.fileNames[idx] : url.split("/").pop();
            const info = getFileInfo(name);
            return info ? { url, name, info } : null;
          })
          .filter(f => f !== null); // Remove nulls (invalid files)

      if (validFiles.length > 0) {
        fileSection = `
          <div class="mt-4 mb-2 border-t border-gray-100 dark:border-gray-600 pt-4">
            <div class="flex items-center gap-2 mb-3">
              <i data-lucide="paperclip" class="w-4 h-4 text-gray-500"></i>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                ${validFiles.length} Attachment${validFiles.length > 1 ? 's' : ''}
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        `;

        validFiles.forEach(file => {
          const originalName = file.name.split("\\").pop().split("_").slice(5).join("_");
          fileSection += `
            <div class="file-card group relative bg-gradient-to-br ${file.info.gradient} rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden">
              <a href="${file.url}" target="_blank" class="block p-4">
                <div class="flex items-start gap-3">
                  <div class="file-icon-wrapper flex-shrink-0 w-12 h-12 ${file.info.bgColor} rounded-lg flex items-center justify-center shadow-sm">
                    <i data-lucide="${file.info.icon}" class="w-6 h-6 ${file.info.iconColor}"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-800 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      ${originalName}
                    </h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-semibold">
                      ${file.info.type}
                    </p>
                  </div>
                </div>
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div class="w-6 h-6 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-sm">
                    <i data-lucide="external-link" class="w-3 h-3 text-gray-600 dark:text-gray-400"></i>
                  </div>
                </div>
                <div class="absolute bottom-2 left-2">
                  <span class="inline-block px-2 py-1 bg-white/90 dark:bg-gray-800/90 text-xs font-medium ${file.info.textColor} rounded-full shadow-sm">
                    ${file.info.extension.toUpperCase()}
                  </span>
                </div>
              </a>
            </div>
          `;
        });

        fileSection += `</div></div>`;
      }
    }

    const card = `
      <div class="announcement-card bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative">
        ${actionButtons}
        <div class="p-5 pb-0">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
              ${getUserInitials(announcement.announcedUserName || announcement.creator?.name)}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-800 dark:text-white">${announcement.announcedUserName}</h3>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <i data-lucide="clock" class="w-3 h-3"></i>
                ${formatRelativeTime(announcement.createdAt)}
              </p>
            </div>
          </div>
          <div class="text-gray-700 dark:text-gray-300 announcement-content">
            <h4 class="font-semibold text-lg mb-3 text-gray-800 dark:text-white leading-tight">${announcement.title}</h4>
            <div class="prose prose-sm mb-2 dark:prose-invert max-w-none">
              ${announcement.content}
            </div>
          </div>
          ${fileSection}
        </div>
        <div class="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-600">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <button class="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 show-comments" data-id="${announcement.announcementId}">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
                <span>${announcement.comments?.length || 0} comments</span>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <i data-lucide="user" class="w-4 h-4 text-gray-500"></i>
            </div>
            <div class="flex-1 relative">
              <input type="text" placeholder="Write a comment..." 
                class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm" 
                data-announcement-id="${announcement.announcementId}" />
            </div>
            <button class="comment-submit-btn px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:scale-105" data-announcement-id="${announcement.announcementId}">
              <i data-lucide="send" class="w-4 h-4"></i>
              <span class="hidden sm:inline">Comment</span>
            </button>
          </div>
        </div>
      </div>
    `;

    $div.append(card);
  });

  // Refresh icons after dynamic render
  if (window.lucide?.createIcons) lucide.createIcons();
}

// Enhanced file info function with better styling
// Enhanced file info function – safe for optional files
function getFileInfo(fileName) {
  if (!fileName) return null; // return null if file doesn't exist

  const ext = fileName.split('.').pop().toLowerCase();
  const fileInfo = { extension: ext };

  // Image files
  if (["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(ext)) {
    return {
      ...fileInfo,
      icon: "image",
      type: "Image",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-green-600",
      gradient: "from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20"
    };
  }

  // PDF files
  if (["pdf"].includes(ext)) {
    return {
      ...fileInfo,
      icon: "file-text",
      type: "PDF Document",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      textColor: "text-red-600",
      gradient: "from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20"
    };
  }

  // Document files
  if (["doc", "docx", "txt", "rtf"].includes(ext)) {
    return {
      ...fileInfo,
      icon: "file-text",
      type: "Document",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-600",
      gradient: "from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20"
    };
  }

  // Spreadsheet files
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return {
      ...fileInfo,
      icon: "table",
      type: "Spreadsheet",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      textColor: "text-emerald-600",
      gradient: "from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20"
    };
  }

  // Presentation files
  if (["ppt", "pptx"].includes(ext)) {
    return {
      ...fileInfo,
      icon: "presentation",
      type: "Presentation",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      textColor: "text-orange-600",
      gradient: "from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20"
    };
  }

  // Archive files
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return {
      ...fileInfo,
      icon: "archive",
      type: "Archive",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-purple-600",
      gradient: "from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20"
    };
  }

  // Video files
  if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(ext)) {
    return {
      ...fileInfo,
      icon: "video",
      type: "Video",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
      iconColor: "text-pink-600 dark:text-pink-400",
      textColor: "text-pink-600",
      gradient: "from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20"
    };
  }

  // Audio files
  if (["mp3", "wav", "flac", "aac", "ogg"].includes(ext)) {
    return {
      ...fileInfo,
      icon: "music",
      type: "Audio",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      textColor: "text-indigo-600",
      gradient: "from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20"
    };
  }

  // Code files
  if (["js", "html", "css", "py", "java", "cpp", "c", "php", "rb"].includes(ext)) {
    return {
      ...fileInfo,
      icon: "code",
      type: "Code",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      textColor: "text-cyan-600",
      gradient: "from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20"
    };
  }

  // Default fallback
  return {
    ...fileInfo,
    icon: "file",
    type: "File",
    bgColor: "bg-gray-100 dark:bg-gray-600",
    iconColor: "text-gray-600 dark:text-gray-400",
    textColor: "text-gray-600",
    gradient: "from-gray-50 to-slate-100 dark:from-gray-700 dark:to-slate-600"
  };
}

// Toggle dropdown visibility
$("#announcement-cards-container").on("click", ".action-btn", function (e) {
  e.stopPropagation(); // prevent click from bubbling up
  const $menu = $(this).siblings(".dropdown-menu");
  $(".dropdown-menu").not($menu).addClass("hidden");
  $menu.toggleClass("hidden");
});

// Close dropdown if clicked outside
$(document).on("click", () => {
  $(".dropdown-menu").addClass("hidden");
});

function loadDataPaginated(page1 = 1, size = state.size) {
  const zeroBasedPage = Math.max(0, page1 - 1);

  ajaxWithToken({
    url: `${api}${classroomId}/view/announcements?page=${zeroBasedPage}&size=${size}`,
    method: "GET",
    dataType: "json",
    success: function (response) {
      const data = response.data || {}; // unwrap the ApiResponse

      const {
        content = [],
        number = 0,
        size: respSize = size,
        totalPages = 1,
        totalElements = 0,
      } = data; // destructure from data

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
    },
  });
}

function formatRelativeTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

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
      day: "numeric",
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
      const comments = response; // because backend returns a raw array

      renderComments(comments);
      $("#commentModal").removeClass("hidden").addClass("flex");
    },
    error: function (xhr) {
      console.error("Failed to load comments", xhr.responseJSON || xhr);
      //alert("Failed to load comments.");
      showMessage("error", "Failed to load comments.");
    },
  });
}

function renderComments(comments) {
  const $list = $("#commentsList");
  $list.empty();

  if (!comments || comments.length === 0) {
    $list.html(
      `<p class="text-gray-500 dark:text-gray-400">No comments yet.</p>`
    );
    return;
  }

  const userId = localStorage.getItem("userId"); // logged-in user

  comments.forEach((c) => {
    // Show edit/delete only if logged-in user is the commenter
    const actionDropdown =
      c.commenterId === userId
        ? `
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
        `
        : "";

    $list.append(`
            <div class="relative p-3 border rounded-lg dark:border-gray-600 mb-2">
                <p class="font-semibold text-gray-800 dark:text-white">${
                  c.commenterName || "Unknown"
                }</p>
                <p class="text-gray-700 dark:text-gray-300 comment-content">${
                  c.content
                }</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${formatRelativeTime(
                  c.createdAt
                )}</p>
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
$("#announcement-cards-container").on(
  "click",
  ".comment-submit-btn",
  function () {
    const announcementId = $(this).data("announcement-id");
    const inputField = $(`input[data-announcement-id='${announcementId}']`);
    const content = inputField.val().trim();
    const userId = localStorage.getItem("userId");

    if (!content) {
      //alert("Please write something before commenting.");
      showMessage("warning", "Please write something before commenting.");
      return;
    }

    // Prepare payload
    const payload = {
      content: content,
    };

    // Make AJAX request to create comment
    ajaxWithToken({
      url: `${api}announcements/comments/announcement/${announcementId}/user/${userId}/add`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function (response) {
        //alert("Comment added successfully!");
        showMessage("success", "Comment added successfully!");
        inputField.val(""); // Clear input
        loadDataPaginated(state.page, state.size); // Reload announcements to refresh comments
      },
      error: function (xhr) {
        console.error("Failed to create comment", xhr.responseJSON || xhr);
        //alert("Failed to create comment.");
        showMessage("error", "Failed to create comment.");
      },
    });
  }
);

// After renderComments
$(document).on("click", ".action-btn", function (e) {
  e.stopPropagation(); // prevent closing parent dropdowns
  const $menu = $(this).siblings(".dropdown-menu");
  $(".dropdown-menu").not($menu).addClass("hidden"); // hide others
  $menu.toggleClass("hidden"); // toggle this one
});

// Optional: click outside to close
$(document).on("click", function () {
  $(".dropdown-menu").addClass("hidden");
});

// Delete comment using AJAX with token
$(document).on("click", ".comment-delete-btn", function () {
  const commentId = $(this).data("id");
  const userId = localStorage.getItem("userId");

  console.log("Deleting commentId:", commentId, "userId:", userId);

  if (!commentId) return;

  if (!confirm("Are you sure you want to delete this comment?")) return;

  ajaxWithToken({
    url: `${api}announcements/comments/delete/${commentId}?userId=${userId}`,
    method: "DELETE",
    success: function (response) {
      if (response.status === 200 && response.data === true) {
        // Remove the entire comment block
        $(`.comment-delete-btn[data-id="${commentId}"]`)
          .closest(".relative")
          .remove();
        //alert(response.message || "Comment deleted successfully!");
        showMessage(
          "success",
          response.message || "Comment deleted successfully!"
        );
      } else {
        //alert("Failed to delete comment: " + (response.message || "Unknown error"));
        showMessage(
          "error",
          "Failed to delete comment: " + (response.message || "Unknown error")
        );
      }
    },
    error: function (xhr) {
      console.error(
        "Delete comment error:",
        xhr.responseJSON || xhr.responseText || xhr
      );
      //alert("An error occurred while deleting the comment.");
      showMessage("error", "An error occurred while deleting the comment.");
    },
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
