import React, { useState, useEffect, useRef, useContext } from "react";
import { ArrowLeft, Send, Search, Home, MoreVertical, Check, CheckCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../baseUrl";
import { SocketContext } from "../context/socketContext";




const containsContactInfo = (text) => {
    if (!text) return false;
  
    const lowerText = text.toLowerCase();
  
    // ✅ Strong and simple email pattern
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailPattern.test(lowerText)) {
      return true;
    }
  
    // ✅ Phone number patterns
    const phonePatterns = [
      /\b\d{10,}\b/, // 10+ consecutive digits
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // xxx-xxx-xxxx
      /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/, // (xxx) xxx-xxxx
      /\+\d{1,3}[-.\s]?\d{3,}/, // International
    ];
    for (const pattern of phonePatterns) {
      if (pattern.test(lowerText)) return true;
    }
  
    // ✅ URL detection
    if (lowerText.includes('http://') || lowerText.includes('https://') || lowerText.includes('www.')) {
      return true;
    }
  
    // ✅ WhatsApp mentions
    if (lowerText.includes('whatsapp') || lowerText.includes('wa.me')) {
      return true;
    }
  
    // ✅ Common contact keywords (even without @)
    const contactKeywords = [
      'gmail', 'yahoo', 'hotmail', 'outlook', 'email',
      'call me', 'text me', 'contact me'
    ];
    for (const keyword of contactKeywords) {
      if (lowerText.includes(keyword)) {
        return true;
      }
    }
  
    return false;
  };
  
  


