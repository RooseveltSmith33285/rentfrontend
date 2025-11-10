import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Search, Home, MoreVertical, Check, CheckCheck } from "lucide-react";

function ChatPage() {
  const messagesEndRef = useRef(null);
  
  // Example data
  const exampleConversations = [
    {
      id: 1,
      otherUser: {
        id: 2,
        name: "Sarah Johnson",
        role: "vendor"
      },
      lastMessage: "The equipment is available for pickup tomorrow",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unreadCount: 2
    },
    {
      id: 2,
      otherUser: {
        id: 3,
        name: "Mike Chen",
        role: "renter"
      },
      lastMessage: "Thanks! I'll be there at 10 AM",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 0
    },
    {
      id: 3,
      otherUser: {
        id: 4,
        name: "Ahmed Hassan",
        role: "vendor"
      },
      lastMessage: "Do you still have the excavator available?",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
      unreadCount: 0
    },
    {
      id: 4,
      otherUser: {
        id: 5,
        name: "Emily Rodriguez",
        role: "renter"
      },
      lastMessage: "Great! Looking forward to working with you",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      unreadCount: 0
    }
  ];

  const exampleMessages = {
    1: [
      {
        id: 1,
        senderId: 2,
        senderName: "Sarah Johnson",
        message: "Hi! I'm interested in renting your concrete mixer for next week.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        read: true
      },
      {
        id: 2,
        senderId: 1,
        senderName: "You",
        message: "Hello! Yes, it's available. Which days do you need it?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
        read: true
      },
      {
        id: 3,
        senderId: 2,
        senderName: "Sarah Johnson",
        message: "I need it from Monday to Friday. What's your rate?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true
      },
      {
        id: 4,
        senderId: 1,
        senderName: "You",
        message: "It's $150 per day or $600 for the full week. Includes delivery within 50km.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
        read: true
      },
      {
        id: 5,
        senderId: 2,
        senderName: "Sarah Johnson",
        message: "Perfect! I'll take it for the week. When can I pick it up?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: true
      },
      {
        id: 6,
        senderId: 1,
        senderName: "You",
        message: "Great! I can have it ready by Sunday evening or Monday morning. Which works better?",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        read: false
      },
      {
        id: 7,
        senderId: 2,
        senderName: "Sarah Johnson",
        message: "Monday morning would be ideal",
        timestamp: new Date(Date.now() - 1000 * 60 * 35),
        read: false
      },
      {
        id: 8,
        senderId: 2,
        senderName: "Sarah Johnson",
        message: "The equipment is available for pickup tomorrow",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false
      }
    ],
    2: [
      {
        id: 9,
        senderId: 1,
        senderName: "You",
        message: "Hi Mike! Your scaffolding rental is confirmed for next week.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true
      },
      {
        id: 10,
        senderId: 3,
        senderName: "Mike Chen",
        message: "Awesome! What time should I come by?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
        read: true
      },
      {
        id: 11,
        senderId: 1,
        senderName: "You",
        message: "Anytime between 8 AM and 5 PM works. Just give me a heads up 30 mins before.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
        read: true
      },
      {
        id: 12,
        senderId: 3,
        senderName: "Mike Chen",
        message: "Thanks! I'll be there at 10 AM",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true
      }
    ],
    3: [
      {
        id: 13,
        senderId: 4,
        senderName: "Ahmed Hassan",
        message: "Hi, I saw your listing for the excavator.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
        read: true
      },
      {
        id: 14,
        senderId: 4,
        senderName: "Ahmed Hassan",
        message: "Do you still have the excavator available?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true
      }
    ],
    4: [
      {
        id: 15,
        senderId: 5,
        senderName: "Emily Rodriguez",
        message: "Hi! I'd like to rent your power tools for a home renovation project.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
        read: true
      },
      {
        id: 16,
        senderId: 1,
        senderName: "You",
        message: "Sure! Which tools do you need and for how long?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 70),
        read: true
      },
      {
        id: 17,
        senderId: 5,
        senderName: "Emily Rodriguez",
        message: "I need a drill, circular saw, and sander for about 2 weeks.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 68),
        read: true
      },
      {
        id: 18,
        senderId: 1,
        senderName: "You",
        message: "All available! I can do $30/day for the set or $350 for 2 weeks.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 66),
        read: true
      },
      {
        id: 19,
        senderId: 5,
        senderName: "Emily Rodriguez",
        message: "Great! Looking forward to working with you",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        read: true
      }
    ]
  };

  const currentUser = { id: 1, name: "You" };
  
  const [conversations, setConversations] = useState(exampleConversations);
  const [selectedConversation, setSelectedConversation] = useState(exampleConversations[0]);
  const [messages, setMessages] = useState(exampleMessages[1]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(exampleMessages[selectedConversation.id] || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    
    // Simulate sending delay
    setTimeout(() => {
      const newMsg = {
        id: messages.length + 1,
        senderId: currentUser.id,
        senderName: "You",
        message: newMessage.trim(),
        timestamp: new Date(),
        read: false
      };

      setMessages([...messages, newMsg]);
      setNewMessage("");
      
      // Update last message in conversation list
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: newMessage.trim(), lastMessageTime: new Date(), unreadCount: 0 }
          : conv
      ));

      setSendingMessage(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#024a47] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <button className="lg:hidden p-2 hover:bg-[#035d59] rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button className="hidden lg:flex items-center space-x-2 hover:opacity-80">
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <div className="h-8 w-px bg-white/30 hidden lg:block"></div>
              <h1 className="text-xl font-bold">Messages</h1>
            </div>
            <div className="text-sm">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`flex items-center space-x-3 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-[#024a47]/5 border-l-4 border-l-[#024a47]' : ''
                }`}
              >
                <div className="w-12 h-12 bg-[#024a47] rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                  {conv.otherUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">{conv.otherUser.name}</h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-[#024a47] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2 flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-white`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="w-10 h-10 bg-[#024a47] rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversation.otherUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedConversation.otherUser.name}</h2>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.otherUser.role === 'vendor' ? 'Vendor' : 'Renter'}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isCurrentUser = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end space-x-2 max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!isCurrentUser && (
                            <div className="w-8 h-8 bg-[#024a47] rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {msg.senderName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isCurrentUser
                                  ? 'bg-[#024a47] text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                              }`}
                            >
                              {!isCurrentUser && (
                                <p className="text-xs font-semibold mb-1 opacity-70">{msg.senderName}</p>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>
                            <div className={`flex items-center space-x-1 mt-1 px-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                              {isCurrentUser && (
                                msg.read ? (
                                  <CheckCheck className="w-3 h-3 text-blue-500" />
                                ) : (
                                  <Check className="w-3 h-3 text-gray-400" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows="1"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] focus:border-transparent resize-none"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className={`p-2 rounded-lg transition-colors ${
                      newMessage.trim() && !sendingMessage
                        ? 'bg-[#024a47] text-white hover:bg-[#035d59]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to Messages</h3>
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;