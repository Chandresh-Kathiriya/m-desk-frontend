import axios from 'axios';
import {
    PUBLIC_FILTERS_REQUEST,
    PUBLIC_FILTERS_SUCCESS,
    PUBLIC_FILTERS_FAIL,
} from '../../constants/storefront/filterConstants';

export const getPublicFilters = () => async (dispatch: any) => {
    try {
        dispatch({ type: PUBLIC_FILTERS_REQUEST });

        // 1. Fetch the dynamic tabs
        const { data: tabs } = await axios.get('/api/masterdata/public/tabs');
        const formattedTabs = tabs.map((t: any) => ({ id: t.tabId, label: t.label }));

        // 2. Fetch the options for each tab dynamically
        const optionsMap: Record<string, any[]> = {};
        for (const tab of formattedTabs) {
            const { data } = await axios.get(`/api/masterdata/public/${tab.id}`);
            optionsMap[tab.id] = data;
        }

        dispatch({ 
            type: PUBLIC_FILTERS_SUCCESS, 
            payload: { filterStructure: formattedTabs, filterOptions: optionsMap } 
        });
    } catch (error: any) {
        dispatch({
            type: PUBLIC_FILTERS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};