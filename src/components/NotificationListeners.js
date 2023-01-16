import React from 'react';
import PushNotification from "react-native-push-notification";
import {Platform} from "react-native";
import NavigationService from "../services/NavigationService";
import OneSignal from "react-native-onesignal";
import {
    CONNECTION_TYPES,
    getAvatar,
    isTelehealthConfigured,
    NOTIFICATION_TYPES
} from 'ch-mobile-shared';
import {Screens} from "../constants/Screens";
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import AuthService from "../services/AuthService";
import KeyValueStorage from "react-native-key-value-storage"
import {ONESIGNAL_APP_ID} from "../constants/CommonConstants";
import {connectReduxState} from "../redux";
import {APPOINTMENTS_FETCH} from "../redux/modules/appointments/actions";
import {GET_CONNECTIONS_SILENT, GET_SPECIFIC_CONNECTION, GROUP_CALL_ACTIVE} from "../redux/modules/connections/actions";
import moment from "moment";

class NotificationListeners extends React.PureComponent {

    static dispatchToRedux = null;

    constructor(props) {
        super(props);
        NotificationListeners.dispatchToRedux = this.props.dispatch;

        console.log({props: this.props})

    }

    static navigateToTelehealth(data) {
        isTelehealthConfigured().then(isConfigured => {
            NavigationService.navigateTo(!isConfigured ? Screens.TELEHEALTH_WELCOME : Screens.VIDEO_CALL, {
                connection: {
                    name: data.from.name,
                    userId: data.from.userId
                },
                sessionId: data.sessionId,
                token: data.sessionToken,
                fromNotification: true
            });
        });
    }


    static subscribeToOneSignal = () => {

        OneSignal.init(ONESIGNAL_APP_ID, {
            kOSSettingsKeyAutoPrompt: true,
            kOSSettingsKeyInFocusDisplayOption: 0
        });
        console.log('OneSignal Init Successfully using appId: ' + ONESIGNAL_APP_ID);
        OneSignal.addEventListener('received', NotificationListeners.onReceived);
        OneSignal.addEventListener('opened', NotificationListeners.onOpened);
        OneSignal.inFocusDisplaying(0);
        OneSignal.addEventListener('ids', NotificationListeners.onIds);
    };

    static onIds = async (device) => {
        if (device.userId) {
            console.log('Got Player Id. Registering: ' + device.userId);
            try {
                const response = await AuthService.registerPlayerId(device.userId);
                if (response.errors) {
                    console.warn(response.errors[0].endUserMessage);
                } else {
                    await KeyValueStorage.set('playerId', device.userId);
                    console.log('PLAYER ID REGISTERED: ' + device.userId);
                }
            } catch (e) {
                console.warn('Could not register player id. Push Notifications may not work');
                console.warn(e);
            }
        }
    };

    /**
     * @function navigateToRespectiveScreen
     * @description This method is used navigate to respective screen ( Deep Linking )
     * @params notification
     */

