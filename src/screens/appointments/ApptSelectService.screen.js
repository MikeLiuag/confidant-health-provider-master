import React, {Component} from 'react';
import { StatusBar } from 'react-native';
import {connectAuth} from '../../redux';
import {Screens} from '../../constants/Screens';
import {
    AlertUtil,
    AppointmentSelectServiceComponent,
    EducationalPieceComponent,
    SelectServiceV2Component
} from 'ch-mobile-shared';
import AppointmentService from "../../services/AppointmentService";

class AppointmentSelectServiceScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.originalAppointment = navigation.getParam('originalAppointment', null);
        this.selectedMember = navigation.getParam('selectedMember', null);
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
        let servicesList = await AppointmentService.getProviderServices(this.props.auth.meta.userId);
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
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN, {
            originalAppointment: this.originalAppointment,
            selectedService: selectedService,
            selectedMember: this.selectedMember,
            updateAppointment: this.updateAppointment
        });
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    updateCheckStatus = (selectedItem) => {
        let {servicesList} = this.state;
        servicesList = servicesList.map((service) => {
            if (service.id === selectedItem.id) {
                service.isSelected = !service.isSelected;
            } else {
                service.isSelected = false;
            }
            return service;
        })
        this.setState({servicesList, selectedItem})
    }

    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <SelectServiceV2Component
                nextStep={this.nextStep}
                isProviderApp
                backClicked={this.backClicked}
                isLoading={this.state.isLoading}
                filteredItems={this.state.servicesList}
                updateCheckStatus={this.updateCheckStatus}
                navigateLearnMoreScreen={this.navigateLearnMoreScreen}
                selectedItem ={this.state.selectedItem}
            />
        );
    };
}


export default connectAuth()(AppointmentSelectServiceScreen);
