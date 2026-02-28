import axios from 'axios';
import {
    USER_INVOICE_BY_ORDER_REQUEST,
    USER_INVOICE_BY_ORDER_SUCCESS,
    USER_INVOICE_BY_ORDER_FAIL,
    USER_INVOICE_DETAILS_REQUEST,
    USER_INVOICE_DETAILS_SUCCESS,
    USER_INVOICE_DETAILS_FAIL,
    USER_INVOICE_LIST_REQUEST,
    USER_INVOICE_LIST_SUCCESS,
    USER_INVOICE_LIST_FAIL,
    USER_INVOICE_DOWNLOAD_REQUEST,
    USER_INVOICE_DOWNLOAD_SUCCESS,
    USER_INVOICE_DOWNLOAD_FAIL,
} from '../../constants/user/invoiceConstants';

export const getUserInvoiceByOrderId = (orderId: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: USER_INVOICE_BY_ORDER_REQUEST });

        const state = getState();
        const userInfo = state.userAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/invoices/order/${orderId}`, config);

        dispatch({ type: USER_INVOICE_BY_ORDER_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: USER_INVOICE_BY_ORDER_FAIL,
            // If it's a 404, the invoice just doesn't exist yet, which is completely normal.
            payload: error.response?.status === 404 ? null : (error.response?.data?.message || error.message),
        });
    }
};

export const getUserInvoiceDetails = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: USER_INVOICE_DETAILS_REQUEST });

        const state = getState();
        const userInfo = state.userAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/invoices/${id}`, config);

        dispatch({ type: USER_INVOICE_DETAILS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: USER_INVOICE_DETAILS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const listMyInvoices = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: USER_INVOICE_LIST_REQUEST });

        const state = getState();
        const userInfo = state.userAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/invoices/myinvoices', config);

        dispatch({ type: USER_INVOICE_LIST_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: USER_INVOICE_LIST_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const downloadUserInvoice = (id: string, invoiceNumber: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: USER_INVOICE_DOWNLOAD_REQUEST, payload: id });

        const state = getState();
        const userInfo = state.userAuth?.userInfo;

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

        dispatch({ type: USER_INVOICE_DOWNLOAD_SUCCESS });
    } catch (error: any) {
        dispatch({
            type: USER_INVOICE_DOWNLOAD_FAIL,
            payload: error.response?.data?.message || 'Failed to download PDF. Please try again.',
        });
    }
};