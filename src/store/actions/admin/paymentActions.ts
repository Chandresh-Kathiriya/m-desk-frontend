import axios from 'axios';
import {
    PAYMENT_CREATE_REQUEST,
    PAYMENT_CREATE_SUCCESS,
    PAYMENT_CREATE_FAIL,
} from '../../constants/admin/paymentConstants';

export const createPayment = (paymentData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: PAYMENT_CREATE_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.post('/api/payments', paymentData, config);

        dispatch({ type: PAYMENT_CREATE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: PAYMENT_CREATE_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};