import {
    REVIEW_CREATE_REQUEST, REVIEW_CREATE_SUCCESS, REVIEW_CREATE_FAIL, REVIEW_CREATE_RESET,
    REVIEW_UPDATE_REQUEST, REVIEW_UPDATE_SUCCESS, REVIEW_UPDATE_FAIL, REVIEW_UPDATE_RESET,
    REVIEW_VOTE_REQUEST, REVIEW_VOTE_SUCCESS, REVIEW_VOTE_FAIL, REVIEW_VOTE_RESET,
    REVIEW_REPORT_REQUEST, REVIEW_REPORT_SUCCESS, REVIEW_REPORT_FAIL, REVIEW_REPORT_RESET
} from '../../constants/storefront/reviewConstants';

export const reviewCreateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case REVIEW_CREATE_REQUEST: return { loading: true };
        case REVIEW_CREATE_SUCCESS: return { loading: false, success: true };
        case REVIEW_CREATE_FAIL: return { loading: false, error: action.payload };
        case REVIEW_CREATE_RESET: return {};
        default: return state;
    }
};

export const reviewUpdateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case REVIEW_UPDATE_REQUEST: return { loading: true };
        case REVIEW_UPDATE_SUCCESS: return { loading: false, success: true };
        case REVIEW_UPDATE_FAIL: return { loading: false, error: action.payload };
        case REVIEW_UPDATE_RESET: return {};
        default: return state;
    }
};

export const reviewVoteReducer = (state = {}, action: any) => {
    switch (action.type) {
        case REVIEW_VOTE_REQUEST: return { loading: true, loadingId: action.payload };
        case REVIEW_VOTE_SUCCESS: return { loading: false, success: true };
        case REVIEW_VOTE_FAIL: return { loading: false, error: action.payload };
        case REVIEW_VOTE_RESET: return {};
        default: return state;
    }
};

export const reviewReportReducer = (state = {}, action: any) => {
    switch (action.type) {
        case REVIEW_REPORT_REQUEST: return { loading: true, loadingId: action.payload };
        case REVIEW_REPORT_SUCCESS: return { loading: false, success: true };
        case REVIEW_REPORT_FAIL: return { loading: false, error: action.payload };
        case REVIEW_REPORT_RESET: return {};
        default: return state;
    }
};