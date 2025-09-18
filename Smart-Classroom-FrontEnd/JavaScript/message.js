// ====================== Global Variables ======================
let stompClient = null;
let currentConversationId = null;
let receiverId = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let reconnectTimeout = null;

// ====================== Helper Functions ======================
function appendMessageToChat(message) {
    const messagesContainer = document.getElementById("messagesContainer");
    if (!messagesContainer) return;

    const messageDiv = document.createElement("div");
    const currentUserId = localStorage.getItem("userId");
    const isUser = message.senderId === currentUserId;

    // Fallback timestamp if not provided
    const timestamp = message.timestamp
        ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    messageDiv.className = `flex items-start space-x-3 message-enter ${isUser ? "justify-end" : ""}`;

    if (isUser) {
        messageDiv.innerHTML = `
            <div class="flex-1 text-right">
                <div class="flex items-center justify-end space-x-2 mb-1">
                    <span class="text-xs text-gray-500 dark:text-gray-400">${timestamp}</span>
                    <span class="text-sm font-semibold text-gray-800 dark:text-white">You</span>
                </div>
                <div class="message-bubble bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl rounded-tr-md px-4 py-3 shadow-sm inline-block max-w-md break-words">
                    <p class="text-white">${escapeHtml(message.content)}</p>
                </div>
            </div>
            <div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i data-lucide="user" class="w-5 h-5 text-gray-600 dark:text-gray-300"></i>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i data-lucide="user" class="w-5 h-5 text-white"></i>
            </div>
            <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                    <span class="text-sm font-semibold text-gray-800 dark:text-white">${message.senderName || "User"}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">${timestamp}</span>
                </div>
                <div class="message-bubble bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md break-words">
                    <p class="text-gray-800 dark:text-gray-200">${escapeHtml(message.content)}</p>
                </div>
            </div>
        `;
    }

    messagesContainer.appendChild(messageDiv);
    //messagesContainer.scrollTop = messagesContainer.scrollHeight; // auto scroll
    lucide.createIcons();
    window.requestAnimationFrame(() => {
        console.log("request animation frame");
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
        console.log("requested animation frame");
    });
}

// Simple XSS protection
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (match) => {
        const escapeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
        return escapeMap[match];
    });
}


function appendMessageToCfhat(message) {
    const chatBox = document.getElementById("messagesContainer");
    if (!chatBox) return;

    const div = document.createElement("div");
    div.className = `message-bubble p-3 rounded-xl max-w-[60%] ${
        message.senderId === localStorage.getItem("userId")
            ? "ml-auto bg-blue-600 text-white"
            : "mr-auto bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
    } message-enter`;
    div.textContent = message.content;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showMessage(type, text, duration = 5000) {
    let messageId, textId;

    if (type === "success") {
        messageId = "successMessage";
        textId = "successText";
    } else if (type === "error") {
        messageId = "errorMessage";
        textId = "errorText";
    } else if (type === "warning") {
        messageId = "warningMessage";
        textId = "warningText";
    }

    const $msg = $("#" + messageId);
    if (textId) $("#" + textId).text(text);

    if ($msg.data("timer")) clearTimeout($msg.data("timer"));

    $msg.removeClass("hidden");

    const timer = setTimeout(() => $msg.addClass("hidden"), duration);
    $msg.data("timer", timer);

    if (window.lucide?.createIcons) lucide.createIcons();
}

// ====================== WebSocket Connection ======================
function connectWebSocket() {
    if (!currentConversationId || !receiverId) return;

    const socket = new SockJS("http://localhost:8080/ws");
    stompClient = Stomp.over(socket);
    stompClient.debug = (str) => console.log("STOMP:", str);

    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    const headers = { Authorization: "Bearer " + token };

    stompClient.connect(
        headers,
        (frame) => {
            console.log("✅ WebSocket connected:", frame);
            reconnectAttempts = 0;
            if (reconnectTimeout) clearTimeout(reconnectTimeout);

            // Subscribe to messages
            stompClient.subscribe("/user/queue/messages", (msg) => {
                try {
                    const message = JSON.parse(msg.body);
                    if (message.conversationId == currentConversationId) {
                        appendMessageToChat(message);
                    }
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            });

            // Subscribe to typing indicators
            stompClient.subscribe("/user/queue/typing", (msg) => {
                try {
                    const typing = JSON.parse(msg.body);
                    console.log("Typing:", typing);
                } catch (err) {
                    console.error("Error parsing typing indicator:", err);
                }
            });
        },
        (error) => {
            console.error("❌ WebSocket error:", error);
            handleReconnect();
        }
    );

    socket.onclose = handleReconnect;
    socket.onerror = handleReconnect;
}

// ====================== Reconnection ======================
function handleReconnect() {
    if (reconnectAttempts >= maxReconnectAttempts) {
        alert("Connection lost. Please refresh the page.");
        return;
    }
    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(connectWebSocket, delay);
}

// ====================== Send Message ======================
function sendMessage() {
    const inputEl = document.getElementById("messageInput");
    if (!inputEl) return;

    const content = inputEl.value.trim();
    if (!content) return;

    const message = {
        conversationId: currentConversationId,
        senderId: localStorage.getItem("userId"),
        receiverId: receiverId,
        content
    };

    // WebSocket
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));
    }

    // REST fallback
    ajaxWithToken({
        url: `http://localhost:8080/api/v1/edusphere/message/conversations/${currentConversationId}/messages`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ receiverId, content }),
        success: (data) => {
            appendMessageToChat({ senderId: localStorage.getItem("userId"), content });
            console.log("Message saved via REST:", data);
        },
        error: (xhr) => {
            console.error("Failed to save message via REST:", xhr.responseText || xhr);
            showMessage("error", "Failed to send message.");
        }
    });

    inputEl.value = "";
}

