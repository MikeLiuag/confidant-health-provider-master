import {createAction} from "redux-actions";
import {GET_PROFILE, PROFILE_GET_MARKED_EDUCATION_CONTENT} from "../profile/actions";
import {REGISTER_TOKEN_REFRESH_TASK} from "../auth/actions";
import {APPOINTMENTS_FETCH} from "../appointments/actions";
import {SETTINGS_GET_ALL} from "../settings/actions";
export const GET_CONNECTIONS = 'connections/GET';
export const GET_CONNECTIONS_SILENT = 'connections/GET_SILENT';
export const GET_SPECIFIC_CONNECTION = 'connections/GET_SPECIFIC';
export const SPECIFIC_CONNECTION_FETCHED = 'connections/SPECIFIC_CONNECTION_FETCHED';
export const NEW_CHAT_GROUP_CREATED = 'connections/NEW_CHAT_GROUP_CREATED';
export const CONNECTIONS_FETCHED = 'connections/FETCHED';
export const GET_CONNECTIONS_FAILED = 'connections/GET_FAILED';
export const CONNECT = 'connections/CONNECT';
export const CONNECTION_FAILED = 'connections/CONNECTION_FAILED';
export const ADD_CONNECTION = 'connections/ADD_CONNECTION';
export const DISCONNECT = 'connections/DISCONNECT';
export const DISCONNECT_FAILED = 'connections/DISCONNECT_FAILED';
export const DISCONNECTING = 'connections/DISCONNECTING';
export const DISCONNECTED = 'connections/DISCONNECTED';
export const ATTACH_MSG_RECEIVER = 'connections/ATTACH_MSG_RECEIVER';
export const REFRESH_ROASTER = 'connections/REFRESH_ROASTER';
export const UPDATED_CHANNEL_URL = 'connections/UPDATED_CHANNEL_URL';
export const GROUP_CALL_ACTIVE = 'connections/GROUP_CALL_ACTIVE';

export const FETCH_PENDING_CONNECTIONS = 'connections/FETCH_PENDING_CONNECTIONS';
export const PENDING_CONNECTIONS_FETCHED = 'connections/PENDING_CONNECTIONS_FETCHED';
export const PENDING_CONNECTIONS_FAILED = 'connections/PENDING_CONNECTIONS_FAILED';


export const connectActionCreators = {
    fetchConnections: createAction(GET_CONNECTIONS),
    connect: createAction(CONNECT),
    disconnect: createAction(DISCONNECT),
    fetchProfile: createAction(GET_PROFILE),
    fetchSettings: createAction(SETTINGS_GET_ALL),
    fetchEducationMarkers: createAction(PROFILE_GET_MARKED_EDUCATION_CONTENT),
    registerTokenRefreshTask: createAction(REGISTER_TOKEN_REFRESH_TASK),
    fetchAppointments: createAction(APPOINTMENTS_FETCH),
    newChatGroupCreated: createAction(NEW_CHAT_GROUP_CREATED),
    refreshConnections: createAction(GET_CONNECTIONS_SILENT)
};
