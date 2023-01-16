import React, {Component} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {connectProfile} from '../../redux';
import {OutcomeDetailComponent} from 'ch-mobile-shared';
import ProfileService from '../../services/ProfileService';

class OutcomeDetailScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {
            isLoading: true,
            isError: false,
            contextId : navigation.getParam('contextId', null),
            dctId : navigation.getParam('dctId', null),
            score : navigation.getParam('score', null),
            dctTitle : navigation.getParam('dctTitle', null),
            completionDate : navigation.getParam('completionDate', null),
            colorCode : navigation.getParam('colorCode', null),
            scorable : navigation.getParam('scorable', null)
        };
    }


    async componentWillMount(): void {
        try {
            const data: any = await ProfileService.getOutcomeDetail(
                this.state.contextId,this.state.dctId
            );

            if (data.errors) {
                this.setState({
                    isLoading: false,
                    isError: data.errors[0],
                });
            } else {
                this.setState({
                    isLoading: false,
                    isError: false,
                    outcomeDetails: data
                });
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false, isError: true});
        }
    }


    backClicked = () => {
        this.props.navigation.goBack();
    };


    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <OutcomeDetailComponent
                isLoading={this.state.isLoading}
                outcomeError={this.state.isError}
                outcomeData={this.state.outcomeDetails}
                dctTitle={this.state.dctTitle}
                colorCode={this.state.colorCode}
                completionDate={this.state.completionDate}
                score={this.state.score}
                scorable={this.state.scorable}
                backClicked={this.backClicked}
            />
        );
    }
}
export default connectProfile()(OutcomeDetailScreen);
