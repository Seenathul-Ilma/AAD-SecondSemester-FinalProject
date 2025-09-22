/*
let assignment_quill;
let currentDate = new Date();
let selectedDate = null;

// Initialize modal features
document.addEventListener("DOMContentLoaded", () => {

    lucide.createIcons(); // Initialize icons

    loadDataPaginated(1, default_page_size);

    // Set user information
    document.getElementById("assignmentUserName").textContent = userName;
    document.getElementById("assignment_userInitials").textContent =
        getUserInitials(userName);
    console.log("Initials: " + userName);

    // Update class info if classroomId is available
    if (classroomId) {
        document.getElementById(
            "assignmentClassInfo"
        ).textContent = `Assigning to: Classroom ${classroomId}`;
    }

    lucide.createIcons();
    initializeQuill();
    initializeDatePicker();
    initializeTimePicker();
    setupFileHandlers();
});

function loadDataPaginated(page1 = 1, size = assignmentState.size) {
    const zeroBasedPage = Math.max(0, page1 - 1);

    console.log("Making AJAX request to:", `${api}${classroomId}/viceew/assignmenfvvvts?page=${zeroBasedPage}&size=${size}`);

    ajaxWithToken({
        url: `${api}${classroomId}/view/assignments?page=${zeroBasedPage}&size=${size}`,
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

            assignmentState.page = (number ?? 0) + 1; // convert 0-based -> 1-based
            assignmentState.size = respSize ?? size;
            assignmentState.totalPages = totalPages ?? 1;
            assignmentState.totalElements = totalElements ?? 0;

            assignmentState.currentPageData = data;

            // Correct
            renderAssignments(data.content);
            //renderPaginationFooter();
            //renderPaginationFooters();
            renderPaginationFooters("#assignment-tab .pagination-container", assignmentState);
        },
        error: function (xhr) {
            console.error("Error loading assignments:", xhr.responseJSON || xhr);
            if (xhr.status === 401) {
                //alert("Session expired. Please log in again.");
                showMessage("error", "Session expired. Please log in again.");
                window.location.href = "login.html";
            }
        },
    });
}


function renderAssignments(items) {
    const $div = $("#assignment-cards-container");
    $div.empty();

    if (!items || items.length === 0) {
        $div.html(`
      <div class="text-center py-12">
        <i data-lucide="megaphone" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"></i>
        <p class="text-gray-500 dark:text-gray-400 text-lg">No assignments yet.</p>
        <p class="text-gray-400 dark:text-gray-500 text-sm">Assign the first assignment to this classroom!</p>
      </div>
    `);
        return;
    }

    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");

    items.forEach((assignment) => {
        const actionButtons =
            assignment.assignedBy === userId || userRole === "ADMIN"
                ? `
          <div class="absolute top-4 right-4 dropdown">
            <button class="assignment-action-btn p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200">
              <i data-lucide="more-horizontal" class="w-5 h-5"></i>
            </button>
            <div class="dropdown-menu hidden absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
              <div class="menu-item flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200 rounded-t-lg" data-action="edit" data-id="${assignment.assignmentId}">
                <i data-lucide="edit-3" class="w-4 h-4 mr-2"></i>Edit
              </div>
              <div class="menu-item flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors duration-200 rounded-b-lg" data-action="delete" data-id="${assignment.assignmentId}">
                <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i>Delete
              </div>
            </div>
          </div>`
                : "";

        // Render file cards only if files exist
        let fileSection = "";
        if (assignment.fileUrls && assignment.fileUrls.length > 0) {
            const validFiles = assignment.fileUrls
                .map((url, idx) => {
                    const name = assignment.fileNames ? assignment.fileNames[idx] : url.split("/").pop();
                    const info = getFileInfo(name);
                    return info ? { url, name, info } : null;
                })
                .filter(f => f !== null); // Remove nulls (invalid files)

            if (validFiles.length > 0) {
                fileSection = `
          <div class="mt-2 mb-2 border-t border-gray-100 dark:border-gray-600 pt-4">
            <div class="flex items-center gap-2 mb-3">
              <i data-lucide="paperclip" class="w-4 h-4 text-gray-500"></i>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                ${validFiles.length} Attachment${validFiles.length > 1 ? 's' : ''}
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        `;

                validFiles.forEach(file => {
                    const originalName = file.name.split("\\").pop().split("_").slice(5).join("_");
                    fileSection += `
            <div class="file-card group relative bg-gradient-to-br ${file.info.gradient} rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden">
              <a href="${file.url}" target="_blank" class="block p-4">
                <div class="flex items-start gap-3">
                  <div class="file-icon-wrapper flex-shrink-0 w-12 h-12 ${file.info.bgColor} rounded-lg flex items-center justify-center shadow-sm">
                    <i data-lucide="${file.info.icon}" class="w-6 h-6 ${file.info.iconColor}"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-800 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      ${originalName}
                    </h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-semibold">
                      ${file.info.type}
                    </p>
                  </div>
                </div>
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div class="p-[6px] rounded-full text-slate-100 dark:hover:text-slate-800 hover:bg-slate-100 bg-slate-100 hover:text-slate-800 hover:text-slate-200 dark:bg-slate-800 transition-colors"
                  >
                    <i data-lucide="square-arrow-out-up-right" class="w-4 h-4 hover:scale-120 dark:hover:scale-none"></i>
                  </div>
                </div>
                <div class="absolute bottom-2 left-2">
                  <span class="inline-block px-2 py-1 bg-white/90 dark:bg-gray-800/90 text-xs font-medium ${file.info.textColor} rounded-full shadow-sm">
                    ${file.info.extension.toUpperCase()}
                  </span>
                </div>
              </a>
            </div>
          `;
                });

                fileSection += `</div></div>`;
            }
        }

        const card = `
      <div class="assignment-card bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative">
        ${actionButtons}
        <div class="p-5 pb-0">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
              ${getUserInitials(assignment.assignedUserName || assignment.assignedBy?.name)}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-800 dark:text-white">${assignment.assignedUserName}</h3>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <i data-lucide="clock" class="w-3 h-3"></i>
                    ${formatRelativeTime(assignment.createdAt || assignment.assignedDate)}
              </p>
            </div>
          </div>
          <div class="text-gray-700 dark:text-gray-300 assignment-content">
            <!-- p class="font-semibold text-lg mb-4 text-gray-800 dark:text-white leading-tight">${assignment.title}</p -->
            <div class="prose-sm prose mb-3 dark:prose-invert">
                ${assignment.content || assignment.description || ''}
            </div>
          </div>
          ${fileSection}
        </div>
        <div class="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-600">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <button class="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 show-comments" data-id="${assignment.assignmentId}">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
                <span>${assignment.comments?.length || 0} comments</span>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <i data-lucide="user" class="w-4 h-4 text-gray-500"></i>
            </div>
            <div class="flex-1 relative">
              <input type="text" placeholder="Write a comment..." 
                class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm" 
                data-assignment-id="${assignment.assignmentId}" />
            </div>
            <button class="comment-submit-btn px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:scale-105" data-assignment-id="${assignment.assignmentId}">
              <i data-lucide="send" class="w-4 h-4"></i>
              <span class="hidden sm:inline">Comment</span>
            </button>
          </div>
        </div>
      </div>
    `;

        $div.append(card);
    });

    // Refresh icons after dynamic render
    if (window.lucide?.createIcons) lucide.createIcons();
}



function initializeQuill() {
    assignment_quill = new Quill('#assignment-editor', {
        theme: 'snow',
        placeholder: 'Write your assignment content here...',
        modules: { toolbar: [['bold','italic','underline'], ['link','blockquote'], [{list:'ordered'}, {list:'bullet'}], ['clean']] }
    });
}

function openAssignmentModal() {
    document.getElementById("assignmentModal").classList.remove("hidden");
    document.getElementById("assignmentModal").classList.add("flex");
}

function closeAssignmentModal() {
    document.getElementById("assignmentModal").classList.add("hidden");
    document.getElementById("assignmentModal").classList.remove("flex");
}

// ---------------- Date Picker ----------------
function initializeDatePicker() {
    populateCalendar(currentDate);

    const dateInput = document.getElementById('dateInput');
    dateInput.addEventListener('click', () => document.getElementById('datePicker').classList.toggle('hidden'));

    document.addEventListener('click', e => {
        if (!document.getElementById('datePicker').contains(e.target) && e.target !== dateInput) {
            document.getElementById('datePicker').classList.add('hidden');
        }
    });

    document.getElementById('prevMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()-1); populateCalendar(currentDate); });
    document.getElementById('nextMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()+1); populateCalendar(currentDate); });
    document.getElementById('todayBtn').addEventListener('click', () => {
        const today = new Date();
        currentDate = new Date(today); selectedDate = new Date(today);
        populateCalendar(currentDate);
        updateDateInput(); document.getElementById('datePicker').classList.add('hidden'); updatePreview();
    });
}

function populateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    document.getElementById("currentMonth").textContent =
        date.toLocaleString("en-US", { month: "long", year: "numeric" });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    // Previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        calendarDays.appendChild(
            createDayElement(daysInPrevMonth - i, 'other-month', new Date(year, month - 1, daysInPrevMonth - i))
        );
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dayElement = createDayElement(day, '', dayDate);
        if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        calendarDays.appendChild(dayElement);
    }

    // Next month
    const totalCells = calendarDays.children.length;
    for (let day = 1; day <= 42 - totalCells; day++) {
        calendarDays.appendChild(
            createDayElement(day, 'other-month', new Date(year, month + 1, day))
        );
    }
}

function createDayElement(day, className, date) {
    const el = document.createElement('div');
    el.className = `date-picker-cell text-sm rounded-lg ${className} p-1 text-center cursor-pointer`;
    el.textContent = day;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight for comparison

    if (date < today && !className.includes('other-month')) {
        // Past dates → disabled
        el.classList.add('opacity-30', 'cursor-not-allowed');
    } else if (!className.includes('other-month')) {
        // Today or future dates → selectable
        el.classList.add('text-blue-600', 'hover:bg-blue-100', 'dark:text-blue-400', 'dark:hover:bg-blue-900/30');

        el.addEventListener('click', () => {
            selectedDate = new Date(date);
            populateCalendar(currentDate);
            updateDateInput();
            document.getElementById('datePicker').classList.add('hidden');
            updatePreview();
        });
    }

    return el;
}

function updateDateInput(){ if(selectedDate){ document.getElementById('dateInput').value = selectedDate.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}); } }

// ---------------- Time Picker ----------------
function initializeTimePicker(){
    const defaultTime = new Date(); defaultTime.setHours(defaultTime.getHours()+1,0,0,0);
    document.getElementById('timeSelect').value = `${defaultTime.getHours().toString().padStart(2,'0')}:${defaultTime.getMinutes().toString().padStart(2,'0')}`;
    document.getElementById('timeSelect').addEventListener('change',updatePreview);
}

// ---------------- Preview ----------------
function updatePreview(){
    if(!selectedDate) return;
    const timeValue = document.getElementById('timeSelect').value;
    if(!timeValue) return;
    const [hours, minutes] = timeValue.split(':'); const hour24=parseInt(hours); const hour12 = hour24===0?12:(hour24>12?hour24-12:hour24); const ampm=hour24<12?'AM':'PM';
    document.getElementById('previewDateTime').textContent = `${selectedDate.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} at ${hour12}:${minutes} ${ampm}`;
}

// ---------------- File Handling ----------------
function setupFileHandlers(){
    const fileInput = document.getElementById('assignmentFileInput');
    const fileSelectBtn = document.getElementById('assignmentFileSelectBtn');
    const fileCount = document.getElementById('assignmentFileCount');
    const filePreviews = document.getElementById('assignmentFilePreviews');

    fileSelectBtn.addEventListener('click', ()=>fileInput.click());
    fileInput.addEventListener('change', ()=>{
        const files = Array.from(fileInput.files);
        if(files.length>0){
            fileCount.textContent = `${files.length} file${files.length>1?'s':''} selected`; fileCount.classList.remove('hidden'); filePreviews.classList.remove('hidden');
            filePreviews.innerHTML='';
            files.forEach((file,index)=>{
                const preview = document.createElement('div'); preview.className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded';
                preview.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="file" class="w-4 h-4 text-gray-500"></i><span class="text-sm text-gray-700 dark:text-gray-300">${file.name}</span><span class="text-xs text-gray-500">(${(file.size/1024).toFixed(1)} KB)</span></div><button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700"><i data-lucide="x" class="w-4 h-4"></i></button>`;
                filePreviews.appendChild(preview);
            });
            lucide.createIcons();
        }else{ fileCount.classList.add('hidden'); filePreviews.classList.add('hidden'); }
    });
}

function removeFile(index){
    const fileInput=document.getElementById('assignmentFileInput'); const dt=new DataTransfer();
    Array.from(fileInput.files).forEach((file,i)=>{ if(i!==index) dt.items.add(file); });
    fileInput.files=dt.files; setupFileHandlers();
}
*/


