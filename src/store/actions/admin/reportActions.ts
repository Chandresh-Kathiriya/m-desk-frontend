import axios from 'axios';
import {
    REPORT_SALES_PRODUCTS_REQUEST, REPORT_SALES_PRODUCTS_SUCCESS, REPORT_SALES_PRODUCTS_FAIL,
    REPORT_PURCHASES_PRODUCTS_REQUEST, REPORT_PURCHASES_PRODUCTS_SUCCESS, REPORT_PURCHASES_PRODUCTS_FAIL,
    REPORT_SALES_CUSTOMERS_REQUEST, REPORT_SALES_CUSTOMERS_SUCCESS, REPORT_SALES_CUSTOMERS_FAIL,
    REPORT_PURCHASES_VENDORS_REQUEST, REPORT_PURCHASES_VENDORS_SUCCESS, REPORT_PURCHASES_VENDORS_FAIL
} from '../../constants/admin/reportConstants';

export const getSalesReportByProducts = (startDate?: string, endDate?: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: REPORT_SALES_PRODUCTS_REQUEST });
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const token = (adminInfo || userInfo).token;
        const config = { headers: { Authorization: `Bearer ${token}` }, params: { startDate, endDate } };
        
        const { data } = await axios.get('/api/reports/sales/products', config);
        dispatch({ type: REPORT_SALES_PRODUCTS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: REPORT_SALES_PRODUCTS_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const getPurchaseReportByProducts = (startDate?: string, endDate?: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: REPORT_PURCHASES_PRODUCTS_REQUEST });
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const token = (adminInfo || userInfo).token;
        const config = { headers: { Authorization: `Bearer ${token}` }, params: { startDate, endDate } };
        
        const { data } = await axios.get('/api/reports/purchases/products', config);
        dispatch({ type: REPORT_PURCHASES_PRODUCTS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: REPORT_PURCHASES_PRODUCTS_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const getSalesReportByCustomers = (startDate?: string, endDate?: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: REPORT_SALES_CUSTOMERS_REQUEST });
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const token = (adminInfo || userInfo).token;
        const config = { headers: { Authorization: `Bearer ${token}` }, params: { startDate, endDate } };
        
        const { data } = await axios.get('/api/reports/sales/customers', config);
        dispatch({ type: REPORT_SALES_CUSTOMERS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: REPORT_SALES_CUSTOMERS_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const getPurchaseReportByVendors = (startDate?: string, endDate?: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: REPORT_PURCHASES_VENDORS_REQUEST });
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const token = (adminInfo || userInfo).token;
        const config = { headers: { Authorization: `Bearer ${token}` }, params: { startDate, endDate } };
        
        const { data } = await axios.get('/api/reports/purchases/vendors', config);
        dispatch({ type: REPORT_PURCHASES_VENDORS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: REPORT_PURCHASES_VENDORS_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const downloadAdminReport = (exportData: { title: string, headers: string[], rows: any[], format: 'csv' | 'pdf' }) => async (dispatch: any, getState: any) => {
    try {
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const token = (adminInfo || userInfo).token;
        
        const config = { 
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob' as 'json' // CRITICAL for receiving files
        };
        
        // POST the table data to the backend
        const response = await axios.post('/api/reports/export', exportData, config);

        // Download the binary blob
        const url = window.URL.createObjectURL(new Blob([response.data as any]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${exportData.title.replace(/\s+/g, '_')}.${exportData.format}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link); 
    } catch (error: any) {
        alert('Failed to generate report from server.');
        console.error(error);
    }
};