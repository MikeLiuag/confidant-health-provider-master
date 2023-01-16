import React, {Component} from 'react';
import {connectConnections} from '../../../redux';
import {Screens} from '../../../constants/Screens';
import {AlertUtil,AppointmentConfirmDetailsComponent} from 'ch-mobile-shared';
import AppointmentService from "../../../services/AppointmentService";
import momentTimeZone from "moment-timezone";

class RequestAppointmentConfirmDetailsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.selectedMember = navigation.getParam('selectedMember', null);
        this.connection = navigation.getParam('connection', null);
        this.memberId = navigation.getParam('memberId', null);
        this.providerId = navigation.getParam('providerId', null);
        this.selectedService = navigation.getParam('selectedService', null);
        this.selectedSchedule = navigation.getParam('selectedSchedule', null);
        this.state = {
            isLoading: false,
        };
    }

    editRequestMessage = (payload) => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_EDIT_MESSAGE_SCREEN, payload);
    };

    setRequestMessageText = (text) => {
        this.setState({msgText: text});
    };

    changeUser = ()=>{
        this.props.navigation.navigate(Screens.APPT_USER_LIST_SCREEN);
    };

    changeService = ()=>{
        this.props.navigation.navigate(Screens.APPT_SERVICE_SCREEN);
    };

    changeSchedule = ()=>{
        this.props.navigation.navigate(Screens.APPT_DATE_TIME_SCREEN);
    };

    submitAppointmentRequest = async (params)=>{
        const appointmentRequest  = {
            memberId:this.memberId,
            providerId:this.providerId,
            serviceId: params.serviceId,
            slot: params.slot,
            day: params.day,
            month: params.month,
            year: params.year,
            timeZone: this.props?.settings?.appointments.timezone? this.props?.settings?.appointments.timezone : momentTimeZone.tz.guess(true)
        }
        this.setState({isLoading: true});
        const response = await AppointmentService.requestMutualAppointment(appointmentRequest);

        if(response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            //Analytics.track('New Appointment - Appointment Requested', payload);
            this.props.navigation.navigate(Screens.APPOINTMENT_SUBMITTED, {
                isRequest: true,
                fixedProvider: this.selectedMember.fixedProvider
            });
        }

    };


    render = () => {
        return (
            <AppointmentConfirmDetailsComponent
                isLoading={this.state.isLoading}
                isProvider
                selectedUser={{...this.selectedMember, userId: this.selectedMember.connectionId}}
                selectedService={this.selectedService}
                selectedSchedule={this.selectedSchedule}
                changeUser={this.changeUser}
                goBack={()=>{
                    this.props.navigation.goBack();
                }}
                changeService={this.changeService}
                requestAppointment={this.submitAppointmentRequest}
                changeSchedule={this.changeSchedule}
                editRequestMessage={this.editRequestMessage}
            />
        )
    };
}

export default connectConnections()(RequestAppointmentConfirmDetailsScreen);
