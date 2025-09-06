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

// Make authenticated AJAX request with automatic token refresh
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


