import {
    PURCHASE_CREATE_REQUEST, PURCHASE_CREATE_SUCCESS, PURCHASE_CREATE_FAIL, PURCHASE_CREATE_RESET,
    PURCHASE_DETAILS_REQUEST, PURCHASE_DETAILS_SUCCESS, PURCHASE_DETAILS_FAIL, PURCHASE_DETAILS_RESET,
    PURCHASE_RECEIVE_REQUEST, PURCHASE_RECEIVE_SUCCESS, PURCHASE_RECEIVE_FAIL, PURCHASE_RECEIVE_RESET, // <-- ADDED THIS
    PURCHASE_LIST_REQUEST, PURCHASE_LIST_SUCCESS, PURCHASE_LIST_FAIL,
} from '../../constants/admin/purchaseConstants';

export const purchaseCreateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case PURCHASE_CREATE_REQUEST: return { loading: true };
        case PURCHASE_CREATE_SUCCESS: return { loading: false, success: true, purchase: action.payload };
        case PURCHASE_CREATE_FAIL: return { loading: false, error: action.payload };
        case PURCHASE_CREATE_RESET: return {};
        default: return state;
    }
};

export const purchaseDetailsReducer = (state = { loading: true }, action: any) => {
    switch (action.type) {
        case PURCHASE_DETAILS_REQUEST: return { ...state, loading: true };
        case PURCHASE_DETAILS_SUCCESS: return { loading: false, purchase: action.payload };
        case PURCHASE_DETAILS_FAIL: return { loading: false, error: action.payload };
        case PURCHASE_DETAILS_RESET: return {};
        default: return state;
    }
};

// --- THIS REPLACES BOTH CONFIRM AND BILL REDUCERS ---
export const purchaseReceiveReducer = (state = {}, action: any) => {
    switch (action.type) {
        case PURCHASE_RECEIVE_REQUEST: return { loading: true };
        case PURCHASE_RECEIVE_SUCCESS: return { loading: false, success: true };
        case PURCHASE_RECEIVE_FAIL: return { loading: false, error: action.payload };
        case PURCHASE_RECEIVE_RESET: return {};
        default: return state;
    }
};

export const purchaseListReducer = (state = { orders: [] }, action: any) => {
    switch (action.type) {
        case PURCHASE_LIST_REQUEST: return { loading: true, orders: [] };
        case PURCHASE_LIST_SUCCESS: return { loading: false, orders: action.payload };
        case PURCHASE_LIST_FAIL: return { loading: false, error: action.payload };
        default: return state;
    }
};