/*
// Initialize Lucide icons
document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons();

})
// Modal elements
const submissionModal = document.getElementById('submissionModal');
const submissionCloseButton = document.getElementById('submissionCloseModal');
const submissionCancelButton = document.getElementById('submissionCancel');
const submissionFileInput = document.getElementById('submissionFileInput');
const submissionFileDropZone = document.getElementById('submissionFileDropZone');
const submissionFileList = document.getElementById('submissionFileList');
const submissionFileItems = document.getElementById('submissionFileItems');
const submissionTestUrlButton = document.getElementById('submissionTestUrl');
const submissionSubmitButton = document.getElementById('submissionSubmit');

let editingSubmissionId = null;
const submissionApi = "http://localhost:8080/api/v1/edusphere/assignments/submissions/";


let existingSubmissionFiles = [];         // files already saved in DB
let removedSubmissionFileIds = [];        // files user removed during editing
let selectedSubmissionFiles = [];         // new files picked in modal
let submittingAssignmentTo = null;

// Open modal
// Open modal
function openSubmissionModal(assignmentId) {
    // Your modal opening logic here
    console.log('Opening submission modal for assignment:', assignmentId);
    submittingAssignmentTo = assignmentId;

    submissionModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // You can pre-fill the modal with assignment details if needed
}


// Close modal
const closeSubmissionModal = () => {
    submissionModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
};

submissionCloseButton.addEventListener('click', closeSubmissionModal);
submissionCancelButton.addEventListener('click', closeSubmissionModal);

// Close modal when clicking outside
submissionModal.addEventListener('click', (e) => {
    if (e.target === submissionModal) {
        closeSubmissionModal();
    }
});

// File upload functionality
submissionFileDropZone.addEventListener('click', () => {
    submissionFileInput.click();
});

submissionFileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    submissionFileDropZone.classList.add('dragover');
});

submissionFileDropZone.addEventListener('dragleave', () => {
    submissionFileDropZone.classList.remove('dragover');
});

submissionFileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    submissionFileDropZone.classList.remove('dragover');

    if (e.dataTransfer.files.length > 0) {
        handleSubmissionFiles(e.dataTransfer.files);
    }
});

submissionFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleSubmissionFiles(e.target.files);
    }
});

// Handle selected files
function handleSubmissionFiles(files) {
    submissionFileList.classList.remove('hidden');

    for (let file of files) {
        selectedSubmissionFiles.push(file);

        const submissionFileItem = document.createElement('div');
        submissionFileItem.className = 'submission-file-item bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 flex items-center justify-between';

        const submissionFileInfo = document.createElement('div');
        submissionFileInfo.className = 'flex items-center';

        const submissionFileIcon = document.createElement('i');
        submissionFileIcon.setAttribute('data-lucide', getSubmissionFileIcon(file.type));
        submissionFileIcon.className = 'w-5 h-5 text-slate-500 mr-3';

        const submissionFileName = document.createElement('span');
        submissionFileName.className = 'text-slate-700 dark:text-slate-300 text-sm';
        submissionFileName.textContent = file.name;

        const submissionFileSize = document.createElement('span');
        submissionFileSize.className = 'text-slate-500 dark:text-slate-400 text-xs ml-2';
        submissionFileSize.textContent = formatSubmissionFileSize(file.size);

        const submissionRemoveButton = document.createElement('button');
        submissionRemoveButton.className = 'text-slate-400 hover:text-red-500 transition-colors';
        submissionRemoveButton.innerHTML = '<i data-lucide="x" class="w-4 h-4"></i>';
        submissionRemoveButton.addEventListener("click", () => {
            submissionFileItem.remove();
            selectedSubmissionFiles = selectedSubmissionFiles.filter(f => f !== file);
            if(submissionFileItems.children.length === 0) {
                submissionFileList.classList.add("hidden");
            }
        });

        submissionFileItem.appendChild(submissionFileInfo);
        submissionFileItem.appendChild(submissionFileIcon);
        submissionFileItem.appendChild(submissionFileName);
        submissionFileItem.appendChild(submissionFileSize);
        submissionFileItem.appendChild(submissionRemoveButton);
        submissionFileItems.appendChild(submissionFileItem);

        // Update Lucide icons for the new elements
        lucide.createIcons();
    }
}


function createSubmission(formData) {
    ajaxWithToken({
        url: `${submissionApi}${submittingAssignmentTo}/${userId}/submit`,
        method: "POST",
        data: formData,
        processData: false, // important for FormData
        contentType: false, // important for FormData
        success: function (data) {
            if (data.status === 201) {
                //alert("Assignment created successfully!");
                showMessage("success", "Submission logged successfully!");
                resetSubmissionForm();
                closeSubmissionModal();
            } else {
                //alert(data.message || "Failed to create assignment.");
                showMessage("error", data.message || "Failed to create assignment.");
            }
        },error: function (xhr) {
            if (xhr.status === 409) {
                showMessage("warning", xhr.responseJSON?.message || "You already submitted this assignment!");
            } else {
                showMessage("error", "Unexpected error occurred while creating submission.");
            }
        }
    });
}

function deleteSubmission(editingSubmissionId) {
    
}

function updateSubmission(editingSubmissionId, formData) {

}

function resetSubmissionForm() {
    // Clear file inputs
    const fileInput = document.getElementById("submissionFileInput");
    if (fileInput) {
        fileInput.value = "";
    }

    // Reset arrays
    selectedSubmissionFiles = [];
    existingSubmissionFiles = [];
    removedSubmissionFileIds = [];

    // Reset editing state
    editingSubmissionId = null;

    // Clear UI previews (if any)
    const filePreview = document.getElementById("submissionFilePreview");
    if (filePreview) {
        filePreview.innerHTML = "";
    }

    // Optional: reset description/url if you use them later
    // document.getElementById("submissionDescription").value = "";
    // document.getElementById("submissionUrl").value = "";

    console.log("Submission form cleared.");
}


submissionSubmitButton.addEventListener("click", () => {
    //const description = document.getElementById("submissionDescription").value.trim();
    //const url = document.getElementById("submissionUrl").value.trim();
    const hasFiles = selectedSubmissionFiles.length > 0 || existingSubmissionFiles.length > 0;

    // ===== DELETE CASE =====
    if (editingSubmissionId && !hasFiles) {
        console.log("Deleting submission:", editingSubmissionId);
        deleteSubmission(editingSubmissionId);
        return;
    }

    // Validate input
    if (!editingSubmissionId && !hasFiles) {
        alert("Please insert your submission file to continue.");
        return;
    }

    const formData = new FormData();
    //formData.append("description", description);
    //formData.append("url", url);

    // Keep remaining existing files
    const remainingSubmissionFiles = existingSubmissionFiles.filter(f => !removedSubmissionFileIds.includes(f.fileId));
    remainingSubmissionFiles.forEach(file => formData.append("existingFiles", file.fileId));

    // Add new files
    selectedSubmissionFiles.forEach(file => formData.append("files", file));

    // ===== UPDATE MODE =====
    if (editingSubmissionId) {
        console.log("Updating submission:", editingSubmissionId);
        updateSubmission(editingSubmissionId, formData);
    }
    // ===== CREATE MODE =====
    else {
        console.log("Creating new submission");
        createSubmission(formData);
    }
});




// Get appropriate file icon based on file type
function getSubmissionFileIcon(fileType) {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.includes('pdf')) return 'file-text';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-text';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'table';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'presentation';
    if (fileType.includes('zip') || fileType.includes('archive')) return 'archive';
    return 'file';
}

// Format file size to human readable format
function formatSubmissionFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Test URL functionality
submissionTestUrlButton.addEventListener('click', () => {
    const submissionUrlInput = document.getElementById('submissionUrl');
    const submissionUrl = submissionUrlInput.value.trim();

    if (submissionUrl) {
        // Validate URL format
        if (!isValidSubmissionUrl(submissionUrl)) {
            alert('Please enter a valid URL (e.g., https://example.com)');
            return;
        }

        // Show loading state
        const originalText = submissionTestUrlButton.innerHTML;
        submissionTestUrlButton.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Testing...';
        submissionTestUrlButton.disabled = true;

        // Simulate URL testing (in a real app, this would make an actual request)
        setTimeout(() => {
            submissionTestUrlButton.innerHTML = originalText;
            submissionTestUrlButton.disabled = false;
            lucide.createIcons();

            // Simulate test result
            const randomSuccess = Math.random() > 0.3; // 70% success rate
            if (randomSuccess) {
                alert('URL is accessible and valid!');
            } else {
                alert('URL could not be reached. Please check the link and try again.');
            }
        }, 1500);
    } else {
        alert('Please enter a URL to test');
    }
});

// Simple URL validation
function isValidSubmissionUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Submit assignment
/!*
submissionSubmitButton.addEventListener('click', () => {
    const submissionDescription = document.getElementById('submissionDescription').value.trim();
    const submissionUrl = document.getElementById('submissionUrl').value.trim();
    const hasSubmissionFiles = submissionFileItems.children.length > 0;

    if (!submissionDescription && !hasSubmissionFiles && !submissionUrl) {
        alert('Please provide at least a description, file, or URL for your submission.');
        return;
    }

    // Show loading state
    const originalText = submissionSubmitButton.innerHTML;
    submissionSubmitButton.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Submitting...';
    submissionSubmitButton.disabled = true;

    // Simulate submission process
    setTimeout(() => {
        submissionSubmitButton.innerHTML = originalText;
        submissionSubmitButton.disabled = false;
        lucide.createIcons();

        // Show success message
        alert('Assignment submitted successfully!');
        closeSubmissionModal();

        // Reset form
        document.getElementById('submissionDescription').value = '';
        document.getElementById('submissionUrl').value = '';
        submissionFileItems.innerHTML = '';
        submissionFileList.classList.add('hidden');
    }, 2000);
});*!/
*/


