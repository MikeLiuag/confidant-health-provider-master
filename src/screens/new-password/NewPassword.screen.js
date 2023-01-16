import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {NewPasswordComponent} from 'ch-mobile-shared';
import {USER_TYPE} from '../../constants/CommonConstants';
import {NavigationActions, StackActions} from 'react-navigation';
import {connectAuth} from "../../redux";
import {Screens} from "../../constants/Screens";

class NewPasswordScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {};
        this.email = navigation.getParam('email', null);
        this.recoveryCode = navigation.getParam('recoveryCode', null);
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    resetAction = ()=> {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: Screens.LOGIN_SCREEN})],
        });
        this.props.navigation.dispatch(resetAction);
    }

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <NewPasswordComponent
                email={this.email}
                recoveryCode={this.recoveryCode}
                auth={this.props.auth}
                backClicked={this.backClicked}
                resetAction={this.resetAction}
                clearErrors={this.props.clearErrors}
                updatePassword={this.props.updatePassword}
                userType={USER_TYPE}
            />

        );
    }

}

export default connectAuth()(NewPasswordScreen);
