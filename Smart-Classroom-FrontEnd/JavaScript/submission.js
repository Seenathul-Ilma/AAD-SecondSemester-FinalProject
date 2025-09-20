/*

const classroomApi = "http://localhost:8080/api/v1/edusphere/classroom/";
const assignmentApi = "http://localhost:8080/api/v1/edusphere/classrooms/";
const default_page_size = 15;
const max_visible_pages = 7;

document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons();

    loadDataPaginated(1, default_page_size);
});

function loadDataPaginated(page1 = 1, size = state.size) {
    const zeroBasedPage = Math.max(0, page1 - 1);

    const paginatingId = localStorage.getItem("userId");
    const paginatingRole = localStorage.getItem("role");

    console.log("#######################################################")

    ajaxWithToken({
        //url: `${api}all/paginated?page=${zeroBasedPage}&size=${size}`,
        //url: `http://localhost:8080/api/v1/edusphere/classroom/paginated?page=${zeroBasedPage}&size=${size}&userId=${paginatingId}&role=${paginatingRole}`,
        url: `${classroomApi}paginated?page=${zeroBasedPage}&size=${size}&userId=${paginatingId}&role=${paginatingRole}`,
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

            console.log(content.length)
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

            renderClassroomCards(content);
            renderPaginationFooter();
        },
        error: function(xhr) {
            //console.error("Error loading students:", xhr.responseJSON || xhr);
            showMessage("error", "Error loading classroom: " + (xhr.responseJSON?.message || xhr.statusText || "Unknown error"));
            if(xhr.status === 401) {
                showMessage("error", "Session expired or unauthorized. Please log in again.");
                window.location.href = "login.html";
            }
        }
    });

}


function renderClassroomCards(classrooms) {
    const container = $("#submissions-container");
    container.empty();

    classrooms.forEach((classroom) => {
        // Use real classroomId in DOM but prefix to ensure valid HTML ID
        const classroomDomId = `classroom-${classroom.classroomId}`;
        console.log("ClassroomId: "+classroomDomId)

        const assignmentsHTML = (classroom.assignments || []).map((a) => {
            // --- Status Badge Logic ---
            let statusBadge = "";
            if (a.dueDate) {
                const now = new Date();
                const due = new Date(a.dueDate);
                const submittedAt = a.submittedAt ? new Date(a.submittedAt) : null;

                if (submittedAt) {
                    statusBadge = submittedAt <= due
                        ? `<span class="assignment-status-badge bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                            <i data-lucide="check-circle" class="w-3 h-3 mr-1"></i> Submitted
                          </span>`
                        : `<span class="assignment-status-badge bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
                            <i data-lucide="clock" class="w-3 h-3 mr-1"></i> Submitted Late
                          </span>`;
                } else if (due < now) {
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

            // --- File Section ---
            let fileSection = "";
            if (a.fileUrls && a.fileUrls.length > 0) {
                fileSection = `<div class="mt-3 flex flex-wrap gap-2">`;

                a.fileUrls.forEach((fileUrl, i) => {
                    const fullName = a.fileNames ? a.fileNames[i] : fileUrl.split("/").pop();
                    const parts = fullName.split("_");
                    const ext = parts.pop().split(".").pop();
                    const displayName = parts.slice(-3).join("_") + "." + ext;

                    let icon = "file-text";
                    if (ext.match(/png|jpg|jpeg|gif|bmp|svg/)) icon = "image";
                    else if (ext === "pdf") icon = "file";

                    fileSection += `
                        <div class="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <i data-lucide="${icon}" class="w-4 h-4 text-blue-600"></i>
                            <a href="${fileUrl}" target="_blank" class="text-sm text-blue-700 dark:text-blue-300 truncate">
                                ${displayName}
                            </a>
                        </div>
                    `;
                });

                fileSection += `</div>`;
            }

            // --- Assignment Card ---
            return `
                <div class="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                    <div class="p-4">
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                ${a.assignedUserName ? a.assignedUserName.slice(0, 2).toUpperCase() : "NA"}
                            </div>
                            <div class="flex-1">
                                <div class="flex items-start justify-between">
                                    <div>
                                        <h4 class="font-medium text-gray-800 dark:text-white mb-1">${a.description}</h4>
                                        ${statusBadge}
                                    </div>
                                </div>
                                ${fileSection}
                                <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div class="flex items-center gap-4 text-sm">
                                        <button class="submission-overview-btn flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800" data-assignment="${a.assignmentId}">
                                            <i data-lucide="check-circle" class="w-4 h-4"></i>
                                            <span>View Submissions</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        // --- Classroom Card ---
        const classroomHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                <div class="p-4 border-b border-gray-200 dark:border-gray-600">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <i data-lucide="landmark" class="w-5 h-5 text-white"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${classroom.classLevel} ‣ ${classroom.subject}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    <span id="classroom-${classroom.classroomId}-assignments-count">${classroom.assignments?.length || 0}</span> assignments • ${classroom.studentCount || 0} students
                                </p>
                            </div>
                        </div>
                        <button class="classroom-toggle p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-classroom="${classroomDomId}">
                            <i data-lucide="chevron-down" class="w-5 h-5 text-gray-500 transition-transform"></i>
                        </button>
                    </div>
                </div>
                <div class="classroom-assignments hidden" id="${classroomDomId}-assignments">
                    ${assignmentsHTML}
                </div>
            </div>
        `;

        container.append(classroomHTML);
    });

    // Re-init icons
    lucide.createIcons();

    // Toggle expand/collapse
// Delegated click handler for classroom toggles
    $(document).on("click", ".classroom-toggle", function () {
        const domId = $(this).data("classroom"); // e.g., classroom-CLS20250001
        const assignmentsContainer = $(`#${domId}-assignments`);

        // Expand/collapse
        assignmentsContainer.toggleClass("hidden");
        $(this).find("i").toggleClass("rotate-180");

        // Load assignments only once
        if (!assignmentsContainer.data("loaded")) {
            // Find the classroom data in current state
            const classroomData = state.currentPageData.find(c => `classroom-${c.classroomId}` === domId);
            if (classroomData) {
                loadAssignmentsForClassroom(classroomData.classroomId, assignmentsContainer);
                assignmentsContainer.data("loaded", true);
            }
        }
    });

    // Attach modal opener for submissions
    $(".submission-overview-btn").on("click", function () {
        const assignmentId = $(this).data("assignment");
        loadSubmissionsModal(assignmentId);
    });
}


function loadAssignmentsForClassroom(classroomId, container) {
    ajaxWithToken({
        url: `${assignmentApi}${classroomId}/view/all/assignments`,
        method: "GET",
        dataType: "json",
        success: function (response) {
            const assignments = response.data || []; // <-- flat array, not .content
            const countAssignElem = $(`#classroom-${classroomId}-assignments-count`);
            if (countAssignElem.length) {
                countAssignElem.text(`${assignments.length} assignments`);
            }
            if (assignments.length === 0) {
                container.html(`<div class="p-4 text-gray-500">No assignments yet.</div>`);
                return;
            }

            const assignmentsHTML = assignments.map(a => {
                // --- Status Badge Logic ---
                let statusBadge = "";
                if (a.dueDate) {
                    const now = new Date();
                    const due = new Date(a.dueDate);
                    const submittedAt = a.submittedAt ? new Date(a.submittedAt) : null;

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

                // --- File Section (actual filenames) ---
                let fileSection = "";
                if (a.fileUrls && a.fileUrls.length > 0) {
                    fileSection = `<div class="mt-3 flex flex-wrap gap-2">`;

                    a.fileUrls.forEach((fileUrl, i) => {
                        const fullName = a.fileNames ? a.fileNames[i] : fileUrl.split("/").pop();

                        // Remove the prefix (everything before last underscore of the meaningful name)
                        // We'll take the last 2-3 parts joined by '_' before the extension
                        const parts = fullName.split("_");
                        const ext = parts.pop().split(".").pop(); // save extension
                        // Take last 2-3 parts for display
                        const displayName = parts.slice(-3).join("_") + "." + ext;

                        let icon = "file-text";
                        if (ext.match(/png|jpg|jpeg|gif|bmp|svg/)) icon = "image";
                        else if (ext === "pdf") icon = "file";

                        fileSection += `
        <div class="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <i data-lucide="${icon}" class="w-4 h-4 text-blue-600"></i>
            <a href="${fileUrl}" target="_blank" class="text-sm text-blue-700 dark:text-blue-300 truncate">
                ${displayName}
            </a>
        </div>
    `;
                    });

                    fileSection += `</div>`;
                }

                // --- Assignment card ---
                return `
                    <div class="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                        <div class="p-4">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                    ${a.assignedUserName ? a.assignedUserName.slice(0, 2).toUpperCase() : "NA"}
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <h4 class="font-medium text-gray-800 dark:text-white mb-1">${a.description}</h4>
                                            ${statusBadge}
                                        </div>
                                    </div>
                                    ${fileSection}
                                    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div class="flex items-center gap-4 text-sm">
                                            <button class="submission-overview-btn flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800" data-assignment="${a.assignmentId}">
                                                <i data-lucide="check-circle" class="w-4 h-4"></i>
                                                <span>View Submissions</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

            container.html(assignmentsHTML);

            lucide.createIcons();

            // Reattach modal buttons
            $(".submission-overview-btn").on("click", function () {
                const assignmentId = $(this).data("assignment");
                loadSubmissionsModal(assignmentId);
            });
        },
        error: function (xhr) {
            container.html(`<div class="p-4 text-red-500">Failed to load assignments.</div>`);
        }
    });
}
*/


