import React from "react";
import {Dimensions, StyleSheet} from "react-native";
import {createBottomTabNavigator} from "react-navigation-tabs";
import {Screens} from '../../constants/Screens';
import {getTabScreens} from '../../screens/AppScreens';
import {isIphoneX, isIPhone12ProSize, isIPhone12MaxSize} from 'ch-mobile-shared';
import NavigationService from "../../services/NavigationService";
import {NavigationActions} from 'react-navigation';
import SingleBottomNavigationIcon from "./SingleBottomNavigationIcon";
const DIMENSION = Dimensions.get('window');

const styles = StyleSheet.create({
    foot:{
        backgroundColor: '#fff',
        justifyContent: 'center'
    },
    // Footer Tab Style
    tabStyle: {
        backgroundColor:'white',
        borderTopWidth:0.5,
        borderTopColor:'#d1d1d1',
        justifyContent: 'flex-start',
        height: isIphoneX()? 50 : 70,
        // paddingTop: isIphoneX()? 15 : 0,
        paddingTop: 0,
        paddingBottom: isIPhone12MaxSize(DIMENSION) || isIPhone12ProSize(DIMENSION)?70:0
    },
});

export default createBottomTabNavigator(getTabScreens(), {
    initialRouteName: Screens.CHAT_LIST,
    defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, horizontal, tintColor }) => {
            const { routeName } = navigation.state;
            if (routeName === Screens.APPOINTMENTS_SCREEN) {
                return (
                    <SingleBottomNavigationIcon
                        iconName='calendar'
                        badge
                        routeName={routeName}
                        focused={focused}/>
                    )
            }
            else if (routeName === Screens.ACTIVITY_FEED_LIST_SCREEN) {
                return (
                    <SingleBottomNavigationIcon
                        iconName='feed'
                        routeName={routeName}
                        focused={focused}/>
                          )
            }
            else if (routeName === Screens.SECTION_LIST_SCREEN) {
                return (
                    <SingleBottomNavigationIcon
                        iconName='book-open'
                        routeName={routeName}
                        focused={focused}/>
                    )
            }
            else if (routeName === Screens.PROVIDER_DETAIL_SCREEN_V2) {
                return (
                    <SingleBottomNavigationIcon
                        iconName='user'
                        routeName={routeName}
                        focused={focused}/>
                    )
            }
            // else if (routeName === Screens.SETTINGS_STACK) {
            //     return (
            //         <SingleBottomNavigationIcon
            //             iconName='settings'
            //             routeName={routeName}
            //             focused={focused}/>
            //         )
            // }
            else{
                return (
                    <SingleBottomNavigationIcon
                        iconName='message-square'
                        routeName={routeName}
                        badge
                        focused={focused}/>
                    )
            }
        },
        header: null,
        tabBarOnPress: (options)=>{
            if(options.navigation.state.key===Screens.SECTION_LIST_SCREEN) {
                const setParamsAction = NavigationActions.setParams({
                    params: { forAssignment: false, fromChat: false},
                    key: Screens.SECTION_LIST_SCREEN,
                });
                NavigationService._navigator.dispatch(setParamsAction);
            }
            options.defaultHandler();
        }

    }),
    tabBarOptions: {
        showLabel: false,
        inactiveTintColor: '#f5f5f5',
        tabStyle: styles.foot,
        style: styles.tabStyle
    }
});
