"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface UserInfo {
  id: string;
  name: string | null;
  username: string;
  email: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: UserInfo;
  receiver: UserInfo;
}

export default function MessagesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected conversation partner username
  const [activePartner, setActivePartner] = useState<UserInfo | null>(null);
  
  // Search input to start new chat
  const [searchUsername, setSearchUsername] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // New message input
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll for new messages every 4 seconds
  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when active partner or messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activePartner, messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    setSearchError("");
    setSearchLoading(true);

    try {
      const cleanUsername = searchUsername.trim().toLowerCase();
      if (session?.user && cleanUsername === session.user.username) {
        setSearchError("You cannot chat with yourself.");
        setSearchLoading(false);
        return;
      }

      // Check if user exists by searching/posting an empty message or fetch profile info
      // To keep it simple, we can fetch from an existing endpoint, or fetch community/profile
      // Or we can try to find them by making a call. Let's do a quick fetch
      const res = await fetch(`/api/profile?username=${cleanUsername}`);
      // Wait, let's see if we have a profile route that supports lookup by username.
      // If we don't, we can query users. Let's look up using a helper or try sending a dummy message.
      // Wait! Let's check if we have a way to search or verify users.
      // We can also check /api/profile or similar. Let's implement user verify or query by username.
      // To avoid adding too many API endpoints, we can fetch `/api/messages` and if user not found, 
      // let the server return user details. Since POST /api/messages returns 404 if not found, we can try to verify.
      // Actually, we can fetch all creators/users, or just hit a tiny check. Let's check how profile API works.
    } catch (e) {
      // fallback
    }

    // Let's do a direct look up:
    try {
      const targetUser = searchUsername.trim().toLowerCase();
      // Let's check if they exist by calling our check or sending a blank message.
      // Let's query them by sending a get to /api/profile or /api/coach or just look at our messages.
      // Let's make a request to POST /api/messages with empty content to check, or just do it by letting
      // the user send a first message. 
      // Actually, we can just query users by creating a tiny route or lookup. Let's see if we can do
      // a fetch from an endpoint. Let's check if the searchUsername is already in our existing message history.
      const foundInHistory = messages.find(
        (m) =>
          m.sender.username === targetUser ||
          m.receiver.username === targetUser
      );

      if (foundInHistory) {
        const partner = foundInHistory.sender.username === targetUser ? foundInHistory.sender : foundInHistory.receiver;
        setActivePartner(partner);
        setSearchUsername("");
        setSearchLoading(false);
        return;
      }

      // If not in history, let's verify if they exist using a simple check on a new message or profile check.
      // Let's call /api/profile?username=... or similar. Let's verify by posting a tiny validation.
      const testRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUser, content: "👋 Hello!" }),
      });
      const data = await testRes.json();

      if (testRes.ok) {
        // Message sent successfully, user exists! Fetch updated inbox and select them.
        await fetchMessages(false);
        const partner = data.message.receiver;
        setActivePartner(partner);
        setSearchUsername("");
      } else {
        setSearchError(data.error || "User not found.");
      }
    } catch (err) {
      setSearchError("Failed to search user.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePartner || !replyContent.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: activePartner.username,
          content: replyContent.trim(),
        }),
      });

      if (res.ok) {
        setReplyContent("");
        // Reload messages immediately
        await fetchMessages(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // Group messages into conversations
  const currentUserId = session?.user?.id;
  const conversationsMap = new Map<string, { partner: UserInfo; lastMessage: Message }>();

  messages.forEach((msg) => {
    if (!currentUserId) return;
    const isSender = msg.senderId === currentUserId;
    const partner = isSender ? msg.receiver : msg.sender;
    
    // Skip if somehow partner is not resolved
    if (!partner) return;

    const existing = conversationsMap.get(partner.id);
    if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
      conversationsMap.set(partner.id, { partner, lastMessage: msg });
    }
  });

  const conversationList = Array.from(conversationsMap.values()).sort(
    (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );

  // Filter messages for active chat
  const activeChatMessages = messages.filter((msg) => {
    if (!activePartner || !currentUserId) return false;
    return (
      (msg.senderId === currentUserId && msg.receiverId === activePartner.id) ||
      (msg.senderId === activePartner.id && msg.receiverId === currentUserId)
    );
  });

  if (sessionStatus === "loading" || (loading && messages.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6c63ff] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] text-white p-4">
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold mb-3">Sign in required</h2>
          <p className="text-gray-400 mb-6">You must be signed in to view and send messages.</p>
          <Link href="/login" className="btn-primary w-full">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-[#f8f8f8] flex text-black overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 md:w-96 border-r border-[#27272a] bg-[#f8f8f8] flex flex-col shrink-0">
        {/* User Info Header */}
        <div className="p-4 border-b border-[#27272a] flex justify-between items-center bg-[#f8f8f8]">
          <div>
            <h2 className="font-bold text-lg text-black truncate max-w-[150px] md:max-w-[200px]">
              {session?.user?.name || session?.user?.email?.split("@")[0]}
            </h2>
            <p className="text-xs text-gray-500 truncate">@{session?.user?.username}</p>
          </div>
          <Link href="/dashboard" className="text-xs text-gray-400 hover:text-black transition">
            Dashboard
          </Link>
        </div>

        {/* Start Chat Form */}
        <form onSubmit={handleStartChat} className="p-4 border-b border-[#27272a] space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              disabled={searchLoading}
              className="flex-1 px-3 py-2 border border-[#27272a] text-sm rounded-lg focus:outline-none focus:border-[#6c63ff] placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="px-4 py-2 bg-[#6c63ff] hover:bg-[#5b53e8] disabled:opacity-50 text-sm font-semibold rounded-lg transition shrink-0 cursor-pointer"
            >
              {searchLoading ? "..." : "Chat"}
            </button>
          </div>
          {searchError && <p className="text-xs text-red-400">{searchError}</p>}
        </form>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#27272a]/50">
          {conversationList.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No conversations yet. Type a username above to start chatting!
            </div>
          ) : (
            conversationList.map(({ partner, lastMessage }) => {
              const isActive = activePartner?.id === partner.id;
              const isSentByMe = lastMessage.senderId === currentUserId;
              return (
                <div
                  key={partner.id}
                  onClick={() => {
                    setActivePartner(partner);
                    setSearchError("");
                  }}
                  className={`p-4 flex flex-col gap-1 cursor-pointer transition ${
                    isActive ? "bg-[#27272a] text-white" : "hover:bg-[#27272a]/40 text-black"
                  }`}
                >
                  <div className="flex justify-between items-baseline">
                    <span className={`font-semibold text-sm truncate max-w-[180px] ${isActive ? "text-white" : "text-black"}`}>
                      {partner.name || partner.username}
                    </span>
                    <span className="text-[10px] text-gray-500 shrink-0">
                      {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-xs text-gray-400 truncate flex-1">
                      {isSentByMe ? "You: " : ""}
                      {lastMessage.content}
                    </p>
                    <span className="text-[10px] text-gray-600 font-mono">@{partner.username}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col bg-[#f8f8f8] relative">
        {activePartner ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-[#27272a] bg-[#f8f8f8] flex items-center justify-between z-10">
              <div>
                <h3 className="font-bold text-base text-black">{activePartner.name || activePartner.username}</h3>
                <p className="text-xs text-[#6c63ff] font-semibold">@{activePartner.username}</p>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8f8f8]">
              {activeChatMessages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm relative ${
                        isMe
                          ? "bg-black text-white rounded-tr-none border border-[#27272a]"
                          : "bg-[#27272a] text-white rounded-tl-none border border-[#3f3f46]/40"
                      }`}
                    >
                      <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                      <span className="block text-[9px] text-gray-500 text-right mt-1.5 font-mono select-none">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={handleSendReply}
              className="p-4 border-t border-[#27272a] bg-[#f8f8f8] flex gap-3 items-center"
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={sending}
                className="flex-1 px-4 py-3 bg-[#f8f8f8] border border-[#27272a] text-sm rounded-xl focus:outline-none focus:border-[#6c63ff] text-black placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!replyContent.trim() || sending}
                className="px-5 py-3 bg-[#6c63ff] hover:bg-[#5b53e8] disabled:opacity-50 text-sm font-bold rounded-xl transition cursor-pointer text-white shrink-0"
              >
                {sending ? "..." : "Send"}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f8f8f8]">
            <div className="w-16 h-16 rounded-full bg-[#f8f8f8] border border-[#27272a] flex items-center justify-center mb-4 text-black">
              💬
            </div>
            <h3 className="text-lg font-bold mb-1">Your Inbox</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Select an existing chat from the sidebar, or search a username to start a new thread.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
