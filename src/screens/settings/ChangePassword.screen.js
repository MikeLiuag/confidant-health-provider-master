import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {ChangePasswordComponent} from 'ch-mobile-shared';
import {AlertUtil} from 'ch-mobile-shared';
import {connectAuth} from '../../redux';
import AuthService from "../../services/AuthService";
import Analytics from "@segment/analytics-react-native";

class ChangePasswordScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    componentDidMount() {
        Analytics.screen(
            'Change Password Screen'
        );
    }

    /**
     * @function backClicked
     * @description This method is used to navigate back .
     */
    backClicked = () => {
        this.props.navigation.goBack();
    };


    /**
     * @function changePassword
     * @description This method is used to update password.
     */
    changePassword = async (changePasswordRequest) => {
        this.setState({isLoading: true});
        try {
            const response = await AuthService.changePassword(changePasswordRequest);
            console.log({response})
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            }
            else {
                AlertUtil.showSuccessMessage("Password updated successfully");
                this.backClicked();
            }
            this.setState({isLoading: false});

        }
        catch (e) {
            console.log(e)
        }
    }

    render(): React.ReactNode {
        StatusBar.setBarStyle('dark-content', true);
        return (
            <ChangePasswordComponent
                changePassword={this.changePassword}
                backClicked={this.backClicked}
                isLoading={this.state.isLoading}
            />
        );
    }
}

export default connectAuth()(ChangePasswordScreen);
