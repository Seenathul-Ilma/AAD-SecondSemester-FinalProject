document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons();
});

// Elements
const chatModal = document.getElementById('chatModal');
const chatWithName = document.getElementById('chatWithName');
const closeChat = document.getElementById('closeChat');
const chatContainerModal = chatModal.querySelector('.chat-container');
const messageInputModal = document.getElementById('messageInputModal');
const sendMessageModal = document.getElementById('sendMessageModal');

// Function to add message to chat modal
function addMessageModal(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-animation flex items-start gap-2 ${isUser ? 'justify-end' : ''}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isUser) {
        messageDiv.innerHTML = `
            <div class="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-sm max-w-[80%]">
                <p>${text}</p>
                <p class="text-xs text-blue-100 mt-1">${timestamp}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="bg-white dark:bg-gray-600 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
                <p class="text-gray-800 dark:text-gray-100">${text}</p>
                <p class="text-xs text-gray-500 dark:text-gray-300 mt-1">${timestamp}</p>
            </div>
        `;
    }

    chatContainerModal.appendChild(messageDiv);
    chatContainerModal.scrollTop = chatContainerModal.scrollHeight;
}

// Open chat modal for specific teacher
document.querySelectorAll('.start-chat').forEach(btn => {
    btn.addEventListener('click', function() {
        const teacherRow = btn.closest('tr');
        const teacherName = teacherRow.querySelectorAll('td')[2].textContent; // Assuming 3rd column is name
        chatWithName.textContent = teacherName;

        chatModal.classList.remove('hidden');
        chatContainerModal.innerHTML = ''; // Clear previous messages if any
    });
});

// Close modal
closeChat.addEventListener('click', () => {
    chatModal.classList.add('hidden');
});
