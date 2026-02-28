import {
    SETTINGS_DETAILS_REQUEST,
    SETTINGS_DETAILS_SUCCESS,
    SETTINGS_DETAILS_FAIL,
    SETTINGS_UPDATE_REQUEST,
    SETTINGS_UPDATE_SUCCESS,
    SETTINGS_UPDATE_FAIL,
    SETTINGS_UPDATE_RESET,
} from '../../constants/admin/settingsConstants';

export const settingsDetailsReducer = (state = { settings: {} }, action: any) => {
    switch (action.type) {
        case SETTINGS_DETAILS_REQUEST:
            return { ...state, loading: true };
        case SETTINGS_DETAILS_SUCCESS:
            return { loading: false, settings: action.payload };
        case SETTINGS_DETAILS_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const settingsUpdateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case SETTINGS_UPDATE_REQUEST:
            return { loading: true };
        case SETTINGS_UPDATE_SUCCESS:
            return { loading: false, success: true };
        case SETTINGS_UPDATE_FAIL:
            return { loading: false, error: action.payload };
        case SETTINGS_UPDATE_RESET:
            return {};
        default:
            return state;
    }
};