(function() {
    // Wrap all your assignment code in this IIFE

    let assignment_quill;
    let currentDate = new Date();
    let selectedDate = null;

// Initialize the page
    document.addEventListener("DOMContentLoaded", function () {
        lucide.createIcons(); // Initialize icons

        initializeQuill();
        initializeDatePicker();
        initializeTimePicker();

        loadDataPaginated(1, default_page_size);

        // Set user information
        const userName = localStorage.getItem("userName");
        document.getElementById("assignmentUserName").textContent = userName;
        console.log("Initials: " + userName);

        // Update class info if classroomId is available
        if (classroomId) {
            document.getElementById(
                "assignmentClassInfo"
            ).textContent = `Assigning to: Classroom ${classroomId}`;
        }
    });

    let editingAssignmentId = null;

    function initializeQuill() {
        assignment_quill = new Quill('#assignment-editor', {
            theme: 'snow',
            placeholder: 'Write your assignment content here...',
            modules: { toolbar: [['bold','italic','underline'], ['link','blockquote'], [{list:'ordered'}, {list:'bullet'}], ['clean']] }
        });
    }


// ---------------- Date Picker ----------------
    function initializeDatePicker() {
        populateCalendar(currentDate);

        const dateInput = document.getElementById('dateInput');
        dateInput.addEventListener('click', () => document.getElementById('datePicker').classList.toggle('hidden'));

        document.addEventListener('click', e => {
            if (!document.getElementById('datePicker').contains(e.target) && e.target !== dateInput) {
                document.getElementById('datePicker').classList.add('hidden');
            }
        });

        document.getElementById('prevMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()-1); populateCalendar(currentDate); });
        document.getElementById('nextMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()+1); populateCalendar(currentDate); });
        document.getElementById('todayBtn').addEventListener('click', () => {
            const today = new Date();
            currentDate = new Date(today); selectedDate = new Date(today);
            populateCalendar(currentDate);
            updateDateInput(); document.getElementById('datePicker').classList.add('hidden'); updatePreview();
        });
    }

    function populateCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        document.getElementById("currentMonth").textContent =
            date.toLocaleString("en-US", { month: "long", year: "numeric" });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        // Previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            calendarDays.appendChild(
                createDayElement(daysInPrevMonth - i, 'other-month', new Date(year, month - 1, daysInPrevMonth - i))
            );
        }

        // Current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const dayElement = createDayElement(day, '', dayDate);
            if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }
            calendarDays.appendChild(dayElement);
        }

        // Next month
        const totalCells = calendarDays.children.length;
        for (let day = 1; day <= 42 - totalCells; day++) {
            calendarDays.appendChild(
                createDayElement(day, 'other-month', new Date(year, month + 1, day))
            );
        }
    }

    function createDayElement(day, className, date) {
        const el = document.createElement('div');
        el.className = `date-picker-cell text-sm rounded-lg ${className} p-1 text-center cursor-pointer`;
        el.textContent = day;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize to midnight for comparison

        if (date < today && !className.includes('other-month')) {
            // Past dates → disabled
            el.classList.add('opacity-30', 'cursor-not-allowed');
        } else if (!className.includes('other-month')) {
            // Today or future dates → selectable
            el.classList.add('text-blue-600', 'hover:bg-blue-100', 'dark:text-blue-400', 'dark:hover:bg-blue-900/30');

            el.addEventListener('click', () => {
                selectedDate = new Date(date);
                populateCalendar(currentDate);
                updateDateInput();
                document.getElementById('datePicker').classList.add('hidden');
                updatePreview();
            });
        }

        return el;
    }

    function updateDateInput(){ if(selectedDate){ document.getElementById('dateInput').value = selectedDate.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}); } }

