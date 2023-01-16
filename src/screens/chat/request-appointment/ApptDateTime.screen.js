import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {Screens} from '../../../constants/Screens';
import {AppointmentSelectDateTimeComponent} from 'ch-mobile-shared';
import AppointmentService from "../../../services/AppointmentService";
import {connectSettings} from "../../../redux";

class AppointmentDateTimeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.updateAppointment = navigation.getParam('updateAppointment', null);
        this.originalAppointment = navigation.getParam('originalAppointment', null);
        this.selectedMember = navigation.getParam('selectedMember', null);
        this.connection = navigation.getParam('connection', null);
        this.selectedService = navigation.getParam('selectedService', null);
        this.memberId = navigation.getParam('memberId', null);
        this.providerId = navigation.getParam('providerId', null);
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToRequestApptConfirmDetailsScreen = (selectedService,selectedSchedule,selectedMember) => {
        const connection = this.connection;
        this.props.navigation.navigate(Screens.APPT_CONFIRM_DETAILS_SCREEN,{
            selectedService,
            selectedSchedule,
            selectedMember,
            connection,
            memberId:this.memberId,
            providerId:this.providerId,
        })

    };

    navigateToAppointmentDetailsScreen = (originalAppointment,appointment,selectedService,selectedSchedule,selectedMember) =>{
        const connection = this.connection;
        this.props.navigation.navigate(Screens.APPOINTMENT_DETAILS_SCREEN,{originalAppointment,appointment,selectedService,selectedSchedule,selectedMember,connection})

    }


    getMutualAvailableSlots = async (participantId,serviceId,date,tz) => {
        const response = await AppointmentService.getMutualAvailableSlots(date, this.memberId, this.providerId, serviceId,tz);
        return response;
    }

    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <AppointmentSelectDateTimeComponent
                originalAppointment={this.originalAppointment}
                selectedMember={this.selectedMember}
                selectedService={this.selectedService}
                backClicked={this.backClicked}
                getAvailableSlots={this.getMutualAvailableSlots}
                appointments={this.props.settings.appointments}
                navigateToRequestApptConfirmDetailsScreen={this.navigateToRequestApptConfirmDetailsScreen}
                navigateToAppointmentDetailsScreen={this.navigateToAppointmentDetailsScreen}
                updateAppointment={this.updateAppointment}
                isMemberApp={false}
            />

        );
    };
}

export default connectSettings()(AppointmentDateTimeScreen);
