import {PROVIDER_LOGOUT} from "../auth/actions";
import {
    GET_PROFILE, PROFILE_FETCH_FAILED, PROFILE_FETCH_SUCCESSFUL, PROFILE_GET_EDUCATION_STATUS_FAILED,
    PROFILE_MARKED_EDUCATION_CONTENT,
    PROFILE_UPDATE, PROFILE_UPDATE_FAILED, PROFILE_UPDATE_MARKED_EDUCATION_CONTENT, PROFILE_UPDATED
} from "./actions";
import {EDUCATIONAL_CONTENT_BOOKMARKED} from "../educational-content/actions";

export const DEFAULT = {
    isLoading: false,
    error: false,
    errorMsg: null,
    profile: null,
    bookmarked: [],
    educationStatusError: null,
};

export default function profileReducer(state = DEFAULT, action = {}) {
    const {type,payload} = action;
    switch (type) {
        case PROVIDER_LOGOUT: {
            return DEFAULT;
        }
        case PROFILE_UPDATE:
        case GET_PROFILE: {
            return {
                ...state,
                isLoading: true
            }
        }
        case PROFILE_UPDATE_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: action.errorMsg
            }
        }
        case PROFILE_UPDATED: {
            return {
                ...state,
                isLoading: false,
                profileUpdated: true,
                profile: {
                    ...state.profile,
                    fullName: payload.fullName ? payload.fullName : state.profile.fullName,
                    gender: payload.gender ? payload.gender : state.profile.gender,
                    bio: payload.bio?payload.bio:state.profile.bio,
                    profileImage: payload.profileImage ? payload.profileImage : state.profile.profileImage,
                    firstName: payload.firstName ? payload.firstName : state.profile.firstName,
                    lastName: payload.lastName ? payload.lastName : state.profile.lastName,
                }
            }
        }
        case PROFILE_FETCH_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: action.errorMsg
            }
        }
        case PROFILE_FETCH_SUCCESSFUL: {
            return {
                ...state,
                isLoading: false,
                error: false,
                errorMsg: null,
                profile: action.profile
            }
        }

        case PROFILE_MARKED_EDUCATION_CONTENT: {
            return {
                ...state,
                bookmarked: payload.bookmarkedContentResponse,
            }
        }
        case PROFILE_GET_EDUCATION_STATUS_FAILED : {
            return {
                ...state,
                educationStatusError: action.errorMsg
            }
        }
        // case PROFILE_UPDATE_MARKED_EDUCATION_CONTENT: {
        //     return {
        //         ...state,
        //         bookmarked: payload.updatedBookMarkedData,
        //     }
        // }

        case EDUCATIONAL_CONTENT_BOOKMARKED: {
            const bookmarked = state.bookmarked;
            if (payload.shouldMark) {
                bookmarked.push(payload.markInfo);
            } else {
                let ind = null;
                bookmarked.map((marker, index) => {
                    if (marker.slug === payload.markInfo.slug) {
                        ind = index;
                    }
                });
                bookmarked.splice(ind, 1);
            }
            return {
                ...state,
                bookmarked
            };
        }
        default: {
            return state;
        }
    }
}