// ========================= Constants & State =========================
const classroomApi = "http://localhost:8080/api/v1/edusphere/classroom/";
const assignmentApi = "http://localhost:8080/api/v1/edusphere/classrooms/";
const submissionApi = "http://localhost:8080/api/v1/edusphere//assignments/submissions/";
const default_page_size = 15;
const max_visible_pages = 7;

// ========================= Initialization =========================
document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons();
    loadDataPaginated(1, state.size);
});

// ========================= Helper Functions =========================
function getStatusBadge(assignment) {
    if (!assignment.dueDate) return "";

    const now = new Date();
    const due = new Date(assignment.dueDate);
    const submittedAt = assignment.submittedAt ? new Date(assignment.submittedAt) : null;

    if (submittedAt) {
        return submittedAt <= due
            ? `<span class="assignment-status-badge bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  <i data-lucide="check-circle" class="w-3 h-3 mr-1"></i> Submitted
               </span>`
            : `<span class="assignment-status-badge bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
                  <i data-lucide="clock" class="w-3 h-3 mr-1"></i> Submitted Late
               </span>`;
    } else if (due < now) {
        return `<span class="assignment-status-badge bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                    <i data-lucide="alert-circle" class="w-3 h-3 mr-1"></i> Expired
                </span>`;
    } else {
        const isSameDay = due.toDateString() === now.toDateString();
        if (isSameDay) {
            const timeStr = due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return `<span class="assignment-status-badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
                        <i data-lucide="alert-triangle" class="w-3 h-3 mr-1"></i> Due Today @ ${timeStr}
                    </span>`;
        } else {
            const dateStr = due.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
            const timeStr = due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return `<span class="assignment-status-badge bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                        <i data-lucide="calendar" class="w-3 h-3 mr-1"></i> Due ${dateStr} @ ${timeStr}
                    </span>`;
        }
    }
}

