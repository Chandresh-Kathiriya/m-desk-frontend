import axios from 'axios';
import {
    BILL_LIST_REQUEST,
    BILL_LIST_SUCCESS,
    BILL_LIST_FAIL,
    BILL_DOWNLOAD_REQUEST,
    BILL_DOWNLOAD_SUCCESS,
    BILL_DOWNLOAD_FAIL,
    BILL_DETAILS_REQUEST,
    BILL_DETAILS_SUCCESS,
    BILL_DETAILS_FAIL,
} from '../../constants/admin/billConstants';

export const listVendorBills = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: BILL_LIST_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/bills', config);

        dispatch({ type: BILL_LIST_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: BILL_LIST_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const downloadAdminBill = (id: string, billNumber: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: BILL_DOWNLOAD_REQUEST, payload: id });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { 
            headers: { Authorization: `Bearer ${userInfo.token}` },
            responseType: 'blob' as 'json'
        };

        const response = await axios.get(`/api/bills/${id}/download`, config);

        const url = window.URL.createObjectURL(new Blob([response.data as any]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${billNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);

        dispatch({ type: BILL_DOWNLOAD_SUCCESS });
    } catch (error: any) {
        dispatch({
            type: BILL_DOWNLOAD_FAIL,
            payload: error.response?.data?.message || 'Failed to download PDF. Please try again.',
        });
    }
};

export const getBillDetails = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: BILL_DETAILS_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/bills/${id}`, config);

        dispatch({ type: BILL_DETAILS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: BILL_DETAILS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};