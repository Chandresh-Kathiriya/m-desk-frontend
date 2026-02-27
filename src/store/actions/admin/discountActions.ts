import axios from 'axios';
import {
    DISCOUNT_OFFER_LIST_REQUEST, DISCOUNT_OFFER_LIST_SUCCESS, DISCOUNT_OFFER_LIST_FAIL,
    DISCOUNT_COUPON_LIST_REQUEST, DISCOUNT_COUPON_LIST_SUCCESS, DISCOUNT_COUPON_LIST_FAIL,
    DISCOUNT_OFFER_CREATE_REQUEST, DISCOUNT_OFFER_CREATE_SUCCESS, DISCOUNT_OFFER_CREATE_FAIL,
    DISCOUNT_COUPON_CREATE_REQUEST, DISCOUNT_COUPON_CREATE_SUCCESS, DISCOUNT_COUPON_CREATE_FAIL
} from '../../constants/admin/discountConstants';

export const listDiscountOffers = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: DISCOUNT_OFFER_LIST_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
        const { data } = await axios.get('/api/discounts/offers', config);
        dispatch({ type: DISCOUNT_OFFER_LIST_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: DISCOUNT_OFFER_LIST_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const listDiscountCoupons = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: DISCOUNT_COUPON_LIST_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
        const { data } = await axios.get('/api/discounts/coupons', config);
        dispatch({ type: DISCOUNT_COUPON_LIST_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: DISCOUNT_COUPON_LIST_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const createDiscountOffer = (offerData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: DISCOUNT_OFFER_CREATE_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
        const { data } = await axios.post('/api/discounts/offers', offerData, config);
        dispatch({ type: DISCOUNT_OFFER_CREATE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: DISCOUNT_OFFER_CREATE_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const createDiscountCoupon = (couponData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: DISCOUNT_COUPON_CREATE_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
        const { data } = await axios.post('/api/discounts/coupons', couponData, config);
        dispatch({ type: DISCOUNT_COUPON_CREATE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: DISCOUNT_COUPON_CREATE_FAIL, payload: error.response?.data?.message || error.message });
    }
};