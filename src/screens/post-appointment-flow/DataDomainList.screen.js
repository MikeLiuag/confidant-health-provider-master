import React, {Component} from 'react';
import { FlatList, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Right, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    SecondaryButton,
    TextStyles
} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import FeatherIcons from 'react-native-vector-icons/Feather';
import ConversationService from "../../services/ConversationService";
import Loader from "../../components/Loader";
import {DOMAIN_IMPORTANCE_COLORS, S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {DomainElementDetailModal} from "../../components/appointments/DomainElementDetailModal";

const HEADER_SIZE = getHeaderHeight();


export default class DataDomainListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.patientId = navigation.getParam('patientId', null);
        this.appointment = navigation.getParam('appointment', null);
        this.referrerScreen = navigation.getParam('referrerScreen', null);
        this.state = {
            domainTypes: [],
            isLoading: true,
            associationSelected: null,
            detailVisible: false
        };
        this.tagRefresher = null;
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    detailDrawerClose = () => {
        this.setState({
            associationSelected: null,
            associationLoading: true,
            associationDetail: null,
            detailVisible: false
        })
    };

    navigateToNextScreen = (domainType) => {
        if (domainType.requireHistory) {
            this.props.navigation.navigate(Screens.ADD_MEDICAL_HISTORY_SCREEN, {
                ...this.props.navigation.state.params
            });
        } else {
            const relatedMedications = this.state.domainTypes.types
                .filter(type=>type.typeSpec && type.typeSpec.requireRxInfo)
                .flatMap((type) => type.relatedElements)
                .filter(element => {
                    return (!element.tagMetaData) || (element.tagMetaData.rxDrugInfo && element.tagMetaData.rxDrugInfo.dose);
                })
                .map(element=>{
                    element.value=element.name;
                    return element;
                });
            const relatedSubstanceUse = this.state.domainTypes.types
                .filter(type=>type.typeSpec && type.typeSpec.requireSubstanceUse)
                .flatMap((type) => type.relatedElements)
                .filter(element => {
                    return (!element.tagMetaData) || (element.tagMetaData.substanceUse && element.tagMetaData.substanceUse.methodOfUse)
                })
                .map(element=>{
                    element.value=element.name;
                    return element;
                });
            this.props.navigation.navigate(Screens.DOMAIN_GROUPS_SCREEN, {
                domainType,
                relatedMedications,
                relatedSubstanceUse,
                ...this.props.navigation.state.params
            });
        }

    };

    navigateToScheduleNextAppointmentScreen = () => {
        this.props.navigation.replace(Screens.ADD_APPOINTMENT_NOTES_SCREEN, {
            ...this.props.navigation.state.params
        });
    };

    componentDidMount() {
        this.getAssociatedTagsList(true);
        this.getLookupKeys();
    };

    componentWillUnmount() {
        if (this.tagRefresher) {
            this.tagRefresher.remove();
            this.tagRefresher = null;
        }
    }

    getAssociatedTagsList = async (showLoader) => {
        this.setState({
            isLoading: !!showLoader
        });
        try {
            const patientId = this.patientId
            const response = await ConversationService.getAssociatedTagsList(patientId);
            if (response.errors) {
                this.setState({
                    isLoading: false
                });
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                response.types = response.types.sort((type1, type2)=>{
                    if(type1.requireHistory) {
                        return -1;
                    }
                    return 0;
                })
                this.setState({domainTypes: response, isLoading: false})
            }
        } catch (e) {
            this.setState({
                isLoading: false
            });
            console.log(e)
        }
        if(this.tagRefresher ===  null) {
            this.tagRefresher = this.props.navigation.addListener(
                'willFocus',
                payload => {
                    this.getAssociatedTagsList(false);
                }
            );
        }

    }

    showAssociationDetail = (item) => {
        this.setState({
            associationSelected: item,
            associationLoading: true,
            associationDetail: null
        });
        this.getAssociationDetail(item.id);
    };

    getAssociationDetail = async (tagId) => {
        try {
            const patientId = this.patientId
            const response = await ConversationService.getTagAssociationDetail(tagId, patientId);

            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                this.setState({associationDetail: response, associationLoading: false, detailVisible: true})
            }


        } catch (e) {
            console.log(e)
        }
    };

    updateAssociation = async (elementId, typeId) => {
        this.setState({
            isLoading: true,
            associationSelected: null,
            detailVisible: false
        });
        try {
            const typeResponse = await ConversationService.getDomainTypeById(typeId);
            if (typeResponse.errors) {
                AlertUtil.showErrorMessage(typeResponse.errors[0].endUserMessage);
                this.setState({
                    isLoading: false
                });
            } else {
                const elementResponse = await ConversationService.getDomainElementById(elementId);
                if (elementResponse.errors) {
                    AlertUtil.showErrorMessage(elementResponse.errors[0].endUserMessage);
                    this.setState({
                        isLoading: false
                    });
                } else {
                    this.props.navigation.navigate(Screens.ASSIGN_DOMAIN_ELEMENT_SCREEN, {
                        selectedElements: [elementResponse],
                        selectedType: {...typeResponse, typeName: typeResponse.name},
                        ...this.props.navigation.state.params,
                    });
                }
            }
        } catch (e) {
            this.setState({
                isLoading: false
            });
            console.log(e)
        }
    };

    resolveAssociation = async (associationId) => {
        this.detailDrawerClose();
        this.setState({
            isLoading: true,
            associationSelected: null
        });
        try {
            const response = await ConversationService.resolveAssociatedTag(associationId, {importanceLevel: 'RESOLVED'});
            if (response.errors) {
                AlertUtil.showErrorMessage(typeResponse.errors[0].endUserMessage);
                this.setState({
                    isLoading: false
                });
            } else {
                AlertUtil.showSuccessMessage("Association resolved");
                this.getAssociatedTagsList(false);
            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
    }
    }

    getFrequencyText = (frequency) => {
        if (frequency === '1') {
            return 'once a day'
        } else if (frequency === '2') {
            return 'twice a day'
        } else {
            return frequency + ' times daily';
        }
    };



    getLookupKeys = async () => {
        try {
            const response = await ConversationService.getDomainLookups();
            if (response.errors) {
                AlertUtil.showError(response.errors[0].endUserMessage);
            } else {
                this.setState({
                    lookupMap: response.lookupMap
                });
            }
        } catch (e) {
            console.log(e);
        }
    };


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        const {domainTypes} = this.state;
        if (this.state.isLoading) {
            return <Loader/>
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent noShadow={false}
                        style={styles.headerWrap}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        {/*<Button*/}
                        {/*    onPress={this.backClicked}*/}
                        {/*    transparent*/}
                        {/*    style={styles.backButton}>*/}
                        {/*    <EntypoIcons size={30} color={Colors.colors.mainBlue} name="chevron-thin-left"/>*/}
                        {/*</Button>*/}
                    </Left>
                    <Body style={styles.bodyWrap}/>
                    <Right style={{flex: 0.5}}/>
                </Header>
                <Content contentContainerStyle={{padding: 24, paddingBottom: isIphoneX()? 34 : 24 }}>
                    <View style={styles.titleWrap}>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>
                            Review and update guest information
                        </Text>
                    </View>

                    {domainTypes?.types && domainTypes.types
                        .filter(domainType => domainType.hasDomainElements)
                        .map((domainType, index) =>
                            <View style={styles.sectionWrapper}>
                                <View style={styles.individualTitleWrap}>
                                    <Text style={styles.singleListTitle}>
                                        {domainType.typeName}
                                    </Text>
                                    {
                                        !domainType.requireHistory && <Text
                                            style={styles.singleListCount}>{domainType.relatedElements.length} Total</Text>
                                    }

                                </View>
                                {!domainType.requireHistory && domainType.relatedElements.length > 0 &&
                                <View>
                                    <FlatList
                                        data={domainType.relatedElements}
                                        renderItem={({item, index}) =>
                                            <TouchableOpacity
                                                style={styles.singleDomainItem}
                                                onPress={() => {
                                                    this.showAssociationDetail(item)
                                                }}
                                            >
                                                <View style={styles.domainInfo}>
                                                    <Text
                                                        style={[styles.domainStatus, {color: item.priority.name && DOMAIN_IMPORTANCE_COLORS[item.priority.name.toUpperCase()].textColor}]}>{item.priority.name}</Text>
                                                    <Text style={styles.domainTitle}>{item.name}</Text>
                                                    {
                                                        domainType.typeSpec && domainType.typeSpec.requireRxInfo && (
                                                            <Text
                                                                style={styles.domainTitle}>{item.tagMetaData && item.tagMetaData.rxDrugInfo && item.tagMetaData.rxDrugInfo.dose ? (
                                                                `${item.tagMetaData.rxDrugInfo.doseUnit} ${this.getFrequencyText(item.tagMetaData.rxDrugInfo.doseFrequency)} - ${item.tagMetaData.rxDrugInfo.supply} days total`
                                                            ): ('No Rx info available')}</Text>
                                                        )
                                                    }
                                                </View>
                                                <View style={styles.domainIcon}>
                                                    <FeatherIcons size={30} color={Colors.colors.mainBlue}
                                                                  name="more-horizontal"/>
                                                </View>
                                            </TouchableOpacity>
                                        }
                                        keyExtractor={item => item.id}
                                    />

                                </View>
                                }
                                <SecondaryButton
                                    testId="add-social-btn"
                                    text={(domainType.requireHistory ? 'Update ' : "Add ") + domainType.typeName}
                                    bgColor={Colors.colors.white}
                                    textColor={Colors.colors.primaryText}
                                    onPress={() => {
                                        this.navigateToNextScreen(domainType);
                                    }}
                                />
                            </View>
                        )
                    }
                    <PrimaryButton
                           {...addTestID('view')}
                        testId="continue"
                        onPress={this.navigateToScheduleNextAppointmentScreen}
                        text="Continue"
                    />
                </Content>

                <DomainElementDetailModal
                    onClose={this.detailDrawerClose}
                    selectedTag={this.state.associationDetail}
                    lookupData={this.state.lookupMap}
                    actionable
                    resolveAssociation={this.resolveAssociation}
                    updateAssociation={this.updateAssociation}
                    associationId={this.state.associationSelected?.id}
                    visible={this.state.detailVisible}
                />
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    headerWrap: {
        paddingLeft: 18,
        paddingRight: 18,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },
    backButton: {
        width: 35,
        paddingLeft: 0,
        paddingRight: 0
    },
    titleWrap: {
        alignItems: 'center',
        marginBottom: 16
    },
    sectionWrapper: {
        marginBottom: 60
    },
    individualTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    singleListTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
    },
    singleListCount: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    singleDomainItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.colors.highContrastBG,
        paddingTop: 16,
        paddingBottom: 16
    },
    domainInfo: {
        flex: 1
    },
    domainStatus: {
        color: Colors.colors.primaryText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold
    },
    domainTitle: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium
    },
    domainIcon: {},
    greBtn: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        ...CommonStyles.styles.stickyShadow
    },
});
