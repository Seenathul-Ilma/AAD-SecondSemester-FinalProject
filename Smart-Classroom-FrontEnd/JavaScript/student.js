document.addEventListener("DOMContentLoaded", function () {
  lucide.createIcons();
  loadDataPaginated(1, default_page_size);

  const openBtn = document.getElementById("create-new-student");
  const modal = document.getElementById("studentModal");
  const closeBtn = document.getElementById("closeStudentModal");
  const cancelBtn = document.getElementById("cancelBtn");

  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
});

const api = "http://localhost:8080/api/v1/edusphere/users/";
const default_page_size = 5;
const max_visible_pages = 7;
let editingStudentId = null;

function getAvatar(student) {
  if (student.profileImg) {
    return `<img src="${student.profileImg}" class="w-10 h-10 rounded-full object-cover" alt="${student.name}" />`;
  } else {
    const firstLetter = student.name.charAt(0).toUpperCase();
    return `<div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">${firstLetter}</div>`;
  }
}

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
      refreshAccessToken().done(function() {
        ajaxWithToken(options); // retry original request
      }).fail(function() {
        showMessage("error", "Session expired. Please log in again.");
        window.location.href = "login.html";
      });
    } else if (xhr.status === 403) {
      // Forbidden -> action-specific
      showMessage("warning", xhr.responseJSON?.message || "You don’t have permission to perform this action.");
    } else if (xhr.status === 400) {
      // Validation issue
      showMessage("warning", xhr.responseJSON?.message || "Please fill all required fields correctly.");
    } else if (xhr.status === 409) {
      // Conflict (e.g. duplicate email)
      showMessage("error", xhr.responseJSON?.message || "This email is already registered.");
    } else if (xhr.status >= 500) {
      showMessage("error", "Unexpected server error. Please try again later.");
    } else if (originalError) {
      originalError(xhr, status, error);
    }
  };

  return $.ajax(options);
}

