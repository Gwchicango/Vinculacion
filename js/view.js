const ChatView = (() => {
  const chatWindow = document.getElementById("chat-window");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const historyBtn = document.getElementById("history-btn");
  const newChatBtn = document.getElementById("new-chat-btn");
  const historyPanel = document.getElementById("history-panel");
  const closeHistoryBtn = document.getElementById("close-history-btn");
  const currentChatTitle = document.getElementById("current-chat-title");

  function appendMessage(message, sender = "user") {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = `${message}`;
    msgDiv.className = `message ${sender}`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function clearChat() {
    chatWindow.innerHTML = "";
  }

  function getInput() {
    return userInput.value;
  }

  function clearInput() {
    userInput.value = "";
  }

  function bindSend(handler) {
    sendBtn.addEventListener("click", handler);
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handler();
    });
  }

  function bindNewChat(handler) {
    newChatBtn.addEventListener("click", handler);
  }

  function bindHistoryToggle(handler) {
    historyBtn.addEventListener("click", handler);
    closeHistoryBtn.addEventListener("click", handler);
  }

  function toggleHistoryPanel() {
    historyPanel.classList.toggle("hidden");
  }

  function setChatTitle(title) {
    currentChatTitle.textContent = title;
  }

  function showMessage(text, type = "info") {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = text;
    msgDiv.className = `message system ${type}`;
    msgDiv.style.background = type === "error" ? "#e74c3c" : "#f39c12";
    msgDiv.style.color = "white";
    msgDiv.style.alignSelf = "center";
    msgDiv.style.fontSize = "12px";
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (msgDiv.parentNode) {
        msgDiv.parentNode.removeChild(msgDiv);
      }
    }, 3000);
  }

  return {
    appendMessage,
    clearChat,
    getInput,
    clearInput,
    bindSend,
    bindNewChat,
    bindHistoryToggle,
    toggleHistoryPanel,
    setChatTitle,
    showMessage
  };
})();
