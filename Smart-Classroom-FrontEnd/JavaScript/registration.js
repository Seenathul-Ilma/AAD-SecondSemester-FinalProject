

    document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
});

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

    document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Hide previous messages
    const successDiv = document.getElementById('successMessage');
    const errorDiv = document.getElementById('errorMessage');
    successDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    // Basic validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const token = document.getElementById('token').value.trim();
    const password = document.getElementById('password').value.trim();
    const terms = document.getElementById('terms').checked;

    if (!name || !email || !token || !password || !terms) {
    errorDiv.textContent = 'Please fill in all fields and accept the terms and conditions.';
    errorDiv.classList.remove('hidden');
    return;
}

    if (password.length < 8) {
    errorDiv.textContent = 'Password must be at least 8 characters long.';
    errorDiv.classList.remove('hidden');
    return;
}

    // DTO payload
    const payload = { name, email, token, password, role: 'TEACHER' };

    // Send AJAX request
    $.ajax({
    url: "http://localhost:8080/api/v1/auth/register",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload),
    dataType: "json",
    success: function(response) {
        successDiv.textContent = response.message || 'Registration successful!';
        successDiv.classList.remove('hidden');
        successDiv.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('registrationForm').reset();
        lucide.createIcons();
        console.log('Registration successful:', response);

        // Redirect after small delay
        setTimeout(() => {
            window.location.href = "../login.html";
        }, 1000);

    },
    error: function(xhr) {
        let errorMessage = "An error occurred. Please try again.";
        try {
        const responseJSON = JSON.parse(xhr.responseText);
        if (responseJSON && responseJSON.message) {
        errorMessage = responseJSON.message;
    }
    } catch (e) {
        console.error("Error parsing JSON response:", e);
    }
        errorDiv.textContent = errorMessage;
        errorDiv.classList.remove('hidden');
        errorDiv.scrollIntoView({ behavior: 'smooth' });
        //console.error("Registration error:", xhr.responseText);
    }
    });
    });

    // Floating label effect
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.parentElement.querySelector('label').classList.add('text-blue-600');
    });
    input.addEventListener('blur', function() {
    if (!this.value) {
    this.parentElement.parentElement.querySelector('label').classList.remove('text-blue-600');
}
});
});
