import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {AddMembersComponent, AlertUtil} from 'ch-mobile-shared';
import {connectConnections} from '../../redux';
import ProfileService from '../../services/ProfileService';
import {Screens} from '../../constants/Screens';

 class AddMembersScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

     constructor(props) {
         super(props);
         const {navigation} = this.props;
         this.group = navigation.getParam('group', null);
         this.onSuccess = navigation.getParam('onSuccess', null);
         this.editMode = navigation.getParam('editMode', false);
         this.state = {
             isLoading: false,
             nameFocus: false,
             imageUploaded: false,
         };
     }

     goBack = () => {
         this.props.navigation.goBack();
     };

     createGroup = async (selectedConnections) => {
         if (this.editMode) {
             this.addMembersToGroup(selectedConnections);
         } else {
             const groupParams = {
                 groupName: this.group.name,
                 selectedConnections,
             };
             const payload = {group: groupParams};
             if (this.group.file) {
                 payload.file = this.group.file;
             }
             this.setState({isLoading: true});
             const groupResponse = await ProfileService.createGroup(payload);
             if (groupResponse.errors) {
                 AlertUtil.showErrorMessage(groupResponse.errors[0].endUserMessage);
                 this.setState({isLoading: false});
             } else {
                 const payload = {
                     ...groupParams,
                     ...groupResponse,
                 };
                 this.props.newChatGroupCreated(payload);
                 AlertUtil.showSuccessMessage('New chat group created.');
                 this.props.navigation.navigate(Screens.TAB_VIEW);
             }
         }
     };

     addMembersToGroup = async (selectedConnections) => {
         this.setState({isLoading: true});
         const groupParams = {
             channelUrl: this.group.channelUrl,
             selectedConnections,
         };
         const groupResponse = await ProfileService.addGroupMembers(groupParams);
         if (groupResponse.errors) {
             AlertUtil.showErrorMessage(groupResponse.errors[0].endUserMessage);
             this.setState({isLoading: false});
         } else {
             AlertUtil.showSuccessMessage('New members added successfully');
             this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN);

             if (this.onSuccess) {
                 this.onSuccess();
             }
         }
     };


     render() {
         // StatusBar.setBackgroundColor('transparent', true);
         StatusBar.setBarStyle('dark-content', true);
         let connections = this.props.connections.activeConnections.filter(connection => connection.type !== 'CHAT_BOT');
         if (this.editMode) {
             const existingMembers = [
                 ...this.group.members.map(member => member.userId),
                 ...this.group.pendingMembers.map(member => member.userId),
             ];
             connections = connections.filter(connection => !existingMembers.includes(connection.connectionId));

         }
         return (
             <AddMembersComponent
                 connections={connections}
                 isLoading={this.state.isLoading}
                 editMode={this.editMode}
                 createGroup={this.createGroup}
                 goBack={this.goBack}
             />
         );
     };

}

 export default connectConnections()(AddMembersScreen);
