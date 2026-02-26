import axios from 'axios';
import {
    ORDER_LIST_REQUEST,
    ORDER_LIST_SUCCESS,
    ORDER_LIST_FAIL,
    ORDER_DETAILS_REQUEST,
    ORDER_DETAILS_SUCCESS,
    ORDER_DETAILS_FAIL,
    ORDER_DELIVER_REQUEST,
    ORDER_DELIVER_SUCCESS,
    ORDER_DELIVER_FAIL,
} from '../../constants/admin/orderConstants';

export const listOrders = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: ORDER_LIST_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/orders', config);

        dispatch({ type: ORDER_LIST_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: ORDER_LIST_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getOrderDetails = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: ORDER_DETAILS_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/orders/${id}`, config);

        dispatch({ type: ORDER_DETAILS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const deliverOrder = (order: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: ORDER_DELIVER_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        // Passing an empty object {} as the body since it's a PUT request requiring no payload
        const { data } = await axios.put(`/api/orders/${order._id}/deliver`, {}, config);

        dispatch({ type: ORDER_DELIVER_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: ORDER_DELIVER_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};