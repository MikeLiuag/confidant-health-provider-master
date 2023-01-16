import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {connectAppointments} from '../../redux';
import {APPOINTMENT_STATUS, AppointmentsV2Component} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";
import {APPOINTMENT_SIGNOFF_STATUS, PROVIDER_ROLES} from "../../constants/CommonConstants";

class AppointmentsScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(): void {
        this.appointmentRefresher = this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.props.fetchAppointments();
            }
        );
    }

    componentWillUnmount(): void {
        if (this.appointmentRefresher) {
            this.appointmentRefresher.remove();
        }
    }

    showAppointmentDetails = (appointment) => {
        if(appointment?.status === APPOINTMENT_STATUS.FULFILLED
            && (appointment?.signOffStatus === APPOINTMENT_SIGNOFF_STATUS.REVIEW ||
                (this.props?.profile?.profile.signOffRole === PROVIDER_ROLES.SUPERVISOR && appointment?.signOffStatus === 'REJECTED'))){
            this.props.navigation.navigate(Screens.APPT_COMPLETED_NOTES_SCREEN, {
                appointment,
            });
        }  else if( appointment?.status === APPOINTMENT_STATUS.FULFILLED
            && (appointment?.signOffStatus === APPOINTMENT_SIGNOFF_STATUS.DRAFTED ||
                ((this.props?.profile?.profile.signOffRole === PROVIDER_ROLES.ASSOCIATE || this.props?.profile?.profile.signOffRole === PROVIDER_ROLES.DEFAULT) && appointment?.signOffStatus === 'REJECTED'))){
            this.props.navigation.navigate(Screens.DATA_DOMAIN_LIST_SCREEN, {
                connection : this.connection,
                patientId : appointment.participantId,
                appointment
            });
        }else{
            this.props.navigation.navigate(Screens.APPOINTMENT_DETAILS_SCREEN, {
                appointment
            });
        }
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        const loaders = {
            current: this.props.appointments.isCurrentLoading,
            past: this.props.appointments.isPastLoading,
            pending: this.props.appointments.isCurrentLoading,
        }
        return (
                <AppointmentsV2Component
                    loaders={loaders}
                    currentAppointments={this.props.appointments.currentAppointments}
                    pastAppointments={this.props.appointments.pastAppointments}
                    connections={this.props.connections}
                    showAppointmentDetails={this.showAppointmentDetails}
                    confirmAppointment={this.showAppointmentDetails}
                    refreshing={this.props.appointments.isRefreshing}
                    refreshAppointments={this.props.refreshAppointments}
                    startBookingFlow={() => {
                        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_MEMBER_SCREEN);
                    }}
                    profile = {this.props?.profile?.profile}
                    isProviderApp = {true}
                />
        );
    }
}

export default connectAppointments()(AppointmentsScreen);
