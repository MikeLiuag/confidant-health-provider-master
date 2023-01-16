import {call, cancel, fork, put, select, take} from "redux-saga/effects";
import {eventChannel} from "redux-saga";
import {
    CHAT_ADD_MESSAGE,
    CHAT_EXIT,
    CHAT_INIT_FAILED,
    CHAT_INITIALIZE,
    CHAT_INITIALIZING,
    CHAT_MARK_AS_READ, CHAT_MEDIA_SENT, CHAT_MEDIA_UPLOADED,
    CHAT_MESSAGE_RECEIVED,
    CHAT_READY, CHAT_SEND_ATTACHMENT,
    CHAT_SEND_MESSAGE
} from "./actions";
import {AlertUtil, SendBirdAction, SendBirdChatEvent, uuid4} from "ch-mobile-shared";
import {UPDATED_CHANNEL_URL} from "../connections/actions";
import ConversationService from "../../../services/ConversationService";
import NavigationService from "../../../services/NavigationService";
import {Screens} from "../../../constants/Screens";
import Sendbird from 'sendbird';

const connectionStatus = {
    connecting: 0,
    connected: 1,
    fetchingMessages: 2,
    promptRequired: 3,
    readyToChat: 4,
    failedToConnect: 5,
    closed: 6
};


function* silentChatRefresher(action, dispatch) {
    let {channelUrl, connection, currentUser} = action.payload;
    const sendBirdAction = yield call(SendBirdAction.getInstance);
    let sendBirdChannel = yield call(getSBChannel, channelUrl, connection.userId);
    let chatMessages = yield call(sendBirdAction.getMessageList, sendBirdChannel, true);
    if (chatMessages) {
        chatMessages = chatMessages.map(mapMessageToGiftedChat);
        yield call(markMessagesAsRead, channelUrl, sendBirdAction, sendBirdChannel);
        yield put({
            type: CHAT_READY,
            payload: {
                connectionStatus: connectionStatus.readyToChat,
                chatMessages,
                channelUrl
            }
        });
    }
    yield fork(messageSenderTask, sendBirdAction, sendBirdChannel, dispatch, connection);
    yield fork(mediaSenderTask, sendBirdAction, sendBirdChannel, dispatch, connection);
}

function* getSBChannel(channelUrl, userId) {
    const sendBirdAction = yield call(SendBirdAction.getInstance);
    let sendBirdChannel = null;
    if (channelUrl) {
        sendBirdChannel = yield call(sendBirdAction.getChannel, channelUrl, false);
    } else {
        console.log('No Channel URL present in cache. Getting Channel URL from Backend');
        const channelIdResponse = yield call(ConversationService.getChannelUrl, userId);
        console.log(channelIdResponse);
        if (channelIdResponse.errors || channelIdResponse.channelUrl === null) {
            console.log(channelIdResponse.errors);
            AlertUtil.showErrorMessage("Chat service is unavailable at the moment, please try again later");
            yield put({
                type: CHAT_INITIALIZING,
                payload: {
                    connectionStatus: connectionStatus.failedToConnect
                }
            });
            yield put({
                type: CHAT_EXIT
            });
        } else {
            channelUrl = channelIdResponse.channelUrl;
            yield put({
                type: UPDATED_CHANNEL_URL,
                payload: {
                    connectionId: userId,
                    channelUrl
                }
            });
            sendBirdChannel = yield call(sendBirdAction.getChannel, channelUrl, false);
        }
    }
    return sendBirdChannel;
}

