import {all, call, cancel, fork, put, select, take} from "redux-saga/effects";
import {
    ADD_CONNECTION,
    CONNECT, CONNECTION_FAILED,
    CONNECTIONS_FETCHED,
    DISCONNECT, DISCONNECT_FAILED,
    DISCONNECTED,
    DISCONNECTING, FETCH_PENDING_CONNECTIONS,
    GET_CONNECTIONS,
    GET_CONNECTIONS_FAILED, GET_CONNECTIONS_SILENT,
    GET_SPECIFIC_CONNECTION, PENDING_CONNECTIONS_FAILED, PENDING_CONNECTIONS_FETCHED,
    REFRESH_ROASTER,
    SPECIFIC_CONNECTION_FETCHED
} from "./actions";
import {eventChannel} from "redux-saga";
import ProfileService from "../../../services/ProfileService";
import {AlertUtil, SendBirdAction, SendBirdConnection} from "ch-mobile-shared";
import {incomingMessageHandler} from "../chat/saga";
import {
    CHAT_ATTACHMENT_SENT,
    CHAT_MARK_AS_READ,
    CHAT_MEDIA_UPLOAD_PROGRESS,
    CHAT_MEDIA_UPLOADED,
    CHAT_MESSAGE_RECEIVED,
    CHAT_SEND_ATTACHMENT,
    SENDBIRD_CONNECT_FAILED,
    SENDBIRD_CONNECTED,
    SENDBIRD_CONNECTING,
    SENDBIRD_RECONNECT,
    SENDBIRD_RECONNECTING
} from "../chat/actions";
import {SocketClient} from "ch-mobile-shared/src/utilities/SocketClient";
import {APPOINTMENTS_FETCH} from "../appointments/actions";
import {PROVIDER_LOGIN_SUCCESSFUL, PROVIDER_LOGOUT, SOCKET_CONNECTED, SOCKET_DISCONNECTED} from "../auth/actions";
import NavigationService from "../../../services/NavigationService";
import {Screens} from "../../../constants/Screens";
import {CONTACT_NOTES_FLAGS, USER_TYPE} from "../../../constants/CommonConstants";
import {S3MediaManager} from "../../../services/S3MediaManager";
import {Colors} from "ch-mobile-shared/src/styles";
import {CONNECTION_TYPES} from "ch-mobile-shared/src/constants/CommonConstants";


const AVATAR_COLOR_ARRAY = ['#7a00e7', '#f78795', '#d97eff', '#2bb826', '#ff7f05'];
let roasterRefreshInterval = null;

function* getConnectionsHandler(dispatch) {
    let msgReceiver, refreshTask;

    while (true) {
        const {type} = yield take([GET_CONNECTIONS, GET_CONNECTIONS_SILENT]);
        const response = yield call(ProfileService.getConnections);
        console.log({"saga":response})
        if (type === GET_CONNECTIONS) {
            if (refreshTask) {
                yield cancel(refreshTask);
                if (roasterRefreshInterval) {
                    clearInterval(roasterRefreshInterval);
                    roasterRefreshInterval = null;
                }

            }
            if (msgReceiver) {
                yield cancel(msgReceiver);
            }
        }
        if (response.errors) {
            yield put({
                type: GET_CONNECTIONS_FAILED, payload: {
                    errorMsg: response.errors[0].endUserMessage
                }
            });
        } else {
            const {userId, nickName} = yield select(state => state.auth.meta);
            // response.activeConnections=response.activeConnections.map(connection=>{
            //     return {
            //         ...connection,
            //         channelUrl: null
            //     }
            // });


            // TODO : This needs to be changed later . For now filtering connections that have name value .
            const meta = yield select(state => state.auth.meta);
            const activeConnections = addColorCode(response.activeConnections.filter(item => item.name !== null));
            const pastConnections = addColorCode(response.pastConnections.filter(item => item.name !== null));
            yield put({
                type: CONNECTIONS_FETCHED, payload: {
                    activeConnections: getTimeFormattedConnections(activeConnections, userId),
                    pastConnections: getTimeFormattedConnections(pastConnections, userId),
                    requestedConnections: response.requestedConnections ? response.requestedConnections : [],
                    userId: meta.userId
                }
            });
            yield put({type: FETCH_PENDING_CONNECTIONS});
            if (type === GET_CONNECTIONS) {
                refreshTask = yield fork(roasterRefreshTask);

                const socket = SocketClient.getInstance().getConnectedSocket();
                if (socket) {
                    socket.off('refresh-connections');
                    socket.off('user-disconnected-by');
                    socket.off('appt-changed');
                    SocketClient.getInstance().unregisterConnectivityCallbacks("GlobalSocketWatcher");
                    SocketClient.getInstance().registerConnectivityCallbacks("GlobalSocketWatcher", () => {
                        dispatch({
                            type: SOCKET_DISCONNECTED,
                        });
                    }, () => {
                        dispatch({
                            type: SOCKET_CONNECTED,
                        });
                    });
                    socket.on('refresh-connections', (data) => {
                        console.log('Got a refresh event');
                        dispatch({
                            type: GET_SPECIFIC_CONNECTION,
                            payload: {
                                connectionId: data.connectionId
                            }
                        });
                    });
                    socket.on('user-disconnected-by', (data) => {
                        console.log('Got a disconnected event');
                        AlertUtil.showMessage("You're disconnected by " + data.userName, 'Close', 'top', 'warning');
                        dispatch({
                            type: GET_CONNECTIONS,
                            payload: {
                                refresh: true
                            }
                        });
                    });

                    socket.on('appt-changed', (data) => {
                        console.log('Got an appointment status change event');
                        AlertUtil.showSuccessMessage(data.data.message);
                        dispatch({
                            type: APPOINTMENTS_FETCH
                        });
                    });
                } else {
                    console.warn('Socket not connected still');
                }

            }

        }
    }
}

