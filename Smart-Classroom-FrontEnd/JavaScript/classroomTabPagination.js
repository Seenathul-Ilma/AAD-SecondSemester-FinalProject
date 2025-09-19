// Enhanced pagination system that works with different tabs
// Replace the existing pagination functions with these:

// IMPORTANT: These state objects must be declared GLOBALLY (outside any IIFEs)
// so they can be accessed by both the pagination system and your modules

window.state = window.state || {
    page: 0,
    size: typeof default_page_size !== 'undefined' ? default_page_size : 10,
    totalPages: 1,
    totalElements: 0,
};

window.announcementState = window.announcementState || {
    page: 0,
    size: typeof default_page_size !== 'undefined' ? default_page_size : 10,
    totalPages: 1,
    totalElements: 0,
};

window.assignmentState = window.assignmentState || {
    page: 0,
    size: typeof default_page_size !== 'undefined' ? default_page_size : 10,
    totalPages: 1,
    totalElements: 0,
};

// Tab configuration mapping
const TAB_CONFIG = {
    'announcements': {
        state: window.announcementState,
        loadFunction: 'loadAnnouncementsPaginated',
        containerSelector: '#broadcast-tab .pagination-container'
    },
    'assignments': {
        state: window.assignmentState,
        loadFunction: 'loadAssignmentsPaginated',
        containerSelector: '#assignment-tab .pagination-container'
    },
    'default': {
        state: window.state,
        loadFunction: 'loadDataPaginated',
        containerSelector: '.pagination-container'
    }
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

// Enhanced pagination renderer that accepts tab type
function renderPaginationFooters(containerSelector, tabState, tabType = 'default') {
    const containers = document.querySelectorAll(containerSelector);

    containers.forEach((container) => {
        container.innerHTML = ""; // reset

        const start = tabState.totalElements === 0
            ? 0
            : (tabState.page - 1) * tabState.size + 1;
        const end = tabState.totalElements === 0
            ? 0
            : Math.min(tabState.page * tabState.size, tabState.totalElements);

        const pageList = buildPageList(tabState.totalPages, tabState.page, max_visible_pages || 7);

        const html = `
        <div class="flex items-center justify-between border-none px-4 py-2 sm:px-6">
          <!-- Mobile -->
          <div class="flex flex-1 justify-between sm:hidden">
            <a href="#" data-action="prev" data-tab="${tabType}"
               class="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10 ${tabState.page === 1 ? 'pointer-events-none opacity-50' : ''}">
              Previous
            </a>
            <a href="#" data-action="next" data-tab="${tabType}"
               class="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10 ${tabState.page === tabState.totalPages || tabState.totalPages === 0 ? 'pointer-events-none opacity-50' : ''}">
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
                <span class="font-medium">${tabState.totalElements}</span>
                results
              </p>
            </div>
            <div>
                <nav aria-label="Pagination" class="isolate inline-flex -space-x-px rounded-md">
                  <a href="#" data-action="prev" data-tab="${tabType}"
                     class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-600 dark:ring-gray-500 hover:bg-white/5 ${tabState.page === 1 ? 'pointer-events-none opacity-50' : ''}">
                    <span class="sr-only">Previous</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5">
                      <path d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" fill-rule="evenodd" />
                    </svg>
                  </a>
                  ${pageList.map(p => {
            if (p === "dots") {
                return `<span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 ring-1 ring-inset ring-gray-700">...</span>`;
            }
            const isCurrent = p === tabState.page;
            return `
                      <a href="#" data-page="${p}" data-tab="${tabType}" aria-current="${isCurrent ? 'page' : 'false'}"
                         class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${isCurrent
                ? 'bg-indigo-500 text-white z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
                : 'text-gray-200 ring-1 ring-inset ring-gray-600 dark:ring-gray-500 hover:bg-white/5'}">
                        ${p}
                      </a>
                    `;
        }).join("")}
                  <a href="#" data-action="next" data-tab="${tabType}"
                     class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-white/5 ${tabState.page === tabState.totalPages || tabState.totalPages === 0 ? 'pointer-events-none opacity-50' : ''}">
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

        // Attach event handlers with tab context
        const navElement = container.querySelector("nav");
        const mobileElement = container.querySelector(".sm\\:hidden");

        if (navElement) {
            navElement.addEventListener("click", (e) => handlePagerClick(e, tabType));
        }
        if (mobileElement) {
            mobileElement.addEventListener("click", (e) => handlePagerClick(e, tabType));
        }
    });
}

// Enhanced click handler that knows which tab it's working with
function handlePagerClick(e, tabType = 'default') {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();

    const action = a.getAttribute("data-action");
    const pageAttr = a.getAttribute("data-page");
    const tabFromElement = a.getAttribute("data-tab") || tabType;

    const config = TAB_CONFIG[tabFromElement] || TAB_CONFIG['default'];
    const currentState = config.state;

    if (action === "prev") {
        gotoPage(currentState.page - 1, tabFromElement);
    } else if (action === "next") {
        gotoPage(currentState.page + 1, tabFromElement);
    } else if (pageAttr) {
        gotoPage(parseInt(pageAttr, 10), tabFromElement);
    }
}

// Enhanced gotoPage function that works with different tabs
function gotoPage(p, tabType = 'default') {
    const config = TAB_CONFIG[tabType] || TAB_CONFIG['default'];
    const currentState = config.state;

    const next = clamp(p, 1, Math.max(1, currentState.totalPages));
    if (next !== currentState.page) {
        // Call the appropriate load function based on tab
        switch (tabType) {
            case 'announcements':
                if (typeof window.announcementPagination !== 'undefined' && window.announcementPagination.loadDataPaginated) {
                    window.announcementPagination.loadDataPaginated(next, currentState.size);
                } else if (typeof window.loadAnnouncementsPaginated === 'function') {
                    window.loadAnnouncementsPaginated(next, currentState.size);
                } else {
                    console.error('Announcement pagination function not found');
                }
                break;
            case 'assignments':
                if (typeof window.loadAssignmentsPaginated === 'function') {
                    window.loadAssignmentsPaginated(next, currentState.size);
                } else if (typeof window.assignmentPagination !== 'undefined' && window.assignmentPagination.loadDataPaginated) {
                    window.assignmentPagination.loadDataPaginated(next, currentState.size);
                } else {
                    console.error('Assignment pagination function not found');
                }
                break;
            default:
                if (typeof window.loadDataPaginated === 'function') {
                    window.loadDataPaginated(next, currentState.size);
                } else {
                    console.error('Default pagination function not found');
                }
                break;
        }
    }
}

// Utility function to get current active tab
function getCurrentActiveTab() {
    // This depends on your tab implementation
    // You might need to adjust this based on your actual tab structure
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab') || activeTab.id;
        if (tabId.includes('announcement') || tabId.includes('broadcast')) {
            return 'announcements';
        } else if (tabId.includes('assignment')) {
            return 'assignments';
        }
    }
    return 'default';
}

// Updated calls in your existing code:
// Replace the existing renderPaginationFooters calls with:

// For announcements:
// renderPaginationFooters("#broadcast-tab .pagination-container", announcementState, 'announcements');

// For assignments:
// renderPaginationFooters("#assignment-tab .pagination-container", assignmentState, 'assignments');

// For default/other content:
// renderPaginationFooters(".pagination-container", state, 'default');