function* liveChatFlowHandler(action, dispatch) {
    yield put({
        type: CHAT_INITIALIZING,
        payload: {
            connectionStatus: connectionStatus.connecting
        }
    });
    let {channelUrl, connection, currentUser} = action.payload;
    const sendBirdAction = yield call(SendBirdAction.getInstance);
    let sendBirdChannel = null;
    let newChannel = false;
    const channelName = currentUser.nickname + "-" + connection.nickname;
    try {
        sendBirdChannel = yield call(getSBChannel, channelUrl,connection.userId);
    } catch (error) {
        console.log(error);
        if (error.code === 400201) {
            console.log('Channel not found So creating a new channel');
            sendBirdChannel = yield call(sendBirdAction.createGroupChannel, channelName, channelUrl, connection.userId, currentUser.userId);
            newChannel = true;
        }
    }
    if (sendBirdChannel) {
        if (newChannel) {

            yield put({
                type: CHAT_READY,
                payload: {
                    connectionStatus: connectionStatus.readyToChat,
                    chatMessages: [],
                    channelUrl
                }
            });
        } else {
            yield put({
                type: CHAT_INITIALIZING,
                payload: {
                    connectionStatus: connectionStatus.fetchingMessages
                }
            });
            let chatMessages = yield call(sendBirdAction.getMessageList, sendBirdChannel, true);
            if (chatMessages) {
                chatMessages = chatMessages.map(mapMessageToGiftedChat);
                yield call(markMessagesAsRead, channelUrl, sendBirdAction, sendBirdChannel);
                yield put({
                    type: CHAT_READY,
                    payload: {
                        connectionStatus: connectionStatus.readyToChat,
                        chatMessages,
                        channelUrl
                    }
                });
            }
        }
        yield fork(messageSenderTask, sendBirdAction, sendBirdChannel, dispatch, connection);
        yield fork(mediaSenderTask, sendBirdAction, sendBirdChannel, dispatch, connection);
    }
}


const createChatEventChannel = (channelEvent) => {
    return eventChannel(emit => {
        channelEvent.onMessageReceived = (channel, message) => {
            console.log(channel);
            emit({message, channelUrl: channel.url, type: 'MessageReceived', isDistinct: channel.isDistinct});
        };
        channelEvent.onMessageUpdated = (channel, message) => {
            // if (connectedChannel.url === channel.url) {
            //     emit({message, type: 'MessageUpdated'});
            // }
        };
        return () => {
            // connectionStatusStream.unsubscribe();
        };
    });
};

function* sendBirdFileSender(sbAction, payload, channel, connection, dispatch) {
    const handlerCB = (success, error) => {
        if (success) {
            dispatch({
                type: CHAT_MEDIA_SENT,
                payload: {
                    _id: payload._id,
                    channelUrl: channel.url,
                    location: payload.location
                }, meta: {
                    contact: {
                        provider: connection
                    }
                }
            })
        } else {
            console.log('Sendbird error sending media');
            console.log(error)
        }
    };
    try {
        const sb = Sendbird.getInstance();
        const params = new sb.FileMessageParams();
        params.fileUrl = payload.location;             // Or .fileUrl  = FILE_URL (You can also send a file message with a file URL.)
        params.mimeType = payload.type;
        const requestPayload = {
            channel: channel,
            file: params,
            handler: handlerCB
        };
        yield call(sbAction.sendFileMessage, requestPayload);
    } catch (e) {
        console.log('Sendbird error sending media');
        console.log(e)
    }
}

function* mediaSenderTask(sendBirdAction, connectedChannel, dispatch, connection) {

    while (true) {
        const {payload} = yield take(CHAT_MEDIA_UPLOADED);
        yield fork(sendBirdFileSender, sendBirdAction, payload, connectedChannel, connection, dispatch);
    }

}


export function* incomingMessageHandler() {
    const chatEvent = yield call(SendBirdChatEvent.getInstance);
    const chatEventChannel = yield call(createChatEventChannel, chatEvent);
    const {userId} = yield select(state => state.auth.meta);
    console.log('SendBird Receiver Initialized');
    try {
        while (true) {
            const {message, channelUrl, isDistinct} = yield take(chatEventChannel);

            yield put({
                type: CHAT_MESSAGE_RECEIVED,
                payload: {
                    message: mapMessageToGiftedChat(message),
                    channelUrl,
                    isDistinct,
                    senderId: message.sender.userId,
                    isIncoming: message.sender.userId !== userId
                }
            });
            const currentNavParams = NavigationService.getCurrentRouteParams();
            if (currentNavParams.routeName === Screens.LIVE_CHAT) {
                const {connection} = currentNavParams.params;
                if (connection.channelUrl === channelUrl) {
                    yield call(markMessagesAsRead, channelUrl);
                }
            }
        }
    } catch (e) {
        console.log('ChatEventChannel threw an error');
        console.log(e);
    }
}

