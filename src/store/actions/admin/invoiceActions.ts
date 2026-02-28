import axios from 'axios';
import {
    INVOICE_LIST_REQUEST,
    INVOICE_LIST_SUCCESS,
    INVOICE_LIST_FAIL,
    INVOICE_DETAILS_REQUEST,
    INVOICE_DETAILS_SUCCESS,
    INVOICE_DETAILS_FAIL,
    ADMIN_INVOICE_BY_ORDER_REQUEST,
    ADMIN_INVOICE_BY_ORDER_SUCCESS,
    ADMIN_INVOICE_BY_ORDER_FAIL,
    INVOICE_DOWNLOAD_REQUEST,
    INVOICE_DOWNLOAD_SUCCESS,
    INVOICE_DOWNLOAD_FAIL,
} from '../../constants/admin/invoiceConstants';

export const listInvoices = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: INVOICE_LIST_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/invoices', config);

        dispatch({ type: INVOICE_LIST_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: INVOICE_LIST_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getInvoiceDetails = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: INVOICE_DETAILS_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/invoices/${id}`, config);

        dispatch({ type: INVOICE_DETAILS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: INVOICE_DETAILS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getAdminInvoiceByOrderId = (orderId: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: ADMIN_INVOICE_BY_ORDER_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/invoices/order/${orderId}`, config);

        dispatch({ type: ADMIN_INVOICE_BY_ORDER_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: ADMIN_INVOICE_BY_ORDER_FAIL,
            // If it's a 404, the invoice just doesn't exist yet, which is completely normal.
            payload: error.response?.status === 404 ? null : (error.response?.data?.message || error.message),
        });
    }
};

export const downloadAdminInvoice = (id: string, invoiceNumber: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: INVOICE_DOWNLOAD_REQUEST, payload: id });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { 
            headers: { Authorization: `Bearer ${userInfo.token}` },
            responseType: 'blob' as 'json' // CRITICAL: Tells Axios to expect a binary file
        };

        // Hit the download endpoint
        const response = await axios.get(`/api/invoices/${id}/download`, config);

        // Create a fake, hidden <a> tag in the browser to trigger the actual file save
        const url = window.URL.createObjectURL(new Blob([response.data as any]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link); // Clean up

        dispatch({ type: INVOICE_DOWNLOAD_SUCCESS });
    } catch (error: any) {
        dispatch({
            type: INVOICE_DOWNLOAD_FAIL,
            payload: error.response?.data?.message || 'Failed to download PDF. Please try again.',
        });
    }
};