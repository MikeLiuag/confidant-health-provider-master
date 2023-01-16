// @flow

import {
    PROVIDER_LOGIN,
    PROVIDER_LOGOUT,
    PROVIDER_LOGIN_FAILED,
    PROVIDER_LOGIN_SUCCESSFUL,
    CLEAR_ERRORS,
    USER_RESET_AUTH,
    NETWORK_STATUS_CHANGED,
    PROVIDER_UPDATE_PASSWORD,
    PROVIDER_PASSWORD_UPDATED,
    PROVIDER_VERIFICATION_FAILED,
    PROVIDER_UPDATE_PASSWORD_FAILED,
    PROVIDER_CODE_VERIFICATION_SUCCESSFUL,
    PROVIDER_VERIFY_CODE, SOCKET_CONNECTED, SOCKET_DISCONNECTED
} from "./actions";
import {PROFILE_UPDATED} from "../profile/actions";

export const DEFAULT = {
    isAuthenticated: false,
    codeVerified: false,
    passwordUpdated: false,
    isLoading: false,
    data: [],
    meta: {},
    error: null,
    networkConnected: true,
    socketConnected: true,
    errorMsg: null
};

export default function authReducer(state = DEFAULT, action = {}) {
    const {type,payload} = action;
    switch (type) {
        case PROVIDER_LOGIN: {
            return {
                ...state,
                isAuthenticated: false,
                isLoading: true
            }
        }

        case PROFILE_UPDATED: {
            return {
                ...state,
                meta: {
                    ...state.meta,
                    nickName: payload.fullName ? payload.fullName : state.meta.nickName,
                }
            }
        }

        case SOCKET_CONNECTED: {
            return {
                ...state,
                socketConnected: true
            };
        }

        case SOCKET_DISCONNECTED: {
            return {
                ...state,
                socketConnected: false
            };
        }
        case NETWORK_STATUS_CHANGED: {
            return {
                ...state,
                networkConnected: action.payload.isConnected
            }
        }

        case PROVIDER_VERIFY_CODE: {
            return {
                ...state,
                isAuthenticated: false,
                isLoading: true,
                data: null,
                error: false,
                errorMsg: null
            };
        }

        case PROVIDER_CODE_VERIFICATION_SUCCESSFUL: {
            return {
                ...state,
                codeVerified: true,
                error: false,
                isLoading: false,
                errorMsg: null
            }
        }

        case PROVIDER_UPDATE_PASSWORD: {
            return {
                ...state,
                isLoading: true
            };
        }

        case PROVIDER_PASSWORD_UPDATED: {
            return {
                ...state,
                isLoading: false,
                passwordUpdated: true
            }
        }

        case PROVIDER_VERIFICATION_FAILED:
        case PROVIDER_UPDATE_PASSWORD_FAILED:{
            return {
                ...state,
                isAuthenticated: false,
                error: true,
                isLoading: false,
                data: null,
                errorMsg: action.errorMsg
            };
        }

        case USER_RESET_AUTH:
        case PROVIDER_LOGOUT: {
            return DEFAULT;
        }

        case PROVIDER_LOGIN_SUCCESSFUL: {
            return {
                ...state,
                // data: action.data,
                isAuthenticated: true,
                isLoading: false,
                error: false,
                errorMsg: null,
                meta: {
                    userId: action.data.userId,
                    nickName: action.data.nickName
                }
            }
        }

        case PROVIDER_LOGIN_FAILED: {
            return {
                ...state,
                data: null,
                isLoading: false,
                isAuthenticated: false,
                errorMsg: null,
            }
        }
        case CLEAR_ERRORS: {
            return {
                ...state,
                errorMsg: null,
                error: false
            }
        }

        default: {
            return state;
        }
    }
}
