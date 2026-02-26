import axios from 'axios';
import {
    UPLOAD_IMAGE_REQUEST,
    UPLOAD_IMAGE_SUCCESS,
    UPLOAD_IMAGE_FAIL,
} from '../../constants/admin/uploadConstants';

export const uploadImage = (uploadData: FormData) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: UPLOAD_IMAGE_REQUEST });

        const state = getState();
        const userInfo = state.adminAuth?.adminInfo || state.adminAuth?.userInfo;

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
                'Content-Type': 'multipart/form-data', // Necessary for file uploads
            },
        };

        const { data } = await axios.post('/api/upload', uploadData, config);

        dispatch({ type: UPLOAD_IMAGE_SUCCESS, payload: data.imageUrl });
    } catch (error: any) {
        dispatch({
            type: UPLOAD_IMAGE_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};