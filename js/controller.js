const ChatController = ((model, view) => {
  async function handleSend() {
    const userMessage = view.getInput().trim();
    if (!userMessage) return;

    // Agregar mensaje del usuario al historial
    HistoryManager.addMessage(userMessage, "user");

    view.appendMessage(userMessage, "user");

    // Obtener respuesta del bot
    const botReply = model.getResponse(userMessage);

    // Agregar respuesta del bot al historial
    HistoryManager.addMessage(botReply, "bot");

    view.appendMessage(botReply, "bot");
    view.clearInput();

    // Actualizar título de la conversación actual
    updateChatTitle();
  }

  function handleNewChat() {
    // Guardar conversación actual si tiene mensajes
    const currentConv = HistoryManager.getCurrentConversation();

    // Crear nueva conversación
    const newConv = HistoryManager.createNewConversation();

    // Limpiar la vista
    view.clearChat();
    view.setChatTitle(newConv.title);

    view.showMessage("Nueva conversación iniciada", "info");
  }

  function handleHistoryToggle() {
    view.toggleHistoryPanel();
  }

  function loadConversationMessages(conversation) {
    // Limpiar chat actual
    view.clearChat();

    // Cargar mensajes de la conversación
    conversation.messages.forEach(message => {
      view.appendMessage(message.content, message.sender);
    });

    // Actualizar título
    view.setChatTitle(conversation.title);

    view.showMessage(`Conversación "${conversation.title}" cargada`, "info");
  }

  function updateChatTitle() {
    const currentConv = HistoryManager.getCurrentConversation();
    if (currentConv) {
      view.setChatTitle(currentConv.title);
    }
  }

  async function init() {
    try {
      // Cargar base de conocimiento
      await model.loadKnowledge();

      // Inicializar historial
      HistoryManager.init();

      // Crear conversación inicial si no existe
      if (!HistoryManager.getCurrentConversationId()) {
        const newConv = HistoryManager.createNewConversation();
        view.setChatTitle(newConv.title);
      } else {
        updateChatTitle();
      }

      // Vincular eventos
      view.bindSend(handleSend);
      view.bindNewChat(handleNewChat);
      view.bindHistoryToggle(handleHistoryToggle);

      view.showMessage("¡Hola! Soy el asistente virtual de la Fundación con Cristo. Puedo ayudarte con información sobre nuestra misión, proyectos, servicios y más. ¿En qué puedo ayudarte?", "info");

    } catch (error) {
      console.error('Error initializing chat:', error);
      view.showMessage("Error al inicializar el chatbot", "error");
    }
  }

  // Exponer funciones globalmente para el historial
  window.ChatController = {
    loadConversationMessages,
    init
  };

  return {
    init,
    loadConversationMessages
  };
})(ChatModel, ChatView);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  ChatController.init();
});

