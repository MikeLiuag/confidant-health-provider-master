import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {Screens} from '../../constants/Screens';
import {SettingsComponent, getAvatar, Colors, AlertUtil} from 'ch-mobile-shared';
import {connectAuth} from '../../redux';
import {Icon} from "native-base";
import BranchLinksService from "../../services/BranchLinksService";
import Analytics from "@segment/analytics-react-native";
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import ProfileService from "../../services/ProfileService";

class SettingsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            darkMode: false,
            matchmakerAutoConnection: this.props.profile.profile.matchmakerAutoConnection,
            isMatchmaker: this.props.profile.profile.matchmaker,
            providerId: this.props.profile.profile.providerId,
        };
    }
    toggleDarkMode = ()=>{
        this.setState({
            darkMode: !this.state.darkMode

        })
    }

    autoConnectionOnOff = async () =>{

        const matchmakerAutoConnectionRequest = {
            matchmakerAutoConnection: !this.state.matchmakerAutoConnection
        };
        const response = await ProfileService.matchmakerAutoConnectionOnOff(this.state.providerId,matchmakerAutoConnectionRequest);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            AlertUtil.showSuccessMessage(response.successMessage);
            this.setState({
                matchmakerAutoConnection: !this.state.matchmakerAutoConnection
            });
            this.props.getProfile();
        }

    }

    getSections = ()=>{
        return [
            {
                title: "Main Settings",
                data: [
                    {
                        title: 'Notifications',
                        des: 'Manage notifications',
                        screen: Screens.NOTIFICATION_SCREEN,
                        toggleable: false,
                        renderIcon: (style)=><Icon name={'bell'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.secondaryIcon,
                        iconBGColor: Colors.colors.secondaryColorBG,
                        onToggle: null
                    },
                    {
                        title: 'Password',
                        des: 'Change your password',
                        screen: Screens.CHANGE_PASSWORD_SCREEN,
                        toggleable: false,
                        renderIcon: (style)=><Icon name={'key'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.primaryIcon,
                        iconBGColor: Colors.colors.primaryColorBG,
                        onToggle: null
                    }
                ]
            },
            {
                title: "Appointment Settings",
                data: [
                    {
                        title: 'Operating States',
                        des: 'Manage the states in which you providing services',
                        screen: Screens.OPERATING_STATES,
                        toggleable: false,
                        renderIcon: (style)=><Icon name={'map-pin'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.secondaryIcon,
                        iconBGColor: Colors.colors.secondaryColorBG,
                        onToggle: null
                    },
                    {
                        title: 'Services',
                        des: 'Manage the services your Members can book',
                        screen: Screens.SERVICES_SCREEN,
                        toggleable: false,
                        renderIcon: (style)=><Icon name={'book'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.successIcon,
                        iconBGColor: Colors.colors.successBG,
                        onToggle: null
                    },
                    {
                        title: 'Appointments',
                        des: 'Manage your appointment settings',
                        screen: Screens.APPOINTMENTS_SETTINGS,
                        toggleable: false,
                        renderIcon: (style)=><Icon name={'calendar'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.primaryIcon,
                        iconBGColor: Colors.colors.primaryColorBG,
                        onToggle: null
                    }
                ]
            },
            {
                title: "Match Maker Auto Connection",
                data: [
                    {
                        title: 'Auto Connection',
                        toggleable: true,
                        onToggle: this.autoConnectionOnOff,
                        onPress: this.autoConnectionOnOff,
                        des: 'Matchmaker Auto connection is',
                        //renderIcon: (style)=><Icon name={'moon'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.white,
                        iconBGColor: Colors.colors.neutral300Icon,
                        checked: this.state.matchmakerAutoConnection
                    }
                ]
            },
            // {
            //     title: "Dark Mode",
            //     data: [
            //         {
            //             title: 'Dark Mode',
            //             toggleable: true,
            //             onToggle: this.toggleDarkMode,
            //             onPress: this.toggleDarkMode,
            //             des: 'Dark mode is',
            //             renderIcon: (style)=><Icon name={'moon'} type={'Feather'} style={style}/>,
            //             iconColor: Colors.colors.white,
            //             iconBGColor: Colors.colors.neutral300Icon,
            //             checked: this.state.darkMode
            //         }
            //     ]
            // },
            {
                title: "Other Settings",
                data: [
                    {
                        title: 'Support',
                        des: 'Contact us to get support',
                        renderIcon: (style)=><Icon name={'support'} type={'SimpleLineIcons'} style={style}/>,
                        iconColor: Colors.colors.errorIcon,
                        iconBGColor: Colors.colors.errorBG,
                        screen:Screens.SUPPORT_SCREEN
                    },
                    {
                        title: 'About',
                        des: 'Learn about the Confidant app',
                        renderIcon: (style)=><Icon name={'info'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.successIcon,
                        iconBGColor: Colors.colors.successBG,
                        screen:Screens.ABOUT_SCREEN
                    },
                    {
                        title: 'Share',
                        des: 'Share the Confidant app',
                        renderIcon: (style)=><Icon name={'share'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.primaryIcon,
                        iconBGColor: Colors.colors.primaryColorBG,
                        onPress: this.shareAppLink
                    },
                    {
                        title: 'Privacy Policy',
                        des: 'Read our privacy policy',
                        renderIcon: (style)=><Icon name={'shield'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.secondaryIcon,
                        iconBGColor: Colors.colors.secondaryColorBG,
                        screen:Screens.PRIVACY_POLICY_SCREEN
                    },
                    {
                        title: 'Terms of Service',
                        des: 'Read our terms of service',
                        renderIcon: (style)=><Icon name={'clipboard-list'} type={'FontAwesome5'} style={style}/>,
                        iconColor: Colors.colors.warningIcon,
                        iconBGColor: Colors.colors.warningBG,
                        screen:Screens.TERMS_OF_SERVICE_SCREEN
                    }
                ]
            }
        ];
    };

    shareAppLink = async () => {
        await BranchLinksService.shareAppLink("facebook");
        Analytics.track(SEGMENT_EVENT.APP_SHARED,{
            userId : this.props.auth.meta.userId,
            screenName: '',
        });

    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    logout = async () => {
        // if(this.state.tapLocked) {
        //     console.warn('Tap Locked temporarily');
        //     return;
        // }
        this.props.logout();
        this.props.navigation.navigate(Screens.LOGIN_SCREEN);
    };

    navigateTo = (itemScreen) => {
        this.props.navigation.navigate(itemScreen);
    };

    render(): React.ReactNode {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <SettingsComponent
                logout={this.logout}
                shareAppLink={this.shareAppLink}
                name={this.props.profile.profile.fullName}
                avatar={getAvatar({profilePicture: this.props.profile.profile.profileImage})}
                profileScreen={Screens.PROFILE}
                sections={this.getSections()}
                isMatchmaker = {this.state.isMatchmaker}
                backClicked={this.backClicked}
                hasBack={true}
                navigateTo={this.navigateTo}
            />
        );
    }
}

export default connectAuth()(SettingsScreen);
