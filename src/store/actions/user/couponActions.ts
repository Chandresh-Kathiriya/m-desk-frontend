import axios from 'axios';
import {
    COUPON_VALIDATE_REQUEST,
    COUPON_VALIDATE_SUCCESS,
    COUPON_VALIDATE_FAIL,
} from '../../constants/user/couponConstants';

export const validateCoupon = (code: string, cartItems: any[]) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: COUPON_VALIDATE_REQUEST });

        const state = getState();
        const userInfo = state.userAuth?.userInfo;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const payload = { code, cartItems };

        const { data } = await axios.post('/api/coupons/validate', payload, config);

        dispatch({ type: COUPON_VALIDATE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: COUPON_VALIDATE_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};