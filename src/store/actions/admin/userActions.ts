import axios from 'axios';
import {
    USER_LIST_REQUEST, USER_LIST_SUCCESS, USER_LIST_FAIL, USER_CREATE_REQUEST,
    USER_CREATE_SUCCESS,
    USER_CREATE_FAIL,
} from '../../constants/admin/userConstants';

export const listUsers = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: USER_LIST_REQUEST });
        const userInfo = getState().adminAuth?.adminInfo || getState().adminAuth?.userInfo;
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        const { data } = await axios.get('/api/users', config);
        const usersArray = Array.isArray(data) ? data : (data.users || []);

        dispatch({ type: USER_LIST_SUCCESS, payload: usersArray });
    } catch (error: any) {
        dispatch({ type: USER_LIST_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const createUser = (userData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: USER_CREATE_REQUEST });

        const userInfo = getState().adminAuth?.adminInfo || getState().adminAuth?.userInfo;
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json'
            }
        };

        const { data } = await axios.post('/api/auth/register', userData, config);

        dispatch({ type: USER_CREATE_SUCCESS, payload: data });
    } catch (error: any) {
        dispatch({
            type: USER_CREATE_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};