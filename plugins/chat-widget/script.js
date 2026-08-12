/**
 * Unified Chat Widget
 * Combined chat from Twitch, YouTube, and Kick with platform icons.
 */

const messagesContainer = document.getElementById('messages');
const MAX_MESSAGES = 200;
let autoScroll = true;

messagesContainer.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
  autoScroll = scrollHeight - scrollTop - clientHeight < 50;
});

function renderMessage(msg) {
  const el = document.createElement('div');
  el.className = 'chat-msg';

  el.innerHTML = `
    <span class="chat-msg-time">${formatTime(msg.timestamp)}</span>
    <span class="chat-msg-platform">${platformIcon(msg.platform, 'xs')}</span>
    <span class="chat-msg-body">
      <span class="chat-msg-username chat-msg-username--${msg.platform}"
            ${msg.user.color ? `style="color:${msg.user.color}"` : ''}
      >${escapeHTML(msg.user.displayName || msg.user.name)}</span>
      <span class="chat-msg-content">${escapeHTML(msg.content)}</span>
    </span>
  `;

  messagesContainer.appendChild(el);

  while (messagesContainer.children.length > MAX_MESSAGES) {
    messagesContainer.removeChild(messagesContainer.firstChild);
  }

  if (autoScroll) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

spWebSocket.connect();
spWebSocket.on('chat', (msg) => renderMessage(msg));
