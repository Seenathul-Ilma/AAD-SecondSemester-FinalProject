document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons after the DOM is loaded
  lucide.createIcons();

  loadDataPaginated(1, default_page_size);
});

const api = "http://localhost:8080/api/v1/edusphere/users/";
const default_page_size = 5;
const max_visible_pages = 7;

function getAvatar(teacher) {
  const name = teacher.name || ""; // ensure it's a string
  if (teacher.profileImg) {
    return `
        <img src="${teacher.profileImg}" 
             class="w-10 h-10 rounded-full object-cover" 
             alt="${name}" />
      `;
  } else {
    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
    return `
        <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          ${firstLetter}
        </div>
      `;
  }
}

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
            <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${
        teacher.userId
    }</td>
            <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${
        teacher.name
    }</td>
            <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${
        teacher.nic
    }</td>
            <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${
        teacher.contact
    }</td>
            <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${
        teacher.email
    }</td>
            <td class="px-6 py-4">
              <div class="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
                <button aria-label="Send Message" class="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105">
                  <i data-lucide="message-circle-more" class="size-5"></i>
                </button>
                <div class="w-px h-6 bg-gray-300 mx-1"></div>
                <button aria-label="Edit" class="p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105">
                  <i data-lucide="pencil" class="size-5"></i>
                </button>
                <div class="w-px h-6 bg-gray-300 mx-1"></div>
                <button aria-label="Delete" class="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105">
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
  const token = localStorage.getItem("accessToken"); // your JWT token

  $.ajax({
    url: api + `teachers?page=${zeroBasedPage}&size=${size}`,
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "", // send token if available
    },
    /*xhrFields: {
      withCredentials: true
    }, // must have this*/
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

      renderRows(content);
      renderPaginationFooter();
    },
    error: function (xhr, status, error) {
      console.error("Error loading teachers:", error);
      alert("Failed to load teacher data. Please try again.");
    },
  });
}



// ------ Invite teachers by Admin
const $inviteEmailInput = $("#inviteEmail");
const $sendInviteBtn = $("#sendInviteBtn");
const $inviteMessage = $("#inviteMessage");
const $inviteMessageText = $("#inviteMessageText");
const $inviteError = $("#inviteError");
const $inviteErrorText = $("#inviteErrorText");

// Send Invite Button
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
  $.ajax({
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
  });
});

// Close buttons
$("#closeInviteMessage").on("click", () => $inviteMessage.addClass("hidden"));
$("#closeInviteError").on("click", () => $inviteError.addClass("hidden"));

// Initialize Lucide icons
lucide.createIcons();
