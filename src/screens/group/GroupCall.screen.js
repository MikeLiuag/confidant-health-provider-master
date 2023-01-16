import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {OPENTOK_APIKEY, SEGMENT_EVENT} from '../../constants/CommonConstants';
import {GroupCallComponent} from 'ch-mobile-shared';
import KeepAwake from 'react-native-keep-awake';
import ProfileService from '../../services/ProfileService';
import Analytics from "@segment/analytics-react-native";
import moment from "moment";
import {connectChat} from "../../redux";

class GroupCallScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.keepScreenAwake(true);
        this.apiKey = OPENTOK_APIKEY;
        this.connection = navigation.getParam('connection', null);
    }

    goBack = ()=> {
        this.props.navigation.goBack();
    };


    componentWillUnmount(): void {
        this.keepScreenAwake(false);
    }

    keepScreenAwake = (shouldBeAwake) => {
        if (shouldBeAwake) {
            KeepAwake.activate();
        } else {
            KeepAwake.deactivate();
        }
    };


    sessionCompletedByProvider = (groupSessionDetails)=>{
        const {channelUrl,name,groupAnonymous,groupTypePublic,members} = this.connection;
        const {sessionId,totalMembersInSession,creationTime} = groupSessionDetails;
        const segmentGroupSessionCompletedPayload = {
            userId: this.props.auth?.meta?.userId,
            groupId: channelUrl,
            groupName: name,
            joinedAt: this.state.joinedAt,
            joinMethod: "Provider App - Telehealth",
            groupAnonymousStatus: groupAnonymous,
            groupPrivacyStatus: groupTypePublic,
            groupTotalMembers: members?.length,
            groupSessionStartTime:creationTime,
            groupSessionEndTime: moment.utc(Date.now()).format(),
            totalMembersInSession:totalMembersInSession,
            groupSessionId: sessionId,
            isProviderApp : true
        };
        Analytics.track(SEGMENT_EVENT.GROUP_SESSION_COMPLETED, segmentGroupSessionCompletedPayload);
        this.goBack();
    }

    startOrJoinGroupCall = async (channelUrl) => {
        const response = await ProfileService.startOrJoinGroupCall(channelUrl);
        const {name,groupAnonymous,groupTypePublic,members} = this.connection;
        await this.setState({joinedAt:moment.utc(Date.now()).format()});
        const segmentGroupSessionJoinedPayload = {
            userId: this.props.auth?.meta?.userId,
            groupId: channelUrl,
            groupName: name,
            groupAnonymousStatus: groupAnonymous,
            groupPrivacyStatus: groupTypePublic,
            groupTotalMembers: members?.length,
            isProviderApp : true
        };
        await Analytics.track(SEGMENT_EVENT.GROUP_SESSION_JOINED, segmentGroupSessionJoinedPayload);
        return response;
    };


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return(
            <GroupCallComponent
                goBack={this.goBack}
                group={this.connection}
                apiKey={String(this.apiKey)}
                startOrJoin={this.startOrJoinGroupCall}
                sessionCompletedByProvider={this.sessionCompletedByProvider}
            />
        );
    };
}

export default connectChat()(GroupCallScreen);
