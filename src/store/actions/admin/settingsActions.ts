import axios from 'axios';
import {
    SETTINGS_DETAILS_REQUEST,
    SETTINGS_DETAILS_SUCCESS,
    SETTINGS_DETAILS_FAIL,
    SETTINGS_UPDATE_REQUEST,
    SETTINGS_UPDATE_SUCCESS,
    SETTINGS_UPDATE_FAIL,
} from '../../constants/admin/settingsConstants';

export const getSettings = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: SETTINGS_DETAILS_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        if (!userInfo || !userInfo.token) return;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/settings', config);

        dispatch({ type: SETTINGS_DETAILS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: SETTINGS_DETAILS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const updateSettings = (settingsData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: SETTINGS_UPDATE_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.put('/api/settings', settingsData, config);

        dispatch({ type: SETTINGS_UPDATE_SUCCESS, payload: data });
        // Update the details state instantly so the UI reflects the new settings
        dispatch({ type: SETTINGS_DETAILS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: SETTINGS_UPDATE_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};