// ---------------- Time Picker ----------------
    function initializeTimePicker(){
        const defaultTime = new Date(); defaultTime.setHours(defaultTime.getHours()+1,0,0,0);
        document.getElementById('timeSelect').value = `${defaultTime.getHours().toString().padStart(2,'0')}:${defaultTime.getMinutes().toString().padStart(2,'0')}`;
        document.getElementById('timeSelect').addEventListener('change',updatePreview);
    }

// ---------------- Preview ----------------
    function updatePreview(){
        if(!selectedDate) return;
        const timeValue = document.getElementById('timeSelect').value;
        if(!timeValue) return;
        const [hours, minutes] = timeValue.split(':'); const hour24=parseInt(hours); const hour12 = hour24===0?12:(hour24>12?hour24-12:hour24); const ampm=hour24<12?'AM':'PM';
        document.getElementById('previewDateTime').textContent = `${selectedDate.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} at ${hour12}:${minutes} ${ampm}`;
    }


// Modal elements
    const assignmentModal = document.getElementById("assignmentModal");
    const assignmentCreateBtn = document.getElementById("createAssignmentBtn");
    const assignmentCloseBtn = document.getElementById("closeAssignmentBtn");
    const assignmentCancelBtn = document.getElementById("cancelAssignmentBtn");
    const assignmentPostBtn = document.getElementById("postAssignmentBtn");
    const assignmentFileInput = document.getElementById("assignmentFileInput");
    const assignmentFileSelectBtn = document.getElementById("assignmentFileSelectBtn");
    const assignmentFileCount = document.getElementById("assignmentFileCount");
    const assignmentFilePreviews = document.getElementById("assignmentFilePreviews");
    //const titleInput = document.getElementById("assignmentTitleInput");
    let selectedAssignmentFiles = [];

    let existingAssignmentFiles = []; // New array to store files already attached to the assignment
    let removedAssignmentFileIds = []; // New array to store IDs of files to be removed

