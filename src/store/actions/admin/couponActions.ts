import axios from 'axios';
import {
    COUPON_LIST_REQUEST,
    COUPON_LIST_SUCCESS,
    COUPON_LIST_FAIL,
    COUPON_CREATE_REQUEST,
    COUPON_CREATE_SUCCESS,
    COUPON_CREATE_FAIL,
} from '../../constants/admin/couponConstants';

export const listCoupons = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: COUPON_LIST_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/coupons', config);

        dispatch({ type: COUPON_LIST_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: COUPON_LIST_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const createCoupon = (couponData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: COUPON_CREATE_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.post('/api/coupons', couponData, config);

        dispatch({ type: COUPON_CREATE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: COUPON_CREATE_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};