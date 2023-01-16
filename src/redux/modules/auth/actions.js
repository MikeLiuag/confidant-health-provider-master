// @flow

import { createAction } from "redux-actions";

export const PROVIDER_LOGIN = 'auth/PROVIDER_LOGIN';
export const PROVIDER_LOGOUT = 'auth/PROVIDER_LOGOUT';
export const PROVIDER_LOGIN_SUCCESSFUL = 'auth/PROVIDER_LOGIN_SUCCESSFUL';
export const PROVIDER_LOGIN_FAILED = 'auth/PROVIDER_LOGIN_FAILED';
export const CLEAR_ERRORS = 'auth/CLEAR_ERRORS';
export const USER_RESET_AUTH = 'auth/USER_RESET_AUTH';
export const REGISTER_TOKEN_REFRESH_TASK = 'auth/REGISTER_TOKEN_REFRESH_TASK';
export const NETWORK_STATUS_CHANGED = 'auth/NETWORK_STATUS_CHANGED';


export const PROVIDER_VERIFY_CODE = 'auth/PROVIDER_VERIFY_CODE';
export const PROVIDER_CODE_VERIFICATION_SUCCESSFUL = 'auth/PROVIDER_CODE_VERIFICATION_SUCCESSFUL';
export const PROVIDER_VERIFICATION_FAILED = 'auth/PROVIDER_VERIFICATION_FAILED';

export const PROVIDER_UPDATE_PASSWORD = 'auth/PROVIDER_UPDATE_PASSWORD';
export const PROVIDER_PASSWORD_UPDATED = 'auth/PROVIDER_PASSWORD_UPDATED';
export const PROVIDER_UPDATE_PASSWORD_FAILED = 'auth/PROVIDER_UPDATE_PASSWORD_FAILED';

export const SOCKET_CONNECTED='auth/SOCKET_CONNECTED';
export const SOCKET_DISCONNECTED='auth/SOCKET_DISCONNECTED';

export const authActionCreators  = {

    login: createAction(PROVIDER_LOGIN),
    logout: createAction(PROVIDER_LOGOUT),
    clearErrors : createAction(CLEAR_ERRORS),
    resetAuth: createAction(USER_RESET_AUTH),
    updateNetworkStatus: createAction(NETWORK_STATUS_CHANGED),
    verifyCode : createAction(PROVIDER_VERIFY_CODE),
    updatePassword: createAction(PROVIDER_UPDATE_PASSWORD),
};
