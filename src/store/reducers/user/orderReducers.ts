import {
    ORDER_LIST_MY_REQUEST,
    ORDER_LIST_MY_SUCCESS,
    ORDER_LIST_MY_FAIL,
    ORDER_LIST_MY_RESET,
    ORDER_CREATE_REQUEST,
    ORDER_CREATE_SUCCESS,
    ORDER_CREATE_FAIL,
    ORDER_CREATE_RESET,
    USER_ORDER_DETAILS_REQUEST,
    USER_ORDER_DETAILS_SUCCESS,
    USER_ORDER_DETAILS_FAIL,
    ORDER_VERIFY_REQUEST,
    ORDER_VERIFY_SUCCESS,
    ORDER_VERIFY_FAIL,
    STRIPE_INTENT_REQUEST,
    STRIPE_INTENT_SUCCESS,
    STRIPE_INTENT_FAIL,
    STRIPE_INTENT_RESET
} from '../../constants/user/orderConstants';

export const orderListMyReducer = (state = { orders: [] }, action: any) => {
    switch (action.type) {
        case ORDER_LIST_MY_REQUEST:
            return { loading: true, orders: [] };
        case ORDER_LIST_MY_SUCCESS:
            return { loading: false, orders: action.payload };
        case ORDER_LIST_MY_FAIL:
            return { loading: false, error: action.payload };
        case ORDER_LIST_MY_RESET:
            return { orders: [] };
        default:
            return state;
    }
};

export const orderCreateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case ORDER_CREATE_REQUEST:
            return { loading: true };
        case ORDER_CREATE_SUCCESS:
            return { loading: false, success: true, order: action.payload };
        case ORDER_CREATE_FAIL:
            return { loading: false, error: action.payload };
        case ORDER_CREATE_RESET:
            return {};
        default:
            return state;
    }
};

export const userOrderDetailsReducer = (state = { loading: true, orderItems: [], shippingAddress: {} }, action: any) => {
    switch (action.type) {
        case USER_ORDER_DETAILS_REQUEST:
            return { ...state, loading: true };
        case USER_ORDER_DETAILS_SUCCESS:
            return { loading: false, order: action.payload };
        case USER_ORDER_DETAILS_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const orderVerifyReducer = (state = {}, action: any) => {
    switch (action.type) {
        case ORDER_VERIFY_REQUEST:
            return { loading: true };
        case ORDER_VERIFY_SUCCESS:
            return { loading: false, success: true };
        case ORDER_VERIFY_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const stripeIntentReducer = (state = {}, action: any) => {
    switch (action.type) {
        case STRIPE_INTENT_REQUEST:
            return { loading: true };
        case STRIPE_INTENT_SUCCESS:
            return { loading: false, success: true, clientSecret: action.payload };
        case STRIPE_INTENT_FAIL:
            return { loading: false, error: action.payload };
        case STRIPE_INTENT_RESET:
            return {};
        default:
            return state;
    }
};