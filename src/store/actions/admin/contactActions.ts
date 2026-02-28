import axios from 'axios';
import {
    CONTACT_LIST_REQUEST, CONTACT_LIST_SUCCESS, CONTACT_LIST_FAIL, CONTACT_CREATE_REQUEST, CONTACT_CREATE_SUCCESS, CONTACT_CREATE_FAIL,
    CONTACT_UPDATE_REQUEST, CONTACT_UPDATE_SUCCESS, CONTACT_UPDATE_FAIL,
    CONTACT_DELETE_REQUEST, CONTACT_DELETE_SUCCESS, CONTACT_DELETE_FAIL
} from '../../constants/admin/contactConstants';

export const listContacts = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: CONTACT_LIST_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

        const { data } = await axios.get('/api/contacts', config).catch(() => ({ data: [] })); // Fallback

        dispatch({ type: CONTACT_LIST_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: CONTACT_LIST_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const createContact = (contactData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: CONTACT_CREATE_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

        const { data } = await axios.post('/api/contacts', contactData, config);
        dispatch({ type: CONTACT_CREATE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: CONTACT_CREATE_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const updateContact = (id: string, contactData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: CONTACT_UPDATE_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

        await axios.put(`/api/contacts/${id}`, contactData, config);
        dispatch({ type: CONTACT_UPDATE_SUCCESS });
    } catch (error: any) {
        dispatch({ type: CONTACT_UPDATE_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const deleteContact = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: CONTACT_DELETE_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

        await axios.delete(`/api/contacts/${id}`, config);
        dispatch({ type: CONTACT_DELETE_SUCCESS });
    } catch (error: any) {
        dispatch({ type: CONTACT_DELETE_FAIL, payload: error.response?.data?.message || error.message });
    }
};