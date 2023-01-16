// @flow

import {persistCombineReducers} from "redux-persist";
import {auth, profile, connections, chat, educational, appointments, settings} from './../modules';
import KeyValueStorage from "react-native-key-value-storage";

const storage = KeyValueStorage;
storage.setItem = KeyValueStorage.set;
storage.getItem = KeyValueStorage.get;
const config = {
    key: "LIFTED_REDUX_STORE",
    storage
};

const appReducer = persistCombineReducers(config, {
    auth, profile, connections, chat, educational, appointments, settings
});

export default function rootReducer(state, action) {
    return appReducer(state, action);
}
