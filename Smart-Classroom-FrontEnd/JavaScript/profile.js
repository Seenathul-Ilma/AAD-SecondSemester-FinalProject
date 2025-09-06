/*
$(document).ready(function() {
    // Initialize Lucide icons once after the DOM is loaded
    lucide.createIcons();

    // Load user profile data
    loadProfileData();

    // Profile image upload handler
    $('#profileImageInput').on('change', function(e) {
    const file = e.target.files[0];
    if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
    $('#profileImage').attr('src', e.target.result).removeClass('hidden');
    $('#defaultAvatar').addClass('hidden');
};
    reader.readAsDataURL(file);
}
});

    // Form submission handler
    $('#profileForm').on('submit', function(e) {
    e.preventDefault();
    updateProfile();
});

    // Cancel button handler
    $('#cancelBtn').on('click', function() {
    if (confirm('Are you sure you want to discard your changes?')) {
    loadProfileData();
}
});

    // Floating label effect
    $('input, textarea, select').on('focus', function() {
    $(this).closest('div').prev('label').addClass('text-blue-600');
});

    $('input, textarea, select').on('blur', function() {
    if (!$(this).val()) {
    $(this).closest('div').prev('label').removeClass('text-blue-600');
}
});

    // Load profile data function
    function loadProfileData() {
    // Show loading state
    $('#saveBtn').prop('disabled', true).html('<i data-lucide="loader-2" class="w-4 h-4 mr-2 inline animate-spin"></i>Loading...');
    lucide.createIcons(); // This is unnecessary but kept here to re-render the dynamic icon

    // Simulate AJAX call to load profile data
    $.ajax({
    url: '/api/profile/get',
    method: 'GET',
    dataType: 'json',
    success: function(data) {
    // Populate form fields
    $('#userId').val(data.userId || 'EDU001');
    $('#name').val(data.name || 'John Doe');
    $('#nic').val(data.nic || '123456789V');
    $('#email').val(data.email || 'john.doe@example.com');
    $('#contact').val(data.contact || '+94 71 234 5678');
    $('#address').val(data.address || '123 Main Street, Colombo 07, Western Province, Sri Lanka');
    $('#emergencyContact').val(data.emergencyContact || '+94 77 987 6543');
    $('#relationship').val(data.relationship || 'parent');

    // Update header information
    $('#displayUserId').text(data.userId || 'EDU001');
    $('#profileName').text(data.name || 'John Doe');
    $('#profileEmail').text(data.email || 'john.doe@example.com');

    // Load profile image if exists
    if (data.profileImg) {
    $('#profileImage').attr('src', data.profileImg).removeClass('hidden');
    $('#defaultAvatar').addClass('hidden');
}

    console.log('Profile data loaded:', data);
},
    error: function(xhr, status, error) {
    $('#errorText').text('Failed to load profile data. Please refresh the page.');
    showMessage('errorMessage');
    console.error('Error loading profile:', error);
},
    complete: function() {
    // Reset button state
    $('#saveBtn').prop('disabled', false).html('<i data-lucide="save" class="w-4 h-4 mr-2 inline"></i>Save Changes');
    lucide.createIcons(); // This is unnecessary but kept here to re-render the dynamic icon
}
});
}

    // Update profile function
    function updateProfile() {
    // Show loading state
    $('#saveBtn').prop('disabled', true).html('<i data-lucide="loader-2" class="w-4 h-4 mr-2 inline animate-spin"></i>Saving...');
    lucide.createIcons(); // This is unnecessary but kept here to re-render the dynamic icon

    // Prepare form data
    const formData = new FormData();
    formData.append('userId', $('#userId').val());
    formData.append('name', $('#name').val());
    formData.append('nic', $('#nic').val());
    formData.append('email', $('#email').val());
    formData.append('contact', $('#contact').val());
    formData.append('address', $('#address').val());
    formData.append('emergencyContact', $('#emergencyContact').val());
    formData.append('relationship', $('#relationship').val());

    // Add profile image if selected
    const profileImageFile = $('#profileImageInput')[0].files[0];
    if (profileImageFile) {
    formData.append('profileImg', profileImageFile);
}

    // AJAX call to update profile
    $.ajax({
    url: '/api/profile/update',
    method: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    success: function(response) {
    // Update header information
    $('#profileName').text($('#name').val());
    $('#profileEmail').text($('#email').val());
    showMessage('successMessage');
    console.log('Profile updated successfully:', response);
},
    error: function(xhr, status, error) {
    let errorMessage = 'Failed to update profile. Please try again.';
    if (xhr.responseJSON && xhr.responseJSON.message) {
    errorMessage = xhr.responseJSON.message;
}
    $('#errorText').text(errorMessage);
    showMessage('errorMessage');
    console.error('Error updating profile:', error);
},
    complete: function() {
    // Reset button state
    $('#saveBtn').prop('disabled', false).html('<i data-lucide="save" class="w-4 h-4 mr-2 inline"></i>Save Changes');
    lucide.createIcons(); // This is unnecessary but kept here to re-render the dynamic icon
}
});
}

    // Auto-hide messages after 5 seconds
    function showMessage(messageId, duration = 5000) {
    $('#' + messageId).removeClass('hidden');
    setTimeout(function() {
    $('#' + messageId).addClass('hidden');
}, duration);
}
});

    // Toggle password visibility
    function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');

    if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.setAttribute('data-lucide', 'eye-off');
} else {
    passwordInput.type = 'password';
    eyeIcon.setAttribute('data-lucide', 'eye');
}
    lucide.createIcons();
}
*/

