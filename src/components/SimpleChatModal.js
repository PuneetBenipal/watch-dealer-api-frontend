import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Badge,
  Paper,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';

import { Send, Chat, Business, Close } from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import { useSocket } from '../contexts/SocketContext';
import api from '../api';

const SimpleChatModal = ({ open, onClose }) => {
  const { user } = useAuth();
  const { socket, isConnected, emit, on, off } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-select first conversation when conversations are loaded
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations]);

  const selectedConversationRef = useRef(selectedConversation);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    console.log("UI console selectedConversation", selectedConversation)
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversation && socket) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/conversations/user/conversations');
      console.log("UI console fetchConversations  ==>", response.data)
      setConversations(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(`Failed to load conversations: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/api/conversations/user/conversations/${conversationId}`);
      setMessages(response.data.messages || []);

      // Mark messages as read
      await api.put(`/api/conversations/user/conversations/${conversationId}/read`);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  const handleReceiveMessage = (newMessage) => {
    console.log('UI console Received newMessage:', newMessage, selectedConversationRef);
    const currentConversation = selectedConversationRef.current;
    if (!currentConversation) return;
    if (newMessage.conversationId == currentConversation._id) {
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    console.log("UI console handleSnedMessage", selectedConversation)
    try {
      if (!selectedConversation) {
        setError('Please select a conversation first');
        return;
      }

      await api.post(`/api/conversations/user/conversations/${selectedConversation._id}/messages`, {
        content: newMessage.trim(),
        messageType: 'text',
      });
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    on('receive_message', handleReceiveMessage);

    return () => {
      off('receive_message', handleReceiveMessage);
    };
  }, [socket]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOtherParticipant = (conversation) => {
    if (conversation.adminId._id == user._id) return conversation.customerId;
    else return conversation.adminId;
  };

  // Fetch conversations on mount
  useEffect(() => {
    if (open) {
      fetchConversations();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '85vh',
          maxHeight: '85vh',
          bgcolor: 'white',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', height: '100%' }}>
        {/* Left Sidebar - Conversation List */}
        <Box
          sx={{
            width: 320,
            bgcolor: '#fafafa',
            borderRight: '1px solid #f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 3.3, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '1.1rem' }}>
              Conversations
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
            ) : conversations.length === 0 ? (
              <Typography sx={{ p: 2, color: '#666', textAlign: 'center' }}>
                No conversations yet
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {conversations.length > 0 && conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);

                  return (
                    <ListItem
                      key={conversation._id}
                      button
                      onClick={() => setSelectedConversation(conversation)}
                      sx={{
                        bgcolor: selectedConversation?._id === conversation._id ? '#e3f2fd' : 'transparent',
                        '&:hover': { bgcolor: '#f5f5f5' },
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unreadCount || 0}
                          color="error"
                          invisible={!conversation.unreadCount}
                        >
                          <Avatar
                            src={otherParticipant?.profilePicture}
                            sx={{
                              bgcolor: '#1976d2',
                              width: 48,
                              height: 48,
                              boxShadow: '0 2px 8px rgba(25,118,210,0.2)'
                            }}
                          >
                            <Business />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        primary={
                          <Typography sx={{
                            color: '#1a1a1a',
                            fontWeight: conversation.unreadCount ? 'bold' : 'normal',
                            fontSize: '0.95rem'
                          }}>
                            {otherParticipant?.fullName || 'Unknown Admin'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                              {conversation.companyId?.name || 'Unknown Company'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                              {formatTime(conversation.lastMessage)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>

        {/* Right Side - Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box sx={{
                p: 2,
                bgcolor: 'white',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: "20px"
              }}>
                <Badge
                  badgeContent={isConnected ? '' : ''}
                  color={isConnected ? 'success' : 'error'}
                  sx={{
                    '& .MuiBadge-badge': {
                      border: '1px solid white',
                    },
                    color: 'white',
                  }}
                  overlap="circular"
                >
                  <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
                    <Business />
                  </Avatar>
                </Badge>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '1.1rem' }}>
                    {getOtherParticipant(selectedConversation)?.fullName || 'Unknown Admin'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                    {selectedConversation.companyId?.name || 'Unknown Company'}
                  </Typography>
                </Box>
                <IconButton
                  onClick={onClose}
                  sx={{
                    color: '#666',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                      color: '#333'
                    }
                  }}
                >
                  <Close />
                </IconButton>
              </Box>

              {/* Messages Area */}
              <Box sx={{
                flex: 1,
                overflow: 'auto',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                bgcolor: '#fafafa'
              }}>
                {messages.length > 0 && messages.map((message, index) => {
                  let isOwnMessage = false;

                  if (message.senderId._id) {
                    isOwnMessage = message.senderId._id === user._id
                  } else {
                    isOwnMessage = message.senderId === user._id;
                  }

                  return (
                    <Box
                      key={message._id || index}
                      sx={{
                        display: 'flex',
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                        mb: 1.5
                      }}
                    >
                      <Paper
                        sx={{
                          px: 2,
                          py: 1,
                          maxWidth: '70%',
                          borderRadius: isOwnMessage
                            ? '20px 20px 6px 20px'
                            : '20px 20px 20px 6px',
                          bgcolor: isOwnMessage
                            ? '#1976d2'
                            : 'white',
                          color: isOwnMessage ? 'white' : '#1a1a1a',
                          boxShadow: isOwnMessage
                            ? '0 4px 12px rgba(25,118,210,0.25)'
                            : '0 2px 8px rgba(0,0,0,0.08)',
                          fontSize: '0.95rem',
                          wordBreak: 'break-word',
                          border: isOwnMessage ? 'none' : '1px solid #f0f0f0',
                          // paddingLeft: isOwnMessage ? 4 : 2,
                          paddingRight: isOwnMessage ? 4 : 4
                        }}
                      >
                        <Typography sx={{ lineHeight: 1.4 }}>{message.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#999',
                            textAlign: isOwnMessage ? 'right' : 'left',
                            fontSize: '0.75rem',
                            margin: isOwnMessage ? '-5px -20px 0 0' : '-5px -20px 0 0'
                          }}
                        >
                          {formatTime(message.createdAt)}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })}

                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2.5, borderTop: '1px solid #f0f0f0', bgcolor: 'white' }}>
                <Grid container spacing={1.5}>
                  <Grid item xs style={{ flex: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      InputProps={{
                        sx: {
                          bgcolor: '#f8f9fa',
                          color: '#1a1a1a',
                          borderRadius: 3,
                          px: 2,
                          py: 1.5,
                          fontSize: '1rem',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e0e0e0'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: '2px'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      sx={{
                        bgcolor: '#1976d2',
                        '&:hover': { bgcolor: '#1565c0' },
                        borderRadius: 3,
                        px: 2.5,
                        py: 1.5,
                        boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                        minWidth: '48px',
                        height: '48px'
                      }}
                    >
                      <Send />
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </>
          ) : (
            /* No conversation selected - Show message input for new chat */
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              color: '#666'
            }}>
              <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2
              }}>
                <Chat sx={{ fontSize: 64, mb: 2, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ mb: 1, color: '#1a1a1a', fontWeight: 600 }}>
                  {conversations.length === 0 ? 'Start a new conversation' : 'Select a conversation to start chatting'}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
                  {conversations.length === 0
                    ? 'Click "Contact Seller" on any product to start chatting with the seller'
                    : 'Choose a conversation from the list to begin messaging'
                  }
                </Typography>
              </Box>

              {/* Always show message input */}
              <Box sx={{ p: 1.5, borderTop: '1px solid #f0f0f0', bgcolor: 'white' }} className="ui-sender-input">
                <Grid container spacing={1.5} alignItems="center">
                  {/* Message Input Area */}
                  <Grid item size={10} style={{ flex: 2 }}>
                    <TextField
                      multiline
                      maxRows={4}
                      placeholder="Type a message to start chatting..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      sx={{
                        width: '100%',
                        bgcolor: '#f8f9fa',
                        color: '#1a1a1a',
                        borderRadius: 2,
                        padding: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#f8f9fa',
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#bdbdbd',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                        fontSize: 14,
                      }}
                    />
                  </Grid>

                  {/* Send Button */}
                  <Grid item size={2} >
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !selectedConversation}
                      sx={{
                        bgcolor: '#1976d2',
                        '&:hover': { bgcolor: '#1565c0' },
                        minWidth: 48,
                        height: 48,
                        borderRadius: 2,
                        boxShadow: 2,
                        transition: 'background-color 0.3s',
                      }}
                    >
                      <Send />
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleChatModal; 