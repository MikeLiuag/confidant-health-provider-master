import React, {Component} from 'react';
import {StatusBar,} from 'react-native';
import {CreateGroupComponent,} from 'ch-mobile-shared';
import {Screens} from "../../constants/Screens";
import Analytics from "@segment/analytics-react-native";


export default class CreateGroupScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            nameFocus: false,
            imageUploaded: false
        };
    }

    goBack = ()=> {
        this.props.navigation.goBack();
    };

    navigateToAddMembers = (group)=>{
        this.props.navigation.navigate(Screens.ADD_MEMBERS_SCREEN, {
            group
        });
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return(
            <CreateGroupComponent
                goBack={this.goBack}
                navigateToAddMembers={this.navigateToAddMembers}
            />
        );
    };
}