function chatConnectionStatusChannel(user) {
    console.log('Watching Sendbird Connection');
    return eventChannel(emitter => {
        const iv = setInterval(() => {
            emitter(SendBirdAction.getInstance().sb.getConnectionState());
        }, 2000);
        return () => {
            clearInterval(iv);
        };
    });
}

function* chatConnectionWatcher() {
    const statusChannel = yield call(chatConnectionStatusChannel);
    while (true) {
        const status = yield take(statusChannel);
        const sendbirdStatus = yield select(state => state.chat.sendbirdStatus);
        switch (status) {
            case 'CLOSED': {
                yield put({
                    type: SENDBIRD_CONNECT_FAILED,
                });
                SendBirdAction.getInstance().sb.reconnect();
                break;
            }
            case 'CONNECTING': {
                if (sendbirdStatus !== 3) {
                    yield put({
                        type: SENDBIRD_RECONNECTING,
                    });
                }
                break;
            }
            case 'OPEN': {
                if (sendbirdStatus !== 2) {
                    yield put({
                        type: SENDBIRD_CONNECTED,
                    });
                }

            }
        }
    }
}

function* connectSendBird(dispatch) {
    let watcher = null;
    while (true) {
        const action = yield take([PROVIDER_LOGIN_SUCCESSFUL, SENDBIRD_RECONNECT]);
        if (watcher) {
            yield cancel(watcher);
        }
        const meta = yield select(state => state.auth.meta);
        try {
            if (action.type === PROVIDER_LOGIN_SUCCESSFUL) {
                SocketClient.getInstance().connect(meta.userId, USER_TYPE);

                yield put({
                    type: SOCKET_CONNECTED,
                });
                yield put({
                    type: SENDBIRD_CONNECTING,
                });
            }

            const {nickName, userId} = meta;
            console.log('Connecting Sendbird for ' + nickName + ' having id ' + userId);
            const sendBird = yield call(SendBirdAction.getInstance);

            const sendBirdUser = yield call(sendBird.connect, userId, nickName);


            if (sendBirdUser) {
                const sendBirdConnection = yield call(SendBirdConnection.getInstance);
                sendBirdConnection.remove();
                sendBirdConnection.add(null, () => {
                    console.log('Sendbird Reconnected');
                    dispatch({
                        type: GET_CONNECTIONS_SILENT
                    });
                }, null);
                yield fork(incomingMessageHandler);
                watcher = yield fork(chatConnectionWatcher);
                yield put({
                    type: SENDBIRD_CONNECTED
                });
                yield take(PROVIDER_LOGOUT);
                yield cancel(watcher);
            } else {
                console.log('Failed to fetch sendbird user information... SendBird Connect returned null.');
                setTimeout(() => {
                    dispatch({
                        type: SENDBIRD_RECONNECTING
                    })
                    dispatch({
                        type: SENDBIRD_RECONNECT
                    })
                }, 1000);
            }
        } catch (e) {
            console.log('Send Bird Issue');
            console.log(e);
            setTimeout(() => {
                dispatch({
                    type: SENDBIRD_RECONNECTING
                })
                dispatch({
                    type: SENDBIRD_RECONNECT
                })
            }, 1000);
        }
    }

}


