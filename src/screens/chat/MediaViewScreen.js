import React from 'react';
import {StatusBar} from 'react-native';
import {MediaViewComponent} from 'ch-mobile-shared';


export default class MediaViewScreen extends React.PureComponent {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.type = navigation.getParam('type', null);
        this.uri = navigation.getParam('uri', null);
    }

    navigateBack=()=> {
        this.props.navigation.goBack();
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <MediaViewComponent
                type={this.type}
                uri={this.uri}
                goBack={this.navigateBack}
            />
        );
    };
}
