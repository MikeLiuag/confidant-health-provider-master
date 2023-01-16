import React, {Component} from "react";
import {StatusBar} from "react-native";
import {TelehealthCompletedComponent} from "ch-mobile-shared";
import {Screens} from "../../constants/Screens";
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import Analytics from "@segment/analytics-react-native";

export default class CompletedSessionScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.name = navigation.getParam('name', null);
        this.appointment = navigation.getParam('appointment', null);
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.segmentSessionCompletedPayload = navigation.getParam("segmentSessionCompletedPayload", null);
        this.state = {
            isLoading: false
        }
    }

    componentDidMount =()=> {
        if(this.segmentSessionCompletedPayload){
            Analytics.track(SEGMENT_EVENT.TELEHEALTH_SESSION_COMPLETED,this.segmentSessionCompletedPayload);
        }
    }


    skipReview = () => {
        if (this.referrerScreen) {
            this.props.navigation.navigate(this.referrerScreen);
        } else {
            this.props.navigation.navigate(Screens.APPOINTMENTS_SCREEN);
        }
    };

    submitProviderFeedback = async (episode,memberProgress)=>{
        this.props.navigation.replace(Screens.ADD_NOTES_SCREEN, {
            episode : episode,
            memberProgress : memberProgress,
            appointmentId : this.appointment.appointmentId,
            referrerScreen:this.referrerScreen,
        });
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <TelehealthCompletedComponent
                skipReview={this.skipReview}
                shouldShowRating={false}
                name={this.name}
                isLoading={this.state.isLoading}
                appointment={this.appointment}
                isProviderApp={true}
                submitProviderFeedback={this.submitProviderFeedback}
            />
        );
    };
}
