import axios from 'axios';
import {
    MASTER_DATA_LIST_REQUEST, MASTER_DATA_LIST_SUCCESS, MASTER_DATA_LIST_FAIL,
    MASTER_DATA_CREATE_REQUEST, MASTER_DATA_CREATE_SUCCESS, MASTER_DATA_CREATE_FAIL,
    MASTER_DATA_UPDATE_REQUEST, MASTER_DATA_UPDATE_SUCCESS, MASTER_DATA_UPDATE_FAIL,
    MASTER_DATA_TABS_REQUEST, MASTER_DATA_TABS_SUCCESS, MASTER_DATA_TABS_FAIL,
    MASTER_DATA_TAB_CREATE_REQUEST, MASTER_DATA_TAB_CREATE_SUCCESS, MASTER_DATA_TAB_CREATE_FAIL
} from '../../constants/admin/masterDataConstants';

export const listMasterDataTabs = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: MASTER_DATA_TABS_REQUEST });
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${(adminInfo || userInfo).token}` } };
        const { data } = await axios.get('/api/masterdata/tabs', config);
        dispatch({ type: MASTER_DATA_TABS_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: MASTER_DATA_TABS_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const createMasterDataTab = (tabData: { tabId: string, label: string }) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: MASTER_DATA_TAB_CREATE_REQUEST });
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${(adminInfo || userInfo).token}` } };
        const { data } = await axios.post('/api/masterdata/tabs', tabData, config);
        dispatch({ type: MASTER_DATA_TAB_CREATE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({ type: MASTER_DATA_TAB_CREATE_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const listMasterData = (type: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: MASTER_DATA_LIST_REQUEST });
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${(adminInfo || userInfo).token}` } };
        const { data } = await axios.get(`/api/masterdata/${type}`, config);
        dispatch({ type: MASTER_DATA_LIST_SUCCESS, payload: { type, data } });
    } catch (error: any) {
        dispatch({ type: MASTER_DATA_LIST_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const createMasterData = (type: string, dataArray: any[]) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: MASTER_DATA_CREATE_REQUEST });
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${(adminInfo || userInfo).token}` } };
        await axios.post(`/api/masterdata/${type}`, dataArray, config);
        dispatch({ type: MASTER_DATA_CREATE_SUCCESS });
    } catch (error: any) {
        dispatch({ type: MASTER_DATA_CREATE_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const updateMasterData = (type: string, id: string, updateData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: MASTER_DATA_UPDATE_REQUEST });
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${(adminInfo || userInfo).token}` } };
        await axios.put(`/api/masterdata/${type}/${id}`, updateData, config);
        dispatch({ type: MASTER_DATA_UPDATE_SUCCESS });
    } catch (error: any) {
        dispatch({ type: MASTER_DATA_UPDATE_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const deleteMasterData = (type: string, id: string) => async (dispatch: any, getState: any) => {
    try {
        const { adminAuth: { userInfo, adminInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${(adminInfo || userInfo).token}` } };
        await axios.delete(`/api/masterdata/${type}/${id}`, config);
    } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete record');
    }
};