// *****************************************************************************

/*
$(document).ready(function() {
    // code here runs after the page (DOM) is fully loaded
    lucide.createIcons();


    $('#profileImageInput').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Only allow one image of type JPG, PNG, or WEBP
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                alert("Only JPG, PNG, or WEBP images are allowed.");
                $(this).val(""); // reset input
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                $('#profileImage').attr('src', e.target.result).removeClass('hidden');
                $('#defaultAvatar').addClass('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    $('#profileForm').on('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });

    $('#cancelBtn').on('click', function() {
        if (confirm('Are you sure you want to discard your changes?')) {
            loadProfileData();
        }
    });

    $('input, textarea, select').on('focus', function() {
        $(this).closest('div').prev('label').addClass('text-blue-600');
    });

    $('input, textarea, select').on('blur', function() {
        if (!$(this).val()) {
            $(this).closest('div').prev('label').removeClass('text-blue-600');
        }
    });

});
*/

$(document).ready(function() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Load profile data on page load
    loadProfileData();

    // ===== Image preview =====
    $('#profileImageInput').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Only allow one image of type JPG, PNG, or WEBP
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                alert("Only JPG, PNG, or WEBP images are allowed.");
                $(this).val(""); // reset input
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                $('#profileImage').attr('src', e.target.result).removeClass('hidden');
                $('#defaultAvatar').addClass('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // ===== Form submission =====
    $('#profileForm').on('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });

    // ===== Cancel button =====
    $('#cancelBtn').on('click', function() {
        if (confirm('Are you sure you want to discard your changes?')) {
            loadProfileData();
        }
    });

    // ===== Floating label effect =====
    $('input, textarea, select').on('focus', function() {
        $(this).closest('div').prev('label').addClass('text-blue-600');
    });

    $('input, textarea, select').on('blur', function() {
        if (!$(this).val()) {
            $(this).closest('div').prev('label').removeClass('text-blue-600');
        }
    });

});

const userId = localStorage.getItem("userId");
const userRole = localStorage.getItem("role");
const api = "http://localhost:8080/api/v1/edusphere/users/";

// ===== Load profile data via AJAX =====
function loadProfileData() {
    ajaxWithToken({
        url: `http://localhost:8080/api/v1/edusphere/users/get/${userId}`,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            $('#userId').val(data.userId || '');
            $('#name').val(data.name || '');
            $('#nic').val(data.nic || '');
            $('#email').val(data.email || '');
            $('#contact').val(data.contact || '');
            $('#address').val(data.address || '');
            $('#emergencyContact').val(data.emergencyContact || '');
            $('#relationship').val(data.relationship || '');

            $('#displayUserId').text(data.userId || '');
            $('#profileName').text(data.name || '');
            $('#profileEmail').text(data.email || '');

            if(data.name) {
                const nameParts = data.name.split(" ");
                const firstTwoPartOfName = nameParts.slice(0, 2).join(" "); // "Seenathul Ilma"
                $('#sidebar-profile-name').text(firstTwoPartOfName);
            } else {
                $('#sidebar-profile-name').text("Edusphere Member");
            }

            $('#sidebar-role').text(getRoleDisplayName(userRole));

            if (data.profileImg) {
                $('#profileImage').attr('src', "http://localhost:8080/profiles/" + data.profileImg).removeClass('hidden');
                $('#sidebar-profile-image').attr('src', "http://localhost:8080/profiles/" + data.profileImg).removeClass('hidden');
                $('#defaultAvatar').addClass('hidden');
            } else {
                $('#profileImage').addClass('hidden');
                $('#defaultAvatar').removeClass('hidden');
            }
        },
        error: function(xhr) {
            console.error("Failed to load profile:", xhr.status, xhr.responseText);
            $('#errorText').text('Failed to load profile data.');
            showMessage('errorMessage');
        }
    });
}

// ===== Update profile via AJAX =====
function updateProfile() {
    const formData = new FormData();
    formData.append('userId', $('#userId').val());
    formData.append('name', $('#name').val());
    formData.append('nic', $('#nic').val());
    formData.append('email', $('#email').val());
    formData.append('contact', $('#contact').val());
    formData.append('address', $('#address').val());
    formData.append('emergencyContact', $('#emergencyContact').val());
    formData.append('relationship', $('#relationship').val());

    const profileImageFile = $('#profileImageInput')[0].files[0];
    if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
    }

    ajaxWithToken({
        url: `${api}profile/update/${userRole}/${userId}`,
        method: 'PUT',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            $('#profileName').text($('#name').val());
            $('#profileEmail').text($('#email').val());
            showMessage('successMessage');
            loadProfileData();
        },
        error: function(xhr) {
            let errorMsg = xhr.responseJSON?.message || 'Failed to update profile.';
            $('#errorText').text(errorMsg);
            showMessage('errorMessage');
        }
    });
}

// ===== Show message =====
function showMessage(messageId, duration = 5000) {
    $('#' + messageId).removeClass('hidden');
    setTimeout(() => $('#' + messageId).addClass('hidden'), duration);
}

// ===== Toggle password visibility =====
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        passwordInput.type = 'password';
        eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

function getRoleDisplayName(role) {
    switch(role) {
        case 'ADMIN':
            return 'Administrator';
        case 'TEACHER':
            return 'Educator';
        case 'STUDENT':
            return 'Learner';
        default:
            return 'User';
    }
}
