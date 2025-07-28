const HistoryManager = (() => {
    const STORAGE_KEY = 'chatbot_conversations';
    const MAX_CONVERSATIONS = 50; // Límite de conversaciones guardadas

    let conversations = [];
    let currentConversationId = null;

    /**
     * Inicializa el historial cargando datos del localStorage
     */
    function init() {
        loadFromStorage();
        bindEvents();
    }

    /**
     * Carga las conversaciones desde localStorage
     */
    function loadFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            conversations = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading conversations from storage:', error);
            conversations = [];
        }
    }

    /**
     * Guarda las conversaciones en localStorage
     */
    function saveToStorage() {
        try {
            // Mantener solo las últimas MAX_CONVERSATIONS conversaciones
            if (conversations.length > MAX_CONVERSATIONS) {
                conversations = conversations.slice(-MAX_CONVERSATIONS);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
        } catch (error) {
            console.error('Error saving conversations to storage:', error);
        }
    }

    /**
     * Crea una nueva conversación
     */
    function createNewConversation() {
        const conversation = {
            id: generateId(),
            title: 'Nueva Conversación',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        conversations.push(conversation);
        currentConversationId = conversation.id;
        saveToStorage();
        updateHistoryUI();

        return conversation;
    }

    /**
     * Añade un mensaje a la conversación actual
     */
    function addMessage(content, sender) {
        if (!currentConversationId) {
            createNewConversation();
        }

        const conversation = getCurrentConversation();
        if (!conversation) return;

        const message = {
            id: generateId(),
            content,
            sender,
            timestamp: new Date().toISOString()
        };

        conversation.messages.push(message);
        conversation.updatedAt = new Date().toISOString();

        // Actualizar título si es el primer mensaje del usuario
        if (conversation.messages.length === 1 && sender === 'user') {
            conversation.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        }

        saveToStorage();
        updateHistoryUI();
    }

    /**
     * Obtiene la conversación actual
     */
    function getCurrentConversation() {
        return conversations.find(conv => conv.id === currentConversationId);
    }

    /**
     * Carga una conversación específica
     */
    function loadConversation(conversationId) {
        const conversation = conversations.find(conv => conv.id === conversationId);
        if (!conversation) return null;

        currentConversationId = conversationId;
        return conversation;
    }

    /**
     * Elimina una conversación
     */
    function deleteConversation(conversationId) {
        const index = conversations.findIndex(conv => conv.id === conversationId);
        if (index !== -1) {
            conversations.splice(index, 1);
            saveToStorage();
            updateHistoryUI();

            // Si se eliminó la conversación actual, crear una nueva
            if (conversationId === currentConversationId) {
                currentConversationId = null;
                return createNewConversation();
            }
        }
        return null;
    }

    /**
     * Elimina todo el historial
     */
    function clearAllHistory() {
        if (confirm('¿Estás seguro de que quieres eliminar todo el historial? Esta acción no se puede deshacer.')) {
            conversations = [];
            currentConversationId = null;
            saveToStorage();
            updateHistoryUI();
            return true;
        }
        return false;
    }

    /**
     * Exporta el historial como JSON
     */
    function exportHistory() {
        const dataStr = JSON.stringify(conversations, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `chatbot_history_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    /**
     * Actualiza la interfaz del historial
     */
    function updateHistoryUI() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        if (conversations.length === 0) {
            historyList.innerHTML = '<div style="text-align: center; color: #bdc3c7; padding: 20px;">No hay conversaciones guardadas</div>';
            return;
        }

        // Ordenar conversaciones por fecha de actualización (más recientes primero)
        const sortedConversations = [...conversations].sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        sortedConversations.forEach(conversation => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            if (conversation.id === currentConversationId) {
                historyItem.style.background = 'rgba(52, 152, 219, 0.3)';
            }

            const preview = conversation.messages.length > 0
                ? conversation.messages[conversation.messages.length - 1].content.substring(0, 50) + '...'
                : 'Sin mensajes';

            historyItem.innerHTML = `
        <div class="history-item-title">${conversation.title}</div>
        <div class="history-item-date">${formatDate(conversation.updatedAt)}</div>
        <div class="history-item-preview">${preview}</div>
      `;

            historyItem.addEventListener('click', () => {
                const conv = loadConversation(conversation.id);
                if (conv && window.ChatController) {
                    window.ChatController.loadConversationMessages(conv);
                }
                ChatView.toggleHistoryPanel();
            });

            historyList.appendChild(historyItem);
        });
    }

    /**
     * Vincula eventos de la interfaz
     */
    function bindEvents() {
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        const exportHistoryBtn = document.getElementById('export-history-btn');

        clearHistoryBtn.addEventListener('click', () => {
            if (clearAllHistory()) {
                ChatView.showMessage('Historial eliminado', 'info');
            }
        });

        exportHistoryBtn.addEventListener('click', () => {
            exportHistory();
            ChatView.showMessage('Historial exportado', 'info');
        });
    }

    /**
     * Genera un ID único
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Formatea una fecha para mostrar
     */
    function formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ayer';
        } else if (diffDays < 7) {
            return `Hace ${diffDays} días`;
        } else {
            return date.toLocaleDateString('es-ES');
        }
    }

    /**
     * Obtiene todas las conversaciones
     */
    function getAllConversations() {
        return conversations;
    }

    /**
     * Obtiene el ID de la conversación actual
     */
    function getCurrentConversationId() {
        return currentConversationId;
    }

    return {
        init,
        createNewConversation,
        addMessage,
        getCurrentConversation,
        loadConversation,
        deleteConversation,
        clearAllHistory,
        exportHistory,
        updateHistoryUI,
        getAllConversations,
        getCurrentConversationId
    };
})();
