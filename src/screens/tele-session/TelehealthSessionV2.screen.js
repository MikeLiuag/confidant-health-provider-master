import React, {Component} from 'react';
import {OPENTOK_APIKEY, SEGMENT_EVENT} from "../../constants/CommonConstants";
import {AlertUtil, getAvatar,SocketClient,TelehealthComponentV2} from "ch-mobile-shared";
import {Screens} from "../../constants/Screens";
import AppointmentService from "../../services/AppointmentService";
import {connectAppointments} from "../../redux";
import KeepAwake from 'react-native-keep-awake';
import {NavigationActions, StackActions} from "react-navigation";
import moment from "moment";
import Analytics from "@segment/analytics-react-native";
import ScheduleService from "../../services/ScheduleService";

class TelehealthSessionV2Screen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);
        this.keepScreenAwake(true);
        this.apiKey = OPENTOK_APIKEY;
        const {navigation} = this.props;
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.sessionId = navigation.getParam('sessionId', null);
        this.token = navigation.getParam('token', null);
        this.sessionStarted = navigation.getParam('sessionStarted', null);
        this.encounterId = navigation.getParam('encounterId', null);
        this.appointment = navigation.getParam('appointment', null);
        this.state = {
            isLoading: false
        };
    }

    componentWillUnmount(): void {
        this.keepScreenAwake(false);
    }

    keepScreenAwake = (shouldBeAwake) => {
        if (shouldBeAwake) {
            KeepAwake.activate();
        } else {
            KeepAwake.deactivate();
        }
    }

    /**
     * @function navigateToLiveChat
     * @description This method is used to navigate to live chat screen
     */
    navigateToLiveChat = () =>{
        this.teleSessionEndedSegmentEvent(false);
        const { connections } = this.props;
        let connection = connections.activeConnections.filter(item => item.connectionId === this.appointment.participantId)[0];
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: Screens.LIVE_CHAT, params:  {
                        connection:{...connection,profilePicture:getAvatar(connection)}
                    }}),
            ],
        });
        this.props.navigation.dispatch(resetAction);
    }

    /**
     * @function navigateToCompleted
     * @description This method is used to navigate to completed screen.
     */
    navigateToCompleted = (completedByProvider, completedViaPhone=false) => {
        this.keepScreenAwake(false);
        this.props.fetchAppointments();
        const { startedAt,completedAt } = this.state;
        const { participantId, startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment } = this.appointment;
        const segmentSessionCompletedPayload = {
            teleSessionId: this.sessionId,
            sessionStarted: false,
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
            completedAt: moment.utc(Date.now()).format(),
            completionMethod: completedViaPhone?'Via Phone': (completedByProvider ? "By Provider":"By Member"),
            isProviderApp : true
        };

        const resetAction = StackActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({ routeName: Screens.TAB_VIEW}),
                NavigationActions.navigate({ routeName: Screens.RATE_CALL_QUALITY_SCREEN, params:   {
                        appointment: this.appointment,
                        referrerScreen: this.referrerScreen,
                        startedAt: startedAt,
                        completedAt: completedAt? completedAt:moment.utc(Date.now()).format(),
                        segmentSessionCompletedPayload:segmentSessionCompletedPayload,
                        completedViaPhone
                    }
                }),
            ],
        });
        this.props.navigation.dispatch(resetAction);
    };

    /**
     * @function goBack
     * @description This method is used to navigate back.
     */
    goBack = () => {
        this.props.navigation.goBack();
    };


    /**
     * @function teleSessionEndedSegmentEvent
     * @description This method is used to send segment event for tele session ended.
     */
    teleSessionEndedSegmentEvent = async (completedByMember)=>{
        const { startedAt,completedAt } = this.state;
        const { participantId, participantName,startTime, endTime, serviceName, serviceDuration, serviceCost, prePayment,marketCost,recommendedCost } = this.appointment;
        const segmentPayload = {
            teleSessionId: this.sessionId,
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


    /**
     * @function completeAppointment
     * @description This method is used to complete Appointment.
     */
    completeAppointment = async ()=>{
        this.setState({sessionEnded:true});
        this.keepScreenAwake(false);
        const {appointmentId} = this.appointment;
        return AppointmentService.completeAppointment(appointmentId);
    };


    saveNotes = async (skipNotes = false,completedByProvider, completedViaPhone) => {
        this.setState({isLoading: true});
        const appointmentId = this.appointment.appointmentId;
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



    /**
     * @function completeViaPhone
     * @description This method is used complete session via phone.
     */
    completeViaPhone = async ()=>{
        this.setState({isLoading:true});
        const response = await this.completeAppointment();
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({sessionEnded:false, isLoading: false});
        } else {
            this.saveNotes(true,true, true)
            //this.navigateToCompleted(true, true);
        }
    };

    /**
     * @function markAsNoShow
     * @description This method is used mark appointment session as no show.
     */
    markAsNoShow = async ()=>{
        this.setState({isLoading: true});
        const response = await AppointmentService.cancelAppointment(this.appointment?.appointmentId, 'NO_SHOW');
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({ isLoading: false });
        } else {
            AlertUtil.showSuccessMessage("Appointment cancelled");
            this.props.navigation.navigate(Screens.TAB_VIEW);
        }
    };

    /**
     * @function callEnded
     * @description This method is used to end session.
     */
    callEnded = async (event) => {
        this.setState({isLoading : true});
        const response = await this.completeAppointment();
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({sessionEnded:false,isLoading : false});
        } else {
            this.saveNotes(true,true, false)
            //this.navigateToCompleted(true);
        }
    };

    render() {
        return (
            <TelehealthComponentV2
                isLoading={this.state.isLoading}
                apiKey={String(this.apiKey)}
                goBack={this.goBack}
                appointmentId={this.appointment.appointmentId}
                userId={this.props?.auth?.meta?.userId}
                token={this.token}
                name={this.appointment.participantName}
                avatar={this.appointment.avatar}
                sessionId={this.sessionId}
                navigateToLiveChat={this.navigateToLiveChat}
                navigateToCompleted={this.navigateToCompleted}
                callEnded = {this.callEnded}
                markAsNoShow = {this.markAsNoShow}
                completeViaPhone = {this.completeViaPhone}
                isProviderApp={true}
            />
        );
    }
}

export default connectAppointments()(TelehealthSessionV2Screen);
