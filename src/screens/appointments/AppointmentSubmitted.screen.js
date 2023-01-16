import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {AppointmentConfirmedComponent} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";
import {connectAppointments} from "../../redux";
import momentTimeZone from "moment-timezone";

class AppointmentSubmittedScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.isRequest = this.props.navigation.getParam('isRequest', false);
        this.appointment = this.props.navigation.getParam('appointment', null);
        this.selectedMember = this.props.navigation.getParam('selectedMember', null);
    }

    goBack = () => {
        this.props.navigation.navigate(Screens.TAB_VIEW);
    };

    goToChat = () => {
        this.props.fetchAppointments();
        this.props.navigation.navigate(Screens.TAB_VIEW);
    };


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (<AppointmentConfirmedComponent
            done={this.goBack}
            isRequest={this.isRequest}
            appointment={this.appointment}
            addToCalender={this.props.addToCalender}
            providerApp={true}
            goToChat={this.goToChat}
            tz={this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true)}
        />);
    }
}

export default connectAppointments()(AppointmentSubmittedScreen);