// Open modal
    if (assignmentCreateBtn) {
        assignmentCreateBtn.addEventListener("click", () => {
            assignmentModal.classList.remove("hidden");
            assignmentModal.classList.add("flex");

            document.getElementById("assignmentModalTitle").textContent =
                "Create New Assignment";

            assignmentPostBtn.textContent = "Post Assignment";
        });
    }

// Close modal
    assignmentCancelBtn.addEventListener("click", () => {
        assignmentCloseModal();
    });

    assignmentCloseBtn.addEventListener("click", () => {
        assignmentCloseModal()
    });

// File selection handling
    assignmentFileSelectBtn.addEventListener("click", () => {
        assignmentFileInput.click();
    });

    assignmentFileInput.addEventListener("change", (e) => {
        selectedAssignmentFiles = Array.from(e.target.files);
        updateFilePreviews();
    });

// Post assignment
// ===== MODIFIED POST LOGIC TO HANDLE FILE REMOVAL =====
    assignmentPostBtn.addEventListener("click", () => {
        const description = assignment_quill.root.innerHTML.trim();

        if (!description || description === "<p><br></p>") {
            showMessage("warning", "Please write something before assigning.");
            return;
        }

        if (!selectedDate) {
            showMessage("warning", "Please select a due date.");
            return;
        }

        const timeValue = document.getElementById("timeSelect").value;
        if (!timeValue) {
            showMessage("warning", "Please select a due time.");
            return;
        }

        const [hours, minutes] = timeValue.split(":");
        selectedDate.setHours(hours, minutes, 0, 0);

        if (selectedDate < new Date()) {
            showMessage("warning", "Due date & time cannot be in the past.");
            return;
        }

        const assignmentData = new FormData();
        assignmentData.append("description", description);
        //assignmentData.append("title", title);

        // FIX: Send local time instead of UTC
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const hour = String(selectedDate.getHours()).padStart(2, '0');
        const minute = String(selectedDate.getMinutes()).padStart(2, '0');
        const second = String(selectedDate.getSeconds()).padStart(2, '0');

        const localDateTimeString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
        assignmentData.append("dueDate", localDateTimeString);
        //assignmentData.append("dueDate", selectedDate.toISOString());

        // Handle file logic based on edit mode
        if (editingAssignmentId) {
            // EDIT MODE: Handle file updates

            // Keep remaining existing files (those not removed by user)
            const remainingExistingAssignmentFiles = existingAssignmentFiles.filter(f => !removedAssignmentFileIds.includes(f.fileId));

            // Append remaining existing files (send their identifiers to backend)
            remainingExistingAssignmentFiles.forEach(file => {
                assignmentData.append("existingAssignmentFiles", file.fileId); // send URLs or IDs
            });

            // Append newly selected files
            selectedAssignmentFiles.forEach(file => assignmentData.append("files", file));

            console.log("=== EDIT MODE: File update ===");
            console.log("Removed files:", removedAssignmentFileIds);
            console.log("Remaining existing files:", remainingExistingAssignmentFiles);
            console.log("New files to upload:", selectedAssignmentFiles.length);
        } else {
            // CREATE MODE: Just add the selected files
            selectedAssignmentFiles.forEach(file => assignmentData.append("files", file));
        }


        // Debug logging
        console.log("=== DEBUG UPDATE REQUEST ===");
        console.log("editingAssignmentId:", editingAssignmentId);
        console.log("selectedAssignmentFiles:", selectedAssignmentFiles);
        console.log("removedAssignmentFileIds:", removedAssignmentFileIds);
        console.log("existingAssignmentFiles:", existingAssignmentFiles);

        console.log("=== FormData Debug ===");
        console.log("Edit mode:", !!editingAssignmentId);
        console.log("Selected date:", selectedDate);
        console.log("Date string:", selectedDate.toISOString());

        for (let [key, value] of assignmentData.entries()) {
            console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
        }

        // Log FormData contents
        /*for (let [key, value] of assignmentData.entries()) {
            console.log(key, value);
        }*/

        if (editingAssignmentId) {
            updateAssignment(editingAssignmentId, assignmentData);
        } else {
            createAssignment(assignmentData);
        }
    });

    // click menu item
    $("#assignment-cards-container").on("click", ".menu-item", function(e) {
        e.stopPropagation();
        const action = $(this).data("action");
        const assignmentId = $(this).data("id");

        if (action === "edit") {
            const assignment = assignmentState.currentPageData.content.find(a => a.assignmentId === assignmentId);

            if (assignment) {
                // Reset file-related variables for a clean edit session
                selectedAssignmentFiles = []; // Clear any files from a previous session
                removedAssignmentFileIds = []; // Clear removed files list
                editingAssignmentId = assignmentId;

                // ===== FIXED: Properly reconstruct existingFiles from assignment data =====
                existingAssignmentFiles = [];

                console.log("Assignment object:", assignment);
                console.log("File URLs:", assignment.fileUrls);

                if (assignment.fileUrls && assignment.fileUrls.length > 0) {
                    assignment.fileUrls.forEach((url, index) => {
                        const fullFileName = url.split("/").pop();
                        const parts = fullFileName.split("_");
                        let displayName = fullFileName; // fallback

                        // Update: Account for the assignmentCategory in the filename
                        if (parts.length >= 7) { // Changed from 6 to 7
                            // Skip: classroomId_userId_assignmentId_timestamp_counter_assignmentCategory
                            // Take: everything from index 6 onwards (the original name)
                            const originalNameParts = parts.slice(6); // Changed from 5 to 6
                            displayName = originalNameParts.join("_");

                            // Clean up the display name
                            displayName = displayName.replace(/_/g, " ");
                            displayName = displayName.replace(/\b\w/g, l => l.toUpperCase());
                        }

                        existingAssignmentFiles.push({
                            fileId: url,
                            fileName: displayName,
                            fileSize: "",
                            fileUrl: url
                        });
                    });
                }
                // ===== END FIX =====

                // Populate title and content
                //titleInput.value = assignment.title;
                assignment_quill.root.innerHTML = assignment.description;

                // ---------------- Fill due date & time ----------------
                if (assignment.dueDate) {
                    const due = new Date(assignment.dueDate);

                    // Update global selectedDate for date picker
                    selectedDate = new Date(due);
                    updateDateInput(); // updates date input field

                    // Fill time input
                    const hours = due.getHours().toString().padStart(2, "0");
                    const minutes = due.getMinutes().toString().padStart(2, "0");
                    document.getElementById("timeSelect").value = `${hours}:${minutes}`;

                    // Refresh preview
                    updatePreview();
                }

                // Update modal UI
                document.getElementById("assignmentModalTitle").textContent = "Edit Assignment";
                assignmentPostBtn.textContent = "Update Assignment";

                // Update the file previews to show existing files
                updateFilePreviews();

                // Open modal
                assignmentModal.classList.remove("hidden");
                assignmentModal.classList.add("flex");
            }
        } else if (action === "delete") {
            if (!confirm("Are you sure you want to delete this assignment?")) return;

            deleteAssignment(assignmentId);
        }
    });

    // delete function
    function deleteAssignment(assignmentId) {
        ajaxWithToken({
            url: `${api}delete/assignments/${assignmentId}?deletingUserId=${userId}`,
            method: "DELETE",
            success: function (response) {
                if (response.status === 200 && response.data === true) {
                    showMessage(
                        "success",
                        response.message || "Assignment deleted successfully!"
                    );
                    loadDataPaginated(assignmentState.page, assignmentState.size);
                } else {
                    //alert("Failed to delete comment: " + (response.message || "Unknown error"));
                    showMessage(
                        "error",
                        "Failed to delete assignment: " + (response.message || "Unknown error")
                    );
                }
            },
            error: function (xhr) {
                console.error(
                    "Delete assignment error:",
                    xhr.responseJSON || xhr.responseText || xhr
                );
                //alert("An error occurred while deleting the comment.");
                showMessage("error", "An error occurred while deleting the assignment.");
            },

        })
    }

    // update function
    function updateAssignment(assignmentId, assignmentData) {
        ajaxWithToken({
            url: `${api}${userId}/assignments/${assignmentId}/update`,
            method: "PUT",
            data: assignmentData,
            processData: false,
            contentType: false,
            success: function (response, textStatus, xhr) {
                // check HTTP status or backend payload
                if (xhr.status === 201 || response.status === 201 || response.data === true) {
                    showMessage("success", "Assignment updated successfully!");
                    assignmentCloseModal();
                    loadDataPaginated(assignmentState.page, assignmentState.size);
                    editingAssignmentId = null;
                } else {
                    showMessage("error", response.message || "Failed to update assignment.");
                }
            },
            error: function (xhr) {
                showMessage("error", xhr.responseJSON?.message || "Failed to update assignment.");
            }
        });
    }

    function createAssignment(assignmentData){
        ajaxWithToken({
            url: `${api}${classroomId}/assignments/${userId}/assign`,
            method: "POST",
            data: assignmentData,
            processData: false, // important for FormData
            contentType: false, // important for FormData
            success: function (data) {
                if (data.status === 201) {
                    //alert("Assignment created successfully!");
                    showMessage("success", "Assignment created successfully!");
                    assignmentCloseModal();
                    loadDataPaginated(assignmentState.page, assignmentState.size);
                } else {
                    //alert(data.message || "Failed to create assignment.");
                    showMessage("error", data.message || "Failed to create assignment.");
                }
            },
        });
    }

