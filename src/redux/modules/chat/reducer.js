import {
    CHAT_ADD_MESSAGE,
    CHAT_EXIT,
    CHAT_INITIALIZING,
    CHAT_MEDIA_SENT,
    CHAT_MEDIA_UPLOAD_PROGRESS,
    CHAT_MESSAGE_RECEIVED,
    CHAT_READY,
    CHAT_SEND_ATTACHMENT,
    SENDBIRD_CONNECT_FAILED,
    SENDBIRD_CONNECTED,
    SENDBIRD_CONNECTING,
    SENDBIRD_RECONNECTING
} from "./actions";
import {PROVIDER_LOGOUT} from "../auth/actions";
import {getArtificialLoadingMediaMessage} from "./saga";

export const DEFAULT_CHAT_LOCAL_CONTEXT = {
    connectionStatus: 0,
    messages: [],
    sendingMessage: false,
    loadEarlier: true,
    isLoadingEarlier: false,
    channelUrl: null,
    sendbirdStatus: 0
};

export default function chatReducer(state = DEFAULT_CHAT_LOCAL_CONTEXT, action) {
    const {type, payload} = action;
    switch (type) {
        case SENDBIRD_CONNECTED: {
            return {
                ...state,
                sendbirdStatus: 2
            }
        }
        case SENDBIRD_CONNECT_FAILED: {
            return {
                ...state,
                sendbirdStatus: 0
            }
        }
        case SENDBIRD_RECONNECTING: {
            return {
                ...state,
                sendbirdStatus: 3
            }
        }
        case SENDBIRD_CONNECTING: {
            return {
                ...state,
                sendbirdStatus: 1
            }
        }
        case CHAT_INITIALIZING: {
            return {
                ...state,
                connectionStatus: payload.connectionStatus,
                messages: []
            }
        }
        case CHAT_READY: {
            return {
                ...state,
                connectionStatus: payload.connectionStatus,
                messages: payload.chatMessages || [],
                channelUrl: payload.channelUrl
            }
        }
        case CHAT_ADD_MESSAGE:
        case CHAT_MESSAGE_RECEIVED: {
            const {channelUrl} = payload;
            if (state.channelUrl && state.channelUrl === channelUrl) {
                return {
                    ...state,
                    messages: [payload.message, ...state.messages]
                }
            } else {
                return state;
            }
        }
        case CHAT_MEDIA_SENT: {
            let {messages} = state;
            let updated = false;
            messages = messages.map(message=>{
                if(message._id===payload._id) {
                    message.fileMeta.loading = false;
                    message.fileMeta.url = payload.location;
                    updated = true;
                }
                return message;
            });
            if(!updated) {
                const message = getArtificialLoadingMediaMessage(payload,payload.meta);
                message.fileMeta.loading = false;
                message.fileMeta.url = payload.location;
                messages = [message, ...messages]
            }
            return {
                ...state,
                messages: messages,
            };
        }

        case CHAT_MEDIA_UPLOAD_PROGRESS: {
            let {messages} = state;
            let updated =false;
            messages = messages.map(message=>{
                if(message._id===payload._id) {
                    message.fileMeta.progress = payload.progress;
                    updated = true;
                }
                return message;
            });
            if(!updated) {
                const message = getArtificialLoadingMediaMessage(payload,payload.meta);
                message.fileMeta.progress=payload.progress;
                messages = [message, ...messages]
            }
            return {
                ...state,
                messages
            }
        }

        case CHAT_SEND_ATTACHMENT: {
            const giftedMessage = getArtificialLoadingMediaMessage(payload, payload.meta);
            return {
                ...state,
                messages: [giftedMessage, ...state.messages],
            };
        }
        case CHAT_EXIT:
        case PROVIDER_LOGOUT: {
            return DEFAULT_CHAT_LOCAL_CONTEXT;
        }
        default: {
            return state;
        }
    }
}
