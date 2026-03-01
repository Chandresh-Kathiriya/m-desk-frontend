import {
    BILL_LIST_REQUEST,
    BILL_LIST_SUCCESS,
    BILL_LIST_FAIL,
    BILL_DOWNLOAD_REQUEST,
    BILL_DOWNLOAD_SUCCESS,
    BILL_DOWNLOAD_FAIL,
    BILL_DOWNLOAD_RESET,
    BILL_DETAILS_REQUEST,
    BILL_DETAILS_SUCCESS,
    BILL_DETAILS_FAIL,
    BILL_DETAILS_RESET
} from '../../constants/admin/billConstants';

export const billListReducer = (state = { bills: [] }, action: any) => {
    switch (action.type) {
        case BILL_LIST_REQUEST:
            return { loading: true, bills: [] };
        case BILL_LIST_SUCCESS:
            return { loading: false, bills: action.payload };
        case BILL_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const billDownloadReducer = (state = {}, action: any) => {
    switch (action.type) {
        case BILL_DOWNLOAD_REQUEST:
            return { loading: true, loadingId: action.payload };
        case BILL_DOWNLOAD_SUCCESS:
            return { loading: false, success: true };
        case BILL_DOWNLOAD_FAIL:
            return { loading: false, error: action.payload };
        case BILL_DOWNLOAD_RESET:
            return {};
        default:
            return state;
    }
};

export const billDetailsReducer = (state = { loading: true }, action: any) => {
    switch (action.type) {
        case BILL_DETAILS_REQUEST:
            return { ...state, loading: true };
        case BILL_DETAILS_SUCCESS:
            return { loading: false, bill: action.payload };
        case BILL_DETAILS_FAIL:
            return { loading: false, error: action.payload };
        case BILL_DETAILS_RESET:
            return {};
        default:
            return state;
    }
};