// Initialize Lucide icons
document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons();
});

// Modal elements
const submissionModal = document.getElementById('submissionModal');
const submissionCloseButton = document.getElementById('submissionCloseModal');
const submissionCancelButton = document.getElementById('submissionCancel');
const submissionFileInput = document.getElementById('submissionFileInput');
const submissionFileDropZone = document.getElementById('submissionFileDropZone');
const submissionFileList = document.getElementById('submissionFileList');
const submissionFileItems = document.getElementById('submissionFileItems');
const submissionTestUrlButton = document.getElementById('submissionTestUrl');
const submissionSubmitButton = document.getElementById('submissionSubmit');
const submissionDescription = document.getElementById('submissionDescription');
const submissionUrl = document.getElementById('submissionUrl');

let editingSubmissionId = null;
const submissionApi = "http://localhost:8080/api/v1/edusphere/assignments/submissions/";

let existingSubmissionFiles = [];         // files already saved in DB
let removedSubmissionFileIds = [];        // files user removed during editing
let selectedSubmissionFiles = [];         // new files picked in modal
let submittingAssignmentTo = null;

// Open modal with proper state
function openSubmissionModal(assignmentId, submissionData = null) {
    submittingAssignmentTo = assignmentId;

    if (submissionData) {
        editingSubmissionId = submissionData.submissionId;

        // Populate files
        if (submissionData.fileUrls && submissionData.fileUrls.length > 0) {
            existingSubmissionFiles = submissionData.fileUrls.map((url, index) => ({
                fileId: index,
                fileUrl: url,
                fileName: url.split('/').pop(),
                fileType: submissionData.fileTypes ? submissionData.fileTypes[index] : 'application/octet-stream'
            }));
            renderExistingSubmissionFiles();
        }

        // Populate form fields
        if (submissionDescription) submissionDescription.value = submissionData.description || '';
        if (submissionUrl) submissionUrl.value = submissionData.url || '';

        updateUIForEditMode();
    }

    submissionModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

// Render existing files in the UI
function renderExistingSubmissionFiles() {
    submissionFileList.classList.remove('hidden');
    submissionFileItems.innerHTML = '';

    existingSubmissionFiles.forEach((file, index) => {
        const submissionFileItem = document.createElement('div');
        submissionFileItem.className = 'submission-file-item bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 flex items-center justify-between';
        submissionFileItem.setAttribute('data-file-id', index);

        const submissionFileInfo = document.createElement('div');
        submissionFileInfo.className = 'flex items-center';

        const submissionFileIcon = document.createElement('i');
        submissionFileIcon.setAttribute('data-lucide', getSubmissionFileIcon(file.fileType));
        submissionFileIcon.className = 'w-5 h-5 text-slate-500 mr-3';

        const submissionFileName = document.createElement('span');
        submissionFileName.className = 'text-slate-700 dark:text-slate-300 text-sm';
        submissionFileName.textContent = file.fileName;

        const fileStatus = document.createElement('span');
        fileStatus.className = 'text-xs ml-2 px-2 py-1 rounded-full bg-blue-100 text-blue-700';
        fileStatus.textContent = 'Uploaded';

        const submissionRemoveButton = document.createElement('button');
        submissionRemoveButton.className = 'text-slate-400 hover:text-red-500 transition-colors';
        submissionRemoveButton.innerHTML = '<i data-lucide="x" class="w-4 h-4"></i>';
        submissionRemoveButton.addEventListener("click", () => {
            removedSubmissionFileIds.push(index);
            submissionFileItem.remove();
            if (submissionFileItems.children.length === 0) {
                submissionFileList.classList.add("hidden");
            }
        });

        submissionFileInfo.appendChild(submissionFileIcon);
        submissionFileInfo.appendChild(submissionFileName);
        submissionFileInfo.appendChild(fileStatus);
        submissionFileItem.appendChild(submissionFileInfo);
        submissionFileItem.appendChild(submissionRemoveButton);
        submissionFileItems.appendChild(submissionFileItem);
    });

    lucide.createIcons();
}

// Update UI for edit mode
function updateUIForEditMode() {
    lucide.createIcons();

    // Change button text and style for edit mode
    submissionSubmitButton.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Update Submission';
    submissionSubmitButton.classList.remove('from-blue-600', 'to-purple-600');
    submissionSubmitButton.classList.add('from-green-600', 'to-blue-600');

    // Update modal title or add indicator
    const modalTitle = submissionModal.querySelector('h2');
    if (modalTitle) {
        modalTitle.innerHTML = 'Update Submission <span class="text-sm text-green-600">(Edit Mode)</span>';
    }

    lucide.createIcons();

}

// Reset UI for create mode
function resetUIForCreateMode() {
    lucide.createIcons();

    // Reset button text and style
    submissionSubmitButton.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> Submit Assignment';
    submissionSubmitButton.classList.remove('from-green-600', 'to-blue-600');
    submissionSubmitButton.classList.add('from-blue-600', 'to-purple-600');

    // Reset modal title
    const modalTitle = submissionModal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = 'Submit Assignment';
    }

    lucide.createIcons();
}