// Close modal when clicking outside
    assignmentModal.addEventListener("click", (e) => {
        if (e.target === assignmentModal) {
            assignmentCloseModal();
        }
    });

// Helper functions
    function assignmentCloseModal() {
        assignmentModal.classList.add("hidden");
        assignmentModal.classList.remove("flex");
        assignment_quill.setText("");
        //titleInput.value = "";
        selectedAssignmentFiles = [];
        existingAssignmentFiles = []; // Reset existing files
        removedAssignmentFileIds = []; // Reset removed file IDs
        editingAssignmentId = null; // Reset the editing state

        updateFilePreviews(); // This will now clear the previews completely

        document.getElementById("assignmentModalTitle").textContent = "Create New Assignment";
        assignmentPostBtn.textContent = "Post Assignment";
    }

// ===== FIXED FILE PREVIEW REMOVAL LOGIC =====
    function updateFilePreviews() {
        // Clear previous previews
        assignmentFilePreviews.innerHTML = "";

        // Combine existing and newly selected files for display
        //const filesToDisplay = [...existingFiles, ...selectedFiles];
        const filesToDisplay = [...existingAssignmentFiles, ...selectedAssignmentFiles]
            .filter(f => f && ((f.fileId && f.fileName.trim() !== "") || f.name)); // only valid files

        console.log("isFilesExist: "+ filesToDisplay.length);

        if (filesToDisplay.length > 0) {
            assignmentFileCount.textContent = `${filesToDisplay.length} file(s) selected`;
            assignmentFileCount.classList.remove("hidden");
            assignmentFilePreviews.classList.remove("hidden");

            filesToDisplay.forEach((file, displayIndex) => {
                const isExistingFile = file.hasOwnProperty('fileId'); // Existing files have fileId
                console.log("fileId: "+ isExistingFile);
                const fileName = isExistingFile ? file.fileName : file.name;
                const fileSize = isExistingFile ? file.fileSize : file.size;

                // Determine file icon
                let icon = "file";
                if (fileName.includes(".pdf")) icon = "file-text";
                else if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) icon = "image";
                else if (fileName.match(/\.(zip|rar|7z)$/i)) icon = "archive";

                // Create preview element
                const preview = document.createElement("div");
                preview.className =
                    "file-preview flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg";

                preview.innerHTML = `
        <div class="flex items-center gap-2">
            <i data-lucide="${icon}" class="w-4 h-4 text-gray-500"></i>
            <span class="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">${fileName}</span>
            <span class="text-xs text-gray-500">  
            ${fileSize ? "(" + (formatFileSize(fileSize)) +")" : " "}
</span>
</div>
        <button type="button" class="text-red-500 hover:text-red-700 remove-file-btn" data-index="${displayIndex}" data-is-existing="${isExistingFile}">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      `;

                assignmentFilePreviews.appendChild(preview);
            });

            // Remove button logic
            document.querySelectorAll("#assignmentFilePreviews .remove-file-btn").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const displayIndex = parseInt(e.currentTarget.getAttribute("data-index"));
                    const isExisting = e.currentTarget.getAttribute("data-is-existing") === "true";
                    const file = filesToDisplay[displayIndex];

                    if (isExisting) {
                        // Track removal
                        removedAssignmentFileIds.push(file.fileId);

                        // Remove from existingFiles array
                        existingAssignmentFiles = existingAssignmentFiles.filter(f => f.fileId !== file.fileId);
                    } else {
                        // Remove from selectedFiles array
                        selectedAssignmentFiles = selectedAssignmentFiles.filter(f => f !== file);
                    }

                    updateFilePreviews(); // Re-render previews
                });
            });

            // Update icons
            lucide.createIcons();
        } else {
            assignmentFileCount.classList.add("hidden");
            assignmentFilePreviews.classList.add("hidden");
        }
    }

    // render assignment function
    function renderAssignments(items) {
        const $div = $("#assignment-cards-container");
        $div.empty();

        if (!items || items.length === 0) {
            $div.html(`
      <div class="text-center py-12">
        <i data-lucide="megaphone" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"></i>
        <p class="text-gray-500 dark:text-gray-400 text-lg">No assignments yet.</p>
        <p class="text-gray-400 dark:text-gray-500 text-sm">Create your first assignment to get started!</p>
      </div>
    `);
            return;
        }

        const userId = localStorage.getItem("userId");
        const userRole = localStorage.getItem("role");

        items.forEach((assignment) => {
            const actionButtons =
                assignment.assignedBy === userId || userRole === "ADMIN"
                    ? `
          <div class="absolute top-4 right-4 dropdown">
            <button class="assignment-action-btn p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200">
              <i data-lucide="more-horizontal" class="w-5 h-5"></i>
            </button>
            <div class="dropdown-menu hidden absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
              <div class="menu-item flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200 rounded-t-lg" data-action="edit" data-id="${assignment.assignmentId}">
                <i data-lucide="edit-3" class="w-4 h-4 mr-2"></i>Edit
              </div>
              <div class="menu-item flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors duration-200 rounded-b-lg" data-action="delete" data-id="${assignment.assignmentId}">
                <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i>Delete
              </div>
            </div>
          </div>`
                    : "";

            const submissionButton = userRole === "STUDENT" ? `
            <div class="submissionOpenModal absolute top-2 right-2 p-2 rounded-full text-slate-600/100 dark:text-slate-800 bg-slate-100 hover:bg-slate-100 hover:text-slate-800 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer" data-assignment-id="${assignment.assignmentId}">
                <i data-lucide="square-arrow-out-up-right" class="w-4 h-4 hover:scale-120 dark:hover:scale-none"></i>
            </div>
        ` : "";

            // Determine status
            let statusBadge = "";
            if (assignment.dueDate) {
                const now = new Date();
                const due = new Date(assignment.dueDate);
                const submittedAt = assignment.submittedAt ? new Date(assignment.submittedAt) : null;

                if (submittedAt) {
                    if (submittedAt <= due) {
                        statusBadge = `<span class="assignment-status-badge bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                <i data-lucide="check-circle" class="w-3 h-3 mr-1"></i> Submitted
                            </span>`;
                    } else {
                        statusBadge = `<span class="assignment-status-badge bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
                                <i data-lucide="clock" class="w-3 h-3 mr-1"></i> Submitted Late
                            </span>`;
                    }
                } else {
                    if (due < now) {
                        statusBadge = `<span class="assignment-status-badge bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                                <i data-lucide="alert-circle" class="w-3 h-3 mr-1"></i> Expired
                            </span>`;
                    } else {
                        const isSameDay = due.toDateString() === now.toDateString();
                        if (isSameDay) {
                            const timeStr = due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            statusBadge = `<span class="assignment-status-badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
                                    <i data-lucide="alert-triangle" class="w-3 h-3 mr-1"></i> Due Today @ ${timeStr}
                                </span>`;
                        } else {
                            const dateStr = due.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
                            const timeStr = due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            statusBadge = `<span class="assignment-status-badge bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                                    <i data-lucide="calendar" class="w-3 h-3 mr-1"></i> Due ${dateStr} @ ${timeStr}
                                </span>`;
                        }
                    }
                }
            }


            // Render file cards only if files exist
            let fileSection = "";
            if (assignment.fileUrls && assignment.fileUrls.length > 0) {
                const validFiles = assignment.fileUrls
                    .map((url, idx) => {
                        const name = assignment.fileNames ? assignment.fileNames[idx] : url.split("/").pop();
                        const info = getFileInfo(name);
                        return info ? { url, name, info } : null;
                    })
                    .filter(f => f !== null); // Remove nulls (invalid files)

                if (validFiles.length > 0) {
                    fileSection = `
          <div class="mt-2 mb-2 border-t border-gray-100 dark:border-gray-600 pt-4">
            <div class="flex items-center gap-2 mb-3">
              <i data-lucide="paperclip" class="w-4 h-4 text-gray-500"></i>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                ${validFiles.length} Attachment${validFiles.length > 1 ? 's' : ''}
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        `;

                    validFiles.forEach(file => {
                        const originalName = file.name.split("\\").pop().split("_").slice(5).join("_");
                        fileSection += `
            <div class="file-card group relative bg-gradient-to-br ${file.info.gradient} rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden">
              <a href="${file.url}" target="_blank" class="block p-4">
                <div class="flex items-start gap-3">
                  <div class="file-icon-wrapper flex-shrink-0 w-12 h-12 ${file.info.bgColor} rounded-lg flex items-center justify-center shadow-sm">
                    <i data-lucide="${file.info.icon}" class="w-6 h-6 ${file.info.iconColor}"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-800 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      ${originalName}
                    </h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-semibold">
                      ${file.info.type}
                    </p>
                  </div>
                </div>
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div class="p-[6px] rounded-full text-slate-100 dark:hover:text-slate-800 hover:bg-slate-100 bg-slate-100 hover:text-slate-800 hover:text-slate-200 dark:bg-slate-800 transition-colors"
                  >
                    <i data-lucide="square-arrow-out-up-right" class="w-4 h-4 hover:scale-120 dark:hover:scale-none"></i>
                  </div>
                </div>
                <div class="absolute bottom-2 left-2">
                  <span class="inline-block px-2 py-1 bg-white/90 dark:bg-gray-800/90 text-xs font-medium ${file.info.textColor} rounded-full shadow-sm">
                    ${file.info.extension.toUpperCase()}
                  </span>
                </div>
              </a>
            </div>
          `;
                    });

                    fileSection += `</div></div>`;
                }
            }

            const card = `
      <div class="assignment-card bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative">
        ${actionButtons}
        ${submissionButton}
        <div class="p-5 pb-0">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
              ${getUserInitials(assignment.assignedUserName || assignment.assignedBy?.name)}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-800 dark:text-white">${assignment.assignedUserName}</h3>
                ${statusBadge}
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <i data-lucide="clock" class="w-3 h-3"></i>
                ${formatRelativeTime(assignment.assignedDate)}
              </p>
            </div>
          </div>
          <div class="text-gray-700 dark:text-gray-300 mb-2 assignment-content">
            <!-- p class="font-semibold text-lg mb-4 text-gray-800 dark:text-white leading-tight">${assignment.title}</p -->
            <div class="assignment-content ql-editor">
                ${assignment.description}
            </div>
          </div>
          ${fileSection}
        </div>
        <div class="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-600">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <button class="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 show-comments" data-id="${assignment.assignmentId}">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
                <span>${assignment.comments?.length || 0} comments</span>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <i data-lucide="user" class="w-4 h-4 text-gray-500"></i>
            </div>
            <div class="flex-1 relative">
              <input type="text" placeholder="Write a comment..." 
                class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm" 
                data-assignment-id="${assignment.assignmentId}" />
            </div>
            <button class="comment-submit-btn px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:scale-105" data-assignment-id="${assignment.assignmentId}">
              <i data-lucide="send" class="w-4 h-4"></i>
              <span class="hidden sm:inline">Comment</span>
            </button>
          </div>
        </div>
      </div>
    `;

            $div.append(card);
        });

        // Refresh icons after dynamic render
        if (window.lucide?.createIcons) lucide.createIcons();
    }


    $(document).on('click', '.submissionOpenModal', function() {
        const assignmentId = $(this).data('assignment-id');
        console.log("Clicked submission Open modal button for assignment:", assignmentId);

        ajaxWithToken({
            url: `http://localhost:8080/api/v1/edusphere/assignments/submissions/${assignmentId}/${userId}/submission`,
            method: "GET",
            success: function(response) {
                console.log("Submission fetch success:", response);

                // If data exists → edit mode, else → create mode
                if (response.data) {
                    openSubmissionModal(assignmentId, response.data);
                } else {
                    openSubmissionModal(assignmentId); // create mode
                }
            },
            error: function(xhr) {
                console.error("Error fetching submission:", xhr);
                showMessage("error", "Failed to check submission status.");
                // fallback to create mode if needed
                openSubmissionModal(assignmentId);
            }
        });
    });

    // Handle submission modal opening
    $(document).on('click', '.submissionOpenModal', function() {
        const assignmentId = $(this).data('assignment-id');

        ajaxWithToken({
            url: `${submissionApi}${assignmentId}/${userId}/submission`,
            method: "GET",
            success: function (response) {
                if (response.status === 200 && response.data) {
                    // Edit mode: User has already submitted
                    openSubmissionModal(assignmentId, response.data);
                } else if (response.status === 400) {
                    // Create mode: No submission exists
                    openSubmissionModal(assignmentId);
                } else {
                    // Default to create mode
                    openSubmissionModal(assignmentId);
                }
            },
            error: function (xhr) {
                if (xhr.status === 400) {
                    // No submission yet - create mode
                    openSubmissionModal(assignmentId);
                } else {
                    showMessage("error", "Failed to check submission status.");
                    // Still open modal in create mode as fallback
                    openSubmissionModal(assignmentId);
                }
            }
        });
    });


