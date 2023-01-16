import { createAction } from "redux-actions";
import {GET_CONNECTIONS} from "../connections/actions";
export const CHAT_INITIALIZE = "chat/INITIALIZE";
export const CHAT_INITIALIZING = "chat/INITIALIZING";
export const CHAT_READY = "chat/READY";
export const CHAT_INIT_FAILED = "chat/INIT_FAILED";
export const CHAT_MARK_AS_READ = "chat/MARK_AS_READ";
export const CHAT_ADD_MESSAGE = "chat/ADD_MESSAGE";
export const CHAT_MESSAGE_RECEIVED = "chat/MESSAGE_RECEIVED";
export const CHAT_SEND_MESSAGE = "chat/SEND_MESSAGE";
export const CHAT_SEND_ATTACHMENT = "chat/SEND_ATTACHMENT";
export const CHAT_ATTACHMENT_SENT = "chat/ATTACHMENT_SENT";
export const CHAT_EXIT = "chat/EXIT";
export const CHAT_DATA_SHARE_PROMPT_ANSWERED = "chat/DATA_SHARE_PROMPT_ANSWERED";
export const CHAT_GROUP_UPDATED = "chat/GROUP_UPDATED";
export const CHAT_MEDIA_UPLOADED = "chat/MEDIA_UPLOADED";
export const CHAT_MEDIA_SENT = "chat/MEDIA_SENT";
export const CHAT_MEDIA_UPLOAD_PROGRESS = "chat/MEDIA_UPLOADED_PROGRESS";

export const SENDBIRD_CONNECTED = "SENDBIRD_CONNECTED"
export const SENDBIRD_RECONNECT = "SENDBIRD_RECONNECT"
export const SENDBIRD_RECONNECTING = "SENDBIRD_RECONNECTING"
export const SENDBIRD_CONNECTING = "SENDBIRD_CONNECTING"
export const SENDBIRD_CONNECT_FAILED = "SENDBIRD_CONNECT_FAILED"
const createActionWrapper = action => {
    return createAction(action, data => data.payload, data => data.meta);
};

export const chatActionCreators = {
    initChat: createActionWrapper(CHAT_INITIALIZE),
    sendMessage: createActionWrapper(CHAT_SEND_MESSAGE),
    exitChat: createAction(CHAT_EXIT),
    dataSharingPromptAnswered: createActionWrapper(CHAT_DATA_SHARE_PROMPT_ANSWERED),
    chatGroupUpdated: createAction(CHAT_GROUP_UPDATED),
    fetchConnections: createAction(GET_CONNECTIONS)
};
