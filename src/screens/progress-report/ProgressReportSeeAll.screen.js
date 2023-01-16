import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {ProgressReportSeeAllComponent} from 'ch-mobile-shared';
import {connectProfile} from '../../redux';
import ProfileService from '../../services/ProfileService';
import {Screens} from "../../constants/Screens";
import {S3_BUCKET_LINK} from "../../constants/CommonConstants";

class ProgressReportSeeAllScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.userId = navigation.getParam('userId', null);
        this.state = {
            isLoading: false,
            isError: false,
            userId: this.userId
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    dctClicked = (dctId , scorable) => {
        const userId = this.state.userId;
        this.props.navigation.navigate(
            Screens.DCT_REPORT_VIEW_SCREEN,
            {
                dctId,
                userId,
                scorable
            }
        );
    };

    dctAttemptClicked = (userId, dctId,contextId , score,dctTitle,completionDate, colorCode, scorable) => {
         this.props.navigation.navigate(
              Screens.OUTCOME_DETAIL_SCREEN,
              {
                  userId,dctId, contextId,score,dctTitle,completionDate, colorCode, scorable
              }
          );
    };


    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <ProgressReportSeeAllComponent
                title={this.props.navigation.getParam('title', null)}
                section={this.props.navigation.getParam('section', null)}
                data={this.props.navigation.getParam('data', null)}
                backClicked={this.backClicked}
                activityError={this.state.isError}
                isLoading={this.state.isLoading}
                isProviderApp={true}
                getUserActivity={ProfileService.getUserActivity}
                getAssignedContent={ProfileService.getContentAssignedByMe}
                getDCTCompletionList={ProfileService.getDCTDetails}
                userId={this.userId}
                dctAttemptClicked={this.dctAttemptClicked}
                dctClicked={this.dctClicked}
                appointments = {this.props.appointments.appointments}
                connections = {this.props.connections}
                S3_BUCKET_LINK = {S3_BUCKET_LINK}
            />
        );
    }
}

export default connectProfile()(ProgressReportSeeAllScreen);