    static navigateToRespectiveScreen = (notification) => {
        console.log("navigate to respective screen", notification);

        if(notification?.data?.metadata || notification?.data?.eventMeta) {

            if (notification?.data?.notificationType === NOTIFICATION_TYPES.APPOINTMENT_REQUESTED ||
                notification?.data?.notificationType === NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED ||
                notification?.data?.notificationType === NOTIFICATION_TYPES.APPOINTMENT_REMINDER ||
                notification?.data?.notificationType === NOTIFICATION_TYPES.APPOINTMENT_PRE_REMINDER
            ) {
                NavigationService.navigateTo(Screens.APPOINTMENT_DETAILS_SCREEN, {
                    appointment: {
                        ...notification?.data?.eventMeta,
                        participantId: notification?.data?.eventMeta?.memberId,
                        participantName: notification?.data?.eventMeta?.memberName,
                        startText: moment(notification?.data?.eventMeta?.startTime).format("h:mm a"),
                        endText: moment(notification?.data?.eventMeta?.endTime).format("h:mm a"),
                        date: moment(notification?.data?.eventMeta?.startTime).format("DD"),
                        month: moment(notification?.data?.eventMeta?.startTime).format("MMMM"),
                        year: moment(notification?.data?.eventMeta?.startTime).format("YYYY"),
                    },
                    fromNotification: true
                });
            } else if (notification?.data?.notificationType === NOTIFICATION_TYPES.GROUP_MESSAGE_RECEIVED) {
                NavigationService.navigateTo(Screens.LIVE_CHAT, {
                    connection: {
                        ...notification?.data?.metadata,
                        connectionId: notification?.data?.metadata?.channelUrl,
                        profilePicture: getAvatar(notification.data.metadata.channelUrl)
                    },
                    fromNotification: true
                });
            } else if (notification?.data?.notificationType === NOTIFICATION_TYPES.CHAT_MESSAGE_RECEIVED) {
                NavigationService.navigateTo(Screens.LIVE_CHAT, {
                    connection: {
                        ...notification?.data?.metadata,
                        connectionId: notification?.data?.metadata?.senderId,
                        profilePicture: getAvatar(notification.data.metadata.senderId)
                    },
                    fromNotification: true
                });
            } else if (notification?.data?.notificationType === NOTIFICATION_TYPES.GROUP_CALL_STARTED) {
                NavigationService.navigateTo(Screens.GROUP_CALL_SCREEN, {
                    connection: {
                        ...notification?.data?.metadata,
                        channelUrl: notification?.data?.eventMeta?.channelUrl,
                    },
                    fromNotification: true
                });
            } else if (notification?.data?.notificationType === NOTIFICATION_TYPES.INCOMING_TELESESSION) {
                NavigationService.navigateTo(Screens.APPOINTMENT_DETAILS_SCREEN, {
                    appointment: {
                        ...notification?.data?.metadata,
                    },
                    fromNotification: true
                });
            } else if (notification?.data?.notificationType === NOTIFICATION_TYPES.GROUP_CREATED) {
                NavigationService.navigateTo(Screens.CHAT_LIST, {
                    connection: {
                        ...notification?.data?.metadata,
                        connectionId: notification?.data?.metadata?.channelUrl,
                        profilePicture: getAvatar(notification.data.metadata.channelUrl)
                    },
                    fromNotification: true
                });
            } else if (notification?.data?.notificationType === NOTIFICATION_TYPES.GROUP_MEMBER_ADDED ||
                notification?.data?.notificationType === NOTIFICATION_TYPES.GROUP_MEMBER_LEFT ||
                notification?.data?.notificationType === NOTIFICATION_TYPES.GROUP_MEMBER_REMOVED) {
                NavigationService.navigateTo(Screens.MANAGE_GROUP_MEMBERS_SCREEN, {
                    connection: {
                        ...notification?.data?.metadata,
                        connectionId: notification?.data?.metadata?.channelUrl,
                        profilePicture: getAvatar(notification.data.metadata.channelUrl)
                    },
                });
            } else if (notification.data.notificationType === NOTIFICATION_TYPES.NEW_CONNECTION_REQUESTED) {
                if (notification.data?.metadata?.connectionPending.type === CONNECTION_TYPES.PATIENT) {
                    NavigationService.navigateTo(Screens.MEMBER_DETAIL_SCREEN, {
                        ...notification?.data?.metadata?.connectionPending,
                        userId: notification?.data?.metadata?.connectionPending?.connectionId,
                        fromNotification: true
                    })
                } else if (notification.data?.metadata?.connectionPending?.type === CONNECTION_TYPES.PRACTITIONER || connection.type === CONNECTION_TYPES.MATCH_MAKER) {
                    NavigationService.navigateTo(Screens.PROVIDER_DETAIL_SCREEN_V2, {
                        provider: {
                            ...notification?.data?.metadata?.connectionPending,
                            userId: notification?.data?.metadata?.connectionPending?.connectionId
                        },
                        providerId: notification?.data?.metadata?.connectionPending?.connectionId,
                        type: notification?.data?.metadata?.connectionPending?.type,
                    })
                }
            } else {
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            }
        }else{
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
    }

    static attachLocalListeners = (socket) => {
        PushNotification.configure({
            permissions: {
                alert: true,
                badge: true,
                sound: true
            },
            onNotification: function (notification) {
                console.log("NOTIFICATION:", notification);
                NotificationListeners.navigateToRespectiveScreen(notification)
                //notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios'
        });
        console.log('Listeners attached');
        if (socket) {
            socket.on('incomingTelesession', data => {
                console.log('New Telehealth Session Requested');
                console.log(data);
                NotificationListeners.showLocalNotification(data.from.name + ' ' + 'arrived for session',
                    data.from.name + ' ' + 'has arrived and waiting for you to join the scheduled session',
                    {...data, notificationType: 'VIDEO_CALL'}, false);
            });
            socket.on('reminder_notification', data => {
                console.log('reminder-notification received');
                console.log(data);
                NotificationListeners.showLocalNotification('Reminder Notification', data.description, data, false);
            });

            socket.on('app-notification-received', data => {
                console.log('Got a live app notification');
                console.log({notificationData: data})

                let shouldShowNotification = true;
                if (data.notificationType === 'CHAT_MESSAGE_RECEIVED' || data.notificationType === 'GROUP_MESSAGE_RECEIVED') {
                    const currentNavParams = NavigationService.getCurrentRouteParams();
                    if (currentNavParams.routeName === Screens.LIVE_CHAT) {
                        const {connection} = currentNavParams.params;
                        if (data.notificationType === 'CHAT_MESSAGE_RECEIVED' && data.metadata.senderId === connection.connectionId) {
                            console.log('Chat open for contact. Ignoring local notification display');
                            shouldShowNotification = false;
                        } else if (data.notificationType === 'GROUP_MESSAGE_RECEIVED' && data.metadata.channelUrl === connection.connectionId) {
                            console.log('Chat open for group. Ignoring local notification display');
                            shouldShowNotification = false;
                        }
                    }
                }
                if (shouldShowNotification) {
                    NotificationListeners.showLocalNotification(data.title, data.subtitle, data, false);
                    NotificationListeners.dispatchNotificationActions(data.notificationType, data);
                }
            });

            socket.on("group-call-check-response", data => {
                if (NotificationListeners.dispatchToRedux) {
                    const {channelUrl, active} = data;
                    NotificationListeners.dispatchToRedux({
                        type: GROUP_CALL_ACTIVE,
                        payload: {
                            channelUrl,
                            active
                        }
                    });
                }
            });

            socket.on('app-refresh-update', data => {
                if (data.shouldUpdateConnections) {
                    if (NotificationListeners.dispatchToRedux) {
                        NotificationListeners.dispatchToRedux({
                            type: GET_CONNECTIONS_SILENT,
                        });
                    }
                }
            });
        }
    };

    static dispatchNotificationActions = (notificationType, data) => {
        console.log('Checking notificationType: ' + notificationType + ' for dispatch');
        switch (notificationType) {
            case 'APPOINTMENT_REQUESTED':
            case 'APPOINTMENT_NEEDS_ACTION':
            case 'APPOINTMENT_CONFIRMED':
            case 'APPOINTMENT_CANCELLED': {
                console.log('Dispatching action from listeners');
                if (NotificationListeners.dispatchToRedux) {
                    NotificationListeners.dispatchToRedux({
                        type: APPOINTMENTS_FETCH,
                    });
                }
                break;
            }
            case 'CHAT_MESSAGE_RECEIVED': {
                if (NotificationListeners.dispatchToRedux) {
                    setTimeout(() => {
                        NotificationListeners.dispatchToRedux({
                            type: GET_SPECIFIC_CONNECTION,
                            payload: {
                                connectionId: data.metadata.senderId,
                            }
                        });
                    }, 2000);
                }
                break;
            }
            case 'GROUP_MESSAGE_RECEIVED': {
                if (NotificationListeners.dispatchToRedux) {
                    setTimeout(() => {
                        NotificationListeners.dispatchToRedux({
                            type: GET_SPECIFIC_CONNECTION,
                            payload: {
                                connectionId: data.metadata.channelUrl,
                            }
                        });
                    }, 2000);
                }
                break;
            }
            default: {

            }
        }
    };

    static showLocalNotification(title, subtitle, data, onGoingNotification) {
        PushNotification.localNotification({
            id: '0', // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
            ticker: "My Notification Ticker", // (optional)
            autoCancel: true, // (optional) default: true
            largeIcon: "ic_launcher_foreground", // (optional) default: "ic_launcher"
            smallIcon: "ic_launcher_foreground", // (optional) default: "ic_notification" with fallback for "ic_launcher"
            bigText: '', // (optional) default: "message" prop
            subText: null, // (optional) default: none
            vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
            ongoing: onGoingNotification, // (optional) set whether this is an "ongoing" notification
            priority: "high", // (optional) set notification priority, default: high
            visibility: "private", // (optional) set notification visibility, default: private
            importance: "high", // (optional) set notification importance, default: high
            data,
            userInfo: {id: '123', ...data},
            title: title, // (optional)
            message: subtitle, // (required)
            playSound: true, // (optional) default: true
        });
    }

    static onReceived = (notification) => {
        console.log("OneSignal Notification received: ", notification);
    };

    static onOpened = (openResult) => {
        console.log('OneSignal Message: ', openResult.notification.payload.body);
        console.log('OneSignal Data: ', openResult.notification.payload.additionalData);
        console.log('OneSignal isActive: ', openResult.notification.isAppInFocus);
        console.log('OneSignal openResult: ', openResult);
    };


    render() {
        return this.props.children;
    }
}

export default connectReduxState()(NotificationListeners);
