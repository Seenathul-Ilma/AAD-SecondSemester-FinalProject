// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();
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

// Handle login form submit
$("#loginForm").submit(function (e) {
    e.preventDefault();

    // Hide messages
    $("#successMessage").addClass("hidden");
    $("#errorMessage").addClass("hidden");

    // Collect form data
    const email = $("#email").val();
    const password = $("#password").val();

    if (!email || !password) {
        $("#errorText").text("Please fill in all fields.");
        $("#errorMessage").removeClass("hidden");
        return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        $("#errorText").text("Please enter a valid email address.");
        $("#errorMessage").removeClass("hidden");
        return;
    }

    // Button loading state
    const loginButton = $(this).find('button[type="submit"]');
    const originalText = loginButton.html();
    loginButton.html('<i data-lucide="loader-2" class="w-5 h-5 mr-2 animate-spin"></i>Signing In...')
        .prop("disabled", true);
    lucide.createIcons();

    // Send login request
    $.ajax({
        url: "http://localhost:8080/api/v1/auth/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ email, password }),
        success: function (response) {
            const token = response.data?.accessToken || response.data?.token;
            const role = response.data?.role; // <-- capture role from backend

            if (token && role) {
                localStorage.setItem("accessToken", token);
                localStorage.setItem("email", email);
                localStorage.setItem("role", role); // store role for later
            }
            console.log("Token:", token, "Role:", role);

            $("#successMessage").removeClass("hidden");
            $("#loginForm")[0].reset();

            // Redirect based on role
            setTimeout(() => {
                if (role === "ADMIN") {
                    window.location.href = "adminDashboard.html";
                } else if (role === "TEACHER") {
                    window.location.href = "teacher.html";
                } else {
                    window.location.href = "student.html"; // default
                }
            }, 1000);
        },
        /*success: function (response) {
            const token = response.data?.accessToken || response.data?.token;
            if (token) {
                localStorage.setItem("accessToken", token);
                localStorage.setItem("email", email);
            }
            console.log("Token: "+ token)

            $("#successMessage").removeClass("hidden");
            $("#loginForm")[0].reset();

            // Redirect after small delay
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        },*/
        error: function (xhr) {
            const message = xhr.responseJSON?.message || "Login failed!";
            $("#errorText").text(message);
            $("#errorMessage").removeClass("hidden");
        },
        complete: function () {
            // Reset button
            loginButton.html(originalText).prop("disabled", false);
            lucide.createIcons();
        }
    });
});

// Floating label effect
document.querySelectorAll('input[type="email"], input[type="password"]').forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.parentElement.querySelector('label').classList.add('text-blue-600');
    });
    input.addEventListener('blur', function () {
        if (!this.value) {
            this.parentElement.parentElement.querySelector('label').classList.remove('text-blue-600');
        }
    });
});
