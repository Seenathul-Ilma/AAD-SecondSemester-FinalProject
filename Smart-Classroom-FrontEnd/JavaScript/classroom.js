document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons after the DOM is loaded
  lucide.createIcons();

  loadDataPaginated(1, default_page_size);
});

const api = "http://localhost:8080/api/v1/edusphere/classroom/";
const default_page_size = 8;
const max_visible_pages = 7;

// ===== Rendering =====
function renderCards(items) {
  const $div = $("#classroom-card-container");
  $div.empty();

  items.forEach((classroom) => {
    const card = `
                           <div
                            class="classroom-card bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group"
                            data-name="grade-07-maths"
                            >
                              <!-- Classroom Image -->
                              <div class="relative h-24 rounded-t-2xl overflow-hidden"> <!-- reduced from h-30 -->
                                <img src="Assets/images/learn-book.jpg" alt="Grade 07 Maths" class="w-full h-full object-cover">
                                <div class="absolute top-2 right-2 p-2 rounded-full text-slate-600/100 dark:text-slate-800 bg-slate-100 hover:bg-slate-100 hover:text-slate-800 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors">
                                  <i data-lucide="square-arrow-out-up-right" class="w-4 h-4 hover:scale-120 dark:hover:scale-none"></i>
                                </div>
                                <div class="absolute top-2 left-2 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-medium px-3 py-1 rounded-lg flex items-center gap-2 shadow">
                                  <span id="classroomCode">${classroom.classroomCode}</span>
                                </div>
                              </div>
        
                              <!-- Card Content -->
                              <div class="p-2">
                                <!-- Grade / Subject / Medium -->
                                <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                  ${classroom.classLevel}
                                </p>
                                <div class="flex items-center space-x-2 mb-2 text-slate-600 dark:text-slate-400">
                                  <i data-lucide="swatch-book" class="w-4 h-4"></i>
                                  <span>${classroom.subject}</span>
                                  <span class="text-xs">${classroom.classLevel}</span>
                                </div>
        
                                <!-- Action Buttons -->
                                <div class="flex gap-2">
                                  <button class="flex-1 bg-blue-100 dark:bg-blue-700/20 hover:bg-blue-200 dark:hover:bg-blue-700/40 text-blue-700 dark:text-blue-200 py-1.5 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-1 text-sm">
                                    <i data-lucide="pencil-ruler" class="w-4 h-4"></i>Edit
                                  </button>
                                  <button class="flex-1 bg-red-100 dark:bg-red-700/20 hover:bg-red-200 dark:hover:bg-red-700/40 text-red-700 dark:text-red-200 py-1.5 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-1 text-sm">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>Delete
                                  </button>
                                </div>
                              </div>
                            </div>    
                        `;
    $div.append(card);
  });

  // Refresh lucid icons
  if (window.lucide?.createIcons) lucide.createIcons();
}

// ===== Data fetching =====
function loadDataPaginated(page1 = 1, size = state.size) {
  const zeroBasedPage = Math.max(0, page1 - 1);
  $.ajax({
    url: api + `all/paginated?page=${zeroBasedPage}&size=${size}`,
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

      renderCards(content);
      renderPaginationFooter();
    },
    error: function (xhr, status, error) {
      console.error("Error loading students:", error);
      alert("Failed to load classroom data. Please try again.");
    },
  });
}
