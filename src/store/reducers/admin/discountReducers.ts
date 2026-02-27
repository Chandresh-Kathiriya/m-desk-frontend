import {
    DISCOUNT_OFFER_LIST_REQUEST, DISCOUNT_OFFER_LIST_SUCCESS, DISCOUNT_OFFER_LIST_FAIL,
    DISCOUNT_COUPON_LIST_REQUEST, DISCOUNT_COUPON_LIST_SUCCESS, DISCOUNT_COUPON_LIST_FAIL,
    DISCOUNT_OFFER_CREATE_REQUEST, DISCOUNT_OFFER_CREATE_SUCCESS, DISCOUNT_OFFER_CREATE_FAIL, DISCOUNT_OFFER_CREATE_RESET,
    DISCOUNT_COUPON_CREATE_REQUEST, DISCOUNT_COUPON_CREATE_SUCCESS, DISCOUNT_COUPON_CREATE_FAIL, DISCOUNT_COUPON_CREATE_RESET
} from '../../constants/admin/discountConstants';

export const discountOfferListReducer = (state = { offers: [] }, action: any) => {
    switch (action.type) {
        case DISCOUNT_OFFER_LIST_REQUEST: return { loading: true, offers: [] };
        case DISCOUNT_OFFER_LIST_SUCCESS: return { loading: false, offers: action.payload };
        case DISCOUNT_OFFER_LIST_FAIL: return { loading: false, error: action.payload };
        default: return state;
    }
};

export const discountCouponListReducer = (state = { coupons: [] }, action: any) => {
    switch (action.type) {
        case DISCOUNT_COUPON_LIST_REQUEST: return { loading: true, coupons: [] };
        case DISCOUNT_COUPON_LIST_SUCCESS: return { loading: false, coupons: action.payload };
        case DISCOUNT_COUPON_LIST_FAIL: return { loading: false, error: action.payload };
        default: return state;
    }
};

export const discountOfferCreateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case DISCOUNT_OFFER_CREATE_REQUEST: return { loading: true };
        case DISCOUNT_OFFER_CREATE_SUCCESS: return { loading: false, success: true, offer: action.payload };
        case DISCOUNT_OFFER_CREATE_FAIL: return { loading: false, error: action.payload };
        case DISCOUNT_OFFER_CREATE_RESET: return {};
        default: return state;
    }
};

export const discountCouponCreateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case DISCOUNT_COUPON_CREATE_REQUEST: return { loading: true };
        case DISCOUNT_COUPON_CREATE_SUCCESS: return { loading: false, success: true, coupon: action.payload };
        case DISCOUNT_COUPON_CREATE_FAIL: return { loading: false, error: action.payload };
        case DISCOUNT_COUPON_CREATE_RESET: return {};
        default: return state;
    }
};