// ====================== Typing Indicator ======================
function sendTyping(isTyping) {
    if (!stompClient || !stompClient.connected) return;
    const typingData = { conversationId: currentConversationId, receiverId, isTyping };
    stompClient.send("/app/chat.typing", {}, JSON.stringify(typingData));
}

// ====================== Load Messages ======================
function loadExistingMessages() {
    ajaxWithToken({
        url: `http://localhost:8080/api/v1/edusphere/message/conversations/${currentConversationId}`,
        method: "GET",
        success: (data) => {
            if (data.messages && Array.isArray(data.messages)) {
                data.messages.forEach((msg) => appendMessageToChat(msg));
            }
        },
        error: (xhr) => {
            console.error("Failed to load messages:", xhr.responseText || xhr);
        }
    });
}

// ====================== Connection Status ======================
function updateConnectionStatus() {
    const statusEl = document.getElementById("connectionStatus");
    if (!statusEl) return;

    if (stompClient && stompClient.connected) {
        statusEl.textContent = "🟢 Connected";
        statusEl.className = "bg-green-100 text-green-800 px-3 py-1 rounded";
    } else if (reconnectAttempts > 0) {
        statusEl.textContent = `🟡 Reconnecting (${reconnectAttempts})`;
        statusEl.className = "bg-yellow-100 text-yellow-800 px-3 py-1 rounded";
    } else {
        statusEl.textContent = "🔴 Disconnected";
        statusEl.className = "bg-red-100 text-red-800 px-3 py-1 rounded";
    }
}
setInterval(updateConnectionStatus, 5000);

