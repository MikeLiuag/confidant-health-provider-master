import React, {Component} from 'react';
import {StatusBar} from "react-native";
import {ProfileComponent} from "ch-mobile-shared";
import {connectProfile} from "../../redux";

const USER_TYPE = 'PRACTITIONER';

class ProfileScreen extends Component<Props> {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
    }

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <ProfileComponent profile={this.props.profile.profile} userType={USER_TYPE}
                              isLoading={this.props.profile.isLoading}
                              backClicked={this.backClicked}
                              updateProfile={this.updateProfile}
                              error={this.props.profile.error}
                              isProviderApp = {true}
            />
        );
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    updateProfile = (profile) => {
        this.props.updateProfile(profile);
    }
}

export default connectProfile()(ProfileScreen);