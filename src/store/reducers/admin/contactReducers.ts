import {
    CONTACT_LIST_REQUEST, CONTACT_LIST_SUCCESS, CONTACT_LIST_FAIL,
    CONTACT_CREATE_REQUEST, CONTACT_CREATE_SUCCESS, CONTACT_CREATE_FAIL, CONTACT_CREATE_RESET,
    CONTACT_UPDATE_REQUEST, CONTACT_UPDATE_SUCCESS, CONTACT_UPDATE_FAIL, CONTACT_UPDATE_RESET,
    CONTACT_DELETE_REQUEST, CONTACT_DELETE_SUCCESS, CONTACT_DELETE_FAIL, CONTACT_DELETE_RESET
} from '../../constants/admin/contactConstants';

export const contactListReducer = (state = { contacts: [] }, action: any) => {
    switch (action.type) {
        case CONTACT_LIST_REQUEST: return { loading: true, contacts: [] };
        case CONTACT_LIST_SUCCESS: return { loading: false, contacts: action.payload };
        case CONTACT_LIST_FAIL: return { loading: false, error: action.payload };
        default: return state;
    }
};

export const contactCreateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case CONTACT_CREATE_REQUEST: return { loading: true };
        case CONTACT_CREATE_SUCCESS: return { loading: false, success: true, contact: action.payload };
        case CONTACT_CREATE_FAIL: return { loading: false, error: action.payload };
        case CONTACT_CREATE_RESET: return {};
        default: return state;
    }
};

export const contactUpdateReducer = (state = {}, action: any) => {
    switch (action.type) {
        case CONTACT_UPDATE_REQUEST: return { loading: true };
        case CONTACT_UPDATE_SUCCESS: return { loading: false, success: true };
        case CONTACT_UPDATE_FAIL: return { loading: false, error: action.payload };
        case CONTACT_UPDATE_RESET: return {};
        default: return state;
    }
};

export const contactDeleteReducer = (state = {}, action: any) => {
    switch (action.type) {
        case CONTACT_DELETE_REQUEST: return { loading: true };
        case CONTACT_DELETE_SUCCESS: return { loading: false, success: true };
        case CONTACT_DELETE_FAIL: return { loading: false, error: action.payload };
        case CONTACT_DELETE_RESET: return {};
        default: return state;
    }
};