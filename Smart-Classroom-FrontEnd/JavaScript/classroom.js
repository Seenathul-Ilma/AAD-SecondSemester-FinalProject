// ===== Global trackers for edit mode =====
let editingClassroomId = null; // holds the id of the classroom being edited
let editingUserId = null;   // holds the logged-in user id

document.addEventListener("DOMContentLoaded", function () {
  lucide.createIcons();
  loadDataPaginated(1, default_page_size);

  const openBtn = document.getElementById("create-classroom");
  const modal = document.getElementById("classroomModal");
  const closeBtn = document.getElementById("closeClassroomModal");
  //const cancelBtn = document.getElementById("cancelBtn");

  // Check role
  const userRole = localStorage.getItem("role");
  if (userRole === "STUDENT") {
    // Hide create-classroom button for students/admins
    if (openBtn) openBtn.style.display = "none";
  } else {
    // Only attach events if teacher
    openBtn.addEventListener("click", () => {
      // Reset edit mode
      editingClassroomId = null;
      editingUserId = null;

      // Reset the form
      $("#classroom-form")[0].reset();

      // Set heading & button text
      document.getElementById("classroom-model-header-text").innerText = "Create New Classroom";
      document.getElementById("save-classroom-btn-text").innerHTML = `
    <i data-lucide="plus-circle" class="w-5 h-5"></i>
    Create Classroom
  `;

      // Show the modal
      modal.classList.remove("hidden");

      // Re-render Lucide icons
      if (window.lucide?.createIcons) lucide.createIcons();
    });

    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }

  /*openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  //cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });*/

});

const api = "http://localhost:8080/api/v1/edusphere/classroom/";
const default_page_size = 8;
const max_visible_pages = 7;

// ====================== Token Refresh ======================
/*function refreshAccessToken() {
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
        showMessage("error", "Session expired. Please log in again.!");
        window.location.href = "login.html";
      });
    } else if (xhr.status === 403) {
      // Forbidden -> show proper message
      showMessage("error", xhr.responseJSON?.message || "Only creator can edit classrooms. You're not the creator of this classroom.");
    }else if (xhr.status === 400) {
      alert(xhr.responseJSON?.message || "Failed to update the classroom..");
    } else if (originalError) {
      originalError(xhr, status, error);
    }
  };
  return $.ajax(options);
}
*/


// ===== Rendering =====
function renderCards(items) {
  const $div = $("#classroom-card-container");
  $div.empty();

  // Get user role from localStorage (or wherever you store it)
  const userRole = localStorage.getItem("role"); // "TEACHER", "STUDENT"
  const userId = localStorage.getItem("userId");

  items.forEach((classroom) => {
    // Only show buttons if role is TEACHER
    //const actionButtons = userRole === "TEACHER" ? `
    const actionButtons = (userRole === "STUDENT" && classroom.creatorId !== userId) ? `
      <div class="flex">
        <button class="classroom-enter flex-1 bg-blue-100 dark:bg-blue-700/20 hover:bg-blue-200 dark:hover:bg-blue-700/40 text-blue-700 dark:text-blue-200 py-1.5 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-1 text-sm">
          <i data-lucide="university" class="w-4 h-4"></i>Enter Classroom
        </button>
      </div>
    ` : `
      <div class="flex gap-2">
        <button class="edit-classroom flex-1 bg-blue-100 dark:bg-blue-700/20 hover:bg-blue-200 dark:hover:bg-blue-700/40 text-blue-700 dark:text-blue-200 py-1.5 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-1 text-sm">
          <i data-lucide="pencil-ruler" class="w-4 h-4"></i>Edit
        </button>
        <button class="delete-classroom flex-1 bg-red-100 dark:bg-red-700/20 hover:bg-red-200 dark:hover:bg-red-700/40 text-red-700 dark:text-red-200 py-1.5 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-1 text-sm">
          <i data-lucide="trash-2" class="w-4 h-4"></i>Delete
        </button>
      </div>
    `;

    const card = `
      <div
        class="classroom-card bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group"
        data-id="${classroom.classroomId}" data-name="${classroom.classroomCode}"
      >
        <div class="relative h-24 rounded-t-2xl overflow-hidden">
          <img src="Assets/images/learn-book.jpg" alt="${classroom.classLevel}" class="w-full h-full object-cover">
          <div class="absolute top-2 right-2 p-2 rounded-full text-slate-600/100 dark:text-slate-800 bg-slate-100 hover:bg-slate-100 hover:text-slate-800 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors">
            <i data-lucide="square-arrow-out-up-right" class="classroom-enter w-4 h-4 hover:scale-120 dark:hover:scale-none"></i>
          </div>
          <div class="absolute top-2 left-2 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-medium px-3 py-1 rounded-lg flex items-center gap-2 shadow">
            <span id="classroomCode">${classroom.classroomCode}</span>
          </div>
        </div>
        <div class="p-2">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            ${classroom.classLevel}
          </p>
          <div class="flex items-center space-x-2 mb-2 text-slate-600 dark:text-slate-400">
            <i data-lucide="swatch-book" class="w-4 h-4"></i>
            <span>${classroom.subject}</span>
            <!-- span class="text-xs">${classroom.classLevel}</span -->
          </div>

          <!-- Conditional Action Buttons -->
          ${actionButtons}
        </div>
      </div>
    `;
    $div.append(card);
  });

  // Refresh Lucide icons
  if (window.lucide?.createIcons) lucide.createIcons();
}

