import axios from 'axios';
import {
    PURCHASE_CREATE_REQUEST,
    PURCHASE_CREATE_SUCCESS,
    PURCHASE_CREATE_FAIL,
    PURCHASE_DETAILS_REQUEST, PURCHASE_DETAILS_SUCCESS, PURCHASE_DETAILS_FAIL,
    PURCHASE_CONFIRM_REQUEST, PURCHASE_CONFIRM_SUCCESS, PURCHASE_CONFIRM_FAIL,
    PURCHASE_BILL_REQUEST, PURCHASE_BILL_SUCCESS, PURCHASE_BILL_FAIL,
    PURCHASE_LIST_REQUEST,
    PURCHASE_LIST_SUCCESS,
    PURCHASE_LIST_FAIL,
} from '../../constants/admin/purchaseConstants';

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

export const confirmPurchaseOrder = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: PURCHASE_CONFIRM_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

        await axios.put(`/api/purchases/${id}/confirm`, {}, config);
        dispatch({ type: PURCHASE_CONFIRM_SUCCESS });
    } catch (error: any) {
        dispatch({ type: PURCHASE_CONFIRM_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const generatePurchaseBill = (id: string, billData: { invoiceDate: string; dueDate: string }) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: PURCHASE_BILL_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

        await axios.post(`/api/purchases/${id}/bill`, billData, config);
        dispatch({ type: PURCHASE_BILL_SUCCESS });
    } catch (error: any) {
        dispatch({ type: PURCHASE_BILL_FAIL, payload: error.response?.data?.message || error.message });
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