function getFileSection(assignment) {
    if (!assignment.fileUrls?.length) return "";

    return `<div class="mt-3 flex flex-wrap gap-2">
        ${assignment.fileUrls.map((url, i) => {
        const fullName = assignment.fileNames ? assignment.fileNames[i] : url.split("/").pop();
        const parts = fullName.split("_");
        const ext = parts.pop().split(".").pop();
        const displayName = parts.slice(-3).join("_") + "." + ext;

        let icon = "file-text";
        if (ext.match(/png|jpg|jpeg|gif|bmp|svg/)) icon = "image";
        else if (ext === "pdf") icon = "file";

        return `
            <div class="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <i data-lucide="${icon}" class="w-4 h-4 text-blue-600"></i>
                <a href="${url}" target="_blank" class="text-sm text-blue-700 dark:text-blue-300 truncate">
                    ${displayName}
                </a>
            </div>`;
    }).join("")}
    </div>`;
}

function renderAssignmentCard(assignment) {
    const statusBadge = getStatusBadge(assignment);
    const fileSection = getFileSection(assignment);

    return `
    <div class="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
        <div class="p-4">
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                    ${assignment.assignedUserName ? assignment.assignedUserName.slice(0, 2).toUpperCase() : "NA"}
                </div>
                <div class="flex-1">
                    <div class="flex items-start justify-between">
                        <div>
                            <h4 class="font-medium text-gray-800 dark:text-white mb-1">${assignment.description}</h4>
                            ${statusBadge}
                        </div>
                    </div>
                    ${fileSection}
                    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-4 text-sm">
        <button class="submission-overview-btn flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors" data-assignment="${assignment.assignmentId}" data-status="submitted">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>${assignment.submittedCount || 0} Submitted</span>
        </button>
        <button class="submission-overview-btn flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors" data-assignment="${assignment.assignmentId}" data-status="delayed">
            <i data-lucide="clock" class="w-4 h-4"></i>
            <span>${assignment.delayedCount || 0} Delayed</span>
        </button>
        <button class="submission-overview-btn flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" data-assignment="${assignment.assignmentId}" data-status="missed">
            <i data-lucide="x-circle" class="w-4 h-4"></i>
            <span>${assignment.missedCount || 0} Missed</span>
        </button>
    </div>
</div>

                </div>
            </div>
        </div>
    </div>`;
}

