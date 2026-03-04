import axios from 'axios';
import {
    ADMIN_DETAILS_REQUEST,
    ADMIN_DETAILS_SUCCESS,
    ADMIN_DETAILS_FAIL,
    ADMIN_LOGIN_SUCCESS,
    ADMIN_DETAILS_RESET,
    ADMIN_UPDATE_PROFILE_REQUEST,
    ADMIN_UPDATE_PROFILE_SUCCESS,
    ADMIN_UPDATE_PROFILE_FAIL,
    ADMIN_UPDATE_PROFILE_RESET
} from '../../constants/admin/adminConstants'

export const getAdminDetails = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: ADMIN_DETAILS_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
        
        const { data } = await axios.get(`/api/admin/${id}`, config);
        dispatch({ type: ADMIN_DETAILS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: ADMIN_DETAILS_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const updateAdminProfile = (admin: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: ADMIN_UPDATE_PROFILE_REQUEST });
        const { adminAuth: { adminInfo } } = getState();
        const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminInfo.token}` } };
        
        const { data } = await axios.put(`/api/admin/profile`, admin, config);
        
        dispatch({ type: ADMIN_UPDATE_PROFILE_SUCCESS, payload: data });
        dispatch({ type: ADMIN_LOGIN_SUCCESS, payload: data }); 
        localStorage.setItem('adminInfo', JSON.stringify(data));
    } catch (error: any) {
        dispatch({ type: ADMIN_UPDATE_PROFILE_FAIL, payload: error.response?.data?.message || error.message });
    }
};