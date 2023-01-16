/**
 * @format
 */
import "react-native-gesture-handler";
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
if (__DEV__) {
    // Setup Dev Tools for debugging
    require("react-devtools");
}