// Close modal
const closeSubmissionModal = () => {
    submissionModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    resetSubmissionForm();
};

submissionCloseButton.addEventListener('click', closeSubmissionModal);
submissionCancelButton.addEventListener('click', closeSubmissionModal);

// Close modal when clicking outside
submissionModal.addEventListener('click', (e) => {
    if (e.target === submissionModal) {
        closeSubmissionModal();
    }
});

// File upload functionality
submissionFileDropZone.addEventListener('click', () => {
    submissionFileInput.click();
});

submissionFileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    submissionFileDropZone.classList.add('dragover');
});

submissionFileDropZone.addEventListener('dragleave', () => {
    submissionFileDropZone.classList.remove('dragover');
});

submissionFileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    submissionFileDropZone.classList.remove('dragover');

    if (e.dataTransfer.files.length > 0) {
        handleSubmissionFiles(e.dataTransfer.files);
    }
});

submissionFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleSubmissionFiles(e.target.files);
    }
});

// Handle selected files
function handleSubmissionFiles(files) {
    submissionFileList.classList.remove('hidden');

    for (let file of files) {
        selectedSubmissionFiles.push(file);

        const submissionFileItem = document.createElement('div');
        submissionFileItem.className = 'submission-file-item bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 flex items-center justify-between';

        const submissionFileInfo = document.createElement('div');
        submissionFileInfo.className = 'flex items-center';

        const submissionFileIcon = document.createElement('i');
        submissionFileIcon.setAttribute('data-lucide', getSubmissionFileIcon(file.type));
        submissionFileIcon.className = 'w-5 h-5 text-slate-500 mr-3';

        const submissionFileName = document.createElement('span');
        submissionFileName.className = 'text-slate-700 dark:text-slate-300 text-sm';
        submissionFileName.textContent = file.name;

        const submissionFileSize = document.createElement('span');
        submissionFileSize.className = 'text-slate-500 dark:text-slate-400 text-xs ml-2';
        submissionFileSize.textContent = formatSubmissionFileSize(file.size);

        const fileStatus = document.createElement('span');
        fileStatus.className = 'text-xs ml-2 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700';
        fileStatus.textContent = 'New';

        const submissionRemoveButton = document.createElement('button');
        submissionRemoveButton.className = 'text-slate-400 hover:text-red-500 transition-colors';
        submissionRemoveButton.innerHTML = '<i data-lucide="x" class="w-4 h-4"></i>';
        submissionRemoveButton.addEventListener("click", () => {
            submissionFileItem.remove();
            selectedSubmissionFiles = selectedSubmissionFiles.filter(f => f !== file);
            if (submissionFileItems.children.length === 0) {
                submissionFileList.classList.add("hidden");
            }
        });

        submissionFileInfo.appendChild(submissionFileIcon);
        submissionFileInfo.appendChild(submissionFileName);
        submissionFileInfo.appendChild(submissionFileSize);
        submissionFileInfo.appendChild(fileStatus);
        submissionFileItem.appendChild(submissionFileInfo);
        submissionFileItem.appendChild(submissionRemoveButton);
        submissionFileItems.appendChild(submissionFileItem);

        lucide.createIcons();
    }
}

