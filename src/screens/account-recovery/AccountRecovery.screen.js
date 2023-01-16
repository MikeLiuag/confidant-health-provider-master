/**
 * Created by stella on 16/10/2019.
 */
import React, {Component} from 'react';
import {StatusBar} from "react-native";
import AuthService from '../../services/AuthService';
import {USER_TYPE,VERIFICATION_CODE_TYPE} from '../../constants/CommonConstants';
import {AccountRecoveryComponent, AlertUtil} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";
export default class AccountRecoveryScreen extends Component<Props> {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        }
    }

    onBackPressed = ()=> {
        this.props.navigation.goBack();
    };

    onSubmit = async (email) => {
        const userAccountRecovery = {
            email,
            type: USER_TYPE
        };
        this.setState({isLoading: true});
        try {
            const response = await AuthService.userAccountRecovery(userAccountRecovery);
            console.log(response)
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                this.setState({isLoading: false});
                AlertUtil.showSuccessMessage(response.successMessage);
                this.props.navigation.navigate(Screens.CONFIRM_NUMBER_SCREEN, {
                    email,
                    codeType: VERIFICATION_CODE_TYPE.PASSWORD_RECOVERY
                });
                return;
                //await AuthService.setAuthToken(response.accessToken, response.tokenType);
                //AlertUtil.showSuccessMessage('Logged In Successfully');
            }
        } catch (e) {
            AlertUtil.showErrorMessage(e);
        }
        this.setState({isLoading: false});

    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <AccountRecoveryComponent isLoading={this.state.isLoading} onSubmit={this.onSubmit}
                                      onBackPressed={this.onBackPressed}/>
        );
    }
}