// ========================= Classroom Rendering =========================
function renderClassroomCards(classrooms) {
    const container = $("#submissions-container").empty();

    classrooms.forEach(classroom => {
        const classroomDomId = `classroom-${classroom.classroomId}`;
        const assignmentsHTML = (classroom.assignments || []).map(renderAssignmentCard).join("");

        const classroomHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
            <div class="p-4 border-b border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <i data-lucide="landmark" class="w-5 h-5 text-white"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${classroom.classLevel} ‣ ${classroom.subject}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                <span id="classroom-${classroom.classroomId}-assignments-count">${classroom.assignments?.length || "View"}</span> assignments • ${classroom.studentCount || 0} students
                            </p>
                        </div>
                    </div>
                    <button class="classroom-toggle p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-classroom="${classroomDomId}">
                        <i data-lucide="chevron-down" class="w-5 h-5 text-gray-500 transition-transform"></i>
                    </button>
                </div>
            </div>
            <div class="classroom-assignments hidden" id="${classroomDomId}-assignments">
                ${assignmentsHTML}
            </div>
        </div>`;

        container.append(classroomHTML);
    });

    lucide.createIcons();
    attachClassroomToggle();
    attachSubmissionButtons();
}

// ========================= Load Assignments via AJAX =========================
function loadAssignmentsForClassroom(classroomId, container) {
    ajaxWithToken({
        url: `${assignmentApi}${classroomId}/view/all/assignments`,
        method: "GET",
        dataType: "json",
        success: function (response) {
            const assignments = response.data || [];

            console.log(response.data); // Inspect what keys are returned

            // Update assignment count in classroom header
            const countAssignElem = $(`#classroom-${classroomId}-assignments-count`);
            if (countAssignElem.length) {
                countAssignElem.text(`${assignments.length}`);
            }

            if (assignments.length === 0) {
                container.html(`<div class="p-4 text-gray-500">No assignments yet.</div>`);
                return;
            }

            const assignmentsHTML = assignments.map(a => {
                // --- Status Badge ---
                let statusBadge = "";
                if (a.dueDate) {
                    const now = new Date();
                    const due = new Date(a.dueDate);
                    const submittedAt = a.submittedAt ? new Date(a.submittedAt) : null;

                    if (submittedAt) {
                        statusBadge = submittedAt <= due
                            ? `<span class="assignment-status-badge bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                <i data-lucide="check-circle" class="w-3 h-3 mr-1"></i> Submitted
                              </span>`
                            : `<span class="assignment-status-badge bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
                                <i data-lucide="clock" class="w-3 h-3 mr-1"></i> Submitted Late
                              </span>`;
                    } else if (due < now) {
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

                // --- File Section ---
                // --- File Section (safe) ---
                let fileSection = "";
                if (a.fileUrls && a.fileUrls.length > 0) {
                    fileSection = `<div class="mt-3 flex flex-wrap gap-2">`;

                    a.fileUrls.forEach((fileUrl, i) => {
                        // Get the actual file name
                        const fullName = a.fileNames ? a.fileNames[i] : fileUrl.split("/").pop();

                        // Safely get file info
                        const info = getFileInfo(fullName) || {
                            icon: "file"
                        };

                        // Display name (remove prefix, last 2-3 parts)
                        let displayName = fullName || "Unknown";
                        if (fullName) {
                            const parts = fullName.split("_");
                            const ext = parts.pop().split(".").pop();
                            displayName = parts.slice(-3).join("_") + "." + ext;
                        }

                        fileSection += `
            <div class="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                <i data-lucide="${info.icon}" class="w-4 h-4 text-blue-600"></i>
                <a href="${fileUrl}" target="_blank" class="text-sm text-blue-700 dark:text-blue-300 truncate">
                    ${displayName}
                </a>
            </div>
        `;
                    });

                    fileSection += `</div>`;
                }

                // --- Assignment Card with Submitted/Delayed/Missed ---
                return `
                    <div id="assignment-card-${a.assignmentId}" class="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                        <div class="p-4">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                    ${a.assignedUserName ? a.assignedUserName.slice(0, 2).toUpperCase() : "NA"}
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <h4 class="font-medium text-gray-800 dark:text-white mb-1">${a.description}</h4>
                                            ${statusBadge}
                                        </div>
                                    </div>
                                    ${fileSection}
                                    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div class="flex items-center gap-4 text-sm">
                                            <button class="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                                                <i data-lucide="check-circle" class="w-4 h-4"></i>
                                                <span class="submitted-count" id="submitted-count-${a.assignmentId}">${a.submittedCount || 0} Submitted</span>
                                            </button>
                                            <button class="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                                                <i data-lucide="clock" class="w-4 h-4"></i>
                                                <span class="late-count" id="late-count-${a.assignmentId}">${a.delayedCount || 0} Delayed</span>
                                            </button>
                                            <button class="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                                <i data-lucide="x-circle" class="w-4 h-4"></i>
                                                <span class="missed-count" id="missed-count-${a.assignmentId}">${a.missedCount || 0} Missed</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

            container.html(assignmentsHTML);

            lucide.createIcons();
            // Call counts after HTML exists
            assignments.forEach(a => {
                loadAssignmentStatusCount(a.assignmentId);
            });
        },
        error: function (xhr) {
            container.html(`<div class="p-4 text-red-500">Failed to load assignments.</div>`);
        }
    });
}

// ========================= Pagination & Classroom Loading =========================
function loadDataPaginated(page = 1, size = state.size) {
    const zeroBasedPage = Math.max(0, page - 1);
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    ajaxWithToken({
        url: `${classroomApi}paginated?page=${zeroBasedPage}&size=${size}&userId=${userId}&role=${role}`,
        method: "GET",
        dataType: "json",
        success: function (response) {
            const data = response.data || {};
            const { content = [], number = 0, size: respSize = size, totalPages = 1, totalElements = 0 } = data;

            if (!content.length) {
                $("#classroom-card-container").html(`<div class="text-center text-gray-500 py-6">You haven't joined any classroom yet.</div>`);
                return;
            }

            state.page = number + 1;
            state.size = respSize;
            state.totalPages = totalPages;
            state.totalElements = totalElements;
            state.currentPageData = content;

            renderClassroomCards(content);
            renderPaginationFooter();  // If you have pagination UI
        },
        error: function (xhr) {
            showMessage("error", "Error loading classroom: " + (xhr.responseJSON?.message || xhr.statusText || "Unknown error"));
            if (xhr.status === 401) window.location.href = "login.html";
        }
    });
}

function loadAssignmentStatusCount(assignmentId) {
    ajaxWithToken({
        url: `http://localhost:8080/api/v1/edusphere/assignments/submissions/counts/${assignmentId}`,
        method: "GET",
        dataType: "json",
        success: function (response) {
            const data = response.data || {};

            $(`#submitted-count-${assignmentId}`).text(`${data.submittedCount || 0} Submitted`);
            $(`#late-count-${assignmentId}`).text(`${data.lateCount || 0} Delayed`);
            $(`#missed-count-${assignmentId}`).text(`${data.notSubmittedCount || 0} Missed`);
        },
        error: function (xhr) {
            console.error("Error loading submission counts:", xhr.responseJSON?.message || xhr.statusText);
        }
    });
}


// ========================= Event Attachments =========================
/*function attachClassroomToggle() {
// Delegated click handler for classroom toggles
    $(document).on("click", ".classroom-toggle", function () {
        const domId = $(this).data("classroom"); // e.g., classroom-CLS20250001
        const assignmentsContainer = $(`#${domId}-assignments`);

        // Expand/collapse
        assignmentsContainer.toggleClass("hidden");
        $(this).find("i").toggleClass("rotate-180");

        // Load assignments only once
        if (!assignmentsContainer.data("loaded")) {
            // Find the classroom data in current state
            const classroomData = state.currentPageData.find(c => `classroom-${c.classroomId}` === domId);
            if (classroomData) {
                // Fetch assignments for this classroom
                loadAssignmentsForClassroom(classroomData.classroomId, assignmentsContainer);

                // Once loaded, mark as loaded
                assignmentsContainer.data("loaded", true);
            }
        }
    });
}*/

function attachClassroomToggle() {
    $(".classroom-toggle").off("click").on("click", function() {
        const classroomDomId = $(this).data("classroom");
        const container = $(`#${classroomDomId}-assignments`);

        // Toggle visibility
        container.toggleClass("hidden");

        // Only load assignments once
        if (!container.data("loaded")) {
            const classroomId = classroomDomId.replace("classroom-", "");
            loadAssignmentsForClassroom(classroomId, container);
            container.data("loaded", true);
        }

        // Animate chevron
        $(this).find("i").toggleClass("rotate-180");
    });
}


function attachSubmissionButtons() {
    $(".submission-overview-btn").off("click").on("click", function () {
        const assignmentId = $(this).data("assignment");
        loadSubmissionsModal(assignmentId);
    });
}




// Enhanced file info function – safe for optional files
function getFileInfo(fileName) {
    if (!fileName) return null; // return null if file doesn't exist

    const ext = fileName.split('.').pop().toLowerCase();
    const fileInfo = { extension: ext };

    // Image files
    if (["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(ext)) {
        return {
            ...fileInfo,
            icon: "image",
            type: "Image"
        };
    }

    // PDF files
    if (["pdf"].includes(ext)) {
        return {
            ...fileInfo,
            icon: "file-text",
            type: "PDF Document"
        };
    }

    // Document files
    if (["doc", "docx", "txt", "rtf"].includes(ext)) {
        return {
            ...fileInfo,
            icon: "file-text",
            type: "Document"
        };
    }

    // Spreadsheet files
    if (["xls", "xlsx", "csv"].includes(ext)) {
        return {
            ...fileInfo,
            icon: "table",
            type: "Spreadsheet"
        };
    }

    // Presentation files
    if (["ppt", "pptx"].includes(ext)) {
        return {
            ...fileInfo,
            icon: "presentation",
            type: "Presentation"
        };
    }

    // Archive files
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
        return {
            ...fileInfo,
            icon: "archive",
            type: "Archive"
        };
    }

    // Video files
    if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(ext)) {
        return {
            ...fileInfo,
            icon: "video",
            type: "Video"
        };
    }

    // Audio files
    if (["mp3", "wav", "flac", "aac", "ogg"].includes(ext)) {
        return {
            ...fileInfo,
            icon: "music",
            type: "Audio"
        };
    }

    // Code files
    if (["js", "html", "css", "py", "java", "cpp", "c", "php", "rb"].includes(ext)) {
        return {
            ...fileInfo,
            icon: "code",
            type: "Code"
        };
    }

    // Default fallback
    return {
        ...fileInfo,
        icon: "file",
        type: "File"
    };
}