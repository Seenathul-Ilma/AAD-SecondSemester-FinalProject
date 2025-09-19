(function() {
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

    let editingAnnouncementId = null;

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

    let existingFiles = []; // New array to store files already attached to the announcement
    let removedFileIds = []; // New array to store IDs of files to be removed



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
// ===== MODIFIED POST LOGIC TO HANDLE FILE REMOVAL =====
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

        // Handle file logic based on edit mode
        if (editingAnnouncementId) {
            // EDIT MODE: Handle file updates

            // Keep remaining existing files (those not removed by user)
            const remainingExistingFiles = existingFiles.filter(f => !removedFileIds.includes(f.fileId));

            // Append remaining existing files (send their identifiers to backend)
            remainingExistingFiles.forEach(file => {
                announcementData.append("existingFiles", file.fileId); // send URLs or IDs
            });

            // Append newly selected files
            selectedFiles.forEach(file => announcementData.append("files", file));

            console.log("=== EDIT MODE: File update ===");
            console.log("Removed files:", removedFileIds);
            console.log("Remaining existing files:", remainingExistingFiles);
            console.log("New files to upload:", selectedFiles.length);
        } else {
            // CREATE MODE: Just add the selected files
            selectedFiles.forEach(file => announcementData.append("files", file));
        }


        // Debug logging
        console.log("=== DEBUG UPDATE REQUEST ===");
        console.log("editingAnnouncementId:", editingAnnouncementId);
        console.log("selectedFiles:", selectedFiles);
        console.log("removedFileIds:", removedFileIds);
        console.log("existingFiles:", existingFiles);

        // Log FormData contents
        for (let [key, value] of announcementData.entries()) {
            console.log(key, value);
        }

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
            const announcement = announcementState.currentPageData.content.find(a => a.announcementId === announcementId);
            if (announcement) {
                // Reset file-related variables for a clean edit session
                selectedFiles = []; // Clear any files from a previous session
                removedFileIds = []; // Clear removed files list
                editingAnnouncementId = announcementId;

                // ===== FIXED: Properly reconstruct existingFiles from announcement data =====
                existingFiles = [];

                console.log("Announcement object:", announcement);
                console.log("File URLs:", announcement.fileUrls);

                if (announcement.fileUrls && announcement.fileUrls.length > 0) {
                    announcement.fileUrls.forEach((url, index) => {
                        // Extract original filename from the URL path
                        const fullFileName = url.split("/").pop(); // Get the last part of URL

                        // Parse the structured filename: classroomId_userId_announcementId_timestamp_counter_originalName.ext
                        const parts = fullFileName.split("_");
                        let displayName = fullFileName; // fallback

                        if (parts.length >= 6) {
                            // Extract original name from parts[5] onwards and reconstruct
                            const originalNameParts = parts.slice(5); // Everything after counter
                            displayName = originalNameParts.join("_");

                            // Clean up the display name - remove underscores and make readable
                            displayName = displayName.replace(/_/g, " ");

                            // Capitalize first letter of each word
                            displayName = displayName.replace(/\b\w/g, l => l.toUpperCase());
                        }

                        // Use the URL as the unique identifier since backend doesn't provide separate IDs
                        const fileId = url;

                        existingFiles.push({
                            fileId: fileId,
                            fileName: displayName,
                            fileSize: "", // We don't have size info from backend
                            fileUrl: url
                        });
                    });
                }
                // ===== END FIX =====

                // Populate title and content
                titleInput.value = announcement.title;
                quill.root.innerHTML = announcement.content;

                // Update modal UI
                document.getElementById("announcementModalTitle").textContent = "Edit Announcement";
                postBtn.textContent = "Update Announcement";

                // Update the file previews to show existing files
                updateFilePreviews();

                // Open modal
                modal.classList.remove("hidden");
                modal.classList.add("flex");
            }
        } else if (action === "delete") {
            if (!confirm("Are you sure you want to delete this announcement?")) return;

            deleteAnnouncement(announcementId);
        }
    });

    function deleteAnnouncement(announcementId) {
        ajaxWithToken({
            url: `${api}delete/${announcementId}?deletingUserId=${userId}`,
            method: "DELETE",
            success: function (response) {
                if (response.status === 200 && response.data === true) {
                    showMessage(
                        "success",
                        response.message || "Announcement deleted successfully!"
                    );
                    loadDataPaginated(announcementState.page, announcementState.size);
                } else {
                    //alert("Failed to delete comment: " + (response.message || "Unknown error"));
                    showMessage(
                        "error",
                        "Failed to delete announcement: " + (response.message || "Unknown error")
                    );
                }
            },
            error: function (xhr) {
                console.error(
                    "Delete announcement error:",
                    xhr.responseJSON || xhr.responseText || xhr
                );
                //alert("An error occurred while deleting the comment.");
                showMessage("error", "An error occurred while deleting the announcement.");
            },

        })
    }

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
                    loadDataPaginated(announcementState.page, announcementState.size);
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
                    loadDataPaginated(announcementState.page, announcementState.size);
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
        existingFiles = []; // Reset existing files
        removedFileIds = []; // Reset removed file IDs
        editingAnnouncementId = null; // Reset the editing state

        updateFilePreviews(); // This will now clear the previews completely

        document.getElementById("announcementModalTitle").textContent = "Create New Announcement";
        postBtn.textContent = "Post Announcement";
    }