function* messageSenderTask(sendBirdAction, connectedChannel, dispatch, connection) {
    try {
        while (true) {
            const action = yield take(CHAT_SEND_MESSAGE);
            if (action.payload.message.hasFile) {

                const attachment = {
                    channel: {
                        channelUrl: connectedChannel.url
                    },
                    file: action.payload.message.fileData
                };
                const meta = yield select(state => state.auth.meta);


                yield put({
                    type: CHAT_SEND_ATTACHMENT,
                    payload: {
                        ...attachment,
                        _id: uuid4(),
                        meta
                    }
                });


            } else {
                const originalMessage = action.payload.message;
                const requestPayload = {
                    channel: connectedChannel,
                    message: originalMessage.text,
                    handler: function (sentMessage, error) {
                        if (sentMessage) {
                            dispatch({
                                type: CHAT_ADD_MESSAGE,
                                payload: {
                                    message: originalMessage,
                                    channelUrl: connectedChannel.url
                                }, meta: {
                                    contact: {
                                        provider: connection
                                    }
                                }
                            });

                        } else {
                            console.log(error);
                        }
                    }
                };
                yield call(sendBirdAction.sendUserMessage, requestPayload);
            }

        }
    } catch (e) {
        console.log('Message Sender Task threw an error');
        console.log(e);
    }
}

function* markMessagesAsRead(channelUrl, sendBirdAction, sendBirdChannel) {
    if (!sendBirdAction) {
        sendBirdAction = SendBirdAction.getInstance();
        sendBirdChannel = yield call(sendBirdAction.getChannel, channelUrl, false);
    }
    console.log('Marking all Messages as read');
    yield call(sendBirdAction.markAsRead, sendBirdChannel);
    yield call(dispatchMarkAsReadAction, channelUrl);
}


function* dispatchMarkAsReadAction(channelUrl) {
    yield put({
        type: CHAT_MARK_AS_READ,
        payload: {
            channelUrl
        }
    });
}

const mapMessageToGiftedChat = (message) => {
    const giftedMessage = {
        _id: message.messageId,
        text: message.message,
        createdAt: message.createdAt,
        type: message.messageType,
        fileMeta: message.messageType === 'file' ? {
            url: message.url,
            type: message.type,
        } : null,
        system: message.messageType && message.messageType === 'admin'

    };
    if (giftedMessage.system) {
        giftedMessage.user = {
            _id: message.messageId,
            name: 'System'
        }
    } else {
        giftedMessage.user = {
            _id: message.sender.userId,
            name: message.sender.nickname,
            avatar: message.sender.profileUrl
        }
    }
    return giftedMessage;
};


export const getArtificialLoadingMediaMessage = (message, meta) => {
    const giftedMessage = {
        _id: message._id,
        text: null,
        createdAt: new Date().getTime(),
        type: 'file',
        fileMeta: {
            url: message.file.uri,
            type: message.file.type,
            loading: true,
            progress: 0
        },
        system: false,

    };
    if (giftedMessage.system) {
        giftedMessage.user = {
            _id: message.messageId,
            name: 'System',
        };
    } else {
        giftedMessage.user = {
            _id: meta.userId,
            name: meta.nickName,
        };
    }
    return giftedMessage;
};

export default function* chatSaga(store) {
    let chatFlowHandle;
    while (true) {
        const action = yield take(CHAT_INITIALIZE);
        if (chatFlowHandle) {
            yield cancel(chatFlowHandle);
        }
        if (action.payload.connection.messages) {

            yield put({
                type: CHAT_READY,
                payload: {
                    connectionStatus: connectionStatus.readyToChat,
                    chatMessages: action.payload.connection.messages,
                    channelUrl: action.payload.connection.channelUrl,
                },
            });
            chatFlowHandle = yield fork(silentChatRefresher, action, store.dispatch);
        } else {
            chatFlowHandle = yield fork(liveChatFlowHandler, action, store.dispatch);
        }
        // const nextAction = yield take([CHAT_INIT_FAILED, CHAT_EXIT]);
        // if (nextAction.type === CHAT_EXIT) {
        //     try {
        //         yield cancel(chatFlowHandle);
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }
    }
}