// Create new submission
function createSubmission(formData) {
    showLoadingState(true);

    ajaxWithToken({
        url: `${submissionApi}${submittingAssignmentTo}/${userId}/submit`,
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            showLoadingState(false);
            if (data.status === 201) {
                showMessage("success", "Submission created successfully!");
                resetSubmissionForm();
                closeSubmissionModal();
                // Optional: Refresh the assignment list
                if (typeof loadAssignments === 'function') {
                    loadAssignments();
                }
            } else {
                showMessage("error", data.message || "Failed to create submission.");
            }
        },
        error: function (xhr) {
            showLoadingState(false);
            if (xhr.status === 409) {
                showMessage("warning", xhr.responseJSON?.message || "You already submitted this assignment!");
            } else {
                showMessage("error", "Unexpected error occurred while creating submission.");
            }
        }
    });

    lucide.createIcons();

}

// Delete submission
function deleteSubmission(submissionId) {
    if (confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
        showLoadingState(true);

        ajaxWithToken({
            url: `${submissionApi}delete/${submissionId}?deletingUserId=${userId}`,
            method: "DELETE",
            success: function (data) {
                showLoadingState(false);
                if (data.status === 200) {
                    showMessage("success", "Submission deleted successfully!");
                    resetSubmissionForm();
                    closeSubmissionModal();
                    // Refresh the assignment list
                    if (typeof loadAssignments === 'function') {
                        loadAssignments();
                    }
                } else {
                    showMessage("error", data.message || "Failed to delete submission.");
                }
            },
            error: function (xhr) {
                showLoadingState(false);
                showMessage("error", "Failed to delete submission.");
            }
        });
    }
}

