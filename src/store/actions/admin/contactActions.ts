import axios from 'axios';
import { CONTACT_LIST_REQUEST, CONTACT_LIST_SUCCESS, CONTACT_LIST_FAIL } from '../../constants/admin/contactConstants';

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