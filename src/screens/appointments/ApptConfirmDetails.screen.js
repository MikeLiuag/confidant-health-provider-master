import React, {Component} from 'react';
import {connectConnections} from '../../redux';
import {Screens} from '../../constants/Screens';
import {
    AlertUtil,
    ApptConfirmDetailsV2Component,
} from 'ch-mobile-shared';
import AppointmentService from "../../services/AppointmentService";
import Analytics from "@segment/analytics-react-native";
import {APPOINTMENT_STATUS, SEGMENT_EVENT} from "../../constants/CommonConstants";
import moment from "moment";
import momentTimeZone from "moment-timezone";


class AppointmentConfirmDetailsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.selectedMember = navigation.getParam('selectedMember', null);
        this.selectedService = navigation.getParam('selectedService', null);
        this.selectedSchedule = navigation.getParam('selectedSchedule', null);
        this.selectedSchedule = {
            ...this.selectedSchedule,
            date: this.selectedSchedule.dateDesc,
            slots: this.selectedSchedule.slotStartTime.time+" "+this.selectedSchedule.slotStartTime.amPm + " - "+ this.selectedSchedule.slotEndTime.time+" "+this.selectedSchedule.slotEndTime.amPm,
        };
        this.state = {
            isLoading: false,
            primaryConcern: ""
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    setRequestMessageText = (text) => {
        this.setState({msgText: text});
    };

    changeUser = ()=>{
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_MEMBER_SCREEN);
    };

    changeService = ()=>{
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN);
    };

    changeSchedule = ()=>{
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN);
    };

    submitAppointmentRequest = async ()=>{
        try {
            this.setState({isLoading: true});
            const payload = {
                participantId: this.selectedMember.connectionId,
                serviceId: this.selectedService.id,
                slot: this.selectedSchedule.slot,
                day: this.selectedSchedule.day,
                month: parseInt(this.selectedSchedule.month),
                year: this.selectedSchedule.year,
                primaryConcern: this.state.primaryConcern,
                timeZone: this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true),
            };
            const response = await AppointmentService.requestAppointment(payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                const segmentPayload = {
                    selectedMember: this.selectedMember?.name,
                    appointmentDuration: this.selectedService?.duration,
                    appointmentCost: this.selectedService?.cost,
                    appointmentMarketRate: this.selectedService?.marketCost,
                    appointmentRecommendedPayment: this.selectedService?.recommendedCost,
                    selectedService: this.selectedService?.name,
                    selectedSchedule: this.selectedSchedule?.dateDesc,
                    requestedAt: moment.utc(Date.now()).format('MMMM Do YYYY, h:mm:ss a'),
                    startTime: this.selectedSchedule?.slotStartTime?.time + this.selectedSchedule?.slotStartTime?.amPm,
                    endTime: this.selectedSchedule?.slotEndTime?.time + this.selectedSchedule?.slotEndTime?.amPm,
                    appointmentStatus: APPOINTMENT_STATUS.PROPOSED,
                    requestMessage: payload?.comment,
                    providerId: this.props.auth?.data?.userId,
                    providerName: this.props.auth?.data?.name,
                    providerRole: this.props.profile?.profile?.designation,
                    serviceType: this.selectedService?.serviceType,
                    isProviderApp: true,
                    appointmentName: this.selectedService?.name,
                    userId: this.selectedService?.participantId
                };
                await Analytics.track(SEGMENT_EVENT.APPOINTMENT_REQUESTED, segmentPayload);
                this.props.navigation.navigate(Screens.APPOINTMENT_SUBMITTED, {
                    isRequest: true,
                    fixedProvider: this.selectedMember.fixedProvider,
                    selectedMember: this.selectedMember
                });
            }
        }catch (e) {
            console.log({e});
            AlertUtil.showErrorMessage('Whoops ! something went wrong')
            this.setState({isLoading: false});
        }

    };

    removePrimaryConcern = () => {
        this.setState({primaryConcern: ""})
    };

    render = () => {
        return (
            <ApptConfirmDetailsV2Component
                isLoading={this.state.isLoading}
                isProviderApp
                backClicked={()=>{
                    this.props.navigation.goBack();
                }}
                selectedUser={{...this.selectedMember, userId: this.selectedMember.connectionId}}
                selectedService={this.selectedService}
                selectedSchedule={this.selectedSchedule}
                changeUser={this.changeUser}
                changeService={this.changeService}
                changeSchedule={this.changeSchedule}
                navigateToNextScreen={this.submitAppointmentRequest}
                primaryConcern={this.state.primaryConcern}
                removePrimaryConcern={this.removePrimaryConcern}
                primaryConcernChanged={(concern)=>{
                    this.setState({
                        primaryConcern: concern
                    });
                }}
                tz={this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true)}
            />
        )
    };
}
export default connectConnections()(AppointmentConfirmDetailsScreen);
