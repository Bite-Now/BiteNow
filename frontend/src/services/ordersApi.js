import api from './api';


export const createOrder = async (payload) => {
    const response = await api.post('/orders', payload);
    return response.data;
};

export const mockPaymentSuccess = async ({ order_id }) => {
    const response = await api.post('/payments/mock-success', { order_id });
    return response.data;
};

export const mockPaymentFailed = async ({ order_id }) => {
    const response = await api.post('/payments/mock-failed', { order_id });
    return response.data;
};

export const getStudentOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

export const getOrderDetails = async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
};

export const getStaffOrders = async () => {
    const response = await api.get('/staff/orders');
    return response.data;
};

export const markOrderReadyStaff = async (orderId) => {
    const response = await api.patch(`/staff/orders/${orderId}/ready`);
    return response.data;
};

export const getOwnerOrders = async () => {
    const response = await api.get('/owner/orders');
    return response.data;
};

export const markOrderReadyOwner = async (orderId) => {
    const response = await api.patch(`/owner/orders/${orderId}/ready`);
    return response.data;
};

export const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

export const markNotificationRead = async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
};
