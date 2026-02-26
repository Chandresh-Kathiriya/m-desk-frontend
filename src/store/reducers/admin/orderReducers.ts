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