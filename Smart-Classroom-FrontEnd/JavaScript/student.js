document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons after the DOM is loaded
  lucide.createIcons();
  loadStudents();
});

function loadStudents() {
  $.ajax({
    url: "http://localhost:8080/api/v1/edusphere/students",
    method: "GET",
    dataType: "json",
    success: function (students) {
      const $tbody = $("#student-table-tbody");
      $tbody.empty();

      students.forEach((student) => {
        const row = `
          <tr class="border-b border-slate-200/50 dark:border-slate-700/50 dark:hover:bg-gray-800 hover:bg-gray-100 hover:shadow transition-colors">
            <td class="p-4">
              ${getAvatar(student)}
            </td>
            <td class="p-4 font-light text-sm text-slate-700 dark:text-slate-400">${
              student.userId
            }</td>
            <td class="p-4 font-light text-sm text-slate-700 dark:text-slate-400">${
              student.name
            }</td>
            <td class="p-4 font-light text-sm text-slate-700 dark:text-slate-400">${
              student.nic
            }</td>
            <td class="p-4 font-light text-sm text-slate-700 dark:text-slate-400">${
              student.contact
            }</td>
            <td class="p-4 font-light text-base text-slate-700 dark:text-slate-400">${
              student.email
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

      // Refresh Lucide icons after new rows are inserted
      lucide.createIcons();
    },
    error: function (xhr, status, error) {
      console.error("Error loading students:", error);
      alert("Failed to load student data. Please try again.");
    },
  });
}

function getAvatar(student) {
  if (student.profileImg) {
    return `
      <img src="${student.profileImg}" 
           class="w-10 h-10 rounded-full object-cover" 
           alt="${student.name}" />
    `;
  } else {
    const firstLetter = student.name
      ? student.name.charAt(0).toUpperCase()
      : "?";
    return `
      <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg text-white text-xl font-medium">
        ${firstLetter}
      </div>
    `;
  }
}