// Navigate to classroom.html with classroomId in URL
$("#classroom-card-container").on("click", ".classroom-enter", function () {
  const classroomId = $(this).closest(".classroom-card").data("id");
  if (!classroomId) return;

  // Redirect to classroom.html with classroomId as query param
  window.location.href = `classroomPage.html?classroomId=${classroomId}`;
});

// Navigate to classroomPage.html when clicking the entire card
$("#classroom-card-container").on("click", ".classroom-card", function (e) {
  // prevent accidental clicks on edit/delete buttons from triggering navigation
  if ($(e.target).closest(".edit-classroom, .delete-classroom").length) return;

  const classroomId = $(this).data("id");
  if (!classroomId) return;

  window.location.href = `classroomPage.html?classroomId=${classroomId}`;
});



// ===== Data fetching =====
function loadDataPaginated(page1 = 1, size = state.size) {
  const zeroBasedPage = Math.max(0, page1 - 1);

  const paginatingId = localStorage.getItem("userId");
  const paginatingRole = localStorage.getItem("role");

  ajaxWithToken({
    //url: `${api}all/paginated?page=${zeroBasedPage}&size=${size}`,
    url: `${api}paginated?page=${zeroBasedPage}&size=${size}&userId=${paginatingId}&role=${paginatingRole}`,
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

      console.log("content length: "+ content.length)
      if (content.length === 0) {
        $("#classroom-card-container").html(`
          <div class="text-center text-gray-500 py-6">
            You haven't joined any classroom yet.
          </div>
        `);
        return;
      }

      state.page = (number ?? 0) + 1; // convert 0-based -> 1-based
      state.size = respSize ?? size;
      state.totalPages = totalPages ?? 1;
      state.totalElements = totalElements ?? 0;

      state.currentPageData = content;

      console.log("Loaded classrooms:", content); // DEBUG

      renderCards(content);
      renderPaginationFooter();
    },
    error: function(xhr) {
      //console.error("Error loading students:", xhr.responseJSON || xhr);
      showMessage("error", "Error loading students: " + (xhr.responseJSON?.message || xhr.statusText || "Unknown error"));
      if(xhr.status === 401) {
        showMessage("error", "Session expired or unauthorized. Please log in again.");
        window.location.href = "login.html";
      }
    }
  });

}

// ====================== Save Classroom ======================
function saveClassroom(classroomData) {
  const userRole = localStorage.getItem("role");
  if (userRole === "STUDENT") {
    //alert("Student don't have access to create classrooms!");
    showMessage("warning", "Student don't have access to create classrooms!");
    return;
  }

  const teacherId = localStorage.getItem("userId"); // logged-in teacher id

  console.log("inside classroom: "+ teacherId)

  ajaxWithToken({
    url: `${api}add?creatingUserId=${teacherId}`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(classroomData),
    success: function(response) {
      console.log(response);
      showMessage("success", "Classroom created successfully!");
      $("#classroomModal").addClass("hidden");
      $("#classroom-form")[0].reset();
      loadDataPaginated(state.page, state.size);
    },
    error: function(xhr) {
      if (xhr.status === 400) {
        const errors = xhr.responseJSON?.data || {};
        showMessage("error", "Validation failed: "+ errors);
      } else {
        showMessage("error", xhr.responseJSON?.message || "Failed to create classroom.");
      }
    }
  });

  console.log("last of saveClassroom")

}

// ====================== Form Submit ======================
$("#classroom-form").on("submit", function(e) {
  e.preventDefault();

  const option = $("#classLevelOption").val();
  const levelText = $("#classLevelText").val().trim();
  const subject =  $("#subject").val().trim();

  // Validation check
  if (!option) {
    showMessage("warning", "Please select a type (Grade / Batch / Year).");
    return;
  }
  if (!levelText) {
    showMessage("warning", "Please enter a class level (Eg: 10, 2025, First Year).");
    return;
  }
  if (!subject) {
    showMessage("warning", "Please enter the subject. (Eg: History, Maths).");
    return;
  }

// Build classroom data only if valid
  const classroomData = {
    classLevel: `${option} ${levelText}`,
    subject: `${subject}`,
    description: $("#description").val().trim(),
  };

  console.log("Submitting classroomData:", classroomData);

  if (editingUserId) {
    // Update
    updateClassroom(editingUserId, editingClassroomId, classroomData);
  } else {
    // Add
    saveClassroom(classroomData);
  }

});


