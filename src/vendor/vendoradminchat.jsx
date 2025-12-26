
import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Maximize2,
  User,
  CheckCheck,
  Check
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../baseUrl';
import { SocketContext } from '../context/socketContext';
import { toast, ToastContainer } from 'react-toastify';

const VendorSupportChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useContext(SocketContext);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      markMessagesAsRead();
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen) {
      fetchSupportMessages();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSupportMessages = async () => {
    try {
      setLoading(true);
      
      const userTicketResponse = await axios.get(`${BASE_URL}/support/my-ticket`, {
        params: {
          userType: 'Vendor'
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });
  
      console.log("VENDOR TICKET")
      console.log(userTicketResponse)
      if (userTicketResponse.data.ticket) {
        const ticket = userTicketResponse.data.ticket;
        setTicketId(ticket._id);
        
        const transformedMessages = userTicketResponse.data.messages.map(msg => ({
          id: msg._id,
          text: msg.message,
          sender: msg.sentBy,
          timestamp: new Date(msg.createdAt),
          read: msg.sentBy === 'user' || msg.sentBy === 'Vendor' ? msg.seenByAdmin : msg.seenByUser
        }));
        setMessages(transformedMessages);
        
        const unreadCount = userTicketResponse.data.messages.filter(
          msg => msg.sentBy === 'admin' && !msg.seenByUser
        ).length;
        setHasUnread(unreadCount > 0);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching support messages:', error);
      setLoading(false);
    }
  };
 
  const markMessagesAsRead = async () => {
    if (!ticketId || !hasUnread) return;
    
    try {
      await axios.post(`${BASE_URL}/support/mark-read/${ticketId}`, 
        { 
          userRole: 'Vendor'
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
          }
        }
      );
      setHasUnread(false);
      
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.sender === 'admin' ? { ...msg, read: true } : msg
        )
      );
  
 
      if (socketRef?.socket) {
        socketRef.socket.emit('supportMessagesRead', {
          ticketId: ticketId,
          userId: localStorage.getItem('vendorId'),
          userType: 'Vendor'
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const closeTicket = async () => {
    if (!ticketId) return;
    
    const confirmed = window.confirm('Are you sure you want to close this ticket? You can create a new one if needed.');
    if (!confirmed) return;
    
    try {
      await axios.patch(`${BASE_URL}/closeTicket/${ticketId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });
      
     
      if (socketRef?.socket) {
        socketRef.socket.emit('ticketClosed', {
          ticketId: ticketId,
          userId: localStorage.getItem('vendorId'),
          userType: 'Vendor',
          closedAt: new Date()
        });
      }
      
      setMessages([]);
      setTicketId(null);
      setIsOpen(false);
      
      toast.success('Ticket closed successfully!',{containerId:"vendorTicket"});
    } catch (error) {
      console.error('Error closing ticket:', error);
    toast.error('Failed to close ticket. Please try again.',{containerId:"vendorTicket"});
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    setSendingMessage(true);
  
    try {
      const userType = 'Vendor';
      const userId = localStorage.getItem('vendorId');
      
      const response = await axios.post(
        `${BASE_URL}/admin/support/send-message`,
        {
          message: newMessage.trim(),
          ticketId: ticketId,
          userId: userId,
          userType: userType
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('vendorToken')}`
          }
        }
      );
  
      const newMsg = {
        id: response.data.messageId || Date.now(),
        text: newMessage.trim(),
        sender: userType,
        timestamp: new Date(),
        read: false
      };
  
      setMessages([...messages, newMsg]);
      setNewMessage('');
      
      const isNewTicket = !ticketId;
      
      if (!ticketId) {
        setTicketId(response.data.ticketId);
      }
  
  
      if (socketRef?.socket) {
        if (isNewTicket) {
         
          socketRef.socket.emit('newTicketCreated', {
            ticketId: response.data.ticketId,
            message: newMessage.trim(),
            sendBy: userType,
            userId: userId,
            timestamp: new Date(),
            messageId: response.data.messageId,
            userType: userType
          });
          console.log('✅ Emitted newTicketCreated event (vendor)');
        } else {
          
          socketRef.socket.emit('sendSupportMessage', {
            ticketId: response.data.ticketId || ticketId,
            message: newMessage.trim(),
            sendBy: userType,
            userId: userId,
            timestamp: new Date(),
            messageId: response.data.messageId,
            userType: userType
          });
        }
      }
  
      setSendingMessage(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setSendingMessage(false);
      toast.error('Failed to send message. Please try again.',{containerId:"vendorTicket"});
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };


// Replace your socket listeners useEffect with this fixed version:

useEffect(() => {
  if (!socketRef?.socket) return;

  const socket = socketRef.socket;

  // Listen for new messages from admin
  socket.on('newSupportMessage', (data) => {
    console.log('New support message received (vendor):', data);
    
    // ⭐ FIX: Handle nested data structure
    const messageData = data.message || data;
    const messageText = messageData.message || data.message?.message || '';
    const messageId = messageData._id || data.messageId || data.id;
    const timestamp = messageData.createdAt || data.timestamp;
    const sentBy = messageData.sentBy || data.sendBy;
    
    // Only add admin messages
    if (sentBy === 'admin') {
      const newMsg = {
        id: messageId,
        text: messageText,
        sender: 'admin',
        timestamp: new Date(timestamp),
        read: false
      };
      
      // ⭐ Prevent duplicates
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === messageId);
        if (exists) {
          console.log('Message already exists, skipping');
          return prev;
        }
        console.log('✅ Adding new admin message:', newMsg);
        return [...prev, newMsg];
      });
      
      // Show unread indicator if chat is closed or minimized
      if (!isOpen || isMinimized) {
        setHasUnread(true);
      } else {
        // Auto-mark as read if chat is open
        setTimeout(() => markMessagesAsRead(), 500);
      }
    }
  });

  // Listen for read receipts from admin
  socket.on('supportMessageRead', (data) => {
    console.log('Support message read by admin (vendor):', data);
    
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.sender === 'Vendor' ? { ...msg, read: true } : msg
      )
    );
  });

  return () => {
    socket.off('newSupportMessage');
    socket.off('supportMessageRead');
  };
}, [socketRef, isOpen, isMinimized, ticketId]);
  return (
    <>
    <ToastContainer containerId={"vendorTicket"}/>
    <div className="fixed bottom-6 left-6 z-50">
        {!isOpen && (
          <button
            onClick={toggleChat}
            className="bg-[#024a47] hover:bg-[#035d59] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 relative"
            aria-label="Open support chat"
          >
            <MessageCircle className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                !
              </span>
            )}
          </button>
        )}

        {isOpen && (
          <div
            className={`bg-white rounded-lg shadow-2xl transition-all duration-300 ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            } flex flex-col overflow-hidden border border-gray-200`}
          >
            <div className="bg-[#024a47] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#024a47]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Admin Support</h3>
                  <p className="text-xs opacity-90">We're here to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {ticketId && (
                  <button
                    onClick={closeTicket}
                    className="hover:bg-red-600 bg-red-500 px-2 py-1 rounded transition-colors text-xs font-medium"
                    title="Close Ticket"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-[#035d59] p-1.5 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button onClick={toggleChat} className="hover:bg-[#035d59] p-1.5 rounded transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-[#024a47] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading messages...</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <div className="w-16 h-16 bg-[#024a47] rounded-full flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Support!</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Have a question or need help? Send us a message and we'll get back to you as soon as possible.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                        <p className="font-medium mb-1">💡 Quick Tips:</p>
                        <ul className="text-left space-y-1">
                          <li>• Describe your issue clearly</li>
                          <li>• Include relevant details</li>
                          <li>• We typically respond within 24 hours</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => {
                        const isVendor = msg.sender === 'Vendor';
                        return (
                          <div key={msg.id || index} className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end space-x-2 max-w-[80%] ${isVendor ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              {!isVendor && (
                                <div className="w-6 h-6 bg-[#024a47] rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                  A
                                </div>
                              )}
                              <div>
                                <div className={`px-3 py-2 rounded-2xl ${isVendor ? 'bg-[#024a47] text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                                </div>
                                <div className={`flex items-center space-x-1 mt-1 px-1 ${isVendor ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                                  {isVendor && (msg.read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-gray-400" />)}
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

                <div className="bg-white border-t border-gray-200 p-3">
                  <div className="flex items-end space-x-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows="1"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] focus:border-transparent resize-none"
                      style={{ minHeight: '36px', maxHeight: '100px' }}
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
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Ticket #{ticketId ? ticketId.slice(-8) : 'New'}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default VendorSupportChatWidget;