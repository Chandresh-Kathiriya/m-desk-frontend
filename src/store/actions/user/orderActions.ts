import axios from 'axios';
import {
    ORDER_LIST_MY_REQUEST,
    ORDER_LIST_MY_SUCCESS,
    ORDER_LIST_MY_FAIL,
    ORDER_CREATE_REQUEST,
    ORDER_CREATE_SUCCESS,
    ORDER_CREATE_FAIL,
    USER_ORDER_DETAILS_REQUEST,
    USER_ORDER_DETAILS_SUCCESS,
    USER_ORDER_DETAILS_FAIL,
    ORDER_VERIFY_REQUEST,
    ORDER_VERIFY_SUCCESS,
    ORDER_VERIFY_FAIL,
    STRIPE_INTENT_REQUEST,
    STRIPE_INTENT_SUCCESS,
    STRIPE_INTENT_FAIL,
} from '../../constants/user/orderConstants';

export const listMyOrders = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: ORDER_LIST_MY_REQUEST });

        const state = getState();
        const userInfo = state.userAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/orders/myorders', config);

        dispatch({ type: ORDER_LIST_MY_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: ORDER_LIST_MY_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const createOrder = (orderData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: ORDER_CREATE_REQUEST });

        const state = getState();
        const userInfo = state.userAuth?.userInfo;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.post('/api/orders', orderData, config);

        dispatch({ type: ORDER_CREATE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: ORDER_CREATE_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getUserOrderDetails = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: USER_ORDER_DETAILS_REQUEST });

        const state = getState();
        const userInfo = state.userAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/orders/${id}`, config);

        dispatch({ type: USER_ORDER_DETAILS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: USER_ORDER_DETAILS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const verifyOrderPayment = (paymentIntentId: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: ORDER_VERIFY_REQUEST });

        const state = getState();
        const userInfo = state.userAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.post('/api/orders/verify-payment', { paymentIntentId }, config);

        dispatch({ type: ORDER_VERIFY_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: ORDER_VERIFY_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const createStripeIntent = (totalPrice: number) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: STRIPE_INTENT_REQUEST });

        const { userAuth: { userInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        const { data } = await axios.post('/api/orders/stripe-intent', { totalPrice }, config);

        dispatch({
            type: STRIPE_INTENT_SUCCESS,
            payload: data.clientSecret, // Pass the secret to the reducer!
        });
    } catch (error: any) {
        dispatch({
            type: STRIPE_INTENT_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};