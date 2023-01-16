import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {Screens} from '../../constants/Screens';
import {TopicDetailsListComponent} from 'ch-mobile-shared';
import {connectEducationalContent} from '../../redux';
import Analytics from '@segment/analytics-react-native';
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import moment from "moment";

class TopicContentListScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const {navigation} = this.props;
    this.fromRecommendedContent = navigation.getParam('fromRecommendedContent', false),
    this.category = navigation.getParam('category', null),
    this.topic = {
      name: navigation.getParam('topicName', null),
      description: navigation.getParam('topicDescription', null),
      image: navigation.getParam('topicImage', null),
      icon: navigation.getParam('topicIcon', null),
      educationOrder: navigation.getParam('educationOrder', null),
    };
    this.state = {
      isLoading: true,
    };
  }

  componentDidMount(): void {

    Analytics.track(SEGMENT_EVENT.TOPIC_OPENED, {
      userId: this.props.auth?.meta?.userId,
      sectionName: this.fromRecommendedContent ? this.fromRecommendedContent?.categoryName : this.category?.categoryName,
      openedAt:moment.utc(Date.now()).format(),
      topicName: this.topic?.name,
      isProviderApp : true
    });

  }

  backClicked = () => {
    this.props.navigation.goBack();
  };

  openSelectedEducation = (item, contentSlug, topicName) => {
    this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
      contentSlug,
      topicName: this.fromRecommendedContent?topicName:this.topic.name,
      educationOrder: this.topic.educationOrder,
      category :this.category,
      topic : this.topic

    });
  };

  render() {
    StatusBar.setBackgroundColor('transparent', true);
    StatusBar.setBarStyle('dark-content', true);
    return (
      <TopicDetailsListComponent
        topic={this.topic}
        backClicked={this.backClicked}
        openSelectedEducation={this.openSelectedEducation}
        bookmarked={this.props.profile.bookmarked}
        fromRecommendedContent={this.fromRecommendedContent}
        assignedContent={this.props.educational.assignedContent}
      />
    );
  }
}

export default connectEducationalContent()(TopicContentListScreen);