// ====================== Page Initialization ======================
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    const params = new URLSearchParams(window.location.search);
    currentConversationId = params.get("conversationId");
    receiverId = params.get("receiverId");

    if (!currentConversationId || !receiverId) {
        console.warn("No conversation selected. Show 'Start New Conversation' button.");
        document.getElementById("inputArea")?.classList.add("hidden");
        document.getElementById("welcomeMessage")?.classList.remove("hidden");
        return;
    } else {
        document.getElementById("inputArea")?.classList.remove("hidden");
        document.getElementById("welcomeMessage")?.classList.add("hidden");
    }

    connectWebSocket();
    loadExistingMessages();

    const sendBtn = document.getElementById("sendButton");
    const inputEl = document.getElementById("messageInput");

    if (sendBtn && inputEl) {
        sendBtn.addEventListener("click", sendMessage);
        inputEl.addEventListener("input", () => sendTyping(inputEl.value.length > 0));
        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// ====================== Cleanup ======================
window.addEventListener("beforeunload", () => {
    if (stompClient && stompClient.connected) stompClient.disconnect();
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
});


/*
// ====================== Global Variables ======================
let stompClient = null;
let currentConversationId = null;
let receiverId = null;

// ====================== Helper Functions ======================
function appendMessageToChat(message) {
    const chatBox = document.getElementById("messagesContainer");
    const div = document.createElement("div");
    div.className = `message-bubble p-3 rounded-xl max-w-[60%] ${
        message.senderId === localStorage.getItem("userId")
            ? "ml-auto bg-blue-600 text-white"
            : "mr-auto bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
    } message-enter`;
    div.textContent = message.content;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}


// ====================== WebSocket Connection with Token Refresh ======================
function connectWebSocket() {
    const socket = new SockJS("http://localhost:8080/ws");
    stompClient = Stomp.over(socket);

    console.log("AccessToken: " +localStorage.getItem("accessToken"))

    function connectWithToken() {
        const accessToken = localStorage.getItem("accessToken");
        const headers = {
            Authorization: "Bearer " + accessToken
        };

        stompClient.connect(
            headers,
            () => {
                console.log("Connected to WebSocket");

                // Subscribe to messages topic
                stompClient.subscribe("/user/queue/messages", (msgOutput) => {
                    const message = JSON.parse(msgOutput.body);
                    if (message.conversationId == currentConversationId) {
                        appendMessageToChat(message);
                    }
                });

                /!*stompClient.subscribe("/topic/messages", (msgOutput) => {
                    const message = JSON.parse(msgOutput.body);
                    if (message.conversationId == currentConversationId) {
                        appendMessageToChat(message);
                    }
                });*!/
            },
            (err) => {
                console.error("WebSocket connection error:", err);

                // Token expired / 403
                if (err && err.includes && err.includes("403")) {
                    console.warn("Token expired, refreshing and retrying WebSocket...");
                    refreshAccessToken().done(() => {
                        connectWithToken(); // Retry connection after refreshing
                    }).fail(() => {
                        alert("Session expired. Please log in again.");
                        window.location.href = "login.html";
                    });
                }
            }
        );
    }

    connectWithToken(); // Initial connection attempt
}

// ====================== Send Message ======================
function sendMessage() {
    const content = document.getElementById("messageInput").value.trim();
    if (!content) return;

    const message = {
        conversationId: currentConversationId,
        senderId: localStorage.getItem("userId"),
        receiverId: receiverId,
        content: content
    };

    // Send via WebSocket if connected
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));
    }

    // Save via REST
    ajaxWithToken({
        url: `http://localhost:8080/api/v1/edusphere/message/conversations/${currentConversationId}/messages`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ receiverId, content }),
        success: function(data) {
            console.log("Message saved via REST:", data);
            // Optionally append immediately if backend doesn’t push WebSocket
            appendMessageToChat({ senderId: localStorage.getItem("userId"), content });
            console.log("Content: "+ content);
        },
        error: function(xhr) {
            console.error("Failed to save message via REST:", xhr.responseText || xhr);
        }
    });

    document.getElementById("messageInput").value = "";
}

// ====================== Load Existing Messages ======================
function loadExistingMessages() {
    ajaxWithToken({
        url: `http://localhost:8080/api/v1/edusphere/message/conversations/${currentConversationId}`,
        method: "GET",
        success: function(data) {
            if (data.messages && Array.isArray(data.messages)) {
                data.messages.forEach(msg => appendMessageToChat(msg));
            }
        },
        error: function(xhr) {
            console.error("Failed to load messages:", xhr.responseText || xhr);
        }
    });
}

// ====================== Page Load ======================
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    // Get conversationId & receiverId from URL params
    const urlParams = new URLSearchParams(window.location.search);
    currentConversationId = urlParams.get("conversationId");
    receiverId = urlParams.get("receiverId");

    if (!currentConversationId || !receiverId) {
        alert("Invalid conversation. Please go back and try again.");
        return;
    }

    // Show input area & hide welcome message
    document.getElementById("inputArea").classList.remove("hidden");
    document.getElementById("welcomeMessage").style.display = "none";

    // Connect to WebSocket
    connectWebSocket();

    // Load existing messages
    loadExistingMessages();

    // Bind send button
    document.getElementById("sendButton").addEventListener("click", sendMessage);

    // Send message on Enter key
    document.getElementById("messageInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});

*/



/*

class EduSphereAPI {
    constructor(baseURL = 'http://localhost:8080/api/v1/edusphere') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Get request headers with authentication
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : '',
        };
    }

    // Generic API request method
    async apiRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: this.getHeaders(),
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Message Service Methods
    async getConversations() {
        return await this.apiRequest('/message/conversations');
    }

    async getConversation(conversationId) {
        return await this.apiRequest(`/message/conversations/${conversationId}`);
    }

    async createConversation(receiverId, content) {
        return await this.apiRequest('/message/conversations', {
            method: 'POST',
            body: JSON.stringify({
                receiverId: receiverId,
                content: content
            })
        });
    }

    async sendMessage(conversationId, receiverId, content) {
        return await this.apiRequest(`/message/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                receiverId: receiverId,
                content: content
            })
        });
    }

    async markMessageAsRead(messageId) {
        return await this.apiRequest(`/message/messages/${messageId}/read`, {
            method: 'PATCH'
        });
    }

    // User Service Methods (assuming you have these endpoints)
    async getUsers() {
        return await this.apiRequest('/users');
    }

    async getUserById(userId) {
        return await this.apiRequest(`/users/${userId}`);
    }
}

// Chat Application Class
class ChatApp {
    constructor() {
        this.api = new EduSphereAPI();
        this.currentConversationId = null;
        this.currentReceiverId = null;
        this.conversations = [];
        this.users = [];

        this.initializeElements();
        this.bindEvents();
        this.loadConversations();
    }

    initializeElements() {
        // Get DOM elements
        this.conversationsList = document.getElementById('conversationsList');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.messageForm = document.getElementById('messageForm');
        this.sendButton = document.getElementById('sendButton');
        this.newConversationBtn = document.getElementById('newConversationBtn');
        this.startConversationBtn = document.getElementById('startConversationBtn');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.inputArea = document.getElementById('inputArea');
        this.currentConversationTitle = document.getElementById('currentConversationTitle');
        this.conversationStatus = document.getElementById('conversationStatus');
    }

    bindEvents() {
        // Message form submission
        this.messageForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // New conversation buttons
        this.newConversationBtn?.addEventListener('click', () => {
            this.showNewConversationDialog();
        });

        this.startConversationBtn?.addEventListener('click', () => {
            this.showNewConversationDialog();
        });

        // Auto-resize textarea
        this.messageInput?.addEventListener('input', () => {
            this.autoResizeTextarea();
        });

        // Enable/disable send button based on input
        this.messageInput?.addEventListener('input', () => {
            this.toggleSendButton();
        });
    }

    async loadConversations() {
        try {
            const response = await this.api.getConversations();
            if (response.status === 200) {
                this.conversations = response.data;
                this.renderConversations();
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
            this.showError('Failed to load conversations');
        }
    }

    renderConversations() {
        if (!this.conversationsList) return;

        this.conversationsList.innerHTML = '';

        this.conversations.forEach(conversation => {
            const conversationEl = this.createConversationElement(conversation);
            this.conversationsList.appendChild(conversationEl);
        });
    }

    createConversationElement(conversation) {
        const div = document.createElement('div');
        div.className = `conversation-item p-4 rounded-lg cursor-pointer transition-colors ${
            this.currentConversationId === conversation.id ? 'conversation-active' : ''
        }`;

        // Get the other participant's name
        const otherParticipant = conversation.senderId !== this.getCurrentUserId()
            ? conversation.senderId
            : conversation.receiverId;

        const lastMessage = conversation.messages?.length > 0
            ? conversation.messages[conversation.messages.length - 1]
            : null;

        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    ${this.getInitials(otherParticipant)}
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-gray-900 dark:text-white truncate">${otherParticipant}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                        ${lastMessage ? lastMessage.content : 'No messages yet'}
                    </p>
                </div>
                ${conversation.unreadCount ? `<span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">${conversation.unreadCount}</span>` : ''}
            </div>
        `;

        div.addEventListener('click', () => {
            this.selectConversation(conversation);
        });

        return div;
    }

    async selectConversation(conversation) {
        this.currentConversationId = conversation.id;
        this.currentReceiverId = conversation.senderId !== this.getCurrentUserId()
            ? conversation.senderId
            : conversation.receiverId;

        // Update UI
        this.updateConversationHeader(conversation);
        this.showChatInterface();

        // Load messages
        await this.loadMessages(conversation.id);

        // Update conversation list active state
        this.renderConversations();
    }

    async loadMessages(conversationId) {
        try {
            const response = await this.api.getConversation(conversationId);
            if (response.status === 200) {
                const conversation = response.data;
                this.renderMessages(conversation.messages || []);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
            this.showError('Failed to load messages');
        }
    }

    renderMessages(messages) {
        if (!this.messagesContainer) return;

        this.messagesContainer.innerHTML = '';

        messages.forEach(message => {
            const messageEl = this.createMessageElement(message);
            this.messagesContainer.appendChild(messageEl);
        });

        // Scroll to bottom
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const div = document.createElement('div');
        const isOwnMessage = message.senderId === this.getCurrentUserId();

        div.className = `message-enter flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`;

        div.innerHTML = `
            <div class="message-bubble max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
            isOwnMessage
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600'
        }">
                <p class="text-sm">${this.escapeHtml(message.content)}</p>
                <p class="text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}">
                    ${message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Now'}
                </p>
            </div>
        `;

        return div;
    }

    async sendMessage() {
        const content = this.messageInput?.value.trim();
        if (!content || !this.currentConversationId || !this.currentReceiverId) return;

        try {
            // Disable send button
            this.sendButton.disabled = true;

            const response = await this.api.sendMessage(
                this.currentConversationId,
                this.currentReceiverId,
                content
            );

            if (response.status === 201) {
                // Clear input
                this.messageInput.value = '';
                this.autoResizeTextarea();

                // Reload messages
                await this.loadMessages(this.currentConversationId);

                // Update conversations list
                await this.loadConversations();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            this.showError('Failed to send message');
        } finally {
            this.sendButton.disabled = false;
            this.toggleSendButton();
        }
    }

    async showNewConversationDialog() {
        // Simple prompt for demo - replace with proper modal
        const receiverId = prompt('Enter user ID to start conversation with:');
        const message = prompt('Enter your message:');

        if (receiverId && message) {
            try {
                const response = await this.api.createConversation(receiverId, message);
                if (response.status === 201) {
                    // Reload conversations
                    await this.loadConversations();

                    // Select the new conversation
                    const newConversation = response.data;
                    await this.selectConversation(newConversation);
                }
            } catch (error) {
                console.error('Failed to create conversation:', error);
                this.showError('Failed to create conversation');
            }
        }
    }

    updateConversationHeader(conversation) {
        const otherParticipant = conversation.senderId !== this.getCurrentUserId()
            ? conversation.senderId
            : conversation.receiverId;

        if (this.currentConversationTitle) {
            this.currentConversationTitle.textContent = otherParticipant;
        }

        if (this.conversationStatus) {
            this.conversationStatus.textContent = 'Online'; // You can implement real status
        }
    }

    showChatInterface() {
        if (this.welcomeMessage) {
            this.welcomeMessage.style.display = 'none';
        }
        if (this.inputArea) {
            this.inputArea.classList.remove('hidden');
        }
    }

    autoResizeTextarea() {
        if (this.messageInput) {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        }
    }

    toggleSendButton() {
        if (this.sendButton && this.messageInput) {
            this.sendButton.disabled = !this.messageInput.value.trim();
        }
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    getCurrentUserId() {
        // Replace with actual user ID from authentication
        return localStorage.getItem('currentUserId') || 'current-user';
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        // Simple error display - replace with proper notification system
        alert(message);
    }
}

// Authentication helper
class AuthManager {
    static async login(email, password) {
        try {
            const response = await fetch('http://localhost:8080/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUserId', data.userId);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    static logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUserId');
        window.location.href = '/login.html';
    }

    static isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }
}

// Initialize the chat application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    // Check authentication
    if (!AuthManager.isAuthenticated()) {
        // Redirect to login page or show login form
        console.warn('User not authenticated');
        return;
    }

    // Initialize chat app
    window.chatApp = new ChatApp();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Export for use in other files
window.EduSphereAPI = EduSphereAPI;
window.AuthManager = AuthManager;*/
