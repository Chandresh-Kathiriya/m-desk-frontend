import {
    ADMIN_DETAILS_REQUEST,
    ADMIN_DETAILS_SUCCESS,
    ADMIN_DETAILS_FAIL,
    ADMIN_DETAILS_RESET,
    ADMIN_UPDATE_PROFILE_REQUEST,
    ADMIN_UPDATE_PROFILE_SUCCESS,
    ADMIN_UPDATE_PROFILE_FAIL,
    ADMIN_UPDATE_PROFILE_RESET
} from '../../constants/admin/adminConstants'

export const adminDetailsReducer = (state = { admin: {} }, action: any) => {
    switch (action.type) {
        case ADMIN_DETAILS_REQUEST: return { ...state, loading: true };
        case ADMIN_DETAILS_SUCCESS: return { loading: false, admin: action.payload };
        case ADMIN_DETAILS_FAIL: return { loading: false, error: action.payload };
        case ADMIN_DETAILS_RESET: return { admin: {} };
        default: return state;
    }
};

export const adminUpdateProfileReducer = (state = {}, action: any) => {
    switch (action.type) {
        case ADMIN_UPDATE_PROFILE_REQUEST: return { loading: true };
        case ADMIN_UPDATE_PROFILE_SUCCESS: return { loading: false, success: true, adminInfo: action.payload };
        case ADMIN_UPDATE_PROFILE_FAIL: return { loading: false, error: action.payload };
        case ADMIN_UPDATE_PROFILE_RESET: return {};
        default: return state;
    }
};