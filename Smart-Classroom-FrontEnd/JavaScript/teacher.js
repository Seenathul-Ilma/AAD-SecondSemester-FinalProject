/*
document.addEventListener("DOMContentLoaded", function () {
  lucide.createIcons();
  loadDataPaginated(1, default_page_size);

  const openBtn = document.getElementById("create-new-teacher");
  const modal = document.getElementById("teacherModal");
  const closeBtn = document.getElementById("closeTeacherModal");
  const cancelBtn = document.getElementById("cancelBtn");

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      const modal = document.getElementById("teacherModal");
      if (modal) modal.classList.remove("hidden");
    });
  }


  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
});
*/

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  loadDataPaginated(1, default_page_size);

  //const openBtn = document.getElementById("create-new-teacher");
  const closeBtn = document.getElementById("closeTeacherModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const modal = document.getElementById("teacherModal");
  let editingTeacherId = null;

  //if (!openBtn || !modal || !closeBtn || !cancelBtn) return; // safety check
  if (!modal || !closeBtn || !cancelBtn) return; // safety check

  function closeModal(modal) {
    modal.classList.add("hidden");
    $("#teacherForm")[0].reset();
    editingTeacherId = null;
  }

  closeBtn.addEventListener("click", () => closeModal(modal));
  cancelBtn.addEventListener("click", () => closeModal(modal));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });

});


const api = "http://localhost:8080/api/v1/edusphere/users/";
const default_page_size = 5;
const max_visible_pages = 7;

function getAvatar(teacher) {
  if (teacher.profileImg) {
    return `<img src="${teacher.profileImg}" class="w-10 h-10 rounded-full object-cover" alt="${teacher.name}" />`;
  } else {
    const firstLetter = teacher.name.charAt(0).toUpperCase();
    return `<div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">${firstLetter}</div>`;
  }
}

/*// ====================== Token Refresh ======================
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
      refreshAccessToken().done(function() {
        ajaxWithToken(options);
      }).fail(function() {
        showMessage("error", "Session expired. Please log in again.");
        window.location.href = "login.html";
      });
    } else if (xhr.status === 403) {
      showMessage("warning", xhr.responseJSON?.message || "Access Denied..!");
    } else if (xhr.status === 400) {
      showMessage("warning", xhr.responseJSON?.message || "Validation failed..");
    } else if (xhr.status >= 500) {
      showMessage("error", "Server error. Please try again later.");
    } else if (originalError) {
      originalError(xhr, status, error);
    }
  };
  return $.ajax(options);
}*/

// ===== Rendering =====
function renderRows(items) {
  const $tbody = $("#teacher-table-tbody");
  $tbody.empty();

  items.forEach((teacher) => {
    const row = `

      <tr class="border-b border-slate-200/50 dark:border-slate-700/50 dark:hover:bg-gray-800 hover:bg-gray-100 hover:shadow transition-colors">
            <td class="p-4">
              ${getAvatar(teacher)}
            </td>
            <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${teacher.userId}</td>
            <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${teacher.name}</td>
            <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${teacher.nic}</td>
            <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${teacher.contact}</td>
            <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${teacher.email}</td>
            <td class="px-6 py-4">
              <div class="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
                <button aria-label="Send Message" class="start-chat p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105">
                  <i data-lucide="message-circle-more" class="size-5"></i>
                </button>
                <div class="w-px h-6 bg-gray-300 mx-1"></div>
                <button aria-label="Edit" class="edit-teacher p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105">
                  <i data-lucide="pencil" class="size-5"></i>
                </button>
                <div class="w-px h-6 bg-gray-300 mx-1"></div>
                <button aria-label="Delete" class="delete-teacher p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105">
                  <i data-lucide="trash" class="size-5"></i>
                </button>
              </div>
            </td>
          </tr>
    `;
    $tbody.append(row);
  });

  // Refresh lucid icons
  if (window.lucide?.createIcons) lucide.createIcons();
}

// ===== Data fetching =====
function loadDataPaginated(page1 = 1, size = state.size) {
  const zeroBasedPage = Math.max(0, page1 - 1);
  //const token = localStorage.getItem("accessToken"); // your JWT token

  ajaxWithToken({
    url: `${api}teachers?page=${zeroBasedPage}&size=${size}`,
    method: "GET",
    dataType: "json",
    success: function(response) {
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

      state.currentPageData = content;
      lucide.createIcons();

      renderRows(content);
      renderPaginationFooter();
    },
    error: function(xhr) {
      console.error("Error loading teachers:", xhr.responseJSON || xhr);
      if(xhr.status === 401) {
        alert("Session expired or unauthorized. Please log in again.");
        window.location.href = "login.html";
      }
    }
  });
}