function UserChatPage() {
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const socketRef = useContext(SocketContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentVendor, setCurrentVendor] = useState({});
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch conversations on mount
  useEffect(() => {
    const initializeChat = async () => {
      const vendorIdFromUrl = await getCurrentVendor();
      await fetchConversations(vendorIdFromUrl);
    };
    initializeChat();
  }, []);

  // Update messages when conversation changes
  useEffect(() => {
    if (selectedConversation && selectedConversation.vendor && selectedConversation.vendor._id) {
      fetchMessages(selectedConversation.vendor._id);
    }
  }, [selectedConversation?.vendor?._id]);

  // Mark messages as seen when conversation is opened
  useEffect(() => {
    const markAsSeen = async () => {
      if (selectedConversation && selectedConversation.vendor && selectedConversation.vendor._id) {
        try {
          await axios.get(`${BASE_URL}/seenMessages/${selectedConversation.vendor._id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          // Update local state to mark messages as read
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.sentBy === 'vendor' ? { ...msg, read: true } : msg
            )
          );
          
          // Update conversation unread count
          setConversations(prevConvs =>
            prevConvs.map(conv =>
              conv.id === selectedConversation.id ? { ...conv, unreadCount: 0 } : conv
            )
          );

          // Emit socket event to notify vendor
if (socketRef?.socket) {
    socketRef.socket.emit('messagesSeen', {
      conversationId: selectedConversation.vendor._id,
      userId: localStorage.getItem('userId'), // or get from your auth context
      vendorId: selectedConversation.vendor._id,
      seenBy: 'user'
    });
  }

        } catch (e) {
          console.log('Error marking messages as seen:', e.message);
        }
      }
    };

    markAsSeen();
  }, [selectedConversation?.vendor?._id]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Socket event listeners
useEffect(() => {
    if (!socketRef?.socket) return;
  
    const socket = socketRef.socket;
  
    // Listen for new messages
socket.on('newMessage', (data) => {
    console.log('New message received:', data);
    
    // Only add message if it's for the current conversation
    if (selectedConversation && 
        (data.conversationId === selectedConversation.vendor._id || 
         data.senderId === selectedConversation.vendor._id ||
         data.receiverId === selectedConversation.vendor._id)) {
      
      const newMsg = {
        id: data.id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderName: data.sendBy === 'user' ? 'You' : (selectedConversation.vendor.businessName || selectedConversation.vendor.name),
        message: data.message,
        image: data.image,
        timestamp: new Date(data.timestamp),
        read: data.read,
        sentBy: data.sendBy
      };
  
      setMessages(prevMessages => [...prevMessages, newMsg]);
  
      // Update conversation list
      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === data.conversationId
            ? { ...conv, lastMessage: data.message, lastMessageTime: new Date(data.timestamp) }
            : conv
        )
      );
    } else if (data.isNewConversation && data.sendBy === 'vendor' && data.vendor) {
      // This is a new conversation initiated by vendor
      // Check if we don't already have this conversation
      setConversations(prevConvs => {
        const exists = prevConvs.some(conv => conv.id === data.senderId);
        if (!exists) {
          const newConversation = {
            id: data.senderId,
            vendor: data.vendor,
            user: { _id: localStorage.getItem('userId') },
            messages: [],
            lastMessage: data.message,
            lastMessageTime: new Date(data.timestamp),
            unreadCount: 1
          };
          return [newConversation, ...prevConvs];
        }
        // Update unread count if conversation exists
        return prevConvs.map(conv =>
          conv.id === data.conversationId
            ? { 
                ...conv, 
                lastMessage: data.message, 
                lastMessageTime: new Date(data.timestamp),
                unreadCount: conv.unreadCount + 1 
              }
            : conv
        );
      });
    } else {
      // If message is from different conversation, update unread count
      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === data.conversationId || conv.id === data.senderId
            ? { 
                ...conv, 
                lastMessage: data.message, 
                lastMessageTime: new Date(data.timestamp),
                unreadCount: conv.unreadCount + 1 
              }
            : conv
        )
      );
    }
  });
    // Listen for new messages
    // socket.on('newMessage', (data) => {
    //     console.log('New message received:', data);
        
    //     // Only add message if it's for the current conversation
    //     // Check both conversationId and senderId to handle new conversations
    //     if (selectedConversation && 
    //         (data.conversationId === selectedConversation.vendor._id || 
    //          data.senderId === selectedConversation.vendor._id ||
    //          data.receiverId === selectedConversation.vendor._id)) { // ADD THIS LINE
          
    //       const newMsg = {
    //         id: data.id,
    //         senderId: data.senderId,
    //         receiverId: data.receiverId,
    //         senderName: data.sendBy === 'user' ? 'You' : (selectedConversation.vendor.businessName || selectedConversation.vendor.name),
    //         message: data.message,
    //         image: data.image,
    //         timestamp: new Date(data.timestamp),
    //         read: data.read,
    //         sentBy: data.sendBy
    //       };
      
    //       setMessages(prevMessages => [...prevMessages, newMsg]);
  
    //     // Update conversation list
    //     setConversations(prevConvs =>
    //       prevConvs.map(conv =>
    //         conv.id === data.conversationId
    //           ? { ...conv, lastMessage: data.message, lastMessageTime: new Date(data.timestamp) }
    //           : conv
    //       )
    //     );
    //   } else {
    //     // If message is from different conversation, update unread count
    //     setConversations(prevConvs =>
    //       prevConvs.map(conv =>
    //         conv.id === data.conversationId
    //           ? { 
    //               ...conv, 
    //               lastMessage: data.message, 
    //               lastMessageTime: new Date(data.timestamp),
    //               unreadCount: conv.unreadCount + 1 
    //             }
    //           : conv
    //       )
    //     );
    //   }
    // });
  
    // Listen for messages read
    socket.on('messagesRead', (data) => {
      console.log('Messages marked as read:', data);
      
      if (selectedConversation && data.conversationId === selectedConversation.vendor._id) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.sentBy === 'user' ? { ...msg, read: true } : msg
          )
        );
      }
    });
  
    // Listen for typing indicator
    socket.on('userTyping', (data) => {
      if (selectedConversation && data.conversationId === selectedConversation.vendor._id) {
        // You can add a typing indicator state here
        console.log('Vendor is typing:', data.isTyping);
      }
    });
  
    socket.on('messageSent', (data) => {
        if (data.success) {
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === data.tempId || msg.timestamp?.getTime() === new Date(data.timestamp).getTime()
                ? { ...msg, read: data.read, id: data.id }
                : msg
            )
          );
        }
      });
      
    // Cleanup
    return () => {
      socket.off('newMessage');
      socket.off('messagesRead');
      socket.off('messageSent');
      socket.off('userTyping');
    };
  }, [selectedConversation, socketRef]);

  // Connect socket on mount
useEffect(() => {
    if (socketRef?.socket) {
      const userId = localStorage.getItem('userId'); 
      socketRef.socket.emit('join', {
        userId: userId,
        userType: 'user'
      });
    }
  }, [socketRef]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get current vendor from URL params
  const getCurrentVendor = async () => {
    try {
      let params = new URLSearchParams(location.search);
      let vendorId = params.get('vendor');
      
      if (vendorId) {
        let response = await axios.get(`${BASE_URL}/getVendorInfo/${vendorId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        let conversationResponse = await axios.get(`${BASE_URL}/getConversation/${vendorId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setCurrentVendor(response.data.vendor);
        
        console.log(conversationResponse)
        console.log("conversationResponse")
        
        const conversationMessages = conversationResponse.data.conversation || [];
        const lastMsg = conversationMessages.length > 0 
          ? conversationMessages[conversationMessages.length - 1] 
          : null;
        
          const transformedMessages = conversationMessages.map(msg => ({
            id: msg._id,
            senderId: msg.sendBy === 'user' ? msg.user : msg.vendor._id,
            receiverId: msg.sendBy === 'user' ? msg.vendor._id : msg.user,
            senderName: msg.sendBy === 'user' ? 'You' : response.data.vendor.businessName || response.data.vendor.name,
            message: msg.message,
            image: msg.image,
            timestamp: new Date(msg.createdAt || Date.now()),
            read: msg.sendBy === 'user' ? msg.seenByVendor : msg.seenByUser,
            sentBy: msg.sendBy
          }));
          
        
        setSelectedConversation({
          id: vendorId,
          vendor: response.data.vendor,
          messages: conversationMessages,
          lastMessage: lastMsg ? lastMsg.message : '',
          lastMessageTime: lastMsg ? new Date(lastMsg.createdAt || Date.now()) : new Date(),
          unreadCount: conversationMessages.filter(msg => msg.sentBy === 'vendor' && !msg.seenByUser).length
        });
        
        setMessages(transformedMessages);
        
        return vendorId;
      }
    } catch (e) {
      console.log(e.message);
    }
    return null;
  };

  // Fetch all conversations
  const fetchConversations = async (vendorIdFromUrl = null) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/getConversations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Group messages by vendor to create conversation list
      const conversationsMap = {};
      
      response.data.conversations.forEach((msg, index) => {
        try {
          console.log(`Processing message ${index}:`, msg);
          
          // Skip if vendor is null/undefined
          if (!msg.vendor || !msg.vendor._id) {
            console.log('Skipping message with no vendor:', msg);
            return;
          }
          
          const vendorId = msg.vendor._id;
          console.log('Vendor ID:', vendorId);
          
          if (!conversationsMap[vendorId]) {
            console.log('Creating new conversation for vendor:', vendorId);
            conversationsMap[vendorId] = {
              id: vendorId,
              vendor: msg.vendor,
              user: msg.user,
              messages: [],
              lastMessage: msg.message,
              lastMessageTime: new Date(msg.createdAt || Date.now()),
              unreadCount: msg.sentBy === 'vendor' && !msg.seenByUser ? 1 : 0
            };
          } else {
            console.log('Updating existing conversation for vendor:', vendorId);
            conversationsMap[vendorId].messages.push(msg);
            
            // Update last message if this one is more recent
            const msgTime = new Date(msg.createdAt || Date.now());
            if (msgTime > conversationsMap[vendorId].lastMessageTime) {
              conversationsMap[vendorId].lastMessage = msg.message;
              conversationsMap[vendorId].lastMessageTime = msgTime;
            }
            
            // Count unread messages from vendor
           
            if (msg.sentBy === 'vendor' && !msg.seenByUser) {
              conversationsMap[vendorId].unreadCount++;
            }
          }
         
        } catch (error) {
          console.error(`Error processing message ${index}:`, error, msg);
        }
      });

    
      const conversationsList = Object.values(conversationsMap).sort(
        (a, b) => b.lastMessageTime - a.lastMessageTime
      );

      setConversations(conversationsList);
      
     
      // If vendorId from URL exists, select that conversation
      if (vendorIdFromUrl) {
        const vendorConversation = conversationsList.find(conv => conv.vendor._id === vendorIdFromUrl);
        if (vendorConversation) {
          setSelectedConversation(vendorConversation);
        }
      } else if (conversationsList.length > 0 && !selectedConversation) {
        // Auto-select first conversation if no URL param and nothing selected
        setSelectedConversation(conversationsList[0]);
      }
      
      setLoading(false);
    } catch (e) {
      console.log(e.message);
      setLoading(false);
    }
  };

  // Fetch messages for specific vendor
  const fetchMessages = async (vendorId) => {
    try {
      let conversationResponse = await axios.get(`${BASE_URL}/getConversation/${vendorId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const conversationMessages = conversationResponse.data.conversation || [];
      
      const transformedMessages = conversationMessages.map(msg => ({
        id: msg._id,
        senderId: msg.sendBy === 'user' ? msg.user : msg.vendor._id,
        receiverId: msg.sendBy === 'user' ? msg.vendor._id : msg.user,
        senderName: msg.sendBy === 'user' ? 'You' : (selectedConversation?.vendor?.businessName || selectedConversation?.vendor?.name || 'Vendor'),
        message: msg.message,
        image: msg.image,
        timestamp: new Date(msg.createdAt || Date.now()),
        read: msg.sendBy === 'user' ? msg.seenByVendor : msg.seenByUser,
        sentBy: msg.sendBy
      }));
      
      setMessages(transformedMessages);
    } catch (e) {
      console.log(e.message);
    }
  };

  
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const hasContactInfo = containsContactInfo(newMessage.trim());
   
    const messageToSend = hasContactInfo ? "⚠️ This message was deleted (contained contact information)" : newMessage.trim();
  
    setSendingMessage(true);

    try {
        const conversationExists = conversations.some(conv => conv.id === selectedConversation.vendor._id);
      
      const response = await axios.post(
        `${BASE_URL}/sendMessage`,
        {
          vendor: selectedConversation.vendor._id,
          message: hasContactInfo?messageToSend:newMessage.trim(),
    sendBy: 'user'
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Add new message to the list optimistically
      const newMsg = {
        id: response.data.id,
        senderId: 'current-user',
        receiverId: selectedConversation.vendor._id,
        senderName: "You",
        message: hasContactInfo?messageToSend:newMessage.trim(),
        timestamp: new Date(),
        read: false,
        sentBy: 'user'
      };

      setMessages([...messages, newMsg]);
      setNewMessage("");

      if (socketRef?.socket) {
        socketRef.socket.emit('sendMessage', {
          conversationId: selectedConversation.vendor._id,
          tempId:response.data.id,
          senderId: localStorage.getItem('userId'), // or get from your auth context
          receiverId: selectedConversation.vendor._id,
          message: hasContactInfo ? messageToSend : newMessage.trim(),
          sendBy: 'user',
          senderType: 'user',
          timestamp: new Date()
        });
      }

      if (!conversationExists) {
        const newConversation = {
          id: selectedConversation.vendor._id,
          vendor: selectedConversation.vendor,
          user: { _id: localStorage.getItem('userId') },
          messages: [newMsg],
          lastMessage: hasContactInfo?messageToSend:newMessage.trim(),
          lastMessageTime: new Date(),
          unreadCount: 0
        };
        setConversations([newConversation, ...conversations]);
      } else {
        // Update existing conversation
        setConversations(conversations.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: newMessage.trim(), lastMessageTime: new Date(), unreadCount: 0 }
            : conv
        ));
      }

      // Update last message in conversation list
    //   setConversations(conversations.map(conv =>
    //     conv.id === selectedConversation.id
    //       ? { ...conv, lastMessage: newMessage.trim(), lastMessageTime: new Date(), unreadCount: 0 }
    //       : conv
    //   ));

      setSendingMessage(false);
    } catch (e) {
      console.log(e.message);
      setSendingMessage(false);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    (conv.vendor.businessName || conv.vendor.name || '').toLowerCase().includes(searchQuery.toLowerCase())
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#024a47] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

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
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No conversations yet</h3>
                <p className="text-sm text-gray-500">Start chatting with vendors to see your conversations here</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex items-center space-x-3 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-[#024a47]/5 border-l-4 border-l-[#024a47]' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-[#024a47] rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {(conv.vendor.businessName || conv.vendor.name || 'V').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conv.vendor.businessName || conv.vendor.name || 'Vendor'}
                      </h3>
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
              ))
            )}
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
                    {(selectedConversation.vendor.businessName || selectedConversation.vendor.name || 'V').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedConversation.vendor.businessName || selectedConversation.vendor.name || 'Vendor'}
                    </h2>
                    <p className="text-xs text-gray-500 capitalize">Vendor</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="w-24 h-24 bg-[#024a47] rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
                        {(selectedConversation.vendor.businessName || selectedConversation.vendor.name || 'V').charAt(0).toUpperCase()}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedConversation.vendor.businessName || selectedConversation.vendor.name || 'Vendor'}
                      </h2>
                      {selectedConversation.vendor.email && (
                        <p className="text-sm text-gray-600 mb-1">{selectedConversation.vendor.email}</p>
                      )}
                      {selectedConversation.vendor.mobile && (
                        <p className="text-sm text-gray-600 mb-4">{selectedConversation.vendor.mobile}</p>
                      )}
                      {selectedConversation.vendor.businessAddress && (
                        <div className="text-sm text-gray-600 mb-6">
                          {selectedConversation.vendor.businessAddress.street && <p>{selectedConversation.vendor.businessAddress.street}</p>}
                          {(selectedConversation.vendor.businessAddress.city || selectedConversation.vendor.businessAddress.state) && (
                            <p>
                              {selectedConversation.vendor.businessAddress.city}
                              {selectedConversation.vendor.businessAddress.city && selectedConversation.vendor.businessAddress.state ? ', ' : ''}
                              {selectedConversation.vendor.businessAddress.state}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <p className="text-gray-700 mb-4">
                          Start a conversation with {selectedConversation.vendor.businessName || selectedConversation.vendor.name || 'this vendor'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Send your first message to begin chatting
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isCurrentUser = msg.sentBy === 'user';
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
                                {msg.image && (
                                  <img src={msg.image} alt="attachment" className="mt-2 rounded-lg max-w-xs" />
                                )}
                              </div>
                              <div className={`flex items-center space-x-1 mt-1 px-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                                {/* Show read status for user messages (sent by current user) */}
                                {isCurrentUser && (
                                  msg.read ? (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                  ) : (
                                    <Check className="w-3 h-3 text-gray-400" />
                                  )
                                )}
                                {/* Show read status for vendor messages (when user has seen them) */}
                                {!isCurrentUser && msg.read && (
                                  <CheckCheck className="w-3 h-3 text-blue-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        
                        // Emit typing indicator
                        if (socketRef?.socket && selectedConversation) {
                          socketRef.socket.emit('typing', {
                            conversationId: selectedConversation.vendor._id,
                            userId: localStorage.getItem('userId'),
                            vendorId: selectedConversation.vendor._id,
                            isTyping: e.target.value.length > 0,
                            typerType: 'user'
                          });
                        }
                      }}
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
                <p>Select a conversation to start chatting with vendors</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserChatPage;