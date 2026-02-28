import {
    INVOICE_LIST_REQUEST,
    INVOICE_LIST_SUCCESS,
    INVOICE_LIST_FAIL,
    INVOICE_DETAILS_REQUEST,
    INVOICE_DETAILS_SUCCESS,
    INVOICE_DETAILS_FAIL,
    INVOICE_DETAILS_RESET,
    ADMIN_INVOICE_BY_ORDER_REQUEST,
    ADMIN_INVOICE_BY_ORDER_SUCCESS,
    ADMIN_INVOICE_BY_ORDER_FAIL,
    ADMIN_INVOICE_BY_ORDER_RESET,
    INVOICE_DOWNLOAD_REQUEST,
    INVOICE_DOWNLOAD_SUCCESS,
    INVOICE_DOWNLOAD_FAIL,
    INVOICE_DOWNLOAD_RESET
} from '../../constants/admin/invoiceConstants';

export const invoiceListReducer = (state = { invoices: [] }, action: any) => {
    switch (action.type) {
        case INVOICE_LIST_REQUEST:
            return { loading: true, invoices: [] };
        case INVOICE_LIST_SUCCESS:
            return { loading: false, invoices: action.payload };
        case INVOICE_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const invoiceDetailsReducer = (state = { loading: true }, action: any) => {
    switch (action.type) {
        case INVOICE_DETAILS_REQUEST:
            return { ...state, loading: true };
        case INVOICE_DETAILS_SUCCESS:
            return { loading: false, invoice: action.payload };
        case INVOICE_DETAILS_FAIL:
            return { loading: false, error: action.payload };
        case INVOICE_DETAILS_RESET:
            return {};
        default:
            return state;
    }
};

export const adminInvoiceByOrderReducer = (state = {}, action: any) => {
    switch (action.type) {
        case ADMIN_INVOICE_BY_ORDER_REQUEST:
            return { loading: true };
        case ADMIN_INVOICE_BY_ORDER_SUCCESS:
            return { loading: false, invoice: action.payload };
        case ADMIN_INVOICE_BY_ORDER_FAIL:
            return { loading: false, error: action.payload };
        case ADMIN_INVOICE_BY_ORDER_RESET:
            return {};
        default:
            return state;
    }
};

export const invoiceDownloadReducer = (state = {}, action: any) => {
    switch (action.type) {
        case INVOICE_DOWNLOAD_REQUEST:
            return { loading: true, loadingId: action.payload };
        case INVOICE_DOWNLOAD_SUCCESS:
            return { loading: false, success: true };
        case INVOICE_DOWNLOAD_FAIL:
            return { loading: false, error: action.payload };
        case INVOICE_DOWNLOAD_RESET:
            return {};
        default:
            return state;
    }
};