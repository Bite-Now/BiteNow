import api from './api';



export const mockPaymentSuccess = async (payload) => {
    const response = await api.post('/payments/mock-success', payload);
    return response.data;
};

export const mockPaymentFailed = async (payload) => {
    const response = await api.post('/payments/mock-failed', payload);
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

export const completeStaffOrder = async (orderId) => {
    const response = await api.patch(`/staff/orders/${orderId}/complete`);
    return response.data;
};

export const getOwnerOrders = async () => {
    const response = await api.get('/owner/orders');
    return response.data;
};

export const completeOwnerOrder = async (orderId) => {
    const response = await api.patch(`/owner/orders/${orderId}/complete`);
    return response.data;
};
