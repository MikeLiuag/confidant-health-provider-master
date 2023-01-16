import React, {Component} from 'react';
import {OPENTOK_APIKEY, SEGMENT_EVENT} from "../../constants/CommonConstants";
import {AlertUtil, getAvatar, SocketClient, TelehealthSessionComponent} from "ch-mobile-shared";
import AuthStore from "../../utilities/AuthStore";
import {Screens} from "../../constants/Screens";
import AppointmentService from "../../services/AppointmentService";
import {connectAppointments} from "../../redux";
import KeepAwake from 'react-native-keep-awake';
import {NavigationActions, StackActions} from "react-navigation";
import moment from "moment";
import Analytics from "@segment/analytics-react-native";


class VideoCallScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.keepScreenAwake(true);
        this.apiKey = OPENTOK_APIKEY;
        const {navigation} = this.props;
        this.appointment = navigation.getParam('appointment', null);
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.sessionId = navigation.getParam('sessionId', null);
        this.token = navigation.getParam('token', null);
        this.sessionStarted = navigation.getParam('sessionStarted', null),
        this.encounterId = navigation.getParam('encounterId', null),
            this.state = {
                isLoading: false,
                sessionEnded:false,
                startedAt: moment.utc(Date.now()).format(),
            };
        SocketClient.getInstance().registerConnectivityCallbacks(Screens.VIDEO_CALL, () => {
            console.log('Telesession Disconnected');
            this.setState({hasConnectivityIssues: true});
        }, async () => {
            console.log('Telesession Reconnected...');
            const socket = SocketClient.getInstance().getConnectedSocket();
            socket.emit('telesession-join', {
                appointmentId: this.appointment.appointmentId,
                encounterId: this.encounterId,
                sessionId: this.sessionId,
                from: {
                    userId: this.props?.auth?.meta?.userId,
                    name: this.props?.auth?.meta?.nickName,
                },
                to: this.appointment.participantId,
                authToken: await AuthStore.getAuthToken(),
            });
            this.setState({hasConnectivityIssues: false});
        });
    }

    componentWillUnmount(): void {
        this.keepScreenAwake(false);
        SocketClient.getInstance().unregisterConnectivityCallbacks(Screens.VIDEO_CALL);
    }

     keepScreenAwake = (shouldBeAwake) => {
        if (shouldBeAwake) {
            KeepAwake.activate();
        } else {
            KeepAwake.deactivate();
        }
    }

    disconnect = () => {
        this.teleSessionEndedSegmentEvents(true);
        this.keepScreenAwake(false);
        this.props.navigation.replace(Screens.WAITING_ROOM, {
            ...this.props.navigation.state.params,
            connectedToSession: true,
            endSessionBtn:true,
        })

    }

    navigateToCompleted = (completedByProvider) => {
        this.props.fetchAppointments();
        const { startedAt } = this.state;
        const { participantId, startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment } = this.appointment;
        const segmentSessionCompletedPayload = {
            sessionStarted: false,
            encounterId: this.encounterId,
            teleSessionId : this.sessionId,
            userId: this.props.auth?.meta?.userId,
            memberId: participantId,
            startedAt: startedAt,
            startTime: startTime,
            endTime: endTime,
            appointmentName: serviceName,
            appointmentDuration: serviceDuration,
            appointmentCost: serviceCost,
            paymentAmount: prePayment?.amountPaid,
            completedAt: moment.utc(Date.now()).format(),
            completionMethod: completedByProvider ? "By Provider":"By Member",
            isProviderApp : true
        };
        this.props.navigation.replace(Screens.RATE_CALL_QUALITY_SCREEN, {
            appointment: this.appointment,
            referrerScreen: this.referrerScreen,
            startedAt: this.state.startedAt,
            completedAt: this.state.completedAt? this.state.completedAt:moment.utc(Date.now()).format(),
            segmentSessionCompletedPayload:segmentSessionCompletedPayload
        });

    };

    navigateToLiveChat = () =>{
        this.teleSessionEndedSegmentEvents(false);
        console.log('Going to live chat screen');
        const socket = SocketClient.getInstance().getConnectedSocket();
        if (socket) {
            socket.emit("telesession-disconnect", {
                appointmentId: this.appointment?.appointmentId,
                userId: this.props.auth?.meta?.userId
            });
        }

        const connections = this.props.connections;
        let connection = connections.activeConnections.filter(item => item.connectionId === this.appointment.participantId)[0];
        const resetAction = StackActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({ routeName: Screens.TAB_VIEW}),
                NavigationActions.navigate({ routeName: Screens.LIVE_CHAT, params:  {
                        connection:{...connection,profilePicture:getAvatar(connection)}
                    }}),
            ],
        });
        this.props.navigation.dispatch(resetAction);
    }


    callEnded = async (event) => {
        this.setState({sessionEnded:true});
        this.keepScreenAwake(false);
        const appointmentId = this.appointment.appointmentId;
        const socket = SocketClient.getInstance().getConnectedSocket();
        if (socket) {
            socket.emit('fullfil-appointment', {
                appointmentId: this.appointment.appointmentId,
                from: {
                    userId: this.props?.auth?.meta?.userId,
                },
                authToken: await AuthStore.getAuthToken()
            });

        }
        const response = await AppointmentService.completeAppointment(appointmentId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({sessionEnded:false});
        } else {
            this.navigateToCompleted(true);

        }
    };

    teleSessionEndedSegmentEvents = async (completedByMember)=>{
        const { startedAt,completedAt } = this.state;
        const { participantId, participantName,startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment,designation,marketCost,recommendedCost } = this.appointment;
        const segmentPayload = {
            telesessionId: this.sessionId,
            sessionStarted: true,
            encounterId: this.encounterId,
            userId: this.props?.auth?.meta?.userId,
            providerId: participantId,
            startedAt: startedAt,
            startTime: startTime,
            endTime: endTime,
            appointmentName: serviceName,
            appointmentDuration: serviceDuration,
            appointmentCost: serviceCost,
            paymentAmount: prePayment?.amountPaid,
            completedAt: completedAt? completedAt:moment.utc(Date.now()).format(),
            completionMethod : completedByMember ? "By Member" : "By Provider",
            memberName : participantName,
            appointmentMarketRate : marketCost,
            appointmentRecommendedPayment : recommendedCost,
            reasonSessionEnded : {
                "endedByPatient" : !!completedByMember,
                "endedByProvider" : !completedByMember,
                "patientNoShow" : true,
                "providerNoShow" : false,
            }
        };
        await Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_ENDED, segmentPayload);
    }


    goBack = () => {
        this.props.navigation.goBack();
    };

    render() {
        return (
            <TelehealthSessionComponent
                isLoading={this.state.isLoading}
                apiKey={this.apiKey}
                goBack={this.goBack}
                hasConnectivityIssues={this.state.hasConnectivityIssues}
                appointmentId={this.appointment.appointmentId}
                userId={this.props?.auth?.meta?.userId}
                token={this.token}
                callEnded={this.callEnded}
                name={this.appointment.participantName}
                avatar={this.appointment.avatar}
                disconnect={this.disconnect}
                navigateToCompleted={this.navigateToCompleted}
                sessionId={this.sessionId}
                navigateToLiveChat={this.navigateToLiveChat}
                sessionEnded={this.state.sessionEnded}
            />
        )
    }
}

export default connectAppointments()(VideoCallScreen)
