document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons(); // Initialize icons

    loadDataPaginated(1, default_page_size);

    // Set user information
    document.getElementById("assignmentUserName").textContent = userName;
    document.getElementById("userInitials").textContent =
        getUserInitials(userName);
    console.log("Initials: " + userName);

    // Update class info if classroomId is available
    if (classroomId) {
        document.getElementById(
            "assignmentClassInfo"
        ).textContent = `Assigning to: Classroom ${classroomId}`;
    }
});