// ====================== Render Rows ======================
function renderRows(items) {
  const $tbody = $("#student-table-tbody");
  $tbody.empty();

  items.forEach(student => {
    const row = `
      <tr class="border-b border-slate-200/50 dark:border-slate-700/50 dark:hover:bg-gray-800 hover:bg-gray-100 hover:shadow transition-colors">
        <td class="p-4">${getAvatar(student)}</td>
        <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${student.userId}</td>
        <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${student.name}</td>
        <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${student.nic}</td>
        <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${student.contact}</td>
        <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${student.email}</td>
        <td class="px-6 py-4">
          <div class="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
            <button aria-label="Send Message" class="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105">
              <i data-lucide="message-circle-more" class="size-5"></i>
            </button>
            <div class="w-px h-6 bg-gray-300 mx-1"></div>
            <button aria-label="Edit" class="edit-student p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105">
              <i data-lucide="pencil" class="size-5"></i>
            </button>
            <div class="w-px h-6 bg-gray-300 mx-1"></div>
            <button aria-label="Delete" class="delete-student p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105">
              <i data-lucide="trash" class="size-5"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    $tbody.append(row);
  });

  if (window.lucide?.createIcons) lucide.createIcons();
}

// ====================== Load Data Paginated ======================
function loadDataPaginated(page1 = 1, size = state.size) {
  const zeroBasedPage = Math.max(0, page1 - 1);

  ajaxWithToken({
    url: `${api}students?page=${zeroBasedPage}&size=${size}`,
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

      renderRows(content);
      renderPaginationFooter();
    },
    error: function(xhr) {
      console.error("Error loading students:", xhr.responseJSON || xhr);
      if(xhr.status === 401) {
        showMessage("error", "Session expired or unauthorized. Please log in again.");
        //alert("Session expired or unauthorized. Please log in again.");
        window.location.href = "login.html";
      }
    }
  });
}

/*// ====================== Pagination Footer ======================
function renderPaginationFooter() {
  const paginationDiv = $("#pagination");
  paginationDiv.empty();

  let start = Math.max(1, state.page - Math.floor(max_visible_pages / 2));
  let end = Math.min(state.totalPages, start + max_visible_pages - 1);
  start = Math.max(1, end - max_visible_pages + 1);

  for (let i = start; i <= end; i++) {
    const btn = $(`<button class="page-btn ${i === state.page ? 'active' : ''}" data-page="${i}">${i}</button>`);
    paginationDiv.append(btn);
  }

  $(".page-btn").on("click", function () {
    const page = $(this).data("page");
    loadDataPaginated(page, state.size);
  });
}*/

// ====================== Save Student ======================
function saveStudent(studentData) {
  ajaxWithToken({
    url: `${api}students/add`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(studentData),
    success: function(response) {
      console.log(response);

      // Test toast here
      console.log("Trying to show toast...");
      showMessage("success", "Student added successfully..!");

      console.log("saved successfully..")
      $("#studentModal").addClass("hidden");
      $("#studentForm")[0].reset();
      loadDataPaginated(1, state.size);
    },
    error: function(xhr) {
      const res = xhr.responseJSON || {};
      const message = res.message || "Something went wrong";

      if (xhr.status === 400) {
        const errors = res.data || {};
        if (Object.keys(errors).length > 0) {
          let msg = "Validation failed:\n";
          for (const field in errors) {
            msg += `- ${field}: ${errors[field]}\n`;
          }
          showMessage("error", msg);
        } else {
          showMessage("error", message);
        }
      } else if (xhr.status === 409) {
        showMessage("error", message);
      } else {
        showMessage("error", message);
        console.error("Failed to save student:", res);
      }
    }
  });
}


// ====================== Form Submit ======================
// NIC regex: old (9 digits + V/X) or new (12 digits)
function isValidNIC(nic) {
  const oldNicPattern = /^[0-9]{9}[VXvx]$/;
  const newNicPattern = /^[0-9]{12}$/;
  return oldNicPattern.test(nic) || newNicPattern.test(nic);
}

$("#studentForm").on("submit", function(e) {
  e.preventDefault();

  const studentData = {
    name: $("#name").val().trim(),
    nic: $("#nic").val().trim(),
    email: $("#email").val().trim(),
    contact: $("#contact").val().trim(),
    address: $("#address").val().trim(),
    emergencyContact: $("#emergencyContact").val().trim(),
    relationship: $("#relationship").val().trim()
  };

  // Collect missing or invalid fields
  let missingFields = [];

  if (!studentData.name) missingFields.push("Name");
  if (!studentData.nic) {
    missingFields.push("NIC");
  } else if (!isValidNIC(studentData.nic)) {
    showMessage("error", "NIC format is invalid.");
    return;
  }
  if (!studentData.email) missingFields.push("Email");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)) {
    showMessage("error", "Email format is invalid.");
    return;
  }
  if (!studentData.contact) missingFields.push("Contact");
  if (!studentData.address) missingFields.push("Address");
  if (!studentData.emergencyContact) missingFields.push("Emergency Contact");
  if (!studentData.relationship) missingFields.push("Relationship");

  if (missingFields.length > 0) {
    showMessage("error", "Please fill in " + missingFields.join(", ") + ".");
    return;
  }

  // Submit
  if (editingStudentId) {
    updateStudent(editingStudentId, studentData);
  } else {
    saveStudent(studentData);
  }
});



// Attach click handler to tbody, listen for .edit-student
$("#student-table-tbody").on("click", ".edit-student", function () {
  const index = $(this).closest("tr").index();
  const student = state.currentPageData[index]; // get the correct student
   editingStudentId = student.userId; // save for update later
  console.log("Full student object:", student);

  // Fill modal with student details
  $("#studentModal").removeClass("hidden");
  $("#name").val(student.name);
  $("#nic").val(student.nic);
  $("#contact").val(student.contact);
  $("#email").val(student.email);
  $("#address").val(student.address ?? "");
  $("#emergencyContact").val(student.emergencyContact ?? "");
  $("#relationship").val(student.relationship ?? "");



});

function updateStudent(studentId, studentData) {
  // Add required userId field directly
  studentData.userId = studentId;

  ajaxWithToken({
    url: `${api}students/edit`,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify(studentData),
    success: function (response) {
      //showMessage("success", response.message || "Student updated successfully!");
      showMessage("success", "Student updated successfully!");
      $("#studentModal").addClass("hidden");
      $("#studentForm")[0].reset();
      editingStudentId = null;
      loadDataPaginated(state.page, state.size);
    },
    error: function (xhr) {
      const msg = xhr.responseJSON?.message || "Failed to update student.";
      showMessage("error", msg);
    }

  });
}

// Attach delete handler
$("#student-table-tbody").on("click", ".delete-student", function () {
  const index = $(this).closest("tr").index();
  const student = state.currentPageData[index];

  if (!student || !student.userId) {
    //alert("Could not identify student for deletion.");
    showMessage("warning", "Could not identify student for deletion.");
    return;
  }

  // Confirm before delete
  if (!confirm(`Are you sure you want to delete ${student.name}?`)) {
    return;
  }

  ajaxWithToken({
    url: `${api}delete/${student.userId}`,
    method: "DELETE",
    success: function () {
      showMessage("success", "Student deleted successfully!");
      loadDataPaginated(state.page, state.size);
    },
    error: function (xhr) {
      const msg = xhr.responseJSON?.message || "Failed to delete student.";
      showMessage("error", msg);
    }
  });
});

// ===== Show Toast Message for Success, Error, Warn =====
function showMessage(type, text, duration = 5000) {
  let messageId, textId;

  if (type === "success") {
    messageId = "successMessage";
    textId = "successText";
  } else if (type === "error") {
    messageId = "errorMessage";
    textId = "errorText";
  } else if (type === "warning") {
    messageId = "warningMessage";
    textId = "warningText";
  }

  const $msg = $("#" + messageId);

  if (textId) $("#" + textId).text(text);

  // Clear previous timers
  if ($msg.data("timer")) {
    clearTimeout($msg.data("timer"));
  }

  $msg.removeClass("hidden");

  // Set new auto-hide timer
  const timer = setTimeout(() => $msg.addClass("hidden"), duration);
  $msg.data("timer", timer);

  if (window.lucide?.createIcons) lucide.createIcons();
}



