import {createAppContainer, createSwitchNavigator} from "react-navigation";
import {Screens} from "./src/constants/Screens";
import {getAuthScreens, getAppScreens} from "./src/screens/AppScreens";
import {createStackNavigator} from "react-navigation-stack";
import AuthLoadingScreen from "./src/screens/auth-loading.screen";
import {NoInternetIntro} from "./src/screens/no-internet-intro";
import {default as BottomNavigator} from "./src/components/Bottom-Navigation/BottomNav";
const appScreens = getAppScreens();
const AuthStack = createStackNavigator(
    getAuthScreens(), {initialRouteName: Screens.LOGIN_SCREEN});
const AppStack = createStackNavigator({...appScreens,tabView: BottomNavigator},{initialRouteName: Screens.PENDING_CONNECTIONS_SCREEN,headerMode: 'none'});

export default createAppContainer(createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        NoInternetIntro: NoInternetIntro,
        App: AppStack,
        Auth: AuthStack,
    },
    {
        initialRouteName: 'AuthLoading',
        backBehavior: 'none'
    }
));