// Update submission
function updateSubmission(submissionId, formData) {
    showLoadingState(true);

    ajaxWithToken({
        url: `${submissionApi}${userId}/${submittingAssignmentTo}/${submissionId}/update`,
        method: "PUT",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            showLoadingState(false);
            if (data.status === 200) {
                showMessage("success", "Submission updated successfully!");
                //resetSubmissionForm();
                closeSubmissionModal();
                // Refresh the assignment list
                if (typeof loadAssignments === 'function') {
                    loadAssignments();
                }
            } else {
                showMessage("error", data.message || "Failed to update submission.");
            }
        },
        error: function (xhr) {
            showLoadingState(false);
            showMessage("error", "Failed to update submission.");
        }
    });
}

// Show loading state
function showLoadingState(loading) {
    if (loading) {
        submissionSubmitButton.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Processing...';
        submissionSubmitButton.disabled = true;
    } else {
        if (editingSubmissionId) {
            submissionSubmitButton.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Update Submission';
        } else {
            submissionSubmitButton.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> Submit Assignment';
        }
        submissionSubmitButton.disabled = false;
    }
    lucide.createIcons();
}

// Reset submission form
function resetSubmissionForm() {
    // Clear form fields
    if (submissionDescription) submissionDescription.value = '';
    if (submissionUrl) submissionUrl.value = '';

    // Clear file inputs
    if (submissionFileInput) submissionFileInput.value = '';

    // Reset arrays
    selectedSubmissionFiles = [];
    existingSubmissionFiles = [];
    removedSubmissionFileIds = [];

    // Reset editing state
    editingSubmissionId = null;
    submittingAssignmentTo = null;

    // Clear UI
    submissionFileItems.innerHTML = '';
    submissionFileList.classList.add('hidden');

    // Reset UI to create mode
    resetUIForCreateMode();

    lucide.createIcons();

    console.log("Submission form reset.");
}

