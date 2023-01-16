import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {connectProfile} from '../../redux';
import {DCTReportViewComponent} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/ProfileService";

class DCTReportViewScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {
            isLoading: true,
            dctId: navigation.getParam('dctId', null),
            userId: navigation.getParam('userId', null)
        };
    }

    dctClicked = (contextId, score, dctTitle,completionDate, colorCode, scorable) => {
        const dctId = this.state.dctId;
        this.props.navigation.navigate(
            Screens.OUTCOME_DETAIL_SCREEN,
            {
                contextId,dctId,score,dctTitle,completionDate, colorCode, scorable
            }
        );
    };

    dctSeeAll = props => {
        this.props.navigation.navigate(
            Screens.PROGRESS_REPORT_SEE_ALL_SCREEN_DCT,
            props,
        );
    };

    async componentDidMount(): void {
        console.log("componentDidMount");
        try {
            const data = await ProfileService.getDCTDetails(
                this.state.userId,this.state.dctId,0,3,
            );
            if (data.errors) {
                this.setState({
                    isLoading: false,
                    isError: data.errors[0],
                });
            }
            else {
                this.setState({
                    isLoading: false,
                    isError: false,
                    initialScore: data.initialScore,
                    currentScore: data.currentScore,
                    dctTitle: data.dctTitle,
                    scorable : data.scorable,
                    totalAttempt: data.totalAttempt,
                    dctCompletionsList: data.DCTCompletionsList ? data.DCTCompletionsList : '',
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
        console.log(this.state);
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <DCTReportViewComponent
                backClicked={this.backClicked}
                initialScore={this.state.initialScore}
                currentScore={this.state.currentScore}
                dctTitle={this.state.dctTitle}
                totalAttempt={this.state.totalAttempt}
                dctCompletionsList={this.state.dctCompletionsList}
                isLoading={this.state.isLoading}
                dctClicked={this.dctClicked}
                scorable={this.state.scorable}
                dctSeeAll={this.dctSeeAll}
                dctId={this.state.dctId}
                userId={this.state.userId}
            />
        );
    }
}
export default connectProfile()(DCTReportViewScreen);
