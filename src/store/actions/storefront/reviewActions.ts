import axios from 'axios';
import {
    REVIEW_CREATE_REQUEST, REVIEW_CREATE_SUCCESS, REVIEW_CREATE_FAIL,
    REVIEW_UPDATE_REQUEST, REVIEW_UPDATE_SUCCESS, REVIEW_UPDATE_FAIL,
    REVIEW_VOTE_REQUEST, REVIEW_VOTE_SUCCESS, REVIEW_VOTE_FAIL,
    REVIEW_REPORT_REQUEST, REVIEW_REPORT_SUCCESS, REVIEW_REPORT_FAIL
} from '../../constants/storefront/reviewConstants';

export const createReview = (productId: string, reviewData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: REVIEW_CREATE_REQUEST });
        const { userAuth: { userInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        await axios.post(`/api/products/${productId}/reviews`, reviewData, config);
        dispatch({ type: REVIEW_CREATE_SUCCESS });
    } catch (error: any) {
        dispatch({ type: REVIEW_CREATE_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const updateReview = (productId: string, reviewId: string, reviewData: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: REVIEW_UPDATE_REQUEST });
        const { userAuth: { userInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        await axios.put(`/api/products/${productId}/reviews/${reviewId}`, reviewData, config);
        dispatch({ type: REVIEW_UPDATE_SUCCESS });
    } catch (error: any) {
        dispatch({ type: REVIEW_UPDATE_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const voteReview = (productId: string, reviewId: string, voteType: 'helpful' | 'unhelpful') => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: REVIEW_VOTE_REQUEST, payload: reviewId }); // Passing ID to track which button is loading
        const { userAuth: { userInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        await axios.put(`/api/products/${productId}/reviews/${reviewId}/vote`, { voteType }, config);
        dispatch({ type: REVIEW_VOTE_SUCCESS });
    } catch (error: any) {
        dispatch({ type: REVIEW_VOTE_FAIL, payload: error.response?.data?.message || error.message });
    }
};

export const reportReview = (productId: string, reviewId: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: REVIEW_REPORT_REQUEST, payload: reviewId });
        const { userAuth: { userInfo } } = getState();
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        await axios.put(`/api/products/${productId}/reviews/${reviewId}/report`, {}, config);
        dispatch({ type: REVIEW_REPORT_SUCCESS });
    } catch (error: any) {
        dispatch({ type: REVIEW_REPORT_FAIL, payload: error.response?.data?.message || error.message });
    }
};