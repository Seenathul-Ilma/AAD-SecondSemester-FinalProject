document.addEventListener("DOMContentLoaded", function () {


});

const state = {
    page: 0,
    size: default_page_size,
    totalPages: 1,
    totalElements:0,
};

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

// Build a list of pages with ellipses markers ("dots")
function buildPageList(totalPages, current, maxVisible = 7) {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const windowSize = maxVisible - 2; // reserve spots for first & last
    let start = Math.max(2, current - Math.floor((windowSize - 1) / 2));
    let end = Math.min(totalPages - 1, start + windowSize - 1);
    start = Math.max(2, end - windowSize + 1);

    const pages = [1];
    if (start > 2) pages.push("dots");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push("dots");
    pages.push(totalPages);
    return pages;
}

function renderPaginationFooter() {
    const container = document.getElementById("pagination-container");
    container.innerHTML = ""; // reset

    const start = state.totalElements === 0
        ? 0
        : (state.page - 1) * state.size + 1;
    const end = state.totalElements === 0
        ? 0
        : Math.min(state.page * state.size, state.totalElements);

    const pageList = buildPageList(state.totalPages, state.page, max_visible_pages);

    // Mobile (Prev/Next) + Desktop (numbers)
    const html = `
    <div class="flex items-center justify-between border-none px-4 py-2 sm:px-6">
      <!-- Mobile -->
      <div class="flex flex-1 justify-between sm:hidden">
        <a href="#" data-action="prev"
           class="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10 ${state.page === 1 ? 'pointer-events-none opacity-50' : ''}">
          Previous
        </a>
        <a href="#" data-action="next"
           class="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10 ${state.page === state.totalPages || state.totalPages === 0 ? 'pointer-events-none opacity-50' : ''}">
          Next
        </a>
      </div>

      <!-- Desktop -->
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Showing
            <span class="font-medium">${start}</span>
            to
            <span class="font-medium">${end}</span>
            of
            <span class="font-medium">${state.totalElements}</span>
            results
          </p>
        </div>
        <div>
          <nav aria-label="Pagination" class="isolate inline-flex -space-x-px rounded-md">
            <a href="#" data-action="prev"
               class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-600 dark:ring-gray-500 hover:bg-white/5 ${state.page === 1 ? 'pointer-events-none opacity-50' : ''}">
              <span class="sr-only">Previous</span>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5">
                <path d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" fill-rule="evenodd" />
              </svg>
            </a>
            ${pageList.map(p => {
        if (p === "dots") {
            return `<span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 ring-1 ring-inset ring-gray-700">...</span>`;
        }
        const isCurrent = p === state.page;
        return `
                <a href="#" data-page="${p}" aria-current="${isCurrent ? 'page' : 'false'}"
                   class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${isCurrent
            ? 'bg-indigo-500 text-white z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
            : 'text-gray-200 ring-1 ring-inset ring-gray-600 dark:ring-gray-500 hover:bg-white/5'}">
                  ${p}
                </a>
              `;
    }).join("")}
            <a href="#" data-action="next"
               class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-white/5 ${state.page === state.totalPages || state.totalPages === 0 ? 'pointer-events-none opacity-50' : ''}">
              <span class="sr-only">Next</span>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5">
                <path d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </div>
  `;
    container.insertAdjacentHTML("beforeend", html);

    // Wire up click handlers (event delegation)
    container.querySelector("nav")?.addEventListener("click", handlePagerClick);
    const mobileCtrls = container.querySelector(".sm\\:hidden");
    mobileCtrls?.addEventListener("click", handlePagerClick);
}

function handlePagerClick(e) {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();

    const action = a.getAttribute("data-action");
    const pageAttr = a.getAttribute("data-page");

    if (action === "prev") {
        gotoPage(state.page - 1);
    } else if (action === "next") {
        gotoPage(state.page + 1);
    } else if (pageAttr) {
        gotoPage(parseInt(pageAttr, 10));
    }
}

function gotoPage(p) {
    const next = clamp(p, 1, Math.max(1, state.totalPages));
    if (next !== state.page) {
        loadStudents(next, state.size);
    }
}