import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {connectAppointments} from '../../redux';
import {
    AlertUtil,
    AppointmentDetailV2Component, PROVIDER_ROLES
} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";
import AppointmentService from "../../services/AppointmentService";
import AuthStore from "../../utilities/AuthStore";
import Analytics from "@segment/analytics-react-native";
import {
    APPOINTMENT_STATUS,
    CONTACT_NOTES_FLAGS,
    CONTACT_NOTES_STATUS,
    SEGMENT_EVENT
} from "../../constants/CommonConstants";
import moment from "moment";
import momentTimeZone from "moment-timezone";
import {getTimeByDSTOffset} from "ch-mobile-shared/src/utilities";
import Loader from "../../components/Loader";

class AppointmentDetailsScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.selectedMember = navigation.getParam('selectedMember', null);
        this.appointment = navigation.getParam('appointment', null);
        this.state = {
            appointment: this.appointment,
            isLoading: false,
            telesessionId: null,
            telesessionToken: null,
            sessionStarted: false,
            encounterId: null,
            appointmentStatus:false,
        };
    }

    componentDidMount() {
        let connection = this.props.connections.activeConnections.filter(connection=>connection.connectionId===this.state.appointment.participantId)[0];
        if(!connection && !this.selectedMember) {
            this.props.fetchParticipant();
        }
    }

    arriveForAppointment = async() => {
        this.setState({isLoading: true});
        const {appointment} = this.state;
        const appointmentId = appointment.appointmentId;
        const authToken = await AuthStore.getAuthToken();
        try {
            const response = await AppointmentService.arriveForAppointment(appointmentId, authToken);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({appointmentStatus:false,isLoading:false})
            }

            else {
                this.setState({
                    isLoading: false,
                    telesessionId: response.telesessionId,
                    telesessionToken: response.telesessionToken,
                    sessionStarted: response.sessionStarted,
                    encounterId: response.encounterId,
                    appointmentStatus:true,
                })
            }
        } catch (e) {
            console.log(e);
            this.setState({appointmentStatus:false,isLoading:false});
            AlertUtil.showErrorMessage("Something went wrong, please try later");
        }
    };

    startSession = async () => {
        await this.arriveForAppointment();
        const filteredConnection = this.props.connections.activeConnections.filter(connection=>connection.connectionId===this.state.appointment.participantId)[0];

        AuthStore.setAppointmentDetails({
            appointment: this.state.appointment,
            sessionId: this.state.telesessionId,
            token: this.state.telesessionToken,
            sessionStarted: this.state.sessionStarted,
            encounterId: this.state.encounterId,
            appointmentStatus: this.state.appointmentStatus
        }).then(() => {
            console.log('Current Appointment Details Stored Temporarily');
        });

        this.props.navigation.navigate(Screens.APPOINTMENT_OVERVIEW_SCREEN, {
            appointment: this.state.appointment,
            sessionId: this.state.telesessionId,
            token: this.state.telesessionToken,
            sessionStarted: this.state.sessionStarted,
            encounterId: this.state.encounterId,
            connection : filteredConnection,
        });

    };


    updateAppointment = (appt) => {
        this.setState({appointment: appt});
    };

    goBack = () => {
        this.props.navigation.goBack();
    };
    changeService = () => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
            originalAppointment: this.state.appointment,
            updateAppointment: this.updateAppointment
        });
    };
    changeSlot = () => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN, {
            originalAppointment: this.state.appointment,
            selectedService: {
                id: this.state.appointment.serviceId,
                name: this.state.appointment.serviceName,
                duration: this.state.appointment.serviceDuration,
                cost: this.state.appointment.serviceCost,
            },
            updateAppointment: this.updateAppointment
        });
    };

    getDurationText = (duration) => {
        const minText = ' min';
        const hourText = ' hour';
        if (duration < 60) {
            return duration + minText;
        }
        const hour = parseInt(duration / 60);
        const min = duration % 60;
        let text = hour + hourText;
        if (min > 0) {
            text = text + ' ' + min + minText;
        }
        return text;
    };

    requestChanges = async (request) => {
        let payload = {
            ...request,
            timeZone : this.props.settings?.appointments?.timezone || momentTimeZone.tz.guess(true)
        }
        this.setState({isLoading: true});
        const response = await AppointmentService.requestChanges(payload.appointmentId, payload)
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            const {appointment} = this.state;
            const selectedSchedule = appointment.selectedSchedule;
            const selectedService = {
                cost: appointment.serviceCost,
                recommendedCost: appointment.recommendedCost,
                marketCost: appointment.marketCost,
                id: appointment.serviceId,
                durationText: this.getDurationText(appointment.serviceDuration),
                name: appointment.serviceName,
                serviceType:appointment.serviceType,
                duration: appointment.serviceDuration
            };
            const segmentAppointmentRequestChangesPayload = {
                selectedMember: appointment?.participantName,
                appointmentName: selectedService?.name,
                appointmentDuration: selectedService?.duration,
                appointmentCost: selectedService?.cost,
                appointmentMarketRate: appointment.marketCost,
                appointmentRecommendedPayment:appointment.recommendedCost ,
                selectedService: selectedService?.name,
                selectedSchedule: selectedSchedule?.dateDesc,
                requestedAt: moment.utc(Date.now()).format('MMMM Do YYYY, h:mm:ss a'),
                startTime: selectedSchedule?.slotStartTime?.time + selectedSchedule.slotStartTime.amPm,
                endTime: selectedSchedule?.slotEndTime?.time + selectedSchedule?.slotEndTime?.amPm,
                appointmentStatus: APPOINTMENT_STATUS.PROPOSED,
                requestMessage: payload?.comment?payload.comment:appointment?.analytics?.requestMessage,
                userId: this.props.auth?.data?.userId,
                serviceType: selectedService?.serviceType,
                paymentAmount:appointment?.prePayment?.amountPaid,
                paymentMethod:appointment?.prePayment?.paymentMethod,
                isProviderApp : true
            };
            await Analytics.track(SEGMENT_EVENT.APPOINTMENT_CHANGE_REQUESTED, segmentAppointmentRequestChangesPayload);
            this.props.navigation.navigate(Screens.APPOINTMENT_SUBMITTED, {
                isRequest: true
            });
        }
    };

    getDateDesc = (_moment) => {
        const tz = moment.tz.guess(true);
        return _moment.tz(tz).format('dddd, DD MMM YYYY');
    };



    confirmAppointment = async () => {
        this.setState({isLoading: true});
        const response = await AppointmentService.confirmAppointment(this.state.appointment.appointmentId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            const {appointment} = this.state;
            const startMoment = moment(appointment.startTime);
            const dayDateText = this.getDateDesc(startMoment);
            const segmentAppointmentConfirmedPayload = {
                appointmentDuration: appointment?.serviceDuration,
                appointmentCost: appointment?.serviceCost,
                appointmentMarketRate: appointment?.marketCost,
                appointmentRecommendedPayment: appointment?.recommendedCost,
                selectedService: appointment?.serviceName,
                serviceType: appointment?.serviceType,
                selectedSchedule: dayDateText,
                requestedAt: appointment?.analytics?.requestedAt,
                startTime: appointment?.startText,
                endTime: appointment?.endText,
                appointmentStatus: APPOINTMENT_STATUS.CONFIRMED,
                requestMessage: appointment?.analytics?.requestMessage,
                providerId: this.props.auth?.data?.userId,
                confirmedAt: moment.utc(Date.now()).format(),
                paymentAmount:appointment?.prePayment?.amountPaid,
                paymentMethod:appointment?.prePayment?.paymentMethod,
                isProviderApp : true,
                providerName : this.props.auth?.data?.nickName,
                providerRole : this.props.profile?.profile?.designation,
                appointmentName : appointment?.name,
                userId : appointment?.participantId
            };
            await Analytics.track(SEGMENT_EVENT.APPOINTMENT_CONFIRMED,segmentAppointmentConfirmedPayload);
            this.props.navigation.navigate(Screens.APPOINTMENT_SUBMITTED, {
                appointment : this.appointment,
                isRequest: false
            });
        }
    };

    gotoChat = ()=>{
        const connection = this.props.connections.activeConnections.filter(connection=>connection.connectionId===this.state.appointment.participantId)[0];
        if(connection) {
            this.props.navigation.navigate(Screens.LIVE_CHAT, {
                connection: connection,
            });
        } else {
            AlertUtil.showErrorMessage("Cannot start chat, participant isn't connected");
        }

    };

    cancelAppointment = async ()=>{
        this.setState({isLoading: true});
        console.log('Cancelling appointment ' + this.state.appointment.appointmentId);
        const response = await AppointmentService.cancelAppointment(this.state.appointment.appointmentId, null);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            const {appointment} = this.state;
            const startMoment = moment(appointment.startTime);
            const dayDateText = this.getDateDesc(startMoment);
            const segmentAppointmentCancelledPayload = {
                selectedProvider: appointment?.participantName,
                appointmentDuration: appointment?.serviceDuration,
                appointmentCost: appointment?.serviceCost,
                appointmentMarketRate: appointment?.marketCost,
                appointmentRecommendedPayment: appointment?.recommendedCost,
                selectedService: appointment?.serviceName,
                selectedSchedule: dayDateText,
                requestedAt: appointment?.analytics?.requestedAt,
                startTime: appointment?.startText,
                endTime: appointment?.endText,
                appointmentStatus: APPOINTMENT_STATUS.CANCELLED,
                requestMessage: appointment?.analytics?.requestMessage,
                userId: this.props.auth?.data?.userId,
                serviceType: appointment?.serviceType,
                confirmedAt: appointment.analytics.confirmedAt,
                cancelledAt: moment.utc(Date.now()).format(),
                paymentAmount:appointment?.prePayment?.amountPaid,
                paymentMethod:appointment?.prePayment?.paymentMethod,
                isProviderApp : true
            };
            await Analytics.track(SEGMENT_EVENT.APPOINTMENT_CANCELLED, segmentAppointmentCancelledPayload);
            AlertUtil.showSuccessMessage(response.message);

        }
        this.goBack();
    };

    getDSTOffsetDetails = (appointmentStartTime,appointmentEndTime)=>{
        const tz = this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true);
        let startDate,endDate;
        let dateAfterDSTOffset = getTimeByDSTOffset(appointmentStartTime).utcOffset();
        let dateBeforeDSTOffset = moment(appointmentStartTime).utcOffset();
        if(dateAfterDSTOffset === dateBeforeDSTOffset){
            startDate =  moment(appointmentStartTime).format('YYYY-MM-DDTHH:mm:ss.sssZ');
            endDate = moment(appointmentEndTime).format('YYYY-MM-DDTHH:mm:ss.sssZ')
        }
        else if(dateAfterDSTOffset<dateBeforeDSTOffset){
            startDate=  moment(appointmentStartTime).subtract(1,"hours").format('YYYY-MM-DDTHH:mm:ss.sssZ');
            endDate= moment(appointmentEndTime).subtract(1,"hours").format('YYYY-MM-DDTHH:mm:ss.sssZ')
        }else{
            startDate=  moment(appointmentStartTime).add(1,"hours").format('YYYY-MM-DDTHH:mm:ss.sssZ');
            endDate= moment(appointmentEndTime).add(1,"hours").format('YYYY-MM-DDTHH:mm:ss.sssZ')
        }
        return { startDate,endDate}
    }


    addEventToCalendar = () =>{
        const {appointment} = this.state;
        let startDate , endDate;
        let dstOffsetDetail = this.getDSTOffsetDetails(appointment.startTime, appointment.endTime);
        startDate = dstOffsetDetail?.startDate;
        endDate = dstOffsetDetail?.endDate;
        const eventConfig = {
            title: 'Appointment with '+ appointment.participantName,
            startDate: startDate,
            endDate: endDate,
            appointmentId: appointment.appointmentId,
        };
        this.props.addToCalender(eventConfig);
    };

    checkPatientProhibitiveToMarkProfileRed = (item) => {
        const contactNotes = item?.contactNotes
        let isPatientProhibitive = false
        if(contactNotes?.length > 0 ) {
            for (let contactNote of contactNotes) {
                if (contactNote.flag === CONTACT_NOTES_FLAGS.PROHIBITIVE && contactNote.status === CONTACT_NOTES_STATUS.ACTIVE) {
                    isPatientProhibitive = true;
                    break;
                }
            }
        }
        return isPatientProhibitive;
    }
    requestNewAppointment = ()=>{
        const connection = this.props.connections.activeConnections.filter(connection=>connection.connectionId===this.state.appointment.participantId)[0];
        if(connection) {
            const isPatientProhibitive= this.checkPatientProhibitiveToMarkProfileRed(connection)
            if(isPatientProhibitive)
            {
                this.props.navigation.navigate(Screens.MEMBER_PROHIBITIVE_SCREEN, {
                    selectedMember: this.state.selectedMember
                });
            }else
            {
                this.props.navigation.pop();
                this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
                    selectedMember: connection
                });
            }
        } else {
            AlertUtil.showErrorMessage("Cannot request another appointment, participant isn't connected");
        }

    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if(this.props.connections?.isLoading || this.state.isLoading){
            return <Loader/>
        }
        let connection = this.props?.connections?.activeConnections?.filter(connection=>connection?.connectionId===this.state.appointment?.participantId)[0];
        if(!connection) {
            connection = this.selectedMember;
        }
        let loading = this.state.isLoading;
        const isPatientProhibitive = this.checkPatientProhibitiveToMarkProfileRed(connection);

        return (
            <AppointmentDetailV2Component
                backClicked={this.goBack}
                appointment={this.state.appointment}
                isProviderApp
                navigateToChat={this.gotoChat}
                changeService={this.changeService}
                changeSlot={this.changeSlot}
                addToCalender={this.addEventToCalendar}
                isLoading={loading}
                startSession={this.startSession}
                confirmAppointment={this.confirmAppointment}
                requestChanges={this.requestChanges}
                cancelAppointment={this.cancelAppointment}
                requestNewAppointment={this.requestNewAppointment}
                tz={this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true)}
                profile = {this.props.profile}
                isPatientProhibitive = {isPatientProhibitive}
            />

        //     <AppointmentDetailsComponent
        //     goBack={this.goBack}
        //     changeService={this.changeService}
        //     isLoading={loading}
        //     timezone={this.props.settings.appointments.timezone}
        //     connection={connection}
        //     changeSlot={this.changeSlot}
        //     addRequestMessage={this.editRequestMessage}
        //     requestChanges={this.requestChanges}
        //     gotoChat={this.gotoChat}
        //     confirmAppointment={this.confirmAppointment}
        //     cancelAppointment={this.cancelAppointment}
        //     appointment={this.state.appointment}
        //     startSession={this.startSession}
        //     isMemberApp={false}
        // />
        );
    }
}

export default connectAppointments()(AppointmentDetailsScreen);