// Toggle dropdown visibility
    $("#assignment-cards-container").on("click", ".assignment-action-btn", function (e) {
        e.stopPropagation(); // prevent click from bubbling up
        const $menu = $(this).siblings(".dropdown-menu");
        $(".dropdown-menu").not($menu).addClass("hidden");
        $menu.toggleClass("hidden");
    });

// Close dropdown if clicked outside
    $(document).on("click", () => {
        $(".dropdown-menu").addClass("hidden");
    });

    // load paginated assignments
    function loadDataPaginated(page1 = 1, size = assignmentState.size) {
        const zeroBasedPage = Math.max(0, page1 - 1);

        ajaxWithToken({
            url: `${api}${classroomId}/view/assignments?page=${zeroBasedPage}&size=${size}`,
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

                assignmentState.page = (number ?? 0) + 1; // convert 0-based -> 1-based
                assignmentState.size = respSize ?? size;
                assignmentState.totalPages = totalPages ?? 1;
                assignmentState.totalElements = totalElements ?? 0;

                assignmentState.currentPageData = data;

                // Correct
                renderAssignments(data.content);
                //renderPaginationFooter();
                //renderPaginationFooters();
                //renderPaginationFooters("#assignment-tab .pagination-container", assignmentState);
                renderPaginationFooters("#activity-tab .pagination-container", assignmentState, 'assignments');
            },
            error: function (xhr) {
                console.error("Error loading assignments:", xhr.responseJSON || xhr);
                if (xhr.status === 401) {
                    //alert("Session expired. Please log in again.");
                    showMessage("error", "Session expired. Please log in again.");
                    window.location.href = "login.html";
                }
            },
        });
    }

