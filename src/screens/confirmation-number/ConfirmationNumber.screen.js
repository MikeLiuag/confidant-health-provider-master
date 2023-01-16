import React, {Component} from 'react';
import { StatusBar} from 'react-native';
import {Screens} from '../../constants/Screens';
import {ConfirmationNumberComponent} from 'ch-mobile-shared';
import {USER_TYPE} from '../../constants/CommonConstants';
import {connectAuth} from '../../redux';
import AuthService from "../../services/AuthService";

class ConfirmationNumberScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {};
        this.email = navigation.getParam('email', null);
        this.codeType = navigation.getParam('codeType', null);
        this.phoneNumber = navigation.getParam('phoneNumber', null);
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNewPasswordScreen = (payload)=>{
        this.props.navigation.replace(Screens.NEW_PASSWORD_SCREEN,{
            email: payload.email,
            recoveryCode: payload.recoveryCode

        })
    }


    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <ConfirmationNumberComponent
                auth={this.props.auth}
                verifyCode={this.props.verifyCode}
                backClicked={this.backClicked}
                email={this.email}
                codeType={this.codeType}
                phoneNumber={this.phoneNumber}
                userType = {USER_TYPE}
                navigateToNewPasswordScreen={this.navigateToNewPasswordScreen}
                resetAuth={this.props.resetAuth}
                clearErrors={this.props.clearErrors}
                resendVerificationCode={AuthService.resendVerificationCode}
            />
        );
    }

}
export default connectAuth()(ConfirmationNumberScreen);