// Handle submission button click
submissionSubmitButton.addEventListener("click", () => {
    const hasFiles = selectedSubmissionFiles.length > 0 || existingSubmissionFiles.length > 0;
    const remainingFiles = existingSubmissionFiles.filter((_, index) => !removedSubmissionFileIds.includes(index));

    if (editingSubmissionId && remainingFiles.length === 0 && selectedSubmissionFiles.length === 0) {
        console.log("deleting: "+ editingSubmissionId );
        deleteSubmission(editingSubmissionId);
        return;
    }

    // Validate input
    if (!hasFiles && remainingFiles.length === 0) {
        alert("Please add at least one file to submit.");
        return;
    }

    const formData = new FormData();

    // Add new files
    selectedSubmissionFiles.forEach(file => formData.append("files", file));

    // Add remaining existing files (for update)
    if (editingSubmissionId) {
        //remainingFiles.forEach(file => formData.append("existingFiles", file.fileId));\
        remainingFiles.forEach(file => formData.append("existingFiles", file.id || file.fileId || file.fileUrl));
    }

    if (editingSubmissionId && hasFiles) {
        updateSubmission(editingSubmissionId, formData);
    } else {
        createSubmission(formData);
    }
});

// Get appropriate file icon based on file type
function getSubmissionFileIcon(fileType) {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.includes('pdf')) return 'file-text';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-text';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'table';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'presentation';
    if (fileType.includes('zip') || fileType.includes('archive')) return 'archive';
    return 'file';
}

// Format file size to human readable format
function formatSubmissionFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

// Handle submission modal opening
/*
$(document).on('click', '.submissionOpenModal', function() {
    const assignmentId = $(this).data('assignment-id');

    ajaxWithToken({
        url: `${submissionApi}${assignmentId}/${userId}/submission`,
        method: "GET",
        success: function (response) {
            if (response.status === 201 && response.data) {
                // Edit mode: User has already submitted
                openSubmissionModal(assignmentId, response.data);
            } else {
                // Create mode: New submission
                openSubmissionModal(assignmentId);
            }
        },
        error: function (xhr) {
            if (xhr.status === 400) {
                // No submission yet - create mode
                openSubmissionModal(assignmentId);
            } else {
                showMessage("error", "Failed to check submission status.");
            }
        }
    });
});*/
