import React, {Component} from 'react';
import {connectProfile} from '../../redux';
import {AssignAssessmentComponent} from 'ch-mobile-shared';
import ConversationService from './../../services/ConversationService';


class AssignAssessmentScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const {navigation} = this.props;
    this.connectionId = navigation.getParam('connectionId', null);
  }


  backClicked = () => {
    this.props.navigation.goBack();
  };

  render = () => {
    return (<AssignAssessmentComponent
      isProviderApp
      goBack={this.backClicked}
      organizationId={this.props.profile.profile.defaultOrganizationId}
      connectionId={this.connectionId}
      getConversations={ConversationService.getConversations}
      assignConversation={ConversationService.assignConversation}
      providerProfile = {this.props.profile?.profile}
    />)
  };
}
export default connectProfile()(AssignAssessmentScreen);
