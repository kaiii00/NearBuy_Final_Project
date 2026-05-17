import axios from 'axios';

const SPRING_API = 'http://localhost:8080/api';
const PHP_API = 'http://localhost:8001/api';
const DJANGO_API = 'http://localhost:8002/api';

const springApi = axios.create({
  baseURL: SPRING_API,
  headers: { 'Content-Type': 'application/json' },
});

const phpApi = axios.create({
  baseURL: PHP_API,
  headers: { 'Content-Type': 'application/json' },
});

const djangoApi = axios.create({
  baseURL: DJANGO_API,
  headers: { 'Content-Type': 'application/json' },
});

const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

springApi.interceptors.request.use(attachToken);
phpApi.interceptors.request.use(attachToken);
djangoApi.interceptors.request.use(attachToken);

// Auth - Spring Boot
export const registerUser = (data) => springApi.post('/auth/register', data);
export const loginUser = (data) => springApi.post('/auth/login', data);

// Profile
export const getProfile = () => springApi.get('/users/profile');
export const getPublicProfile = (userId) => springApi.get(`/users/${userId}/public`);

// Stores & Products
export const getStores = () => springApi.get('/stores');
export const getProducts = (storeId) => springApi.get(`/stores/${storeId}/products`);

// Orders
export const placeOrder = (data) => springApi.post('/orders', data);
export const getOrders = () => springApi.get('/orders/my');
export const cancelOrder = (orderId) => springApi.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' });

// Chat media upload
export const uploadProfilePhoto = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return springApi.post('/users/profile/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

  export const uploadStoreImage = (storeId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      return springApi.post(`/stores/${storeId}/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
  };
  
export const uploadChatMedia = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return springApi.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Chat - Spring Boot
export const getMessages = (userId) => springApi.get(`/chat/${userId}`);
export const sendMessage = (data) => springApi.post('/chat', data);

// Feedback & Ratings - PHP
export const submitFeedback = (data) => phpApi.post('/feedback', data);
export const submitRating = (data) => phpApi.post('/ratings', data);
export const getStoreRatings = (storeId) => phpApi.get(`/ratings/store/${storeId}`);
export const replyToRating = (ratingId, reply) => phpApi.patch(`/ratings/${ratingId}/reply`, { reply });
export const getOrderFeedback = (orderId) => phpApi.get(`/feedback/order/${orderId}`);

// Notifications - Django
export const getNotifications = (userId) => djangoApi.get(`/notifications/?user_id=${userId}`);
export const createNotification = (data) => djangoApi.post('/notifications/create/', data);
export const markNotificationRead = (id) => djangoApi.patch(`/notifications/${id}/read/`);
export const markAllNotificationsRead = (userId) => djangoApi.patch('/notifications/read-all/', { user_id: userId });
export const getUnreadCount = (userId) => djangoApi.get(`/notifications/unread-count/?user_id=${userId}`);

export { springApi, phpApi, djangoApi };
export default springApi;