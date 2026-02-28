import {
    USER_INVOICE_BY_ORDER_REQUEST,
    USER_INVOICE_BY_ORDER_SUCCESS,
    USER_INVOICE_BY_ORDER_FAIL,
    USER_INVOICE_BY_ORDER_RESET,
    USER_INVOICE_DETAILS_REQUEST,
    USER_INVOICE_DETAILS_SUCCESS,
    USER_INVOICE_DETAILS_FAIL,
    USER_INVOICE_DETAILS_RESET,
    USER_INVOICE_LIST_REQUEST,
    USER_INVOICE_LIST_SUCCESS,
    USER_INVOICE_LIST_FAIL,
    USER_INVOICE_LIST_RESET,
    USER_INVOICE_DOWNLOAD_REQUEST,
    USER_INVOICE_DOWNLOAD_SUCCESS,
    USER_INVOICE_DOWNLOAD_FAIL,
    USER_INVOICE_DOWNLOAD_RESET
} from '../../constants/user/invoiceConstants';

export const userInvoiceByOrderReducer = (state = {}, action: any) => {
    switch (action.type) {
        case USER_INVOICE_BY_ORDER_REQUEST:
            return { loading: true };
        case USER_INVOICE_BY_ORDER_SUCCESS:
            return { loading: false, invoice: action.payload };
        case USER_INVOICE_BY_ORDER_FAIL:
            return { loading: false, error: action.payload };
        case USER_INVOICE_BY_ORDER_RESET:
            return {};
        default:
            return state;
    }
};

export const userInvoiceDetailsReducer = (state = { loading: true }, action: any) => {
    switch (action.type) {
        case USER_INVOICE_DETAILS_REQUEST:
            return { ...state, loading: true };
        case USER_INVOICE_DETAILS_SUCCESS:
            return { loading: false, invoice: action.payload };
        case USER_INVOICE_DETAILS_FAIL:
            return { loading: false, error: action.payload };
        case USER_INVOICE_DETAILS_RESET:
            return {};
        default:
            return state;
    }
};

export const userInvoiceListReducer = (state = { invoices: [] }, action: any) => {
    switch (action.type) {
        case USER_INVOICE_LIST_REQUEST:
            return { loading: true, invoices: [] };
        case USER_INVOICE_LIST_SUCCESS:
            return { loading: false, invoices: action.payload };
        case USER_INVOICE_LIST_FAIL:
            return { loading: false, error: action.payload };
        case USER_INVOICE_LIST_RESET:
            return { invoices: [] };
        default:
            return state;
    }
};

export const userInvoiceDownloadReducer = (state = {}, action: any) => {
    switch (action.type) {
        case USER_INVOICE_DOWNLOAD_REQUEST:
            return { loading: true, loadingId: action.payload };
        case USER_INVOICE_DOWNLOAD_SUCCESS:
            return { loading: false, success: true };
        case USER_INVOICE_DOWNLOAD_FAIL:
            return { loading: false, error: action.payload };
        case USER_INVOICE_DOWNLOAD_RESET:
            return {};
        default:
            return state;
    }
};