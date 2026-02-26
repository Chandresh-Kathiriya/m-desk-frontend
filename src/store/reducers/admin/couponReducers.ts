import {
    COUPON_LIST_REQUEST,
    COUPON_LIST_SUCCESS,
    COUPON_LIST_FAIL,
    COUPON_CREATE_REQUEST,
    COUPON_CREATE_SUCCESS,
    COUPON_CREATE_FAIL,
    COUPON_CREATE_RESET,
} from '../../constants/admin/couponConstants';

export const couponListReducer = (state = { coupons: [] }, action: any) => {
    switch (action.type) {
        case COUPON_LIST_REQUEST:
            return { loading: true, coupons: [] };
        case COUPON_LIST_SUCCESS:
            return { loading: false, coupons: action.payload };
        case COUPON_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const couponCreateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case COUPON_CREATE_REQUEST:
            return { loading: true };
        case COUPON_CREATE_SUCCESS:
            return { loading: false, success: true, coupon: action.payload };
        case COUPON_CREATE_FAIL:
            return { loading: false, error: action.payload };
        case COUPON_CREATE_RESET:
            return {};
        default:
            return state;
    }
};