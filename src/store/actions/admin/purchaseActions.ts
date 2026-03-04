import axios from 'axios';
import {
    PURCHASE_CREATE_REQUEST,
    PURCHASE_CREATE_SUCCESS,
    PURCHASE_CREATE_FAIL,
    PURCHASE_DETAILS_REQUEST, PURCHASE_DETAILS_SUCCESS, PURCHASE_DETAILS_FAIL,
    PURCHASE_LIST_REQUEST,
    PURCHASE_LIST_SUCCESS,
    PURCHASE_LIST_FAIL,
    PURCHASE_RECEIVE_REQUEST, 
    PURCHASE_RECEIVE_SUCCESS, 
    PURCHASE_RECEIVE_FAIL,
    PURCHASE_DOWNLOAD_REQUEST,
} from '../../constants/admin/purchaseConstants';
import { showErrorAlert } from '../../../common/utils/alertUtils';

export const createPurchaseOrder = (purchaseData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: PURCHASE_CREATE_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.post('/api/purchases', purchaseData, config);

        dispatch({ type: PURCHASE_CREATE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: PURCHASE_CREATE_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getPurchaseOrderDetails = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: PURCHASE_DETAILS_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

        const { data } = await axios.get(`/api/purchases/${id}`, config);
        dispatch({ type: PURCHASE_DETAILS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: PURCHASE_DETAILS_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const listPurchaseOrders = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: PURCHASE_LIST_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/purchases', config);

        dispatch({ type: PURCHASE_LIST_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: PURCHASE_LIST_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const receivePurchaseOrder = (id: string, billingData: { invoiceDate: string, dueDate: string }) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: PURCHASE_RECEIVE_REQUEST });

        // --- THE FIX: Look in both adminAuth and userAuth to safely grab the token ---
        const { adminAuth, userAuth } = getState();
        const userInfo = (adminAuth && adminAuth.adminInfo) || (adminAuth && adminAuth.userInfo) || (userAuth && userAuth.userInfo);

        if (!userInfo || !userInfo.token) {
            throw new Error("Authorization token not found. Please log in again.");
        }

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        // Hits the unified route!
        const { data } = await axios.post(`/api/purchases/${id}/receive`, billingData, config);

        dispatch({ type: PURCHASE_RECEIVE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: PURCHASE_RECEIVE_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const downloadAdminPO = (id: string, orderNumber: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: PURCHASE_DOWNLOAD_REQUEST }); // Add to constants if you want loading state!

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        const config = { 
            headers: { Authorization: `Bearer ${userInfo.token}` },
            responseType: 'blob' as 'json' // CRITICAL
        };

        const response = await axios.get(`/api/purchases/${id}/download`, config);

        const url = window.URL.createObjectURL(new Blob([response.data as any]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `PO_${orderNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link); 

        // dispatch({ type: PURCHASE_DOWNLOAD_SUCCESS });
    } catch (error: any) {
        showErrorAlert('Download Failed', 'Failed to download PO PDF.');
    }
};

export const downloadAdminBill = (id: string, billNumber: string) => async (dispatch: any, getState: any) => {
    try {
        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        const config = { 
            headers: { Authorization: `Bearer ${userInfo.token}` },
            responseType: 'blob' as 'json' 
        };

        const response = await axios.get(`/api/bills/${id}/download`, config);

        const url = window.URL.createObjectURL(new Blob([response.data as any]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BILL_${billNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link); 
    } catch (error: any) {
        showErrorAlert('Download Failed', 'Failed to download Bill PDF.');
    }
};