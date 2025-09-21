(function() {

    document.addEventListener("DOMContentLoaded", function () {
        loadDataPaginated(1, default_page_size);
    });

    // Real user data storage
    let realUsers = [];
    let allLoadedUsers = []; // Store all users loaded from API for search

    // why both
    // When API loads users:
    // realUsers = [user1, user2, user3, user4, user5]; // Original data
    // allLoadedUsers = [user1, user2, user3, user4, user5]; // Copy for search

    // When user searches for "John":
    // allLoadedUsers = [user1]; // Filtered results
    // realUsers = [user1, user2, user3, user4, user5]; // Still has all users

    // When user clears search:
    // allLoadedUsers = realUsers; // Reset to show all users again


    function loadUsersToJoin() {
        console.log("classroomId: "+classroomId)
        ajaxWithToken({
            url: `http://localhost:8080/api/v1/edusphere/users/all/${classroomId}/users?page=0&size=10`, // Load more users initially
            method: "GET",
            dataType: "json",
            success: function (response) {
                const users = response.data?.content || [];

                // Transform API data to match UI expectations and add selection state
                realUsers = users.map(user => ({
                    ...user,
                    id: user.userId, // Map userId to id for consistency
                    selected: false  // Add selection state
                }));

                // Store all loaded users for search functionality
                allLoadedUsers = [...realUsers];

                // Initialize pagination state
                modalPaginationState.filteredUsers = realUsers;
                modalPaginationState.totalElements = realUsers.length;
                modalPaginationState.totalPages = Math.ceil(realUsers.length / modalPaginationState.pageSize);
                modalPaginationState.page = 1;

                // Render initial page
                renderUserTable(getCurrentPageUsers());
                renderModalPagination();
                updateSelectedCount();
            },
            error: function (xhr) {
                console.error("Error loading users:", xhr.responseJSON?.message || xhr.statusText);
                // Show error in UI
                userTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-8 text-red-500">
                            <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-2"></i>
                            <p>Failed to load users. Please try again.</p>
                        </td>
                    </tr>
                `;
                lucide.createIcons();
            }
        });
    }

    function getUserInitials(name) {
        if (!name || typeof name !== "string") return "?";
        return name.trim().charAt(0).toUpperCase();
    }

    // Get users for current page
    function getCurrentPageUsers() {
        const startIndex = (modalPaginationState.page - 1) * modalPaginationState.pageSize;
        const endIndex = startIndex + modalPaginationState.pageSize;
        return modalPaginationState.filteredUsers.slice(startIndex, endIndex);
    }

    // DOM elements
    const addConnectionBtn = document.getElementById('addConnectionBtn');
    const addConnectionModal = document.getElementById('addConnectionModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelModalBtn = document.getElementById('cancelModal');
    const userSearch = document.getElementById('userSearch');
    const userTableBody = document.getElementById('userTableBody');
    const memberTableBody = document.getElementById('member-table-tbody');
    const selectedCount = document.getElementById('selectedCount');
    const joinClassroomBtn = document.getElementById('joinClassroomBtn');
    const modalPaginationContainer = document.getElementById('modalPagination');

    const default_page_size = 10;

    // Pagination state for the modal
    const modalPaginationState = {
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalElements: 0,
        filteredUsers: []
    };

    // Open modal
    addConnectionBtn.addEventListener('click', () => {
        addConnectionModal.classList.remove('hidden');
        loadUsersToJoin();
    });

    // Close modal
    function closeModal() {
        addConnectionModal.classList.add('hidden');
        // Reset selections
        realUsers.forEach(user => user.selected = false);
        allLoadedUsers.forEach(user => user.selected = false);
        // Reset search
        userSearch.value = '';
    }

    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    addConnectionModal.addEventListener('click', (e) => {
        if (e.target === addConnectionModal || e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });

    // Search functionality - NOW USES REAL DATA
    userSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        // Filter through real loaded users, not mock data
        const filteredUsers = allLoadedUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.userId.toLowerCase().includes(searchTerm) ||
            user.role.toLowerCase().includes(searchTerm)
        );

        // Update pagination state with filtered results
        modalPaginationState.filteredUsers = filteredUsers;
        modalPaginationState.totalElements = filteredUsers.length;
        modalPaginationState.totalPages = Math.ceil(filteredUsers.length / modalPaginationState.pageSize);
        modalPaginationState.page = 1; // Reset to first page

        // Render updated results
        renderUserTable(getCurrentPageUsers());
        renderModalPagination();
    });

    // Render user table
    function renderUserTable(users) {
        userTableBody.innerHTML = '';

        if (users.length === 0) {
            userTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
                        <i data-lucide="users" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                        <p>No users found</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';

            // Determine profile display: image or initials
            const profileContent = user.profileImg
                ? `<img src="http://localhost:8080/profiles/${user.profileImg}" class="w-10 h-10 rounded-full object-cover" alt="${user.name}" onerror="this.outerHTML='<div class=&quot;w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold&quot;>${getUserInitials(user.name)}</div>'"/>`
                : `<div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">${getUserInitials(user.name)}</div>`;

            row.innerHTML = `
                <td class="py-3 px-4">
                    <input 
                        type="checkbox" 
                        class="checkbox-circle" 
                        data-user-id="${user.userId}"
                        ${user.selected ? 'checked' : ''}
                    >
                </td>
                <td class="py-3 px-4">
                    ${profileContent}
                </td>
                <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${user.userId}</td>
                <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${user.name}</td>
                <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${user.email}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(user.role)}">
                        ${user.role}
                    </span>
                </td>
            `;
            userTableBody.appendChild(row);
        });

        // Add event listeners to checkboxes - NOW USES REAL DATA
        document.querySelectorAll('.checkbox-circle').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const userId = e.target.getAttribute('data-user-id');

                // Find user in both arrays and update selection
                const realUser = allLoadedUsers.find(u => u.userId === userId);
                const filteredUser = modalPaginationState.filteredUsers.find(u => u.userId === userId);

                if (realUser) {
                    realUser.selected = e.target.checked;
                }
                if (filteredUser) {
                    filteredUser.selected = e.target.checked;
                }

                updateSelectedCount();
            });
        });

        lucide.createIcons();
    }

    // Get role badge styling
    function getRoleBadgeClass(role) {
        switch(role?.toUpperCase()) {
            case 'TEACHER':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'STUDENT':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'ADMIN':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }

    // Render pagination for modal
    function renderModalPagination() {
        if (!modalPaginationState || modalPaginationState.totalPages <= 1) {
            modalPaginationContainer.innerHTML = '';
            return;
        }

        const prevDisabled = modalPaginationState.page === 1 ? 'disabled opacity-50 cursor-not-allowed' : '';
        const nextDisabled = modalPaginationState.page === modalPaginationState.totalPages ? 'disabled opacity-50 cursor-not-allowed' : '';

        const paginationHTML = `
            <div class="flex items-center gap-2 justify-center py-2">
                <button class="modal-prev-btn flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${prevDisabled}"
                        ${prevDisabled ? 'disabled' : ''}>
                    <i data-lucide="chevron-left" class="w-3 h-3"></i>
                </button>
                <span class="text-xs text-gray-500 dark:text-gray-400 px-2">
                    ${modalPaginationState.page}/${modalPaginationState.totalPages} (${modalPaginationState.totalElements} users)
                </span>
                <button class="modal-next-btn flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${nextDisabled}"
                        ${nextDisabled ? 'disabled' : ''}>
                    <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </button>
            </div>
        `;

        modalPaginationContainer.innerHTML = paginationHTML;

        // Add event listeners to pagination buttons
        document.querySelector('.modal-prev-btn')?.addEventListener('click', () => {
            if (modalPaginationState.page > 1) {
                modalPaginationState.page--;
                renderUserTable(getCurrentPageUsers());
                renderModalPagination();
            }
        });

        document.querySelector('.modal-next-btn')?.addEventListener('click', () => {
            if (modalPaginationState.page < modalPaginationState.totalPages) {
                modalPaginationState.page++;
                renderUserTable(getCurrentPageUsers());
                renderModalPagination();
            }
        });

        lucide.createIcons();
    }

    // Update selected count - NOW USES REAL DATA
    function updateSelectedCount() {
        const count = allLoadedUsers.filter(user => user.selected).length;
        selectedCount.innerHTML = count === 1 ?
            '<i data-lucide="user-check" class="w-4 h-4 mr-1"></i><span>1 user selected</span>' :
            `<i data-lucide="users" class="w-4 h-4 mr-1"></i><span>${count} users selected</span>`;

        joinClassroomBtn.disabled = count === 0;
        lucide.createIcons();
    }

    // Join classroom button - NOW USES REAL DATA
    joinClassroomBtn.addEventListener('click', () => {
        const selectedUsers = allLoadedUsers.filter(user => user.selected);
        console.log("JoinedBtn clicked..!")
        if (selectedUsers.length === 0) {
            alert('Please select at least one user');
            return;
        }

        // Here you can make the API call to add users to classroom
        console.log('Selected users:', selectedUsers.map(u => ({
            userId: u.userId,
            name: u.name,
            email: u.email,
            role: u.role
        })));

        alert(`Adding ${selectedUsers.length} users to classroom`);

        console.log("ClassroomId: "+ classroomId)

        // Example API call (uncomment and modify as needed):
        ajaxWithToken({
            url: `http://localhost:8080/api/v1/edusphere/classroom/joinById/list?classroomId=${classroomId}`,
            method: "POST",
            dataType: "json",
            data: JSON.stringify(selectedUsers.map(u => u.userId)), // just the array
            contentType: "application/json",
            success: function (response) {
                alert('Users added successfully!');
                closeModal();
            },
            error: function (xhr) {
                console.error("Error adding users:", xhr.responseJSON?.message || xhr.statusText);
                alert('Failed to add users. Please try again.');
            }
        });

        closeModal();
    });

    // Initialize lucide icons
    lucide.createIcons();

    // Export functions for external use
    window.loadConnectionPaginated = function(page, size) {
        // This can be used for external pagination if needed
        console.log('Loading page:', page, 'size:', size);
    };


    function loadDataPaginated(page1 = 1, size = connectionState.size) {
        const zeroBasedPage = Math.max(0, page1 - 1);
        console.log("classroomId: "+classroomId)

        ajaxWithToken({
            url: `http://localhost:8080/api/v1/edusphere/classroom/get/${classroomId}/members?page=${zeroBasedPage}&size=${size}`, // Load more users initially
            method: "GET",
            dataType: "json",
            success: function (response) {
                const data = response.data || [];
                console.log("Members: response")
                console.log(response)
                console.log("Members: response data")
                console.log(response.data)
                console.log("Members: response content")
                console.log(response.data?.content)

                const {
                    content = [],
                    number = 0,
                    size: respSize = size,
                    totalPages = 1,
                    totalElements = 0,
                } = data; // destructure from data

                connectionState.page = (number ?? 0) + 1; // convert 0-based -> 1-based
                connectionState.size = respSize ?? size;
                connectionState.totalPages = totalPages ?? 1;
                connectionState.totalElements = totalElements ?? 0;

                connectionState.currentPageData = data;

                // Correct
                renderMembersTable(content);
                renderPaginationFooters("#connection-tab .pagination-container", connectionState, 'connections');

            },
            error: function (xhr) {
                console.error("Error loading users:", xhr.responseJSON?.message || xhr.statusText);
                // Show error in UI
                memberTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-8 text-red-500">
                            <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-2"></i>
                            <p>Failed to load members. Please try again.</p>
                        </td>
                    </tr>
                `;
                lucide.createIcons();
            }
        });
    }

    function renderMembersTable(members) {
        const userRole = localStorage.getItem("role");
        memberTableBody.innerHTML = '';

        if (members.length === 0) {
            memberTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
                        <i data-lucide="users" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                        <p>No members found</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        members.forEach(member => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors';

            // Determine profile display: image or initials
            const profileContent = member.profileImg
                ? `<img src="http://localhost:8080/profiles/${member.profileImg}" class="w-10 h-10 rounded-full object-cover" alt="${member.name}" onerror="this.outerHTML='<div class=&quot;w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold&quot;>${getUserInitials(member.name)}</div>'"/>`
                : `<div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">${getUserInitials(member.name)}</div>`;

            row.innerHTML = `
                <td class="py-3 px-4">
                    ${profileContent}
                </td>
                <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${member.memberId}</td>
                <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${member.name}</td>
                <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${member.contact}</td>
                <td class="p-4 text-sm text-slate-500 dark:text-slate-400">${member.email}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(member.roleInClassroom)}">
                        ${member.roleInClassroom}
                    </span>
                </td>
                <td class="py-3 px-4">
  <div class="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
    <button aria-label="Send Message"
            class="message-member p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105"
            data-id="${member.memberId}">
      <i data-lucide="message-circle-more" class="size-5"></i>
    </button>
    
    ${userRole !== 'STUDENT' ? `
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      <button aria-label="Delete"
              class="remove-member p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105"
              data-id="${member.memberId}">
        <i data-lucide="trash" class="size-5"></i>
      </button>
    ` : ''}
  </div>
</td>

            `;
            memberTableBody.appendChild(row);
        });

        // Add event listeners to checkboxes - NOW USES REAL DATA
        document.querySelectorAll('.checkbox-circle').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const userId = e.target.getAttribute('data-user-id');

                // Find user in both arrays and update selection
                const realUser = allLoadedUsers.find(u => u.userId === userId);
                const filteredUser = modalPaginationState.filteredUsers.find(u => u.userId === userId);

                if (realUser) {
                    realUser.selected = e.target.checked;
                }
                if (filteredUser) {
                    filteredUser.selected = e.target.checked;
                }

                updateSelectedCount();
            });
        });

        lucide.createIcons();
    }



    window.loadConnectionsPaginated = loadDataPaginated;
})();

// Add this outside the IIFE
window.connectionPagination = {
    loadDataPaginated: function(page, size) {
        if (typeof window.loadConnectionsPaginated === 'function') {
            window.loadConnectionsPaginated(page, size);
        }
    },
    state: window.connectionState
};