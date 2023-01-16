//@Flow

import {
    EDUCATIONAL_BOOKMARK_CONTENT,
    EDUCATIONAL_BOOKMARK_CONTENT_FAILED,
    EDUCATIONAL_CONTENT_BOOKMARKED
} from "./actions";
import {PROVIDER_LOGOUT} from "../auth/actions";

export const DEFAULT = {
    isLoading: false,
    markerError: null
};

export default function educationalReducer(state = DEFAULT, action = {}) {
    const {type, payload} = action;
    switch (type) {
        case EDUCATIONAL_BOOKMARK_CONTENT: {
            return {
                ...state,
                isLoading: false
            };
        }
        case EDUCATIONAL_BOOKMARK_CONTENT_FAILED: {
            return {
                ...state,
                isLoading: false,
                markerError: action.errorMsg
            };
        }
        case EDUCATIONAL_CONTENT_BOOKMARKED: {
            return {
                ...state,
                isLoading: false
            };
        }
        case PROVIDER_LOGOUT: {
            return DEFAULT;
        }
        default: {
            return state;
        }
    }
}
