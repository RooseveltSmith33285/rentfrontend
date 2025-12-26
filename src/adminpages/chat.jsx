import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  User, 
  Store, 
  MessageSquare,
  X,
  ChevronLeft,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import axios from 'axios';
import { useContext } from 'react';
import { AdminSocketContext } from '../context/adminSocketContext'; 
import { BASE_URL } from '../baseUrl'; 
import { toast, ToastContainer } from 'react-toastify';

const AdminChatPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showContactList, setShowContactList] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useContext(AdminSocketContext);
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [filterType]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/admin/support/tickets`, {
        params: {
          status: 'all',
          userType: filterType === 'all' ? 'all' : filterType
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      console.log("tickets")
      console.log(response.data)
      setTickets(response.data.tickets || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId) => {
    try {
      const response = await axios.get(`${BASE_URL}/support/messages/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      console.log("messages")
      console.log(response.data)
      const transformedMessages = response.data.messages.map(msg => ({
        id: msg._id,
        sender: msg.sentBy,
        text: msg.message,
        timestamp: msg.createdAt,
        read: msg.seenByAdmin
      }));
      
      setMessages(transformedMessages);
      
    
      await markMessagesAsRead(ticketId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (ticketId) => {
    try {
      await axios.post(
        `${BASE_URL}/support/mark-read/${ticketId}`,
        { userRole: 'admin' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
    
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket._id === ticketId ? { ...ticket, unreadCount: 0 } : ticket
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

// Replace your handleSendMessage function with this:

const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedContact) return;
  
  setSendingMessage(true);
  
  // Generate temp ID
  const tempId = `temp-${Date.now()}-${Math.random()}`;
  
  // Optimistic update
  const optimisticMessage = {
    id: tempId,
    sender: 'admin',
    text: newMessage.trim(),
    timestamp: new Date(),
    read: false
  };
  
  setMessages([...messages, optimisticMessage]);
  const messageText = newMessage.trim();
  setNewMessage('');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/adminsupportsendmessage`,
      {
        ticketId: selectedContact._id,
        message: messageText,
        adminId: JSON.parse(localStorage.getItem('adminToken')).email
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      }
    );
    
    // Update temp message with real ID
    setMessages(prev => 
      prev.map(msg => 
        msg.id === tempId ? { ...msg, id: response.data.messageId } : msg
      )
    );
    
    // Update conversation list
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket._id === selectedContact._id
          ? { ...ticket, lastMessage: { message: messageText }, lastMessageAt: new Date() }
          : ticket
      )
    );
    
    // ⭐ Emit socket event to deliver message in real-time
    if (socketRef?.socket && socketRef?.isConnected) {
      socketRef.socket.emit('sendAdminSupportMessage', {
        ticketId: selectedContact._id,
        message: messageText,
        sendBy: 'admin',
        adminId: JSON.parse(localStorage.getItem('adminToken')).email,
        timestamp: new Date(),
        messageId: response.data.messageId,
        userId: selectedContact.userId._id // ⭐ This is crucial - the user's ID
      });
      
      console.log('✅ Emitted admin message to user:', selectedContact.userId._id);
    }
    
    setSendingMessage(false);
  } catch (error) {
    // Remove failed message
    setMessages(prev => prev.filter(msg => msg.id !== tempId));
    console.error('Error sending message:', error);
    setSendingMessage(false);
    toast.error('Failed to send message. Please try again.',{containerId:"chatPage"});
  }
};

  const filteredContacts = tickets.filter(ticket => {
    const userName = ticket.userId?.name || '';
    const userEmail = ticket.userId?.email || '';
    
    const matchesSearch = 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleContactSelect = (ticket) => {
    setSelectedContact(ticket);
    if (isMobileView) {
      setShowContactList(false);
    }
  };

  const handleBackToList = () => {
    setShowContactList(true);
    setSelectedContact(null);
  };

  const totalUnread = tickets.reduce((sum, ticket) => sum + (ticket.unreadCount || 0), 0);



  useEffect(() => {
    if (!socketRef?.socket) return;
  
    const socket = socketRef.socket;
  
    // Listen for new support messages
    socket.on('newSupportMessage', (data) => {
      console.log('New support message received:', data);
      
      if (selectedContact && data.ticketId === selectedContact._id) {
        const newMsg = {
          id: data.message._id,
          sender: data.message.sentBy,
          text: data.message.message,
          timestamp: data.message.createdAt,
          read: data.message.seenByAdmin
        };
        setMessages(prev => [...prev, newMsg]);
        
        markMessagesAsRead(data.ticketId);
      }
      
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket._id === data.ticketId
            ? { 
                ...ticket, 
                lastMessage: { message: data.message.message },
                lastMessageAt: new Date(data.message.createdAt),
                unreadCount: selectedContact?._id === data.ticketId ? 0 : (ticket.unreadCount || 0) + 1
              }
            : ticket
        )
      );
    });
  
    // Listen for new tickets
  // Listen for new tickets
socket.on('newTicket', async (data) => {
    console.log("NEW TICKET received:", data);
    
    // Fetch updated tickets
    await fetchTickets();
    
    // If currently viewing a conversation with this user
    if (selectedContact && 
        selectedContact.userId._id === data.ticket.userId._id) {
      
      // Update selected contact to the new ticket
      setSelectedContact({
        ...data.ticket,
        userId: data.ticket.userId,
        lastMessage: { message: data.message.message },
        lastMessageAt: data.message.createdAt,
        unreadCount: 0
      });
      
      // Fetch messages for the new ticket
      fetchMessages(data.ticket._id);
    }
  });
  
    // Listen for ticket closed
    socket.on('ticketClosed', (data) => {
      console.log('Ticket closed by user:', data);
      
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket._id === data.ticketId
            ? { ...ticket, status: 'closed' }
            : ticket
        )
      );
      
      if (selectedContact && selectedContact._id === data.ticketId) {
        setSelectedContact(prev => ({ ...prev, status: 'closed' }));
   
      }
    });
    
    // Listen for messages read
    socket.on('supportMessagesRead', (data) => {
      console.log('Messages marked as read:', data);
      
      if (selectedContact && data.ticketId === selectedContact._id) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.sender === 'admin' ? { ...msg, read: true } : msg
          )
        );
      }
    });
  
    return () => {
      socket.off('newSupportMessage');
      socket.off('newTicket');
      socket.off('supportMessagesRead');
      socket.off('ticketClosed');
    };
  }, [socketRef, selectedContact]);

  return (
  <>
  <ToastContainer containerId={"chatPage"}/>



  <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Chat</h1>
            <p className="text-sm text-gray-600">Manage conversations with users and vendors</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {totalUnread} unread
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Contacts List */}
        <div className={`${isMobileView ? (showContactList ? 'w-full' : 'hidden') : 'w-80'} bg-white border-r border-gray-200 flex flex-col`}>
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({tickets.length})
              </button>
              <button
                onClick={() => setFilterType('user')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <User className="h-4 w-4 inline mr-1" />
                Users
              </button>
              <button
                onClick={() => setFilterType('Vendor')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'vendor' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Store className="h-4 w-4 inline mr-1" />
                Vendors
              </button>
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading tickets...</p>
                </div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageSquare className="h-12 w-12 mb-2" />
                <p>No tickets found</p>
              </div>
            ) : (
              filteredContacts.map(ticket => (
                <div
                  key={ticket._id}
                  onClick={() => handleContactSelect(ticket)}
                  className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                    selectedContact?._id === ticket._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={ticket.userId?.avatar || `https://ui-avatars.com/api/?name=${ticket.userId?.name || 'User'}&background=3b82f6&color=fff`}
                      alt={ticket.userId?.name || 'User'}
                      className="h-12 w-12 rounded-full"
                    />
                    {ticket.userType === 'Vendor' && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <Store className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {ticket.userType === 'user' && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                        <User className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {ticket.userId?.name || 'Unknown User'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTime(ticket.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate">
                        {ticket.lastMessage?.message || 'No messages yet'}
                      </p>
                      {ticket.unreadCount > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {ticket.unreadCount}
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
        <div className={`${isMobileView ? (showContactList ? 'hidden' : 'w-full') : 'flex-1'} flex flex-col bg-gray-50`}>
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isMobileView && (
                      <button
                        onClick={handleBackToList}
                        className="mr-3 text-gray-600 hover:text-gray-900"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                    )}
                    <img
                      src={selectedContact.userId?.avatar || `https://ui-avatars.com/api/?name=${selectedContact.userId?.name || 'User'}&background=3b82f6&color=fff`}
                      alt={selectedContact.userId?.name || 'User'}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="ml-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedContact.userId?.name || 'Unknown User'}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {selectedContact.userId?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedContact.userType === 'Vendor' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedContact.userType === 'Vendor' ? 'Vendor' : 'user'}
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
  {selectedContact?.status === 'closed' ? (
    <div className="text-center py-4">
      <p className="text-gray-500 text-sm font-medium">This ticket has been closed by the user.</p>
      <p className="text-gray-400 text-xs mt-1">No new messages can be sent.</p>
    </div>
  ) : (
    <div className="flex items-end space-x-2">
      <div className="flex-1 relative">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="1"
          style={{ minHeight: '40px', maxHeight: '120px' }}
          disabled={sendingMessage}
        />
      </div>
      <button
        onClick={handleSendMessage}
        disabled={!newMessage.trim() || sendingMessage}
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sendingMessage ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </button>
    </div>
  )}
</div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
              <p className="text-sm">Choose a user or vendor to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  
  </>
  );
};

export default AdminChatPage;