// ====================== Form Submit ======================
/*
$("#teacherForm").on("submit", function(e) {
  e.preventDefault();

  const teacherData = {
    name: $("#name").val(),
    nic: $("#nic").val(),
    email: $("#email").val(),
    contact: $("#contact").val(),
    address: $("#address").val(),
    emergencyContact: $("#emergencyContact").val(),
    relationship: $("#relationship").val()
  };

  console.log("Submitting teacherData:", teacherData); // check data
  saveTeacher(teacherData);
});
*/

$("#teacher-table-tbody").on("click", ".edit-teacher", function () {
  const index = $(this).closest("tr").index();
  const teacher = state.currentPageData[index]; // get the correct student
  editingTeacherId = teacher.userId; // save for update later

  console.log("Full teacher object:", teacher);

  // Fill modal with student details
  $("#teacherModal").removeClass("hidden");
  $("#name").val(teacher.name);
  $("#nic").val(teacher.nic);
  $("#contact").val(teacher.contact);
  $("#email").val(teacher.email);
  $("#address").val(teacher.address ?? "");
  $("#emergencyContact").val(teacher.emergencyContact ?? "");
  $("#relationship").val(teacher.relationship ?? "");
});


$("#teacherForm").on("submit", function(e) {
  e.preventDefault();

  const teacherData = {
    name: $("#name").val(),
    nic: $("#nic").val(),
    email: $("#email").val(),
    contact: $("#contact").val(),
    address: $("#address").val(),
    emergencyContact: $("#emergencyContact").val(),
    relationship: $("#relationship").val()
  };

  console.log("Updating teacherData:", teacherData); // check data

  updateTeacher(editingTeacherId, teacherData);

  /*if (editingTeacherId) {
    // Update student
    updateTeacher(editingTeacherId, teacherData);
  } else {
    // Add student
    saveTeacher(teacherData);
  }*/

});


function updateTeacher(teacherId, teacherData) {
  teacherData.userId = teacherId;

  ajaxWithToken({
    url: `${api}teachers/edit`,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify(teacherData),
    success: function (response) {
      showMessage("success", response.message || "Teacher updated successfully!");
      $("#teacherModal").addClass("hidden");
      $("#teacherForm")[0].reset();
      editingTeacherId = null;
      loadDataPaginated(state.page, state.size);
    },
    error: function (xhr) {
      const message = xhr.responseJSON?.message || "Failed to update teacher..";
      showMessage("error", message);
    }
  });
}


// Attach delete handler
$("#teacher-table-tbody").on("click", ".delete-teacher", function () {
  const index = $(this).closest("tr").index();
  const teacher = state.currentPageData[index];

  if (!teacher || !teacher.userId) {
    showMessage("error", "Could not identify teacher for deletion.");
    return;
  }

  if (!confirm(`Are you sure you want to delete ${teacher.name}?`)) return;

  ajaxWithToken({
    url: `${api}delete/${teacher.userId}`,
    method: "DELETE",
    success: function () {
      showMessage("success", "Teacher deleted successfully!");
      loadDataPaginated(state.page, state.size);
    },
    error: function (xhr) {
      const message = xhr.responseJSON?.message || "Failed to delete teacher.";
      showMessage("error", message);
    }
  });
});


// ------ Invite teachers by Admin
const $inviteEmailInput = $("#inviteEmail");
const $sendInviteBtn = $("#sendInviteBtn");
const $inviteMessage = $("#inviteMessage");
const $inviteMessageText = $("#inviteMessageText");
const $inviteError = $("#inviteError");
const $inviteErrorText = $("#inviteErrorText");

// Send Invite Button
/*
$sendInviteBtn.on("click", function() {
  const email = $inviteEmailInput.val().trim();

  // Clear previous messages
  $inviteMessage.addClass("hidden");
  $inviteError.addClass("hidden");

  // Validate input
  if (!email) {
    $inviteErrorText.text("Please enter an email address.");
    $inviteError.removeClass("hidden");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    $inviteErrorText.text("Please enter a valid email address.");
    $inviteError.removeClass("hidden");
    return;
  }

  // Disable button while sending
  $sendInviteBtn.prop("disabled", true).html('<i data-lucide="send" class="w-4 h-4 mr-2"></i> Sending...');

  // AJAX call
  /!*$.ajax({
    url: "http://localhost:8080/api/v1/admin/invite-teacher",
    method: "POST",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("accessToken")
    },
    data: JSON.stringify({ email }),
    success: function(response) {
      if (response.success) {
        $inviteMessageText.text(`Invite sent to ${email}!`);
        $inviteMessage.removeClass("hidden");
        $inviteEmailInput.val("");
        setTimeout(() => $inviteMessage.addClass("hidden"), 4000);
      } else {
        $inviteErrorText.text(response.message || "Failed to send invite.");
        $inviteError.removeClass("hidden");
      }
    },
    error: function() {
      $inviteErrorText.text("Something went wrong. Try again.");
      $inviteError.removeClass("hidden");
    },
    complete: function() {
      $sendInviteBtn.prop("disabled", false).html('<i data-lucide="send" class="w-4 h-4 mr-2"></i> Send Invite');
    }
  });*!/

  $.ajax({
    url: "http://localhost:8080/api/v1/admin/invite-teacher",
    method: "POST",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("accessToken")
    },
    data: JSON.stringify({ email }),
    success: function(response) {
      // Backend returned success (HTTP 200)
      if (response.success) {
        $inviteMessageText.text(response.message || `Invite sent to ${email}!`);
        $inviteMessage.removeClass("hidden");
        $inviteEmailInput.val("");
        setTimeout(() => $inviteMessage.addClass("hidden"), 4000);
      } else {
        // Backend returned 200 but success=false (rare)
        $inviteErrorText.text(response.message || "Failed to send invite.");
        $inviteError.removeClass("hidden");
      }
    },
    error: function(xhr) {
      // Handle HTTP errors like 400, 409, 403 etc.
      let msg = "Something went wrong. Try again.";

      if (xhr.responseJSON && xhr.responseJSON.message) {
        msg = xhr.responseJSON.message;
      }

      $inviteErrorText.text(msg);
      $inviteError.removeClass("hidden");
    },
    complete: function() {
      lucide.createIcons();
      $sendInviteBtn.prop("disabled", false)
          .html('<i data-lucide="send" class="w-4 h-4 mr-2"></i> Invitation Sent ');
    }
  });

});
*/

// Send Invite Button
$sendInviteBtn.on("click", function() {
  const email = $inviteEmailInput.val().trim();

  // Validate input
  if (!email) {
    showMessage("warning", "Please enter an email address.");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showMessage("warning", "Please enter a valid email address.");
    return;
  }

  // Disable button while sending
  $sendInviteBtn.prop("disabled", true).html('<i data-lucide="send" class="w-4 h-4 mr-2"></i> Sending');
  lucide.createIcons();

  // AJAX call using ajaxWithToken (handles 401, 403, 400, 500 automatically)
  ajaxWithToken({
    url: "http://localhost:8080/api/v1/admin/invite-teacher",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ email }),
    success: function(response) {
      // Backend returned success (HTTP 200)
      showMessage("success", response.message || `Invite sent to ${email}!`);
      $inviteEmailInput.val(""); // clear input
    },
    error: function(xhr) {
      // Backend returned error (like 409 Duplicate, 400 Bad Request)
      const msg = xhr.responseJSON?.message || "Something went wrong. Try again.";
      showMessage("error", msg);
      $inviteEmailInput.val(""); // clear input
    },
    complete: function() {
      $sendInviteBtn.prop("disabled", false)
          .html('<i data-lucide="send" class="w-4 h-4 mr-2"></i> Invite Teacher');
      lucide.createIcons();
    }
  });
});


// Close buttons
$("#closeInviteMessage").on("click", () => $inviteMessage.addClass("hidden"));
$("#closeInviteError").on("click", () => $inviteError.addClass("hidden"));

// Initialize Lucide icons
lucide.createIcons();


// ===== Show Toast Message for Success, Error, Warn =====
/*
function showMessage(type, text, duration = 5000) {
  let messageId, textId;

  if (type === "success") {
    messageId = "successMessage";
    textId = null; // success text is static ("Success!")
  } else if (type === "error") {
    messageId = "errorMessage";
    textId = "errorText";
  } else if (type === "warning") {
    messageId = "warningMessage";
    textId = "warningText";
  }

  const $msg = $("#" + messageId);

  if (textId) {
    $("#" + textId).text(text); // update dynamic text
  }

  $msg.removeClass("hidden");

  // Auto hide after duration
  setTimeout(() => {
    $msg.addClass("hidden");
  }, duration);

  // Re-render Lucide icons in case they didn’t load
  if (window.lucide?.createIcons) {
    lucide.createIcons();
  }
}
*/

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