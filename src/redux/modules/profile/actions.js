import {createAction} from "redux-actions";

export const GET_PROFILE = 'profile/GET';
export const PROFILE_FETCH_FAILED = 'profile/FETCH_FAILED';
export const PROFILE_FETCH_SUCCESSFUL = 'profile/FETCH_SUCCESSFUL';
export const PROFILE_UPDATE = 'profile/UPDATE';
export const PROFILE_UPDATE_FAILED = 'profile/UPDATE_FAILED';
export const PROFILE_UPDATED = 'profile/UPDATED';
export const PROFILE_CLEAR_ERRORS = 'profile/CLEAR_ERRORS';
export const PROFILE_GET_MARKED_EDUCATION_CONTENT = 'profile/PROFILE_GET_MARKED_EDUCATION_CONTENT';
export const PROFILE_MARKED_EDUCATION_CONTENT = 'profile/PROFILE_MARKED_EDUCATION_CONTENT';
export const PROFILE_GET_EDUCATION_STATUS_FAILED = 'profile/GET_EDUCATION_STATUS_FAILED';
export const PROFILE_UPDATE_MARKED_EDUCATION_CONTENT = 'profile/PROFILE_UPDATE_MARKED_EDUCATION_CONTENT';

export const profileActionCreators = {
    getProfile: createAction(GET_PROFILE),
    updateProfile: createAction(PROFILE_UPDATE),
    clearErrors: createAction(PROFILE_CLEAR_ERRORS),
   // updateMarkedEducationContent:createAction(PROFILE_UPDATE_MARKED_EDUCATION_CONTENT)

};