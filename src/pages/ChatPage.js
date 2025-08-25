import ChatRoom from '../components/ChatRoom';

export default function ChatPage() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Chat</h2>
      <ChatRoom room="general" />
    </div>
  );
}
