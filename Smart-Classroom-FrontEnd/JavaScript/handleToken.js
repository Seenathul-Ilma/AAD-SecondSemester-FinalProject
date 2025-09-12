// -------------------- Helper Functions --------------------

// Get tokens from localStorage
function getAccessToken() {
    return localStorage.getItem("accessToken");
}

function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

// Save new access token
function saveAccessToken(token) {
    localStorage.setItem("accessToken", token);
}

// Refresh access token
function refreshAccessToken() {
    return $.ajax({
        url: "http://localhost:8080/api/v1/auth/refresh",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ refreshToken: getRefreshToken() })
    }).done(function(response) {
        saveAccessToken(response.accessToken);
    });
}

// ====================== Token Refresh ======================
/*function refreshAccessToken() {
    return $.ajax({
        url: "http://localhost:8080/api/v1/auth/refresh",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") })
    }).done(function(response) {
        localStorage.setItem("accessToken", response.accessToken);
    });
}*/

// ====================== AJAX with Token ======================
function ajaxWithToken(options) {
    const accessToken = localStorage.getItem("accessToken");
    options.headers = options.headers || {};
    options.headers["Authorization"] = "Bearer " + accessToken;

    const originalError = options.error;
    options.error = function(xhr, status, error) {
        if (xhr.status === 401) {
            refreshAccessToken().done(function() {
                ajaxWithToken(options); // retry original request
            }).fail(function() {
                showMessage("error", "Session expired. Please log in again.");
                window.location.href = "login.html";
            });
        } else if (xhr.status === 403) {
            // Forbidden -> action-specific
            showMessage("warning", xhr.responseJSON?.message || "You don’t have permission to perform this action.");
        } else if (xhr.status === 400) {
            // Validation issue
            showMessage("warning", xhr.responseJSON?.message || "Please fill all required fields correctly.");
        } else if (xhr.status === 409) {
            // Conflict (e.g. duplicate email)
            showMessage("error", xhr.responseJSON?.message || "This email is already registered.");
        } else if (xhr.status >= 500) {
            showMessage("error", "Unexpected server error. Please try again later.");
        } else if (originalError) {
            originalError(xhr, status, error);
        }
    };

    return $.ajax(options);
}


// Make authenticated AJAX request with automatic token refresh
/*
function ajaxWithToken(options) {
    const accessToken = localStorage.getItem("accessToken");
    options.headers = options.headers || {};
    options.headers["Authorization"] = "Bearer " + accessToken;

    const originalError = options.error;
    options.error = function(xhr, status, error) {
        if (xhr.status === 401 || xhr.status === 403) {
            // Token expired refresh and retry
            refreshAccessToken().done(function() {
                ajaxWithToken(options); // retry original request
            }).fail(function() {
                alert("Session expired. Please log in again.");
                window.location.href = "login.html";
            });
        } else if (originalError) {
            originalError(xhr, status, error);
        }
    };

    return $.ajax(options);
}
*/


