import axios from 'axios';
import {
    USER_UPDATE_PROFILE_REQUEST,
    USER_UPDATE_PROFILE_SUCCESS,
    USER_UPDATE_PROFILE_FAIL,
    USER_LOGIN_SUCCESS,
    USER_UPDATE_PROFILE_RESET,
    USER_DETAILS_REQUEST,
    USER_DETAILS_SUCCESS,
    USER_DETAILS_FAIL,
    USER_DETAILS_RESET
} from '../../constants/user/userConstants'

export const getUserDetails = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: USER_DETAILS_REQUEST });
        const { userAuth: { userInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        // id is usually 'profile' when getting the logged-in user
        const { data } = await axios.get(`/api/users/${id}`, config);
        dispatch({ type: USER_DETAILS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: USER_DETAILS_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const updateUserProfile = (user: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: USER_UPDATE_PROFILE_REQUEST });
        const { userAuth: { userInfo } } = getState();
        const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
        
        const { data } = await axios.put(`/api/users/profile`, user, config);
        
        dispatch({ type: USER_UPDATE_PROFILE_SUCCESS, payload: data });
        // Update the auth state so the navbar/header reflects the new name instantly
        dispatch({ type: USER_LOGIN_SUCCESS, payload: data }); 
        localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error: any) {
        dispatch({ type: USER_UPDATE_PROFILE_FAIL, payload: error.response?.data?.message || error.message });
    }
};