import React, {Component} from 'react';
import { StatusBar } from 'react-native';
import {connectAuth} from '../../../redux';
import {Screens} from '../../../constants/Screens';
import {AlertUtil, AppointmentSelectServiceComponent } from 'ch-mobile-shared';
import AppointmentService from "../../../services/AppointmentService";
import Analytics from "@segment/analytics-react-native";



class AppointmentServiceScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.originalAppointment = navigation.getParam('originalAppointment', null);
        this.selectedMember = navigation.getParam('selectedMember', null);
        this.connection = navigation.getParam('connection', null);
        this.memberId = navigation.getParam('memberId', null);
        this.providerId = navigation.getParam('providerId', null);
        this.updateAppointment = navigation.getParam('updateAppointment', null);
        this.state = {
            isLoading: true,
            servicesList: []
        };
    }

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

    async componentDidMount(): void {
        let servicesList = await AppointmentService.getProviderServices(this.providerId);
        if (servicesList.errors) {
            AlertUtil.showErrorMessage(servicesList.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            servicesList = servicesList.map(service => {
                service.durationText = this.getDurationText(service.duration);
                return service;
            });
            console.log('Found '+ servicesList.length + ' services');
            this.setState({isLoading: false, servicesList});
        }
    }



    nextStep = (selectedService) => {
        // Analytics.track('New Appointment - Selected Service', {
        //     selectedProvider: this.selectedMember,
        //     originalAppointment: this.originalAppointment,
        //     selectedService: selectedService
        // });
        this.props.navigation.navigate(Screens.APPT_DATE_TIME_SCREEN, {
            originalAppointment: this.originalAppointment,
            selectedService: selectedService,
            selectedMember: this.selectedMember,
            connection: this.connection,
            updateAppointment: this.updateAppointment,
            memberId:this.memberId,
            providerId:this.providerId
        });
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <AppointmentSelectServiceComponent
                nextStep={this.nextStep}
                servicesList={this.state.servicesList}
                backClicked={this.backClicked}
                isLoading={this.state.isLoading}
            />
        );
    };
}


export default connectAuth()(AppointmentServiceScreen);
