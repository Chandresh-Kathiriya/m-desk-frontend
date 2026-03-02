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
    ORDER_DELIVER_RESET,
    ORDER_CREATE_MANUAL_RESET,
    ORDER_CREATE_MANUAL_FAIL,
    ORDER_CREATE_MANUAL_SUCCESS,
    ORDER_CREATE_MANUAL_REQUEST,
    ORDER_PAY_MANUAL_REQUEST,
    ORDER_PAY_MANUAL_SUCCESS,
    ORDER_PAY_MANUAL_FAIL,
    ORDER_PAY_MANUAL_RESET
} from '../../constants/admin/orderConstants';

export const orderListReducer = (state = { orders: [] }, action: any) => {
    switch (action.type) {
        case ORDER_LIST_REQUEST:
            return { loading: true, orders: [] };
        case ORDER_LIST_SUCCESS:
            return { loading: false, orders: action.payload };
        case ORDER_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const orderDetailsReducer = (state = { loading: true, orderItems: [], shippingAddress: {} }, action: any) => {
    switch (action.type) {
        case ORDER_DETAILS_REQUEST:
            return { ...state, loading: true };
        case ORDER_DETAILS_SUCCESS:
            return { loading: false, order: action.payload };
        case ORDER_DETAILS_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const orderDeliverReducer = (state = {}, action: any) => {
    switch (action.type) {
        case ORDER_DELIVER_REQUEST:
            return { loading: true };
        case ORDER_DELIVER_SUCCESS:
            return { loading: false, success: true };
        case ORDER_DELIVER_FAIL:
            return { loading: false, error: action.payload };
        case ORDER_DELIVER_RESET:
            return {};
        default:
            return state;
    }
};

export const orderCreateManualReducer = (state = {}, action: any) => {
    switch (action.type) {
        case ORDER_CREATE_MANUAL_REQUEST: return { loading: true };
        case ORDER_CREATE_MANUAL_SUCCESS: return { loading: false, success: true, order: action.payload };
        case ORDER_CREATE_MANUAL_FAIL: return { loading: false, error: action.payload };
        case ORDER_CREATE_MANUAL_RESET: return {};
        default: return state;
    }
};

export const orderPayManualReducer = (state = {}, action: any) => {
    switch (action.type) {
        case ORDER_PAY_MANUAL_REQUEST:
            return { loading: true };
        case ORDER_PAY_MANUAL_SUCCESS:
            return { loading: false, success: true };
        case ORDER_PAY_MANUAL_FAIL:
            return { loading: false, error: action.payload };
        case ORDER_PAY_MANUAL_RESET:
            return {};
        default:
            return state;
    }
};