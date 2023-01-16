import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {Screens} from '../../constants/Screens';
import {SelectDateTimeV2Component} from 'ch-mobile-shared';
import AppointmentService from "../../services/AppointmentService";
import {connectSettings} from "../../redux";

class AppointmentSelectDateTimeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.updateAppointment = navigation.getParam('updateAppointment', null);
        this.originalAppointment = navigation.getParam('originalAppointment', null);
        this.selectedMember = navigation.getParam('selectedMember', null);
        this.selectedService = navigation.getParam('selectedService', null);
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToRequestApptConfirmDetailsScreen = (selectedService,selectedSchedule,selectedMember) => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_CONFIRM_DETAILS_SCREEN,{selectedService,selectedSchedule,selectedMember})

    };

    navigateToAppointmentDetailsScreen = (originalAppointment,appointment,selectedService,selectedSchedule,selectedMember) =>{
        this.props.navigation.navigate(Screens.APPOINTMENT_DETAILS_SCREEN,{originalAppointment,appointment,selectedService,selectedSchedule,selectedMember})

    }

    render = () => {
        StatusBar.setBarStyle('dark-content', true);
        return (
            <SelectDateTimeV2Component
                originalAppointment={this.originalAppointment}
                selectedMember={this.selectedMember}
                selectedService={this.selectedService}
                backClicked={this.backClicked}
                getAvailableSlots={AppointmentService.getAvailableSlots}
                getMasterSchedule={AppointmentService.getMasterSchedule}
                appointments={this.props.settings.appointments}
                navigateToRequestApptConfirmDetailsScreen={this.navigateToRequestApptConfirmDetailsScreen}
                navigateToAppointmentDetailsScreen={this.navigateToAppointmentDetailsScreen}
                updateAppointment={this.updateAppointment}
                providerId = {this.props?.auth?.meta?.userId}
                isMemberApp={false}
                timezone={this.props.settings?.appointments?.timezone}
            />

        );
    };
}

export default connectSettings()(AppointmentSelectDateTimeScreen);
