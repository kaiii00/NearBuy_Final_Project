import axios from 'axios';

const DJANGO_API = 'http://localhost:8002/api';
const SPRING_API = 'http://localhost:8080/api';
const PHP_API = 'http://localhost:8001/api';

const djangoApi = axios.create({
  baseURL: DJANGO_API,
  headers: { 'Content-Type': 'application/json' },
});

const springApi = axios.create({
  baseURL: SPRING_API,
  headers: { 'Content-Type': 'application/json' },
});

const phpApi = axios.create({
  baseURL: PHP_API,
  headers: { 'Content-Type': 'application/json' },
});

const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

djangoApi.interceptors.request.use(attachToken);
springApi.interceptors.request.use(attachToken);
phpApi.interceptors.request.use(attachToken);

export const registerUser = (data) => axios.post(`${DJANGO_API}/users/register/`, data);
export const loginUser = (data) => axios.post(`${DJANGO_API}/users/login/`, data);

export const getProfile = () => djangoApi.get('/users/profile/');
export const getStores = () => springApi.get('/stores');
export const getProducts = (storeId) => springApi.get(`/stores/${storeId}/products`);
export const placeOrder = (data) => springApi.post('/orders', data);
export const getOrders = () => springApi.get('/orders/my');
export const getMessages = (orderId) => phpApi.get(`/chat/${orderId}`);
export const sendMessage = (data) => phpApi.post('/chat', data);
export const submitFeedback = (data) => phpApi.post('/feedback', data);
export const submitRating = (data) => phpApi.post('/ratings', data);
export const getStoreRatings = (storeId) => phpApi.get(`/ratings/store/${storeId}`);
export const getOrderFeedback = (orderId) => phpApi.get(`/feedback/order/${orderId}`);

export { djangoApi, springApi, phpApi };
export default djangoApi;