// ===== FIXED FILE PREVIEW REMOVAL LOGIC =====
    function updateFilePreviews() {
        // Clear previous previews
        filePreviews.innerHTML = "";

        // Combine existing and newly selected files for display
        //const filesToDisplay = [...existingFiles, ...selectedFiles];
        const filesToDisplay = [...existingFiles, ...selectedFiles]
            .filter(f => f && ((f.fileId && f.fileName.trim() !== "") || f.name)); // only valid files

        console.log("isFilesExist: "+ filesToDisplay.length);

        if (filesToDisplay.length > 0) {
            fileCount.textContent = `${filesToDisplay.length} file(s) selected`;
            fileCount.classList.remove("hidden");
            filePreviews.classList.remove("hidden");

            filesToDisplay.forEach((file, displayIndex) => {
                const isExistingFile = file.hasOwnProperty('fileId'); // Existing files have fileId
                console.log("fileId: "+ isExistingFile);
                const fileName = isExistingFile ? file.fileName : file.name;
                const fileSize = isExistingFile ? file.fileSize : file.size;

                // Determine file icon
                let icon = "file";
                if (fileName.includes(".pdf")) icon = "file-text";
                else if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) icon = "image";
                else if (fileName.match(/\.(zip|rar|7z)$/i)) icon = "archive";

                // Create preview element
                const preview = document.createElement("div");
                preview.className =
                    "file-preview flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg";

                preview.innerHTML = `
        <div class="flex items-center gap-2">
            <i data-lucide="${icon}" class="w-4 h-4 text-gray-500"></i>
            <span class="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">${fileName}</span>
            <span class="text-xs text-gray-500">  
            ${fileSize ? "(" + (formatFileSize(fileSize)) +")" : " "}
</span>
</div>
        <button type="button" class="text-red-500 hover:text-red-700 remove-file-btn" data-index="${displayIndex}" data-is-existing="${isExistingFile}">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      `;

                filePreviews.appendChild(preview);
            });

            // Remove button logic
            document.querySelectorAll("#filePreviews .remove-file-btn").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const displayIndex = parseInt(e.currentTarget.getAttribute("data-index"));
                    const isExisting = e.currentTarget.getAttribute("data-is-existing") === "true";
                    const file = filesToDisplay[displayIndex];

                    if (isExisting) {
                        // Track removal
                        removedFileIds.push(file.fileId);

                        // Remove from existingFiles array
                        existingFiles = existingFiles.filter(f => f.fileId !== file.fileId);
                    } else {
                        // Remove from selectedFiles array
                        selectedFiles = selectedFiles.filter(f => f !== file);
                    }

                    updateFilePreviews(); // Re-render previews
                });
            });

            // Update icons
            lucide.createIcons();
        } else {
            fileCount.classList.add("hidden");
            filePreviews.classList.add("hidden");
        }
    }

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
        const userRole = localStorage.getItem("role");

        items.forEach((announcement) => {
            const actionButtons =
                announcement.announcedUserId === userId || userRole === "ADMIN"
                    ? `
          <div class="absolute top-4 right-4 dropdown">
            <button class="announcement-action-btn p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200">
              <i data-lucide="more-horizontal" class="w-5 h-5"></i>
            </button>
            <div class="dropdown-menu hidden absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
              <div class="menu-item flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200 rounded-t-lg" data-action="edit" data-id="${announcement.announcementId}">
                <i data-lucide="edit-3" class="w-4 h-4 mr-2"></i>Edit
              </div>
              <div class="menu-item flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors duration-200 rounded-b-lg" data-action="delete" data-id="${announcement.announcementId}">
                <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i>Delete
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
          <div class="mt-2 mb-2 border-t border-gray-100 dark:border-gray-600 pt-4">
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
                  <div class="p-[6px] rounded-full text-slate-100 dark:hover:text-slate-800 hover:bg-slate-100 bg-slate-100 hover:text-slate-800 hover:text-slate-200 dark:bg-slate-800 transition-colors"
                  >
                    <i data-lucide="square-arrow-out-up-right" class="w-4 h-4 hover:scale-120 dark:hover:scale-none"></i>
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
            <p class="font-semibold text-lg mb-4 text-gray-800 dark:text-white leading-tight">${announcement.title}</p>
            <div class="announcement-content ql-editor">
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

// Toggle dropdown visibility
    $("#announcement-cards-container").on("click", ".announcement-action-btn", function (e) {
        e.stopPropagation(); // prevent click from bubbling up
        const $menu = $(this).siblings(".dropdown-menu");
        $(".dropdown-menu").not($menu).addClass("hidden");
        $menu.toggleClass("hidden");
    });

// Close dropdown if clicked outside
    $(document).on("click", () => {
        $(".dropdown-menu").addClass("hidden");
    });

    function loadDataPaginated(page1 = 1, size = announcementState.size) {
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

                announcementState.page = (number ?? 0) + 1; // convert 0-based -> 1-based
                announcementState.size = respSize ?? size;
                announcementState.totalPages = totalPages ?? 1;
                announcementState.totalElements = totalElements ?? 0;

                announcementState.currentPageData = data;

                // Correct
                renderAnnouncements(data.content);
                //renderPaginationFooter();
                //renderPaginationFooters();
                //renderPaginationFooters("#broadcast-tab .pagination-container", announcementState);
                renderPaginationFooters("#broadcast-tab .pagination-container", announcementState, 'announcements');

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
                <button class="comment-action-btn p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <i data-lucide="more-horizontal" class="w-4 h-4 mr-1"></i>
                </button>
                <div class="dropdown-menu hidden absolute right-0 mt-1 w-24 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                    <div class="menu-item flex items-center px-3 py-1 cursor-pointer bg-red-100/90 dark:bg-red-900/80 backdrop-blur-xl border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 comment-delete-btn" data-id="${c.commentId}">
                        <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i>
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
                    loadDataPaginated(announcementState.page, announcementState.size); // Reload announcements to refresh comments
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
    $(document).on("click", ".comment-action-btn", function (e) {
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
                    loadDataPaginated(announcementState.page, announcementState.size);
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

    // At the end of your announcement IIFE:
    window.loadAnnouncementsPaginated = loadDataPaginated;
})();

// Move this outside the IIFE and use the global state
window.announcementPagination = {
    loadDataPaginated: function(page, size) {
        if (typeof window.loadAnnouncementsPaginated === 'function') {
            window.loadAnnouncementsPaginated(page, size);
        }
    },
    state: window.announcementState
};