// Open comments modal when clicking the comment icon
    $("#assignment-cards-container").on("click", ".show-comments", function () {
        const assignmentId = $(this).data("id");
        loadComments(assignmentId);
    });

    // comment load function
    function loadComments(assignmentId) {
        console.log("assignmentId:", assignmentId);
        ajaxWithToken({
            url: `${api}assignments/comments/assignment/${assignmentId}`,
            method: "GET",
            success: function (response) {
                const comments = response; // because backend returns a raw array

                renderAssignmentComments(comments);
                $("#commentModal").removeClass("hidden").addClass("flex");
            },
            error: function (xhr) {
                console.error("Failed to load comments", xhr.responseJSON || xhr);
                //alert("Failed to load comments.");
                showMessage("error", "Failed to load comments.");
            },
        });
    }

    // comment render function
    function renderAssignmentComments(comments) {
        const $list = $("#commentsList");
        $list.empty();

        if (!comments || comments.length === 0) {
            $list.html(
                `<p class="text-gray-500 dark:text-gray-400">No comments yet.</p>`
            );
            return;
        }

        const userId = localStorage.getItem("userId"); // logged-in user

        comments.forEach((c) => {
            // Show edit/delete only if logged-in user is the commenter
            const actionDropdown =
                c.commenterId === userId
                    ? `
            <div class="absolute top-2 right-2 assign-comment-dropdown">
                <button class="assign-comment-action-btn p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <i data-lucide="more-horizontal" class="w-4 h-4 mr-1"></i>
                </button>
                <div class="assign-comment-dropdown-menu hidden absolute right-0 mt-1 w-24 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                    <div class="menu-item flex items-center px-3 py-1 cursor-pointer bg-red-100/90 dark:bg-red-900/80 backdrop-blur-xl border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 assign-comment-delete-btn" data-id="${c.commentId}">
                        <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i>
                        Delete
                    </div>
                </div>
            </div>
        `
                    : "";

            $list.append(`
            <div class="relative p-3 border rounded-lg dark:border-gray-600 mb-2">
                <p class="font-semibold text-gray-800 dark:text-white">${
                c.commenterName || "Unknown"
            }</p>
                <p class="text-gray-700 dark:text-gray-300 comment-content">${
                c.content
            }</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${formatRelativeTime(
                c.createdAt
            )}</p>
                ${actionDropdown}
            </div>
        `);
        });

        // Refresh Lucide icons after rendering
        if (window.lucide?.createIcons) lucide.createIcons();
    }

    $("#closeCommentModal").on("click", function () {
        $("#commentModal").addClass("hidden").removeClass("flex");
    });

    $(document).on("click", function (e) {
        if ($(e.target).is("#commentModal")) {
            $("#commentModal").addClass("hidden").removeClass("flex");
        }
    });

