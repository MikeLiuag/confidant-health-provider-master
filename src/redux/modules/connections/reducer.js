import {PROVIDER_LOGOUT} from "../auth/actions";
import {
    ADD_CONNECTION, CONNECTION_FAILED,
    CONNECTIONS_FETCHED,
    DISCONNECTING,
    GET_CONNECTIONS,
    GET_CONNECTIONS_FAILED,
    GROUP_CALL_ACTIVE,
    NEW_CHAT_GROUP_CREATED,
    REFRESH_ROASTER,
    SPECIFIC_CONNECTION_FETCHED,
    UPDATED_CHANNEL_URL,
    DISCONNECT_FAILED,
    FETCH_PENDING_CONNECTIONS,
    PENDING_CONNECTIONS_FAILED,
    PENDING_CONNECTIONS_FETCHED
} from "./actions";
import {
    CHAT_ADD_MESSAGE, CHAT_ATTACHMENT_SENT,
    CHAT_GROUP_UPDATED,
    CHAT_MARK_AS_READ, CHAT_MEDIA_SENT,
    CHAT_MESSAGE_RECEIVED, CHAT_READY,
    CHAT_SEND_ATTACHMENT
} from "../chat/actions";
import {getArtificialLoadingMediaMessage} from "../chat/saga";

export const DEFAULT = {
    isLoading: false,
    activeConnections: [],
    pastConnections: [],
    requestedConnections: [],
    pendingConnections : [],
    error: null,
    connectionsFetchedFor: null,
    errorMsg: null
};

export const sortConnections = roaster => {
    roaster = roaster?.sort((contact1, contact2) => {
        let timestamp1 = contact1.lastMessageTimestamp;
        if (!timestamp1) {
            timestamp1 = 0;
        }
        let timestamp2 = contact2.lastMessageTimestamp;
        if (!timestamp2) {
            timestamp2 = 0;
        }
        const result = timestamp2 - timestamp1;
        if (result < 0) {
            return -1;
        } else {
            return 1;
        }
    });
    return roaster;
};

