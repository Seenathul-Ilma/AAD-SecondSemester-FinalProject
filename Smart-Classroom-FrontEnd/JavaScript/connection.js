(function() {

    document.addEventListener("DOMContentLoaded", function () {
        loadDataPaginated(1, default_page_size);
    });

    // Real user data storage
    let realUsers = [];
    let allLoadedUsers = [];
    let selectedMembersForRemoval = new Set(); // Track selected members for removal

    function loadUsersToJoin() {
        console.log("classroomId: "+classroomId)
        ajaxWithToken({
            url: `http://localhost:8080/api/v1/edusphere/users/all/${classroomId}/users?page=0&size=10`,
            method: "GET",
            dataType: "json",
            success: function (response) {
                const users = response.data?.content || [];

                realUsers = users.map(user => ({
                    ...user,
                    id: user.userId,
                    selected: false
                }));

                allLoadedUsers = [...realUsers];

                modalPaginationState.filteredUsers = realUsers;
                modalPaginationState.totalElements = realUsers.length;
                modalPaginationState.totalPages = Math.ceil(realUsers.length / modalPaginationState.pageSize);
                modalPaginationState.page = 1;

                renderUserTable(getCurrentPageUsers());
                renderModalPagination();
                updateSelectedCount();
            },
            error: function (xhr) {
                console.error("Error loading users:", xhr.responseJSON?.message || xhr.statusText);
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

    // Bulk removal elements
    const bulkRemoveContainer = document.createElement('div');
    const selectAllCheckbox = document.createElement('input');
    const bulkRemoveBtn = document.createElement('button');

    const default_page_size = 10;

    const modalPaginationState = {
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalElements: 0,
        filteredUsers: []
    };

    if (addConnectionBtn) {
        // Open modal
        addConnectionBtn.addEventListener('click', () => {
            addConnectionModal.classList.remove('hidden');
            loadUsersToJoin();
        });
    }

    // Close modal
    function closeModal() {
        addConnectionModal.classList.add('hidden');
        realUsers.forEach(user => user.selected = false);
        allLoadedUsers.forEach(user => user.selected = false);
        userSearch.value = '';
    }

    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    addConnectionModal.addEventListener('click', (e) => {
        if (e.target === addConnectionModal || e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });

    // Search functionality
    userSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        const filteredUsers = allLoadedUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.userId.toLowerCase().includes(searchTerm) ||
            user.role.toLowerCase().includes(searchTerm)
        );

        modalPaginationState.filteredUsers = filteredUsers;
        modalPaginationState.totalElements = filteredUsers.length;
        modalPaginationState.totalPages = Math.ceil(filteredUsers.length / modalPaginationState.pageSize);
        modalPaginationState.page = 1;

        renderUserTable(getCurrentPageUsers());
        renderModalPagination();
    });

    // Render user table (for add modal)
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
                <td class="py-3 px-4">${profileContent}</td>
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

        document.querySelectorAll('.checkbox-circle').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const userId = e.target.getAttribute('data-user-id');
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

    function updateSelectedCount() {
        const count = allLoadedUsers.filter(user => user.selected).length;
        selectedCount.innerHTML = count === 1 ?
            '<i data-lucide="user-check" class="w-4 h-4 mr-1"></i><span>1 user selected</span>' :
            `<i data-lucide="users" class="w-4 h-4 mr-1"></i><span>${count} users selected</span>`;

        joinClassroomBtn.disabled = count === 0;
        lucide.createIcons();
    }

    // Join classroom functionality
    joinClassroomBtn.addEventListener('click', () => {
        const selectedUsers = allLoadedUsers.filter(user => user.selected);

        if (selectedUsers.length === 0) {
            alert('Please select at least one user');
            return;
        }

        ajaxWithToken({
            url: `http://localhost:8080/api/v1/edusphere/classroom/joinById/list?classroomId=${classroomId}`,
            method: "POST",
            dataType: "json",
            data: JSON.stringify(selectedUsers.map(u => u.userId)),
            contentType: "application/json",
            success: function (response) {
                showMessage('success', 'Users added successfully!');
                closeModal();
                loadDataPaginated(connectionState.page, connectionState.size);
            },
            error: function (xhr) {
                console.error("Error adding users:", xhr.responseJSON?.message || xhr.statusText);
                showMessage('error', 'Failed to add users. Please try again.');
            }
        });

        closeModal();
    });

    // Create bulk removal UI
    function createBulkRemovalUI() {
        bulkRemoveContainer.className = 'flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800';
        bulkRemoveContainer.id = 'bulkRemovalContainer';
        bulkRemoveContainer.style.display = 'none';

        bulkRemoveContainer.innerHTML = `
            <div class="flex items-center gap-2">
                <input type="checkbox" id="selectAllMembers" class="checkbox-circle-remove w-4 h-4">
                <label for="selectAllMembers" class="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</label>
            </div>
            <div id="selectedMembersCount" class="text-sm text-gray-600 dark:text-gray-400">
                0 members selected
            </div>
            <button id="bulkRemoveBtn" class="ml-auto px-4 py-2 bg-purple-600 bg-gradient-to-r from-purple-600 to-blue-600 gap-2 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i data-lucide="trash-2" class="w-4 h-4"></i>
              <span>Remove Selected Members</span>
            </button>
        `;

        // Insert before the table
        const tableContainer = memberTableBody.closest('.overflow-x-auto') || memberTableBody.closest('table')?.parentElement;
        if (tableContainer) {
            tableContainer.parentElement.insertBefore(bulkRemoveContainer, tableContainer);
        }

        // Add event listeners
        document.getElementById('selectAllMembers').addEventListener('change', handleSelectAll);
        document.getElementById('bulkRemoveBtn').addEventListener('click', handleBulkRemove);
    }

    function handleSelectAll(e) {
        const isChecked = e.target.checked;
        selectedMembersForRemoval.clear();

        document.querySelectorAll('.member-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
            if (isChecked) {
                selectedMembersForRemoval.add(checkbox.dataset.memberId);
            }
        });

        updateBulkRemovalUI();
    }

    function updateBulkRemovalUI() {
        const count = selectedMembersForRemoval.size;
        const countElement = document.getElementById('selectedMembersCount');
        const removeBtn = document.getElementById('bulkRemoveBtn');
        const selectAllCheckbox = document.getElementById('selectAllMembers');

        if (countElement) {
            countElement.textContent = `${count} member${count !== 1 ? 's' : ''} selected`;
        }

        if (removeBtn) {
            removeBtn.disabled = count === 0;
        }

        // Show/hide bulk removal container
        if (bulkRemoveContainer) {
            bulkRemoveContainer.style.display = count > 0 ? 'flex' : 'none';
        }

        // Update select all checkbox state
        if (selectAllCheckbox) {
            const totalCheckboxes = document.querySelectorAll('.member-checkbox').length;
            selectAllCheckbox.checked = count === totalCheckboxes && count > 0;
            selectAllCheckbox.indeterminate = count > 0 && count < totalCheckboxes;
        }
    }

    function handleBulkRemove() {
        if (selectedMembersForRemoval.size === 0) return;

        const memberIds = Array.from(selectedMembersForRemoval);
        const confirmText = `Are you sure you want to remove ${memberIds.length} member${memberIds.length !== 1 ? 's' : ''} from this classroom?`;

        if (!confirm(confirmText)) return;

        // Show loading state
        const removeBtn = document.getElementById('bulkRemoveBtn');
        removeBtn.disabled = true;
        removeBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-1 inline animate-spin"></i>Removing...';
        lucide.createIcons();

        // Make API call for bulk removal
        ajaxWithToken({
            url: `http://localhost:8080/api/v1/edusphere/classroom/removeById/list?classroomId=${classroomId}`,
            method: "DELETE",
            contentType: "application/json",
            data: JSON.stringify(memberIds),
            success: function () {
                showMessage("success", `${memberIds.length} member${memberIds.length !== 1 ? 's' : ''} removed successfully!`);
                selectedMembersForRemoval.clear();
                loadDataPaginated(connectionState.page, connectionState.size);
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.message || "Failed to remove members.";
                showMessage("error", msg);

                // Reset button state
                removeBtn.disabled = false;
                removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4 mr-1 inline"></i>Remove Selected';
                lucide.createIcons();
            }
        });
    }

    function loadDataPaginated(page1 = 1, size = connectionState.size) {
        const zeroBasedPage = Math.max(0, page1 - 1);

        ajaxWithToken({
            url: `http://localhost:8080/api/v1/edusphere/classroom/get/${classroomId}/members?page=${zeroBasedPage}&size=${size}`,
            method: "GET",
            dataType: "json",
            success: function (response) {
                const data = response.data || [];

                const {
                    content = [],
                    number = 0,
                    size: respSize = size,
                    totalPages = 1,
                    totalElements = 0,
                } = data;

                connectionState.page = (number ?? 0) + 1;
                connectionState.size = respSize ?? size;
                connectionState.totalPages = totalPages ?? 1;
                connectionState.totalElements = totalElements ?? 0;
                connectionState.currentPageData = data;

                renderMembersTable(content);
                renderPaginationFooters("#connection-tab .pagination-container", connectionState);
            },
            error: function (xhr) {
                console.error("Error loading users:", xhr.responseJSON?.message || xhr.statusText);
                memberTableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center py-8 text-red-500">
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
        selectedMembersForRemoval.clear();

        // Create bulk removal UI if it doesn't exist
        if (!document.getElementById('bulkRemovalContainer') && userRole !== 'STUDENT') {
            createBulkRemovalUI();
        }

        if (members.length === 0) {
            memberTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-8 text-gray-500 dark:text-gray-400">
                        <i data-lucide="users" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                        <p>No members found</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        members.forEach((member, index) => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors';
            row.setAttribute('data-member-id', member.memberId);
            row.setAttribute('data-member-name', member.name);
            row.setAttribute('data-row-index', index);

            const profileContent = member.profileImg
                ? `<img src="http://localhost:8080/profiles/${member.profileImg}" class="w-10 h-10 rounded-full object-cover" alt="${member.name}" onerror="this.outerHTML='<div class=&quot;w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold&quot;>${getUserInitials(member.name)}</div>'"/>`
                : `<div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">${getUserInitials(member.name)}</div>`;

            // Add checkbox column for non-students
            const checkboxColumn = userRole !== 'STUDENT'
                ? `<td class="py-3 px-4">
                     <input type="checkbox" class="member-checkbox w-4 h-4" data-member-id="${member.memberId}">
                   </td>`
                : '';

            row.innerHTML = `
                ${checkboxColumn}
                <td class="py-3 px-4">${profileContent}</td>
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
                                data-member-id="${member.memberId}"
                                data-member-name="${member.name}">
                            <i data-lucide="message-circle-more" class="size-5"></i>
                        </button>
                        
                        ${userRole !== 'STUDENT' ? `
                            <div class="w-px h-6 bg-gray-300 mx-1"></div>
                            <button aria-label="Delete"
                                    class="remove-member p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all duration-200 hover:scale-105"
                                    data-member-id="${member.memberId}"
                                    data-member-name="${member.name}"
                                    data-row-index="${index}">
                                <i data-lucide="trash" class="size-5"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            memberTableBody.appendChild(row);
        });

        // Add checkbox event listeners
        document.querySelectorAll('.member-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const memberId = this.dataset.memberId;
                if (this.checked) {
                    selectedMembersForRemoval.add(memberId);
                } else {
                    selectedMembersForRemoval.delete(memberId);
                }
                updateBulkRemovalUI();
            });
        });

        // Add individual remove button listeners
        document.querySelectorAll('.remove-member').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                const memberId = this.getAttribute('data-member-id');
                const memberName = this.getAttribute('data-member-name');
                const rowIndex = parseInt(this.getAttribute('data-row-index'));
                const member = members[rowIndex];

                if (!member) {
                    showMessage("warning", "Could not identify member for deletion.");
                    return;
                }

                if (!confirm(`Are you sure you want to remove ${memberName} from this classroom?`)) {
                    return;
                }

                this.disabled = true;
                this.innerHTML = '<i data-lucide="loader-2" class="size-5 animate-spin"></i>';
                lucide.createIcons();

                ajaxWithToken({
                    url: `http://localhost:8080/api/v1/edusphere/classroom/remove/${classroomId}/${memberId}`,
                    method: "DELETE",
                    success: function () {
                        showMessage("success", "Member removed successfully!");
                        loadDataPaginated(connectionState.page, connectionState.size);
                    },
                    error: function (xhr) {
                        const msg = xhr.responseJSON?.message || "Failed to remove member.";
                        showMessage("error", msg);

                        button.disabled = false;
                        button.innerHTML = '<i data-lucide="trash" class="size-5"></i>';
                        lucide.createIcons();
                    }
                });
            });
        });

        // Add message button listeners
        document.querySelectorAll('.message-member').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const memberId = this.getAttribute('data-member-id');
                const memberName = this.getAttribute('data-member-name');
                console.log(`Send message to ${memberName} (ID: ${memberId})`);
            });
        });

        updateBulkRemovalUI();
        lucide.createIcons();
    }


    $("#member-table-tbody").on("click", ".message-member", function () {
        const receiverId = $(this).data("member-id");
        const currentUserId = localStorage.getItem("userId");

        // Call API to create conversation or get existing one
        ajaxWithToken({
            url: "http://localhost:8080/api/v1/edusphere/message/conversations",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                receiverId: receiverId,
                content: "👋 Hi, let’s start chatting!"
            }),
            success: function (res) {
                const conversationId = res.data.id;
                if (localStorage.getItem("role") === "STUDENT") {
                    window.location.href = `studentChat.html?conversationId=${conversationId}&receiverId=${receiverId}`;
                }
                window.location.href = `studentChat.html?conversationId=${conversationId}&receiverId=${receiverId}`;
            },
            error: function (xhr) {
                if (xhr.responseJSON?.message?.includes("Conversation already exists")) {
                    $.get("http://localhost:8080/api/v1/edusphere/message/conversations", function (res) {
                        const existingConv = res.data.find(c =>
                            c.senderId === receiverId || c.receiverId === receiverId
                        );
                        if (existingConv) {
                            window.location.href = `/studentChat.html?conversationId=${existingConv.id}&receiverId=${receiverId}`;
                        }
                    });
                }
            }
        });
    });


    lucide.createIcons();

    function showMessage(type, message) {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-lg transition-all duration-300 transform translate-x-full`;

        let bgClass, textClass, icon;
        switch(type) {
            case 'success':
                bgClass = 'bg-green-100 dark:bg-green-900/80 border border-green-400';
                textClass = 'text-green-700 dark:text-green-200';
                icon = 'check-circle';
                break;
            case 'error':
                bgClass = 'bg-red-100 dark:bg-red-900/80 border border-red-400';
                textClass = 'text-red-700 dark:text-red-200';
                icon = 'alert-circle';
                break;
            case 'warning':
                bgClass = 'bg-orange-100 dark:bg-orange-900/80 border border-orange-400';
                textClass = 'text-orange-700 dark:text-orange-200';
                icon = 'alert-triangle';
                break;
        }

        toast.className += ` ${bgClass} ${textClass}`;
        toast.innerHTML = `
        <div class="flex items-center">
            <i data-lucide="${icon}" class="w-5 h-5 mr-2"></i>
            <span>${message}</span>
            <button class="ml-4 hover:opacity-70" onclick="this.parentElement.parentElement.remove()">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;

        document.body.appendChild(toast);
        lucide.createIcons();

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }


    window.loadConnectionsPaginated = loadDataPaginated;
})();

window.connectionPagination = {
    loadDataPaginated: function(page, size) {
        if (typeof window.loadConnectionsPaginated === 'function') {
            window.loadConnectionsPaginated(page, size);
        }
    },
    state: window.connectionState
};

// Add this outside the IIFE
window.connectionPagination = {
    loadDataPaginated: function(page, size) {
        if (typeof window.loadConnectionsPaginated === 'function') {
            window.loadConnectionsPaginated(page, size);
        }
    },
    state: window.connectionState
};