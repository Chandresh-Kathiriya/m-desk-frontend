import {
    PUBLIC_FILTERS_REQUEST,
    PUBLIC_FILTERS_SUCCESS,
    PUBLIC_FILTERS_FAIL,
} from '../../constants/storefront/filterConstants';

export const publicFiltersReducer = (state = { filterStructure: [], filterOptions: {} }, action: any) => {
    switch (action.type) {
        case PUBLIC_FILTERS_REQUEST:
            return { ...state, loading: true };
        case PUBLIC_FILTERS_SUCCESS:
            return { 
                loading: false, 
                filterStructure: action.payload.filterStructure, 
                filterOptions: action.payload.filterOptions 
            };
        case PUBLIC_FILTERS_FAIL:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};