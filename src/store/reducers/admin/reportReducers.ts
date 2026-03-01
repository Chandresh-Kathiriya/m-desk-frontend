import {
    REPORT_SALES_PRODUCTS_REQUEST, REPORT_SALES_PRODUCTS_SUCCESS, REPORT_SALES_PRODUCTS_FAIL,
    REPORT_PURCHASES_PRODUCTS_REQUEST, REPORT_PURCHASES_PRODUCTS_SUCCESS, REPORT_PURCHASES_PRODUCTS_FAIL,
    REPORT_SALES_CUSTOMERS_REQUEST, REPORT_SALES_CUSTOMERS_SUCCESS, REPORT_SALES_CUSTOMERS_FAIL,
    REPORT_PURCHASES_VENDORS_REQUEST, REPORT_PURCHASES_VENDORS_SUCCESS, REPORT_PURCHASES_VENDORS_FAIL
} from '../../constants/admin/reportConstants';

export const reportSalesProductsReducer = (state = { data: [] }, action: any) => {
    switch (action.type) {
        case REPORT_SALES_PRODUCTS_REQUEST: return { loading: true, data: [] };
        case REPORT_SALES_PRODUCTS_SUCCESS: return { loading: false, data: action.payload };
        case REPORT_SALES_PRODUCTS_FAIL: return { loading: false, error: action.payload };
        default: return state;
    }
};

export const reportPurchasesProductsReducer = (state = { data: [] }, action: any) => {
    switch (action.type) {
        case REPORT_PURCHASES_PRODUCTS_REQUEST: return { loading: true, data: [] };
        case REPORT_PURCHASES_PRODUCTS_SUCCESS: return { loading: false, data: action.payload };
        case REPORT_PURCHASES_PRODUCTS_FAIL: return { loading: false, error: action.payload };
        default: return state;
    }
};

export const reportSalesCustomersReducer = (state = { data: [] }, action: any) => {
    switch (action.type) {
        case REPORT_SALES_CUSTOMERS_REQUEST: return { loading: true, data: [] };
        case REPORT_SALES_CUSTOMERS_SUCCESS: return { loading: false, data: action.payload };
        case REPORT_SALES_CUSTOMERS_FAIL: return { loading: false, error: action.payload };
        default: return state;
    }
};

export const reportPurchasesVendorsReducer = (state = { data: [] }, action: any) => {
    switch (action.type) {
        case REPORT_PURCHASES_VENDORS_REQUEST: return { loading: true, data: [] };
        case REPORT_PURCHASES_VENDORS_SUCCESS: return { loading: false, data: action.payload };
        case REPORT_PURCHASES_VENDORS_FAIL: return { loading: false, error: action.payload };
        default: return state;
    }
};