// Listen for comment submissions
    $("#assignment-cards-container").on(
        "click",
        ".comment-submit-btn",
        function () {
            const assignmentId = $(this).data("assignment-id");
            const inputField = $(`input[data-assignment-id='${assignmentId}']`);
            const content = inputField.val().trim();
            const userId = localStorage.getItem("userId");

            if (!content) {
                //alert("Please write something before commenting.");
                showMessage("warning", "Please write something before commenting.");
                return;
            }

            // Prepare payload
            const payload = {
                content: content,
            };

            // Make AJAX request to create comment
            ajaxWithToken({
                url: `${api}assignments/comments/assignment/${assignmentId}/user/${userId}/add`,
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (response) {
                    //alert("Comment added successfully!");
                    showMessage("success", "Comment added successfully!");
                    inputField.val(""); // Clear input
                    loadDataPaginated(assignmentState.page, assignmentState.size); // Reload assignments to refresh comments
                },
                error: function (xhr) {
                    console.error("Failed to create comment", xhr.responseJSON || xhr);
                    //alert("Failed to create comment.");
                    showMessage("error", "Failed to create comment.");
                },
            });
        }
    );

    // After renderComments
    $(document).on("click", ".assign-comment-action-btn", function (e) {
        e.stopPropagation(); // stop bubbling
        const $dropdown = $(this).closest(".assign-comment-dropdown"); // get parent .dropdown
        const $menu = $dropdown.find(".assign-comment-dropdown-menu"); // get its menu
        $(".assign-comment-dropdown-menu").not($menu).addClass("hidden"); // hide others
        $menu.toggleClass("hidden"); // toggle this one
    });

    // Optional: click outside to close
    $(document).on("click", function () {
        $(".assign-comment-dropdown-menu").addClass("hidden");
    });

    // Delete comment using AJAX with token
    $(document).on("click", ".assign-comment-delete-btn", function () {
        const commentId = $(this).data("id");
        const userId = localStorage.getItem("userId");

        console.log("Deleting commentId:", commentId, "userId:", userId);

        if (!commentId) return;

        if (!confirm("Are you sure you want to delete this comment?")) return;

        ajaxWithToken({
            url: `${api}assignments/comments/delete/${commentId}?userId=${userId}`,
            method: "DELETE",
            success: function (response) {
                if (response.status === 200 && response.data === true) {
                    // Remove the entire comment block
                    $(`.assign-comment-delete-btn[data-id="${commentId}"]`)
                        .closest(".relative")
                        .remove();
                    //alert(response.message || "Comment deleted successfully!");
                    showMessage(
                        "success",
                        response.message || "Comment deleted successfully!"
                    );
                    loadDataPaginated(assignmentState.page, assignmentState.size);
                } else {
                    //alert("Failed to delete comment: " + (response.message || "Unknown error"));
                    showMessage(
                        "error",
                        "Failed to delete comment: " + (response.message || "Unknown error")
                    );
                }
            },
            error: function (xhr) {
                console.error(
                    "Delete comment error:",
                    xhr.responseJSON || xhr.responseText || xhr
                );
                //alert("An error occurred while deleting the comment.");
                showMessage("error", "An error occurred while deleting the comment.");
            },
        });
    });

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
    // At the end of your assignment IIFE:
    window.loadAssignmentsPaginated = loadDataPaginated;
})();

// Add this outside the IIFE
window.assignmentPagination = {
    loadDataPaginated: function(page, size) {
        if (typeof window.loadAssignmentsPaginated === 'function') {
            window.loadAssignmentsPaginated(page, size);
        }
    },
    state: window.assignmentState
};