$("#classroom-card-container").on("click", ".edit-classroom", function () {
  //const index = $(this).closest(".classroom-card").index(); // safer selector
  //const classroom = state.currentPageData[index];

  const classroomId = $(this).closest(".classroom-card").data("id");
  const classroom = state.currentPageData.find(c => c.classroomId === classroomId);

  console.log("classroomId: "+ classroomId +"- classroom: "+ classroom)

  editingClassroomId = classroom.classroomId; // save classroom id for update
  editingUserId = localStorage.getItem("userId");

  // Set heading & button text
  document.getElementById("classroom-model-header-text").innerText = "Edit Classroom";
  document.getElementById("save-classroom-btn-text").innerHTML = `
        <i data-lucide="pencil-ruler" class="w-5 h-5"></i>
        Update Classroom
      `;

  lucide.createIcons();

  console.log("Editing classroom:", classroom);

  $("#classroomModal").removeClass("hidden");

  // Populate fields
  const [grade, level] = (classroom.classLevel || "").split(" ");
  $("#classLevelOption").val(grade || "");
  $("#classLevelText").val(level || "");
  $("#subject").val(classroom.subject);
  $("#description").val(classroom.description);
});


function updateClassroom(teacherId, classroomId, classroomData) {
  ajaxWithToken({
    url: `${api}edit/${classroomId}?updatingTeacherId=${teacherId}`,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify(classroomData),
    success: function (response) {
      showMessage("success", response.message || "Classroom updated successfully!");
      $("#classroomModal").addClass("hidden");
      $("#classroom-form")[0].reset();
      editingClassroomId = null; // reset edit mode
      editingUserId = null;
      loadDataPaginated(state.page, state.size);
    },
    error: function (xhr) {
      console.log(xhr.responseText);
      console.log(xhr.status);
      console.log(xhr.responseJSON);
      showMessage("error", xhr.responseJSON?.message || "Failed to update classroom.");
    }
  });
}


$("#classroom-card-container").on("click", ".delete-classroom", function () {
  //const index = $(this).closest(".classroom-card").index();
  //const classroom = state.currentPageData[index];
  const classroomId = $(this).closest(".classroom-card").data("id");
  const classroom = state.currentPageData.find(c => c.classroomId === classroomId);

  const deletingTeacherId = localStorage.getItem("userId");

  if (!confirm(`Are you sure you want to delete classroom ${classroom.classroomCode}?`)) return;

  ajaxWithToken({
    url: `${api}delete/${classroom.classroomId}?deletingTeacherId=${deletingTeacherId}`,
    method: "DELETE",
    success: function(response) {
      showMessage("success", response.message || "Classroom deleted successfully!");
      loadDataPaginated(state.page, state.size);
    },
    error: function(xhr) {
      if (xhr.status === 403) {
        showMessage("error", xhr.responseJSON?.message || "You are not authorized to delete this classroom.");
      } else if (xhr.status === 404) {
        showMessage("error", xhr.responseJSON?.message || "Classroom not found.");
      } else {
        console.error("Failed to delete classroom.", xhr.responseJSON || xhr);
        showMessage("error", "Failed to delete classroom." || xhr.responseJSON?.message);
      }
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

// ====================== Form Submit ======================
/*
$("#classroom-form").on("submit", function(e) {
  e.preventDefault();

  const classroomData = {
    classLevel: `${$("#classLevelOption").val()} ${$("#classLevelText").val()}`,
    level: $("#classLevelText").val(),
    subject: $("#subject").val(),
    description: $("#description").val()
  };

  $.ajax({
    url: `${api}add`,
    method: "POST",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("accessToken")
    },
    data: JSON.stringify(classroomData),
    success: function(response) {
      console.log(response);

      alert("Classroom created successfully..!");
      $("#classroomModal").addClass("hidden");
      $("#classroomForm")[0].reset();
      loadDataPaginated(state.page, state.size);
    },
    error: function(xhr) {
      const message = xhr.responseJSON?.message || "Failed to create classroom.";
      alert(message);
    }
  });



  /!*if (editingTeacherId) {
    // Update student
    updateClassroom(editingTeacherId, classroomData);
  } else {
    // Add student
    saveClassroom(classroomData);
  }*!/


});*/
