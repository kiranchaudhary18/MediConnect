import axios from '../utils/axios';

export const getConversations = async () => {
  const response = await axios.get('/messages/conversations');
  return response.data;
};

export const getMyPatients = async () => {
  const response = await axios.get('/messages/my-patients');
  return response.data;
};

export const getMyDoctors = async () => {
  const response = await axios.get('/messages/my-doctors');
  return response.data;
};

export const getMessages = async (partnerId) => {
  const response = await axios.get(`/messages/${partnerId}`);
  return response.data;
};

export const sendMessage = async (receiverId, message) => {
  const response = await axios.post('/messages/send', {
    receiverId,
    message,
  });
  return response.data;
};

export const markAsRead = async (messageId) => {
  const response = await axios.patch(`/messages/${messageId}/read`);
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await axios.delete(`/messages/${messageId}`);
  return response.data;
};
