import React, {Component} from 'react';
import {StatusBar} from "react-native";
import {SupportInfoComponent} from 'ch-mobile-shared';

export default class Support extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        return (
            <SupportInfoComponent goBack={this.backClicked}/>
        );
    }
}
