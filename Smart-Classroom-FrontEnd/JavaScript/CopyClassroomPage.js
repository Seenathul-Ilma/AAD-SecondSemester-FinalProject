// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  lucide.createIcons(); // Initialize icons

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      // Remove active styles from all buttons
      tabButtons.forEach(b => {
        b.classList.remove("bg-white", "dark:bg-gray-600", "text-blue-600", "dark:text-blue-400", "shadow-sm");
        b.classList.add("text-gray-600", "dark:text-gray-300");
      });

      // Add active styles to clicked button
      btn.classList.add("bg-white", "dark:bg-gray-600", "text-blue-600", "dark:text-blue-400", "shadow-sm");
      btn.classList.remove("text-gray-600", "dark:text-gray-300");

      // Show target tab content, hide others
      tabContents.forEach(content => {
        if (content.id === `${targetTab}-tab`) {
          content.classList.remove("hidden");
          content.classList.add("block");
        } else {
          content.classList.add("hidden");
          content.classList.remove("block");
        }
      });
    });
  });

});

// API configuration
const api = "http://localhost:8080/api/v1/edusphere/classrooms/";
const classroomId = new URLSearchParams(window.location.search).get(
  "classroomId"
);

const default_page_size = 10;
const max_visible_pages = 7;

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
  placeholder: "Write your content here...",
});

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
