import React, {Component} from 'react';
import {connectEducationalContent} from "../../../redux";
import {Screens} from "../../../constants/Screens";
import {EducationalPieceComponent} from 'ch-mobile-shared';
import Analytics from "@segment/analytics-react-native";
import {SEGMENT_EVENT} from "../../../constants/CommonConstants";
import moment from "moment";


class EducationalContentPiece extends Component<props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.contentSlug = navigation.getParam('contentSlug', null);
        this.topicName = navigation.getParam('topicName', null);
        this.educationOrder = navigation.getParam('educationOrder', null);
        this.categoryName = navigation.getParam('categoryName', null);
        this.topic = navigation.getParam('topic', null);

    }


    bookmarkContent = async (isBookmarked, entryId,entryTitle) => {
        const markInfo = {
            topicName: this.topicName,
            slug: entryId,
            shouldMark: !isBookmarked
        };

        if (!isBookmarked) {
            //only send segment event if bookmark value is false
            await Analytics.track(SEGMENT_EVENT.EDUCATION_BOOKMARKED, {
                educationName: entryTitle,
                userId: this.props.auth?.meta?.userId,
                sectionName: this.categoryName,
                topicName: this.topic.name,
                bookmarkedAt: moment.utc(Date.now()).format(),
                isProviderApp : true
            });
        }
        this.props.bookmarkContent(markInfo);
    };


    navigateToShareContent = (data) => {
        this.props.navigation.replace(Screens.SHARE_CONTENT_SCREEN,{
            ...this.props.navigation.state.params,
            educationalContentInfo :data.fields,
            entryId : data.sys.id,


        })
    };

    sendEducationEventToSegment = data => {
        Analytics.track(SEGMENT_EVENT.EDUCATION_OPENED, {
            userId: this.props.auth.meta.userId,
            sectionName: this.category?.categoryName,
            topicName: this.topic?.name,
            openedAt: moment.utc(Date.now()).format(),
            educationName: data,
            isProviderApp : true
        });
    };


    render() {
        return (
            <EducationalPieceComponent
                topicName={this.topicName}
                entryId={this.contentSlug}
                educationOrder={this.educationOrder}
                isLoading={this.props.educational.isLoading}
                bookmarkedArticles={this.props.profile.bookmarked}
                bookmarkContent={this.bookmarkContent}
                navigateToShareContent={this.navigateToShareContent}
                isProviderApp={true}
                fromRecommendedContent={false}
                goBack={()=>{this.props.navigation.goBack()}}
                initiateSegmentCall={this.sendEducationEventToSegment}
            />
        );
    }
}

export default connectEducationalContent()(EducationalContentPiece);
