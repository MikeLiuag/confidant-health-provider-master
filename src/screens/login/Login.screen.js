import React, {Component} from 'react';
import {StatusBar} from "react-native";
import SplashScreen from "react-native-splash-screen";
import {LoginComponent} from "ch-mobile-shared";
import {AlertUtil} from "ch-mobile-shared";
import * as Keychain from "react-native-keychain";
import TouchID from "react-native-touch-id";
import {connectAuth} from "../../redux";
import {Screens} from "../../constants/Screens";
import Analytics from "@segment/analytics-react-native";

const USER_TYPE = 'PRACTITIONER';

class LoginScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        SplashScreen.hide();
        this.state = {
            biometryType: null,
            keychainStatus: null,
            keychainUser: null,
            keychainPass: null
        }
    }

    componentDidMount(): void {
        this.props.resetAuth();
        this.loadCredentials();
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        if (!this.props.auth.isLoading) {
                if (this.props.auth.isAuthenticated) {
                    Analytics.identify(this.props.auth.meta.userId, {
                        name: this.props.auth.meta.nickName,
                        isFirstTimeSignUp: !this.props.auth.meta.isOnboarded
                    });
                    this.saveCredentials(); //save credentials to keychain

                    this.props.navigation.navigate("App");
                }
        }
    }

    /**
     *
     * @Name : saveCredentials
     * @Description: Save user credentials from Keychain and sets them in state for further use
     *
     */
    saveCredentials = async (): void => {
        console.log('Storing credentials');
        if (this.state.biometryType) {

            try {

                    await Keychain.setGenericPassword(
                        this.state.email,
                        this.state.password
                    );


            } catch (error) {
                console.warn(error);
            }
        }

    };


    render(): React.ReactNode {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        return (
            <LoginComponent biometryType={this.state.biometryType}
                            biometryEnabled={this.state.keychainUser}
                            TouchID={TouchID}
                            verifyBiometricsLogin={this.verifyBiometricsLogin}
                            resetCredentials={this.resetCredentials}
                            forgotPasswordClicked={this.forgotPasswordClicked}
                            phoneLoginClicked={this.phoneLoginClicked}
                            backClicked={this.backClicked}
                            signupClicked={this.signupClicked}
                            isLoading={this.props.auth.isLoading}
                            userType={USER_TYPE}
                            isProviderApp={true}
                            login={this.login}/>
        );
    }

    signupClicked = () => {

    };

    backClicked = () => {
        // this.props.navigation.goBack();
    };

    loadCredentials() {

        Keychain.getSupportedBiometryType().then(async biometryType => {
            console.log('TYPE::' + biometryType);
            this.setState({biometryType});
            if (biometryType) {
                try {
                    // Retrieve the credentials
                    const credentials = await Keychain.getGenericPassword();
                    if (credentials.username) {
                        this.setState({keychainUser: credentials.username, keychainPass: credentials.password});
                        console.log('Credentials successfully loaded for user ' + credentials.username);
                    } else {
                        console.log('No credentials stored');
                    }
                } catch (error) {
                    console.log('Keychain couldn\'t be accessed!', error);
                }
            }
        });

    }

    forgotPasswordClicked = () => {
        this.props.navigation.navigate(Screens.ACCOUNT_RECOVERY_SCREEN);
    };

    phoneLoginClicked = () => {

    };


    /**
     *
     * @Name : resetCredentials
     * @Description: Reset user credentials from Keychain
     *
     */

    resetCredentials = async (): void => {
        if (this.state.biometryType) {

            try {
                await Keychain.resetGenericPassword();
                this.setState({
                    keychainStatus: 'Credentials Reset',
                    keychainUser: null,
                    keychainPass: null
                });
                console.log('RESET Successful !');
            } catch (error) {
                this.setState({keychainStatus: 'could not reset credentials, ' + error});
                console.log('could not reset credentials !');

            }
        }
    };

    verifyBiometricsLogin = () => {

        this.login({
            emailOrPhone: this.state.keychainUser,
            password: this.state.keychainPass,
            type: USER_TYPE
        });
    };

    login = (loginParams) => {
        Analytics.track('Provider Authentication - Email Login Attempt', {
            emailOrPhone: loginParams.emailOrPhone,
        });
        this.setState({email: loginParams.emailOrPhone, password: loginParams.password});
        this.props.login(loginParams);
    }
}

export default connectAuth()(LoginScreen);
