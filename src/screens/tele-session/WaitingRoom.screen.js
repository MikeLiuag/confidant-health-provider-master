import React, {Component} from 'react';
import {AlertUtil, SocketClient, TelehealthWaitingComponent} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";
import AuthStore from "../../utilities/AuthStore";
import AppointmentService from "../../services/AppointmentService";
import Analytics from "@segment/analytics-react-native";
import {connectAppointments} from "../../redux";
import KeepAwake from "react-native-keep-awake";
import moment from "moment";
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import ScheduleService from "../../services/ScheduleService";

class WaitingRoomScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.keepScreenAwake(true);
        this.connectedToSession = navigation.getParam('connectedToSession', false);
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.endSessionBtn = navigation.getParam('endSessionBtn', false);
        this.state = {
            isLoading: false,
            appointment : navigation.getParam('appointment', null),
            sessionId : navigation.getParam('sessionId', null),
            token : navigation.getParam('token', null),
            sessionStarted : navigation.getParam('sessionStarted', null),
            encounterId : navigation.getParam('encounterId', null),
            sessionEnded:false
        }
    }

    componentDidMount = async() => {
        await this.emitSocketEvents();
    }

    keepScreenAwake = (shouldBeAwake) => {
        if (shouldBeAwake) {
            KeepAwake.activate();
        } else {
            KeepAwake.deactivate();
        }
    }

    emitSocketEvents = async () => {

        const socket = SocketClient.getInstance().getConnectedSocket();
        if(!this.connectedToSession) {
            socket.emit("telesession-join", {
                appointmentId:this.state.appointment.appointmentId,
                encounterId:this.state.encounterId,
                sessionId: this.state.sessionId,
                from: {
                    userId: this.props.auth?.meta?.userId,
                    name: this.props.auth?.meta?.nickName
                },
                to: this.state.appointment.participantId,
                authToken: await AuthStore.getAuthToken()
            });

        }

        socket.on('telesessionError', (data) => {
            AlertUtil.showErrorMessage("Unable to communicate with the requested user");
            this.goBack();
        });
    }


    goBack = () => {
        this.keepScreenAwake(false);
        if (this.referrerScreen) {
            this.props.navigation.navigate(this.referrerScreen);
        } else {
            this.props.navigation.replace(Screens.APPOINTMENT_DETAILS_SCREEN, {
                appointment: this.state.appointment
            });
        }
    };

    telesessionStarted = async (session) => {
        this.keepScreenAwake(false);
        const { appointment, sessionId, encounterId } = this.state;
        const { participantId,participantName, startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment ,appointmentMarketRate,appointmentRecommendedPayment} = appointment;
        await this.setState({ startedAt: moment.utc(Date.now()).format() });
        const segmentPayload = {
            telesessionId: sessionId,
            encounterId: encounterId,
            userId: this.props.auth?.meta?.userId,
            memberId: participantId,
            startedAt: this.state.startedAt,
            startTime: startTime,
            endTime: endTime,
            appointmentName: serviceName,
            appointmentDuration: serviceDuration,
            appointmentCost: serviceCost,
            sessionStarted: true,
            isProviderApp : true,
            paymentAmount : prePayment?.amountPaid,
            memberName : participantName ,
            appointmentMarketRate : appointment?.marketCost,
            appointmentRecommendedPayment : appointment?.recommendedCost
        };
        await Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_STARTED, segmentPayload);

        this.props.navigation.replace(Screens.VIDEO_CALL, {
            appointment: this.state.appointment,
            sessionId: this.state.sessionId,
            token: this.state.token,
            sessionStarted: this.state.sessionStarted,
            encounterId: this.state.encounterId,
            referrerScreen: this.referrerScreen,
        })
    };

    telesessionRejected = (session) => {
        this.keepScreenAwake(false);
        AlertUtil.showErrorMessage(this.state.appointment.name + " rejected your telesession request");
    };

    telesessionNotReady = (session)=>{
        this.keepScreenAwake(false);
        //AlertUtil.showErrorMessage("The session has been ended previously");
        this.navigateToCompleted(true);
    };

    navigateToCompleted = (completedByProvider, completedViaPhone=false) => {
        this.keepScreenAwake(false);
        this.props.fetchAppointments();
        const { encounterId, sessionId, appointment, startedAt } = this.state;
        const { participantId, startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment } = appointment;
        const segmentSessionCompletedPayload = {
            telesessionId: sessionId,
            sessionStarted: false,
            encounterId: encounterId,
            userId: this.props?.auth?.meta?.userId,
            providerId: participantId,
            startedAt: startedAt,
            startTime: startTime,
            endTime: endTime,
            appointmentName: serviceName,
            appointmentDuration: serviceDuration,
            appointmentCost: serviceCost,
            paymentAmount: prePayment.amountPaid,
            completedAt: moment.utc(Date.now()).format(),
            completionMethod: completedViaPhone?'Via Phone': (completedByProvider ? "By Provider":"By Member"),
            isProviderApp : true
        };

        this.props.navigation.replace(Screens.RATE_CALL_QUALITY_SCREEN, {
            appointment: this.state.appointment,
            referrerScreen: this.referrerScreen,
            startedAt: this.state.startedAt,
            completedAt: moment.utc(Date.now()).format(),
            segmentSessionCompletedPayload: segmentSessionCompletedPayload,
            completedViaPhone
        });

    };

    saveNotes = async (skipNotes = false,completedByProvider, completedViaPhone) => {
        this.setState({isLoading: true});
        const appointmentId = this.state.appointment?.appointmentId;
        const payload = {
            subjective: '',
            objective: '',
            assessment: '',
            plan:'',
            skip: skipNotes
        };
        try {
            const response = await ScheduleService.addAppointmentNotes(appointmentId, payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false})
            } else {
                this.navigateToCompleted(completedByProvider, completedViaPhone)
            }
        } catch (e) {
            this.setState({isLoading: false})
            console.log("Error", e);
        }

    };

    callEnded = async (event) => {
        const response = await this.completeAppointment();
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({sessionEnded:false});
        } else {
            this.saveNotes(true,true,false);
            this.navigateToCompleted(true);
        }
    };

    completeAppointment = async ()=>{
        this.setState({sessionEnded:true});
        this.keepScreenAwake(false);
        const appointmentId = this.state.appointment.appointmentId;
        const socket = SocketClient.getInstance().getConnectedSocket();
        if (socket) {
            socket.emit('fullfil-appointment', {
                appointmentId: this.state.appointment.appointmentId,
                from: {
                    userId: this.props?.auth.meta.userId,
                },
                authToken: await AuthStore.getAuthToken(),
            });

        }
        return AppointmentService.completeAppointment(appointmentId);
    };

    completeViaPhone = async ()=>{
        this.setState({isLoading:true});
        const response = await this.completeAppointment();
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({sessionEnded:false, isLoading: false});
        } else {
            this.saveNotes(true,true,true);
        }
    };


    markAsNoShow = async ()=>{
        this.setState({
            isLoading: true
        });
        const response = await AppointmentService.cancelAppointment(this.state.appointment.appointmentId, 'NO_SHOW');
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({ isLoading: false });
        } else {
            AlertUtil.showSuccessMessage("Appointment cancelled");
            this.props.navigation.navigate(Screens.TAB_VIEW);
        }
    };

    render() {
        return (
            <TelehealthWaitingComponent
                goBack={this.goBack}
                isLoading={this.state.isLoading}
                sessionId={this.state.sessionId}
                userId={this.props.auth.meta.userId}
                appointmentId={this.state.appointment.appointmentId}
                name={this.state.appointment.participantName}
                avatar={this.state.appointment.avatar}
                telesessionRejected={this.telesessionRejected}
                telesessionStarted={this.telesessionStarted}
                telesessionNotReady={this.telesessionNotReady}
                endSessionBtn={this.endSessionBtn}
                callEnded={this.callEnded}
                sessionEnded={this.state.sessionEnded}
                markAsNoShow={this.markAsNoShow}
                completeViaPhone={this.completeViaPhone}
                isProviderApp={true}
            />
        );
    }
}

export default connectAppointments()(WaitingRoomScreen);