function timerChannel() {
    return eventChannel(emitter => {
            roasterRefreshInterval = setInterval(() => {
                emitter({});
            }, 60 * 1000);
            return () => {
                clearInterval(roasterRefreshInterval)
            }
        }
    )
}


function* roasterRefreshTask() {
    const repeatChannel = yield call(timerChannel);
    while (true) {
        yield take(repeatChannel);
        yield put({
            type: REFRESH_ROASTER,
            payload: {}
        })
    }
}

const getTimeFormattedConnections = (connections, currentUserId) => {
    return connections.map(connection => {
            return formatTimeForConnection(connection, currentUserId)
        }
    );
};




/**
 * @function getProfileColorByFlag
 * @description This method is used to get profile border color by flag
 */

 const getProfileColorByFlag = (patientContactNotes) => {
    const prohibitiveNotes = patientContactNotes?.filter(note => note?.flag === CONTACT_NOTES_FLAGS.PROHIBITIVE);
    const cautionNotes = patientContactNotes?.filter(note => note?.flag === CONTACT_NOTES_FLAGS.CAUTION);
    let contactNotesFlag = "";
    if (prohibitiveNotes?.length > 0) {
        contactNotesFlag = CONTACT_NOTES_FLAGS.PROHIBITIVE
    } else if (cautionNotes?.length > 0) {
        contactNotesFlag = CONTACT_NOTES_FLAGS.CAUTION
    }
    switch (contactNotesFlag) {
        case CONTACT_NOTES_FLAGS.CAUTION:
            return Colors.colors.starRatingColor;
        case CONTACT_NOTES_FLAGS.PROHIBITIVE:
            return Colors.colors.mainPink;
        default :
            return Colors.colors.white
    }
}


const addColorCode = (connections) => {

    if (connections && connections.length > 0) {
        connections = connections.map((item, index) => {
            if (!item.profilePicture) {
                item.colorCode = AVATAR_COLOR_ARRAY[index % AVATAR_COLOR_ARRAY.length];
            }
            if(item.type === CONNECTION_TYPES.PATIENT) {
                item.profileHighlightedColor = getProfileColorByFlag(item?.contactNotes)
            }
            return item;

        });
    }
    return connections;

}


const formatTimeForConnection = (connection, currentUserId) => {
    let timestamp = null;
    if (connection.lastMessageTimestamp) {
        let timeString = connection.lastMessageTimestamp;
        if (timeString.indexOf("-") === -1) {
            timeString = parseInt(connection.lastMessageTimestamp);
        }
        timestamp = new Date(timeString).getTime();
    }
    connection.lastMessageTimestamp = timestamp;
    if (connection.type === 'PRACTITIONER' || connection.type === 'MATCH_MAKER') {
        connection.nickname = connection.name;
        connection.userId = connection.connectionId
    }
    return connection;
};

function* connectHandler() {
    while (true) {
        const {payload} = yield take(CONNECT);
        const connectResponse = yield call(ProfileService.connectWithUser, payload.userId);
        if (connectResponse.errors) {
            console.log(connectResponse.errors[0].endUserMessage);
            yield put({
                type: CONNECTION_FAILED
            });
            yield put({
                type: GET_CONNECTIONS, payload: {
                    refresh: true
                }
            });
            AlertUtil.showErrorMessage('Unable to connect at the moment. Please try again later')
        } else {
            AlertUtil.showSuccessMessage("Connection request sent");
            yield put({
                type: GET_CONNECTIONS, payload: {
                    refresh: true
                }
            });
        }
    }
}

function* disconnectHandler() {
    while (true) {
        const {payload} = yield take(DISCONNECT);
        yield put({type: DISCONNECTING});
        const disconnectResponse = yield call(ProfileService.disconnectMember, payload.userId);
        if (disconnectResponse.errors) {
            console.log('Failed to disconnect');
            console.log(disconnectResponse.errors[0].endUserMessage);
            //TODO : Will remove this event once we can figure out the exact scenario for this case.
            AlertUtil.showErrorMessage(disconnectResponse.errors[0].endUserMessage);
            yield put({
                type: DISCONNECT_FAILED, payload: {
                    errorMsg: disconnectResponse.errors[0].endUserMessage
                }
            });
        } else {
            yield put({type: DISCONNECTED});
            AlertUtil.showSuccessMessage("User disconnected");
            yield put({
                type: GET_CONNECTIONS,
                payload: {
                    refresh: true
                }
            });
        }
    }
}