export default function connectionsReducer(state = DEFAULT, action = {}) {
    const {type, payload} = action;
    switch (type) {


        case CHAT_SEND_ATTACHMENT: {
            let {activeConnections} = state;
            const giftedMessage = getArtificialLoadingMediaMessage(payload, payload.meta);
            activeConnections = activeConnections.map(connection => {
                if (connection.channelUrl === payload.channel.channelUrl) {
                    return {
                        ...connection,
                        lastMessage: 'Attachment',
                        lastMessageTimestamp: new Date().getTime(),
                        messages: connection.messages? [giftedMessage, ...connection.messages]:[giftedMessage]
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case CHAT_MEDIA_SENT: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.channelUrl === payload.channelUrl) {
                    let messages = connection.messages;
                    if(messages) {
                        messages = messages.map(message=>{
                            if(message._id===payload._id) {
                                message.fileMeta.loading=false;
                                message.fileMeta.url = payload.location;
                            }
                            return message;
                        })
                    }
                    return {
                        ...connection,
                        sendingAttachment: false,
                        messages: messages
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case CHAT_ATTACHMENT_SENT: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.channelUrl === payload.channelUrl) {
                    return {
                        ...connection,
                        sendingAttachment: false,
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case CHAT_READY: {
            if(payload.channelUrl) {
                let {activeConnections} = state;
                activeConnections = activeConnections.map(connection=>{
                    if(connection.channelUrl===payload.channelUrl) {
                        connection.messages = payload.chatMessages
                    }
                    return connection;
                });

                return {
                    ...state,
                    activeConnections: sortConnections(activeConnections)
                };
            } else {
                return state;
            }

        }

        case GET_CONNECTIONS: {
            return {
                ...state,
                isLoading: true,
            }
        }
        case CONNECTION_FAILED: {
            return {
                ...state,
                isLoading: false,
            };
        }
        case DISCONNECTING: {
            return {
                ...state,
                isLoading: true
            }
        }
        case DISCONNECT_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg
            }
        }
        case GET_CONNECTIONS_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                connectionsFetchedFor: null,
                errorMsg: payload.errorMsg
            }
        }
        case NEW_CHAT_GROUP_CREATED: {
            const {activeConnections} = state;
            const date = new Date();
            const chatGroup = {
                connectionId: payload.channelUrl,
                name: payload.groupName,
                profilePicture: payload.profilePicture,
                lastModified: date.toISOString(),
                type: 'CHAT_GROUP',
                lastMessage: null,
                lastMessageTimestamp: date.getTime(),
                lastMessageUnread: false,
                channelUrl: payload.channelUrl,
            };
            activeConnections.push(chatGroup);
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }
        case CONNECTIONS_FETCHED: {
            let {activeConnections} = state;
            let newActive = payload.activeConnections;
            if(state.connectionsFetchedFor!==null) {
                activeConnections.forEach(connection=>{
                    newActive = payload.activeConnections.map(activeConnection=>{
                        if(connection.connectionId===activeConnection.connectionId) {
                            activeConnection.messages = connection.messages;
                        }
                        return activeConnection;
                    })
                })
            }
            return {
                ...state,
                isLoading: false,
                error: null,
                errorMsg: null,
                activeConnections: sortConnections(newActive),
                pastConnections: sortConnections(payload.pastConnections),
                requestedConnections: payload.requestedConnections,
                connectionsFetchedFor: payload.userId
            }
        }

        case GROUP_CALL_ACTIVE: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.connectionId === payload.channelUrl && connection.type === 'CHAT_GROUP') {
                    return {
                        ...connection,
                        groupCallActive: payload.active
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections)
            }
        }
        case CHAT_MARK_AS_READ: {
            let {activeConnections} = state;
            const {channelUrl} = payload;
            activeConnections = activeConnections.map(connection => {
                if (connection.channelUrl === channelUrl) {
                    return {
                        ...connection,
                        lastMessageUnread: false
                    }
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections)
            };
        }
        case CHAT_ADD_MESSAGE: {
            let {activeConnections} = state;
            const {channelUrl} = action.payload;
            activeConnections = activeConnections.map(connection => {
                if (connection.channelUrl === channelUrl) {
                    return {
                        ...connection,
                        lastMessage: payload.message.text,
                        lastMessageTimestamp: payload.message.createdAt,
                        lastMessageUnread: false
                    }
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections)
            };
        }
        case UPDATED_CHANNEL_URL: {
            const {connectionId, channelUrl} = payload;
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.connectionId === connectionId) {
                    return {
                        ...connection,
                        channelUrl: channelUrl
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections)
            }

        }
        case CHAT_MESSAGE_RECEIVED: {
            let {activeConnections} = state;
            const {channelUrl, isIncoming, message, senderId, isDistinct} = payload;
            const isFile = message.type==='file';
            if (isDistinct) {
                activeConnections = activeConnections.map(connection => {
                    if (connection.channelUrl === channelUrl) {
                        return {
                            ...connection,
                            lastMessage: isFile?'Attachment':message.text,
                            lastMessageTimestamp: message.createdAt,
                            lastMessageUnread: isIncoming
                        }
                    } else if (connection.connectionId === senderId) {
                        return {
                            ...connection,
                            lastMessage: isFile?'Attachment':message.text,
                            lastMessageTimestamp: message.createdAt,
                            lastMessageUnread: isIncoming,
                            channelUrl: channelUrl
                        }
                    }
                    return connection;
                });
            } else {
                activeConnections = activeConnections.map(connection => {
                    if(connection.channelUrl === channelUrl) {
                        return {
                            ...connection,
                            lastMessage: isFile?'Attachment':message.text,
                            lastMessageTimestamp: message.createdAt,
                            lastMessageUnread: isIncoming
                        }
                    }
                    return connection;
                });
            }
            return {
                ...state,
                activeConnections: sortConnections(activeConnections)
            };
        }
        case REFRESH_ROASTER: {
            return {
                ...state,
                activeConnections: sortConnections(state.activeConnections),
                pastConnections: sortConnections(state.pastConnections)
            }
        }
        case SPECIFIC_CONNECTION_FETCHED: {
            let {requestedConnections, activeConnections, pastConnections} = state;
            delete payload['isActive'];
            const mapper = (connections) => {
                return connections.map(connection => {
                    if (connection.connectionId === payload.connectionId) {
                        return {
                            ...payload,
                            messages: connection.messages
                        };
                    }
                    return connection;
                });
            };
            requestedConnections = mapper(requestedConnections);
            pastConnections = mapper(pastConnections);
            activeConnections = mapper(activeConnections);
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
                pastConnections: sortConnections(pastConnections),
                requestedConnections,
            };
        }
        case ADD_CONNECTION: {
            let {activeConnections, pastConnections} = state;
            if (payload.isActive) {
                activeConnections.push(payload);
                pastConnections = pastConnections.filter(connection => connection.connectionId !== payload.connectionId);
            } else {
                pastConnections.push(payload);
                activeConnections = activeConnections.filter(connection => connection.connectionId !== payload.connectionId);
            }
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
                pastConnections: sortConnections(pastConnections)
            }
        }
        case CHAT_GROUP_UPDATED: {
            let {activeConnections, pastConnections} = state;
            const {channelUrl, groupName, profilePicture} = payload;
            activeConnections = activeConnections.map(connection => {
                if(channelUrl === connection.channelUrl) {
                    return {
                        ...connection,
                        name: groupName,
                        profilePicture: profilePicture
                    };
                }
                return connection;
            });
            pastConnections = pastConnections.map(connection => {
                if(channelUrl === connection.channelUrl) {
                    return {
                        ...connection,
                        name: groupName,
                        profilePicture: profilePicture
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
                pastConnections: sortConnections(pastConnections),
            };
        }
        case FETCH_PENDING_CONNECTIONS: {
            return {
                ...state,
                isLoading: true
            };
        }
        case PENDING_CONNECTIONS_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,
            };
        }
        case PENDING_CONNECTIONS_FETCHED: {
            return {
                ...state,
                isLoading: false,
                pendingConnections: payload
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
