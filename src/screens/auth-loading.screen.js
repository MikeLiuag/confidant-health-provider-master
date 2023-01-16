import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import AuthService from '../services/AuthService';
import SplashScreen from 'react-native-splash-screen'
import AuthStore from './../utilities/AuthStore'
import {AlfieLoader,APP_ENVIRONMENT} from 'ch-mobile-shared';
import { NativeModules } from 'react-native';
import {connectReduxState} from "../redux";
import {PROVIDER_LOGIN_SUCCESSFUL} from "../redux/modules/auth/actions";
import Analytics from "@segment/analytics-react-native";
import VersionCheck from 'react-native-version-check';
const AnimatedSplash = NativeModules.AnimatedSplash;
import {Alert, BackHandler, Linking} from 'react-native';
import Instabug from 'instabug-reactnative';
class AuthLoadingScreen extends Component {
    constructor(props) {
        super(props);
        this._bootstrap();
    }

    checkAppVersion = async () => {
        try{
            const updateNeeded = await VersionCheck.needUpdate();
            if(updateNeeded && updateNeeded.isNeeded){
                Alert.alert(
                    'Please Update',
                    'You will have to update your app to the latest version to continue using Confidant Pro.',
                    [
                        {
                            text: 'Update',
                            onPress: () => {
                                BackHandler.exitApp();
                                Linking.openURL(updateNeeded.storeUrl);
                            },
                        },
                   {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => {},
                    }],
                    {cancelable: true},
                );
            }
        }catch (e) {
            console.log(e);
        }
    }



    async _bootstrap() {
        const authToken = await AuthStore.getAuthToken();
        let route = 'Auth';
        if (authToken) {
            console.log('An existing auth token found');
            try {

                const refreshed = await AuthService.refreshAuthToken();
                console.log({refreshed})
                if (!refreshed.errors) {
                    await Analytics.identify(refreshed.userId, {});
                    Instabug.setUserAttribute("userId", refreshed.userId);
                    await AuthStore.setAuthToken(refreshed.accessToken, refreshed.expiration);
                    this.props.dispatch({
                        type: PROVIDER_LOGIN_SUCCESSFUL,
                        data: refreshed
                    });
                    route = 'App';
                } else {
                    this.hideSplash();
                }
            } catch(e) {
                if(e.message && e.message === 'Network request failed') {
                    console.log('No Internet connection');

                    route='NoInternetIntro';
                }
                this.hideSplash();
            }

        } else {
            setTimeout(() => {
                this.hideSplash();
            }, 2000);
        }
        this.props.navigation.navigate(route);
        this.checkAppVersion();

    }

    hideSplash = ()=>{
        SplashScreen.hide();
        if(Platform.OS==='ios') {
            AnimatedSplash.hide();
        }
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        return (<AlfieLoader/>);
    }
}
export default connectReduxState()(AuthLoadingScreen);