function* getNewConnectionOnMessage() {
    while (true) {
        const {payload} = yield take(CHAT_MESSAGE_RECEIVED);
        const {userId} = yield select(state => state.auth.meta);
        const {channelUrl, senderId} = payload;
        const {activeConnections, pastConnections} = yield select(state => state.connections);
        let isConnected = false;
        isConnected = activeConnections.filter(connection => connection.connectionId === senderId).length > 0;
        if (!isConnected) {
            const response = yield call(ProfileService.getSpecificConnection, senderId, channelUrl);
            if (response.errors) {
                console.log(response.errors[0].endUserMessage);
            } else {
                yield put({
                    type: ADD_CONNECTION,
                    payload: formatTimeForConnection(response, userId)
                });
            }
        }
    }
}


function* specificConnectionUpdateHandler() {
    while (true) {
        const {payload} = yield take(GET_SPECIFIC_CONNECTION);
        const {userId} = yield select(state => state.auth.meta);
        const response = yield call(ProfileService.getSpecificConnection, payload.connectionId);
        if (response.errors) {
            console.log(response.errors[0].endUserMessage);
        } else {
            yield put({
                type: SPECIFIC_CONNECTION_FETCHED, payload: formatTimeForConnection(response, userId)
            });
            const currentNavParams = NavigationService.getCurrentRouteParams();
            if (currentNavParams.routeName === Screens.LIVE_CHAT) {
                const {connection} = currentNavParams.params;
                if (payload.connectionId === connection.connectionId) {
                    yield put({
                        type: CHAT_MARK_AS_READ,
                        payload: {
                            channelUrl: connection.channelUrl
                        }
                    });
                }
            }
        }
    }
}

function* attachmentSender(dispatch) {
    while (true) {
        const {payload} = yield take(CHAT_SEND_ATTACHMENT);
        yield fork(awsMediaUploader, payload, dispatch)
    }
}

function* awsMediaUploader(payload, dispatch) {
    try {
        const response = yield call(S3MediaManager.uploadChatMedia, {
            ...payload.file,
            contentType: payload.file.type

        }, (e) => {
            const progress = e.percent * 100;
            dispatch({
                type: CHAT_MEDIA_UPLOAD_PROGRESS,
                payload: {
                    ...payload,
                    progress

                }
            })
        });
        if (response.success) {
            yield put({
                type: CHAT_MEDIA_UPLOADED,
                payload: {
                    channelUrl: payload.channel.channelUrl,
                    _id: payload._id,
                    type: payload.file.type,
                    location: response.response.location
                }
            })
        } else {
            AlertUtil.showErrorMessage("Media storage service failed to upload attachment");
        }
    } catch (e) {
        console.log(e);
        AlertUtil.showErrorMessage("Unable to send attachment");
    }
}

function* fetchPendingConnections() {
    while (true) {
        yield take(FETCH_PENDING_CONNECTIONS);
        try {
            const pendingConnections = yield call(ProfileService.getPendingConnections);
            if (pendingConnections.errors) {
                AlertUtil.showErrorMessage(pendingConnections.errors[0].endUserMessage);
                yield put({
                    type: PENDING_CONNECTIONS_FAILED, payload: {
                        errorMsg: pendingConnections?.errors[0]?.endUserMessage,
                    }
                })
            } else {
                yield put({type: PENDING_CONNECTIONS_FETCHED, payload: pendingConnections})
            }
        } catch (error) {
            AlertUtil.showErrorMessage(error);
            yield put({type: PENDING_CONNECTIONS_FAILED})

        }
    }

}

export default function* connectionsSaga(store) {

    yield all([
        fork(getConnectionsHandler, store.dispatch),
        fork(connectSendBird, store.dispatch),
        fork(getNewConnectionOnMessage),
        fork(connectHandler),
        fork(specificConnectionUpdateHandler),
        fork(disconnectHandler),
        fork(attachmentSender, store.dispatch),
        fork(fetchPendingConnections)
    ]);

}
