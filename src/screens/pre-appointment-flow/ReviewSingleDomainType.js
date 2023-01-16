import React, {Component} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {Container, Content, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    AlfieLoader,
    Colors,
    isIphoneX,
    isTelehealthConfigured,
    PrimaryButton,
    TextStyles
} from 'ch-mobile-shared';
import {PreApptHeader} from "../../components/pre-appointment/PreApptHeader.component";
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/ProfileService";
import {AssociatedTagsList} from "../../components/pre-appointment/AssociatedTagsList.component";
import AuthStore from "../../utilities/AuthStore";
import ConversationService from "../../services/ConversationService";
import {DomainElementDetailModal} from "../../components/appointments/DomainElementDetailModal";


export default class ReviewSingleDomainType extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.connection = navigation.getParam('connection', null);
        const tag = navigation.getParam('tag', null);
        this.state = {
            isLoading: false,
            associatedTagsData: [],
            associatedTagsLength: null,
            selectedTagDetails: null,
            currentIndex: 0,
            detailVisible: false,
            tag
        };
        this.tagDetailSegments = [{segmentId: 'information', title: 'Information'}, {
            segmentId: 'history',
            title: 'History'
        }];
    }

    getAssignedElements = async ()=>{
        const response = await ConversationService.getDomainElementAssociationByPatient(this.state.tag.typeId, this.connection.connectionId);
        if(response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            this.setState({tag: response.types[0]});
        }
    };

    /**
     * @function getPatientAssociatedTagDetails
     * @description This method is used to get Patient Associated Tag details for given user.
     */

    getPatientAssociatedTagDetails = async (item) => {
        try {
            const payload = {
                associatedTagId: item.id,
                patientId: this.connection.connectionId
            }
            const selectedTagDetails = await ProfileService.getUserAssociatedTagDetails(payload);
            if (selectedTagDetails.errors) {
                AlertUtil.showErrorMessage(selectedTagDetails.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                this.setState({selectedTagDetails, detailVisible: true});
            }


        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };


    componentDidMount = async () => {
        this.getDomainLookups();
        this.getAssignedElements();
    }

    getDomainLookups = async () => {
        try {
            const lookupData = await ConversationService.getDomainLookups();
            if (lookupData.errors) {
                AlertUtil.showErrorMessage(lookupData.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                this.setState({lookupData: lookupData.lookupMap, isLoading: false});
            }


        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };


    backClicked = () => {
        this.props.navigation.goBack();
    };

    detailDrawerClose = () => {
        this.setState({detailVisible: false});
    };


    isRelatedTo = (key, item) => {
        return item.tagMetaData.specification[key] && item.tagMetaData.specification[key].length > 0;
    };

    appendSubText = (text, subText) => {
        if (!subText) {
            return text;
        }
        if (subText.length > 0) {
            subText = subText + '\n';
        }
        return subText + text;
    };

    getRelatedToText = (item) => {
        let subText = null;
        if (item.tagMetaData && item.tagMetaData.specification) {
            if (this.isRelatedTo('relatedToMedicalCondition', item)) {
                subText = this.appendSubText('Related To Medical Condition', subText);
            }
            if (this.isRelatedTo('relatedToMedication', item)) {
                subText = this.appendSubText('Related To Medication', subText);
            }
            if (this.isRelatedTo('relatedToSubstanceUse', item)) {
                subText = this.appendSubText('Related To Substance Use', subText);
            }
            if (this.isRelatedTo('relatedToWithdrawal', item)) {
                subText = this.appendSubText('Related To Withdrawal', subText);
            }
        }
        return subText;
    };


    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <AlfieLoader/>;
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />

                <PreApptHeader
                    onPress={this.backClicked}
                    headerText={'Review ' + this.state.tag.typeName}
                />

                <Content>
                    <AssociatedTagsList
                        data={this.state.tag.relatedElements}
                        getRelatedToText={this.getRelatedToText}
                        getPatientAssociatedTagDetails={this.getPatientAssociatedTagDetails}/>
                </Content>

                <DomainElementDetailModal
                    onClose={this.detailDrawerClose}
                    selectedTag={this.state.selectedTagDetails}
                    lookupData={this.state.lookupData}
                    segments={this.tagDetailSegments}
                    visible={this.state.detailVisible}
                />


            </Container>
        );
    }
}
