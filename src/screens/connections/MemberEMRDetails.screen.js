import React, {Component} from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform, ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import {Body, Button, Container, Content, Header, Icon, Left, ListItem, Right, Text} from 'native-base';
import {
    AlertUtil,
    Colors,
    DEFAULT_IMAGE,
    PrimaryButton,
    S3_BUCKET_LINK,
    TextStyles,
    TransactionSingleActionItem
} from "ch-mobile-shared";
import {addTestID, getHeaderHeight, isCloseToBottom, isIphoneX} from "ch-mobile-shared/src/utilities";
import EntypoIcons from "react-native-vector-icons/Entypo";
import {List} from "react-native-paper";
import {
    CONTACT_NOTES_FLAGS,
    CONTACT_NOTES_STATUS,
    DEFAULT_AVATAR_COLOR,
    PLAN_STATUS
} from "../../constants/CommonConstants";
import {CommonStyles} from "ch-mobile-shared/src/styles";
import {CommonSegmentHeader} from "ch-mobile-shared/src/components/CommonSegmentHeader";
import ProfileService from "../../services/ProfileService";
import ScheduleService from "../../services/ScheduleService";
import {Screens} from "../../constants/Screens";
import FeatherIcons from "react-native-vector-icons/Feather";
import AntIcons from "react-native-vector-icons/AntDesign";
import GenericListItem from "../../components/revamp/GenericListItem";
import ConversationService from "../../services/ConversationService";
import Modal from "react-native-modalbox";
import MaterialComIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {connectConnections} from "../../redux";
import {CheckBox} from 'react-native-elements';
import {NavigationActions, StackActions} from "react-navigation";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_Can.json";
import ViewMoreText from "react-native-view-more-text";
import moment from "moment-timezone";

const HEADER_SIZE = getHeaderHeight();
export const EMRItem = (itemProps) => {
    return (
        <TouchableOpacity
            style={styles.singleItem}
            onPress={itemProps.onPress}
        >
            <Button
                transparent
                onPress={itemProps.onPress}
                style={[styles.settingIconWrap,
                    {backgroundColor: Colors.colors.primaryColorBG}
                ]}>
                {
                    itemProps.renderIcon()
                }
            </Button>
            <View style={styles.itemDetail}>
                <Text
                    style={styles.itemName}>{itemProps.title}</Text>
                <Text
                    style={styles.itemDes} numberOfLines={2}>
                    {itemProps.subTitle}
                </Text>
            </View>
            <View style={styles.nextWrapper}>
                <Button onPress={itemProps.onPress}
                        transparent style={styles.itemNextButton}>
                    <EntypoIcons size={30} color={Colors.colors.neutral50Icon}
                                 name="chevron-thin-right"/>
                </Button>
            </View>

        </TouchableOpacity>
    )
};

const ActiveInActiveOptions = [
    {
        id: "activeChat",
        name: 'Active in chat',
        value: false,
        description: "Select to add in active group section",
    },
    {
        id: "inActiveChat",
        name: 'Inactive in chat',
        value: false,
        description: "Select to remove active group section",
    }
];

class MemberEMRDetailsScreen extends Component {

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.connection = navigation.getParam('connection', null);
        this.state = {
            //connection: connection,
            connection: this.findConnection(this.connection?.connectionId),
            activeSegmentId: 'emr',
            changeSegmentTab: null,
            careTeam: [],
            careTeamLoading: true,
            appointmentsLoading: true,
            appointments: [],
            groupsLoading: true,
            groups: [],
            chatbotsLoading: true,
            chatbots: [],
            dataDomainTypes: [],
            historyLoading: true,
            historyCompleted: null,
            articlesLoading: true,
            patientContactNotes: [],
            patientContactNotesLoading: true,
            articles: [],
            planLoading: true,
            revampPlanItemsList: [],
            contextPlanItems: [],
            optionsMenu: false,
            chatStatusModalVisible: false,
            activeInActiveChatStatus: this.populateData(ActiveInActiveOptions, this.connection.inActiveChat),
            channelUrl: navigation.getParam('channelUrl', null),
            profileHighlightedColor: Colors.colors.white,
            searchQuery: '',
            orderBy: '',
            sortBy: [],
            selectedEngagementLevel : this.connection?.levelOfEngagement || null
        };
    }

    componentDidMount() {
        if (this.state.connection?.connectionId) {
            this.fetchCareTeam();
            this.fetchPastAppointments();
            this.fetchJoinedGroups();
            this.fetchUserChatBots();
            this.fetchAssignedDataDomains();
            this.fetchPatientMedicalHistory();
            this.fetchCompletedArticles();
            this.fetchPatientContactNotes();
            this.fetchLevelOfEngagements(false);
        }

        this.screenFocusListener = this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.fetchPatientContactNotes();
                this.fetchPlan();
            }
        );
    }

    componentWillUnmount() {
        if (this.screenFocusListener) {
            this.screenFocusListener.remove();
            this.screenFocusListener = null;
        }
    }


    /**
     * @function goBack
     * @description This method is used to navigate back
     */
    goBack = () => {
        this.props.navigation.goBack();
    }


    /**
     * @function populateRevampContextData
     * @description This method is used to populate Revamp Context Data as sections
     */
    populateRevampContextData = (revampPlanItemsList) => {
        if (revampPlanItemsList) {
            const map = revampPlanItemsList.reduce((prev, current) => {
                const title = current.status.toUpperCase();
                if (prev[title]) {
                    prev[title].push(current);
                } else {
                    prev[title] = [current]
                }
                return prev;
            }, {});

            return Object.keys(map).map((title, index) => {
                return {
                    title: title,
                    data: map[title],
                    expanded: index === 0
                }
            });

        }
    }


    /**
     * @function getSortedList
     * @description This method is used to get sorted list
     */
    getSortedList = (list)=>{
         return list?.sort((a, b)=> {
            if(a.name?.toLowerCase() < b.name?.toLowerCase()) return -1;
            if(a.name?.toLowerCase() > b.name?.toLowerCase()) return 1;
            return 0;
        });
    }


    /**
     * @function fetchLevelOfEngagements
     * @description This method is used to fetch level of engagements
     */
    fetchLevelOfEngagements = async (isLazy) => {
        isLazy
            ? this.setState({isLoadingMore: true})
            : this.setState({isLoading: true});
        try {
            this.setState({isLoading: true});
            const {searchQuery, currentPage, pageSize, orderBy, sortBy} = this.state;
            const response = await ConversationService.getLevelOfEngagementsList(
                searchQuery?.trim(), currentPage - 1,
                pageSize, orderBy, sortBy
            );
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({
                    isLoading: false
                })
            } else {
                const currentpage = response?.currentPage;
                const totalpages = response?.totalPages;
                const nextLevels = response?.records;
                let levelOfEngagements = this.state.levelOfEngagements
                    ? [...this.state.levelOfEngagements, ...nextLevels]
                    : [...nextLevels];

                this.setState({
                    levelOfEngagements: this.getSortedList(levelOfEngagements),
                    hasMore: currentpage < totalpages - 1,
                    currentPage: this.state.hasMore ? currentpage + 1 : currentpage,
                    isLoading: false,
                    isLoadingMore: false,
                })
            }
        } catch (e) {
            this.setState({
                isLoading: false
            })
        }
    };


    /**
     * @function fetchPlan
     * @description This method is used to fetch plans
     */
    fetchPlan = async () => {
        this.setState({
            planLoading: true
        });
        const response = await ConversationService.getAssignedPlanItems(this.state?.connection?.connectionId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({
                planLoading: false
            })
        } else {
            this.setState({
                revampPlanItemsList: this.populateRevampContextData(response.planItemsContexts),
                contextPlanItems: response.planItemsContexts,
                planLoading: false
            })
        }
    };


    /**
     * @function fetchCareTeam
     * @description This method is used to fetch care team
     */
    fetchCareTeam = async () => {
        const response = await ProfileService.getCareTeam(this.state.connection.connectionId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            this.setState({
                careTeamLoading: false,
                careTeam: response
            })
        }
    }

    /**
     * @function getProfileColorByFlag
     * @description This method is used to get profile color by flag
     */

    getProfileColorByFlag = (patientContactNotes) => {
        const prohibitiveNotes = patientContactNotes?.filter(note => note.flag === CONTACT_NOTES_FLAGS.PROHIBITIVE);
        const cautionNotes = patientContactNotes?.filter(note => note.flag === CONTACT_NOTES_FLAGS.CAUTION);
        let contactNotesFlag = "";
        if (prohibitiveNotes?.length > 0) {
            contactNotesFlag = CONTACT_NOTES_FLAGS.PROHIBITIVE
        } else if (cautionNotes?.length > 0) {
            contactNotesFlag = CONTACT_NOTES_FLAGS.CAUTION
        }
        switch (contactNotesFlag) {
            case CONTACT_NOTES_FLAGS.CAUTION:
                return Colors.colors.starRatingColor;
            case CONTACT_NOTES_FLAGS.PROHIBITIVE:
                return Colors.colors.mainPink;
            default :
                return Colors.colors.white
        }
    }


    /**
     * @function fetchPatientContactNotes
     * @description This method is used to fetch patient contact notes
     */
    fetchPatientContactNotes = async () => {
        try {
            const response = await ProfileService.getContactNotes(this.state.connection.connectionId);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                const patientContactNotes = response.patientContactNotes;
                this.setState({
                    patientContactNotes: patientContactNotes?.filter(note => note.flag === CONTACT_NOTES_FLAGS.CAUTION || note.status === CONTACT_NOTES_STATUS.ACTIVE),
                    profileHighlightedColor: this.getProfileColorByFlag(patientContactNotes),
                    patientContactNotesLoading: false
                })
            }
        }catch (e) {
            console.log(e)
        }
    }

    /**
     * @function fetchCompletedArticles
     * @description This method is used to fetch completed articles
     */
    fetchCompletedArticles = async () => {
        const response = await ProfileService.getCompletedArticlesByMember(this.state.connection.connectionId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        } else {
            this.setState({
                articlesLoading: false,
                articles: response
            })
        }
    }

    /**
     * @function fetchPastAppointments
     * @description This method is used to fetch past appointments
     */
    fetchPastAppointments = async () => {
        const isConnected = !!this.props.connections.activeConnections.find(conn => conn.connectionId === this.state.connection.connectionId);
        if (!isConnected) {
            return;
        }
        try {
            const pastAppointments = await ScheduleService.getPastAppointments(this.state.connection.connectionId);
            if (pastAppointments.errors) {
                AlertUtil.showErrorMessage(pastAppointments.errors[0].endUserMessage);
                this.setState({appointmentsLoading: false});
            } else {
                this.setState({appointments: pastAppointments, appointmentsLoading: false});


            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };

    /**
     * @function fetchJoinedGroups
     * @description This method is used to fetch joined groups
     */
    fetchJoinedGroups = async () => {
        try {
            const groupsData = await ProfileService.getUserGroups(this.state.connection.connectionId);
            if (groupsData.errors) {
                AlertUtil.showErrorMessage(groupsData.errors[0].endUserMessage);
                this.setState({groupsLoading: false});
            } else {
                this.setState({groups: groupsData, groupsLoading: false});
            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };

    /**
     * @function fetchUserChatBots
     * @description This method is used to get user chatbots
     */
    fetchUserChatBots = async () => {
        try {
            const chatbotData = await ProfileService.getUserChatbotDetails(this.state.connection.connectionId);
            if (chatbotData.errors) {
                AlertUtil.showErrorMessage(chatbotData.errors[0].endUserMessage);
                this.setState({chatbotsLoading: false});
            } else {
                this.setState({chatbots: chatbotData, chatbotsLoading: false});

            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };

    /**
     * @function fetchAssignedDataDomains
     * @description This method is used to fetch assigned data domains
     */
    fetchAssignedDataDomains = async () => {
        try {
            const associatedTagsData = await ProfileService.getUserAssociatedTags(this.state.connection.connectionId);
            if (associatedTagsData.errors) {
                AlertUtil.showErrorMessage(associatedTagsData.errors[0].endUserMessage);
            } else {
                //Filtering out medical history
                //type.typeName !== 'Medical History' &&
                const types = associatedTagsData.types.filter(type => type.typeName !== 'Medical History');
                const historyType = associatedTagsData.types.find(type => !!type.requireHistory);
                // .filter(type =>  );

                // if (types.length === 0) {
                //     this.startTelehealth(true);
                // } else {
                this.setState({
                    dataDomainTypes: types,
                    historyType
                });
                // }

            }

        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };


    /**
     * @function fetchPatientMedicalHistory
     * @description This method is used to fetch patient medical history
     */
    fetchPatientMedicalHistory = async () => {
        try {
            const historicalData = await ProfileService.getUserHistory(this.state.connection.connectionId);
            if (historicalData.errors) {
                AlertUtil.showErrorMessage(historicalData.errors[0].endUserMessage);
                this.setState({historyLoading: false});
            } else {
                const tagItem = historicalData.tagItems[0];

                this.setState({historyCompleted: !!tagItem.metaData, historyLoading: false});
            }


        } catch (e) {
            this.setState({isLoading: false});
            console.log(e.message)
        }
    };


    /**
     * @function handleExpanded
     * @description This method is used to handle expanded behaviour
     */
    handleExpanded = (context) => {
        let {revampPlanItemsList} = this.state;
        revampPlanItemsList[context].expanded = !revampPlanItemsList[context].expanded;
        this.setState({revampPlanItemsList});
    };


    /**
     * @function renderEmptyPlan
     * @description This method is used to render empty plan
     */
    renderEmptyPlan = () => {
        return (
            <View style={{flex: 1}}>
                <View style={{...styles.planContent, marginBottom: 8}}>
                    <Image
                        style={styles.planImage}
                        resizeMode="contain"
                        source={require("../../assets/images/priorities.png")}
                    />

                    <Text style={styles.planContentTitle}>
                        They don’t have any active Plan items
                    </Text>
                    <Text style={styles.planContentSubTitle}>
                        This is usually because they haven’t finished the ReVAMP onboarding. Add some plan items and get
                        them started,
                    </Text>
                </View>
            </View>

        )
    }

    /**
     * @function renderFullPlanItems
     * @description This method is used to render Full plan items
     */
    renderPlan = () => {
        const {revampPlanItemsList, planLoading} = this.state;
        if (planLoading) {
            return <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1}}>
                <ActivityIndicator size={'large'} style={{width: '100%', height: 400}}/>
            </View>

        }
        return (
            <View style={styles.planContent}>
                {
                    revampPlanItemsList?.length === 0 ? this.renderEmptyPlan() :
                        revampPlanItemsList && Object.keys(revampPlanItemsList).map(context => {
                            const expanded = revampPlanItemsList[context].expanded;
                            return (
                                <List.Accordion
                                    title={PLAN_STATUS[revampPlanItemsList[context].title]}
                                    titleStyle={styles.headerStyles}
                                    style={styles.headerBgStyles}
                                    left={props => <AntIcons size={22} color={Colors.colors.highContrast}
                                                             name={expanded ? "caretup" : "caretdown"}/>}
                                    right={props => <Text
                                        style={styles.itemQty}>{revampPlanItemsList[context].data?.length} item
                                        {revampPlanItemsList[context]?.data?.length > 1 ? 's' : ''}</Text>}
                                    expanded={expanded}
                                    onPress={() => {
                                        this.handleExpanded(context)
                                    }}>
                                    {revampPlanItemsList[context].data && this.renderCardList(revampPlanItemsList[context].data, false)}
                                </List.Accordion>
                            )
                        })

                }
            </View>
        )
    };

    /**
     * @function getItemColorByStatus
     * @description This method is used to get color by status
     */
    getItemColorByStatus = (revampContext) => {
        switch (revampContext.status) {
            case 'IN_PROGRESS':
                return Colors.colors.mainBlue;
            case 'SCHEDULED':
                return Colors.colors.warningIcon;
            case 'NOT_STARTED':
                return Colors.colors.highContrast;
            case 'COMPLETED':
                return Colors.colors.successIcon;
            default :
                return Colors.colors.highContrast

        }
    }

    /**
     * @function renderCardList
     * @description This method is used to render list of plan items
     */
    renderCardList = (revampPlanItemsList, isPriority) => {
        let listToBeRender = revampPlanItemsList;
        if (isPriority) {
            listToBeRender = listToBeRender.filter(context => context.priority === true);
        }
        return (
            listToBeRender && listToBeRender?.map((revampContext) => {
                return (
                    <GenericListItem
                        headingText={revampContext.status}
                        headingSubText={revampContext?.planItem?.token}
                        mainText={revampContext?.planItem?.name}
                        itemColor={this.getItemColorByStatus(revampContext)}
                        shapeColor={this.getItemColorByStatus(revampContext)}
                        subInnerText={revampContext?.planItem?.navigatesTo}
                        onPress={() => {
                        }}
                    />
                );

            })
        );
    };

    /**
     * @function getIconProps
     * @description This method is used to get icon props
     */
    getIconProps = (domainType) => {
        switch (domainType) {
            case 'Side Effects': {
                return {
                    name: 'questioncircleo',
                    type: 'AntDesign'
                }
            }
            case 'Social Determinants': {
                return {
                    name: 'grid',
                    type: 'Feather'
                }
            }
            case 'Symptoms': {
                return {
                    name: 'activity',
                    type: 'Feather'
                }
            }
            case 'Life Events': {
                return {
                    name: '',
                    imagePath: require('../../assets/images/emr-life-events.png'),
                    type: ''
                }
            }
            case 'Medications': {
                return {
                    name: '',
                    imagePath: require('../../assets/images/emr-medications.png'),
                    type: ''
                }
            }
            case 'Substance Use': {
                return {
                    name: '',
                    imagePath: require('../../assets/images/emr-substance-use.png'),
                    type: ''
                }
            }
            case 'Diagnoses': {
                return {
                    name: '',
                    imagePath: require('../../assets/images/emr-diagnoses.png'),
                    type: ''
                }
            }
            default : {
                return {
                    name: 'unknown',
                    type: 'AntDesign'
                }
            }
        }

    };

    /**
     * @function renderEMR
     * @description This method is render EMR
     */
    renderEMR = (isConnected) => {
        const completedChatbotCount = this.state.chatbots.filter(chatbot => !!chatbot.completed).length;
        return (
            <View style={{marginBottom: 26}}>
                <EMRItem
                    title={'Contact Information'}
                    subTitle={'Email and Phone'}
                    renderIcon={() =>
                        <Icon
                            name={'email-outline'}
                            type={'MaterialCommunityIcons'}
                            style={[styles.settingIcon, {color: Colors.colors.primaryIcon}]}/>
                    }
                    onPress={() => {
                        this.props.navigation.navigate(Screens.MEMBER_CONTACT_INFO_SCREEN, {
                            connection: this.state.connection
                        });
                    }}
                />
                <EMRItem
                    title={'Contact Notes'}
                    subTitle={!this.state.patientContactNotesLoading && (this.state.patientContactNotes.length + ` Note${this.state.patientContactNotes?.length>1?'s':''} `)}
                    renderIcon={() =>
                        <Icon
                            name={'file-text'}
                            type={'Feather'}
                            style={[styles.settingIcon, {color: Colors.colors.primaryIcon}]}/>
                    }
                    onPress={() => {
                        this.props.navigation.navigate(Screens.NOTES_SCREEN, {
                            connection: this.state.connection, patientContactNotes: this.state.patientContactNotes
                        });
                    }}
                />
                <EMRItem
                    title={'Care Team'}
                    subTitle={!this.state.careTeamLoading && (this.state.careTeam.length + ` Member${this.state.careTeam?.length > 1 ?'s':''}`)}
                    renderIcon={() =>
                        <Icon name={'heart'} type={'Feather'} style={[styles.settingIcon,
                            {color: Colors.colors.primaryIcon}
                        ]}/>
                    }
                    onPress={() => {
                        this.props.navigation.navigate(Screens.CARE_TEAM_MEMBERS_SCREEN, {
                            connection: this.state.connection
                        });
                    }}
                />
                {
                    isConnected && (
                        <EMRItem
                            title={'Appointments'}
                            subTitle={!this.state.appointmentsLoading && (this.state.appointments.length + ' Completed')}
                            renderIcon={() =>
                                <Icon name={'calendar'} type={'Feather'} style={[styles.settingIcon,
                                    {color: Colors.colors.primaryIcon}
                                ]}/>
                            }
                            onPress={() => {
                                this.props.navigation.navigate(Screens.PAST_APPOINTMENT_LIST_SCREEN, {
                                    connection: this.state.connection,
                                    manualView: true
                                });
                            }}
                        />
                    )
                }

                <EMRItem
                    title={'Groups'}
                    subTitle={!this.state.groupsLoading && (this.state.groups.length + ` group${this.state.groups?.length > 1 ?'s' : ''} joined`)}
                    renderIcon={() =>
                        <Icon name={'users'} type={'Feather'} style={[styles.settingIcon,
                            {color: Colors.colors.primaryIcon}
                        ]}/>
                    }
                    onPress={() => {
                        this.props.navigation.navigate(Screens.REVIEW_GROUP_LIST_SCREEN, {
                            connection: this.state.connection,
                            manualView: true
                        });
                    }}
                />
                <EMRItem
                    title={'Chatbots'}
                    subTitle={!this.state.chatbotsLoading && (completedChatbotCount + ' Completed')}
                    renderIcon={() =>
                        <Icon name={'message-circle'} type={'Feather'} style={[styles.settingIcon,
                            {color: Colors.colors.primaryIcon}
                        ]}/>
                    }
                    onPress={() => {
                        this.props.navigation.navigate(Screens.REVIEW_CHATBOT_LIST_SCREEN, {
                            connection: this.state.connection,
                            manualView: true
                        });
                    }}
                />
                <EMRItem
                    title={'Education'}
                    subTitle={!this.state.articlesLoading && (this.state.articles.length + ' read')}
                    renderIcon={() =>
                        <Icon name={'book-open'} type={'Feather'} style={[styles.settingIcon,
                            {color: Colors.colors.primaryIcon}
                        ]}/>
                    }
                    onPress={() => {
                        this.props.navigation.navigate(Screens.MEMBER_COMPLETED_ARTICLES, {
                            connection: this.state.connection
                        });
                    }}
                />
                <EMRItem
                    title={'History'}
                    subTitle={!this.state.historyLoading && (this.state.historyCompleted ? 'Completed' : 'Not Completed')}
                    renderIcon={() =>
                        <Icon name={'clock'} type={'Feather'} style={[styles.settingIcon,
                            {color: Colors.colors.primaryIcon}
                        ]}/>
                    }
                    onPress={() => {
                        this.props.navigation.navigate(Screens.REVIEW_HISTORY_SCREEN, {
                            connection: this.state.connection,
                            manualView: true
                        });
                    }}
                />

                {
                    this.state.dataDomainTypes.map(domainType => {
                        const iconProps = this.getIconProps(domainType.typeName);
                        return (
                            <EMRItem
                                title={domainType.typeName}
                                subTitle={domainType.relatedElements.length + ' Active'}
                                key={domainType.typeId}
                                renderIcon={() => {
                                    if (iconProps.name) {
                                        return <Icon name={iconProps.name} type={iconProps.type}
                                                     style={[styles.settingIcon,
                                                         {color: Colors.colors.primaryIcon}
                                                     ]}/>
                                    } else {
                                        return <Image source={iconProps.imagePath}/>
                                    }
                                }}
                                onPress={() => {
                                    this.props.navigation.navigate(Screens.REVIEW_SINGLE_DOMAIN_TYPE, {
                                        connection: this.state.connection,
                                        tag: domainType
                                    });
                                }}
                            />
                        )
                    })
                }

            </View>
        )
    };


    /**
     * @function disconnect
     * @description This method is used to disconnect
     */
    disconnect = () => {
        this.closeModal()
        this.props.disconnect({userId: this.state.connection.connectionId});
        this.state.changeSegmentTab('emr');
    };

    /**
     * @function connect
     * @description This method is used to connect
     */
    connect = async () => {
        this.closeModal();
        await this.props.connect({userId: this.connection.connectionId});
        this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN, {
            channelUrl: this.state.channelUrl
        })
    };

    /**
     * @function navigateToRequestAppointment
     * @description This method is used to navigate request appoointment
     */
    navigateToRequestAppointment = () => {
        this.closeModal();
        const isPatientProhibitive=this.checkPatientProhibitive()
        if(isPatientProhibitive)
        {
            this.props.navigation.navigate(Screens.MEMBER_PROHIBITIVE_SCREEN, {
                selectedMember: this.state.selectedMember
            });
        }else
        {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
                selectedMember: this.state.connection
            });
        }

    };

    checkPatientProhibitive = () =>{
        const contactNotes=this.state.connection?.contactNotes
        let isPatientProhibitive = false
        for (let contactNote of contactNotes) {
            if(contactNote.flag === CONTACT_NOTES_FLAGS.PROHIBITIVE && contactNote.status===CONTACT_NOTES_STATUS.ACTIVE)
            {
                isPatientProhibitive=true;
                break;
            }
        }
        return isPatientProhibitive;
    }
    /**
     * @function navigateToChat
     * @description This method is used to navigate to chat
     */
    navigateToChat = () => {
        this.closeModal();
        /* this.props.navigation.navigate(Screens.LIVE_CHAT, {
             connection: this.state.connection
         });*/
        const resetAction = StackActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({routeName: Screens.TAB_VIEW}),
                NavigationActions.navigate({
                    routeName: Screens.LIVE_CHAT, params: {
                        connection: this.state.connection
                    }
                }),
            ],
        });
        this.props.navigation.dispatch(resetAction);
    };


    /**
     * @function populateData
     * @description This method is used to populate data
     */
    populateData = (ActiveInActiveOptions, inActiveChat) => {
        return ActiveInActiveOptions.map(item => {
            return {
                ...item,
                value: (inActiveChat && item.id === "activeChat") ? true : (!inActiveChat && item.id === "inActiveChat")
            }
        });
    }

    /**
     * @function updateChatStatus
     * @description This method is used to update chat status
     */
    updateChatStatus = async () => {
        const {connectionId} = this.state.connection;
        const {activeInActiveChatStatus} = this.state;
        const inActiveChat = activeInActiveChatStatus[0].value === true;
        this.setState({isLoading: true});

        try {
            let response = await ProfileService.updateChatStatus(connectionId, inActiveChat);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({
                    optionsMenu: false,
                    chatStatusModalVisible: false,
                    isLoading: false
                });
            } else {
                AlertUtil.showSuccessMessage("Chat Status updated successfully");
                this.props.refreshConnections();
                this.setState({
                    optionsMenu: false,
                    chatStatusModalVisible: false,
                    isLoading: false
                })
            }
        } catch (e) {
            console.log(e)
            this.setState({isLoading: false});
        }
    }

    /**
     * @function updateLevelOfEngagement
     * @description This method is used to update level of Engagement
     */
    updateLevelOfEngagement = async () => {
        try {
            this.setState({isLoading: true});
            const {connection,selectedEngagementLevel} = this.state;
            let response = await ProfileService.updateLevelOfEngagement(connection?.connectionId, selectedEngagementLevel?.id);
            if (response?.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({
                    openModal: false,
                    isLoading: false
                });
            } else {
                AlertUtil.showSuccessMessage("Level of Engagement updated successfully");
                this.props.refreshConnections();
                this.setState({
                    openModal: false,
                    isLoading: false
                })
            }
        } catch (e) {
            console.log(e);
            this.setState({
                openModal: false,
                isLoading: false
            });

        }
    }

    /**
     * @function setChatStatus
     * @description This method is used to set chat status
     */
    setChatStatus = (listValue) => {
        let {activeInActiveChatStatus} = this.state;
        if (listValue.item.value === false) {
            const updateData = activeInActiveChatStatus.map(item => {
                return {
                    ...item,
                    value: !item.value,
                }
            })
            this.setState({activeInActiveChatStatus: updateData})
        }
    }

    /**
     * @function setEngagementLevel
     * @description This method is used to set selected engagement level
     */
    setEngagementLevel = (listValue) => {
        this.setState({selectedEngagementLevel : listValue?.item});
    }


    /**
     * @function renderViewMore
     * @description This method is used to render more content
     */

    renderViewMore = (onPress) => {
        return (
            <View style={styles.readMoreButton}>
                <Text style={styles.readMoreButtonText} onPress={onPress}>Read more</Text>
                <FeatherIcons onPress={onPress} size={24} color={Colors.colors.primaryIcon} name="arrow-right"/>
            </View>
        )
    }

    /**
     * @function renderViewLess
     * @description This method is used to render less
     */


    renderViewLess = (onPress) => {
        return (
            <View style={styles.readMoreButton}>
                <Text style={styles.readMoreButtonText} onPress={onPress}>Read less</Text>
                <FeatherIcons onPress={onPress} size={24} color={Colors.colors.primaryIcon} name="arrow-up"/>
            </View>
        )
    }



    /**
     * @function renderOption
     * @description This method is used to render each option from the list
     */
    renderOption = (listValue) => {
        const {modalDetails,selectedEngagementLevel} = this.state;
        const isChecked = modalDetails?.ref === "modalLevelOfEngagement" ? listValue?.item?.id === selectedEngagementLevel?.id : listValue.item.value;
        return (
            <ListItem
                {...addTestID(listValue.item.id)}
                key={listValue.item.id}
                onPress={() => {
                    if (modalDetails?.ref === "modalLevelOfEngagement") {
                        this.setEngagementLevel(listValue);
                    } else {
                        this.setChatStatus(listValue)
                    }
                }}
                style={listValue.item.value
                    ? styles.multiListSelected
                    : styles.multiList}
            >
                <View style={styles.checkListText}>
                    <Text style={styles.multiListText}>{listValue?.item?.name}</Text>
                    <ViewMoreText
                        numberOfLines={3}
                        renderViewMore={this.renderViewMore}
                        renderViewLess={this.renderViewLess}
                        textStyle={{textAlign: 'left'}}>
                        <Text numberOfLines={3} style={styles.multiListSubText}>{listValue?.item?.description}</Text>
                    </ViewMoreText>

                </View>

                <CheckBox
                    {...addTestID(this.props.checkTestId)}
                    checkedIcon="check"
                    iconType='Feather'
                    size={24}
                    checkedColor={Colors.colors.whiteColor}
                    uncheckedIcon=""
                    containerStyle={
                        isChecked ? [styles.multiCheck, styles.multiCheckSelected] : styles.multiCheck
                    }
                    checked={isChecked}
                    onPress={() => {
                        if (modalDetails?.ref === "modalLevelOfEngagement") {
                            this.setEngagementLevel(listValue);
                        } else {
                            this.setChatStatus(listValue)
                        }
                    }}

                />

            </ListItem>
        )
    }

    /**
     * @function backModal
     * @description This method is used to navigate to back
     */
    backModal = () => {
        this.closeModal();
    }

    /**
     * @function findConnection
     * @description This method is used to find connection details
     */
    findConnection = (connectionId) => {
        return this.props.connections?.activeConnections?.find(connection => connection.connectionId === connectionId);
    };


    /**
     * @function getRenderModalDetails
     * @description This method is used to get render modal details
     */
    getRenderModalDetails = (type) => {
        switch (type) {
            case 'modalButtonOptions' :
                return {ref: "modalButtonOptions", maxHeight: null, method: () => this.renderButtonOptions()};
            case 'modalChatStatus' :
                return {ref: "modalChatStatus", maxHeight: null, method: () => this.renderChatStatusSection()};
            case 'modalLevelOfEngagement' :
                return {
                    ref: "modalLevelOfEngagement",
                    maxHeight: '70%',
                    method: () => this.renderLevelOfEngagementSection()
                };
            default :
                return null
        }
    }


    /**
     * @function renderPageMainModal
     * @description This method is used to render page main model.
     */
    renderPageMainModal = () => {
        const {modalDetails} = this.state;
        return (<Modal
            backdropPressToClose={true}
            backdropColor={Colors.colors.overlayBg}
            backdropOpacity={1}
            isOpen={this.state.openModal}
            onClosed={() => {
                this.setState({openModal: false, modalDetails: null, modalType: ''})
            }}
            style={{
                ...CommonStyles.styles.commonModalWrapper,
                //maxHeight: this.state.modalDetails?.maxHeight,
                height: modalDetails?.maxHeight || 'auto',
                position: 'absolute',
                paddingLeft: modalDetails.ref === 'modalButtonOptions' ? 24 : 0,
                paddingRight: modalDetails.ref === 'modalButtonOptions' ? 24 : 0,
                paddingBottom: isIphoneX() ? 35 : 0
            }}
            entry={"bottom"}
            position={"bottom"}
            ref={this.state.modalDetails?.ref}
            swipeArea={100}>
            <View style={{...CommonStyles.styles.commonSwipeBar}}/>
            {this.state.modalDetails?.method()}
        </Modal>)
    }

    /**
     * @function openModal
     * @description This method is used for open modal.
     */
    openModal = (type) => {
        this.setState({modalDetails: this.getRenderModalDetails(type), openModal: true})
    }

    /**
     * @function closeModal
     * @description This method is used for closing modal.
     */
    closeModal = () => {
        this.setState({modalDetails: null,openModal: false})
    }


    /**
     * @function renderButtonOptions
     * @description This method is used to render Button options
     */
    renderButtonOptions = () => {
        const {connection} = this.state;
        const isConnected = !!this.props.connections.activeConnections.find(conn => conn.connectionId === connection?.connectionId);
        return (
            <View>
                {
                    isConnected && (
                        <View style={styles.btnOptions}>
                            <TransactionSingleActionItem
                                title={'Disconnect'}
                                iconBackground={Colors.colors.whiteColor}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <MaterialComIcons size={24} color={Colors.colors.errorIcon}
                                                      name="link-variant-off"/>
                                }
                                onPress={this.disconnect}
                            />
                        </View>
                    )
                }

                {
                    isConnected && (
                        <View style={styles.btnOptions}>
                            <TransactionSingleActionItem
                                title={'Update chat status'}
                                iconBackground={Colors.colors.whiteColor}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <Image
                                        style={styles.planImage}
                                        resizeMode="contain"
                                        source={require("../../assets/images/chat-status.png")}
                                    />
                                }
                                onPress={() => {
                                    this.closeModal();
                                    setTimeout(()=>{
                                        this.openModal('modalChatStatus')
                                    },1000)
                                }}
                            />
                        </View>
                    )
                }

                {
                    isConnected && (
                        <View style={styles.btnOptions}>
                            <TransactionSingleActionItem
                                title={'Update level of engagement'}
                                iconBackground={Colors.colors.whiteColor}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <Icon name={'edit-2'} type={'Feather'} size={24}
                                          style={{color: Colors.colors.primaryIcon, fontSize: 24}}
                                    />
                                }
                                onPress={() => {
                                    this.closeModal();
                                    setTimeout(() => {
                                        this.openModal('modalLevelOfEngagement')
                                    }, 1000)
                                }}
                            />
                        </View>
                    )
                }

                {
                    isConnected && (
                        <View style={styles.btnOptions}>
                            <TransactionSingleActionItem
                                title={'Request Appointment'}
                                iconBackground={Colors.colors.whiteColor}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <Icon name={'calendar'} type={'Feather'} size={24}
                                          style={{color: Colors.colors.primaryIcon, fontSize: 24}}
                                    />
                                }
                                onPress={this.navigateToRequestAppointment}
                            />
                        </View>
                    )
                }

                {
                    !isConnected && (
                        <View style={styles.btnOptions}>
                            <TransactionSingleActionItem
                                title={"Connect"}
                                iconBackground={Colors.colors.whiteColor}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <Icon size={24} style={{color: Colors.colors.successIcon, fontSize: 24}}
                                          name="link-2" type={'Feather'}/>
                                }
                                onPress={this.connect}
                            />
                        </View>
                    )
                }

                {
                    isConnected && (
                        <View style={styles.btnOptions}>
                            <TransactionSingleActionItem
                                title={'Go to chat'}
                                iconBackground={Colors.colors.whiteColor}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <Icon name={'message-circle'} type={'Feather'} size={24}
                                          style={{color: Colors.colors.primaryIcon, fontSize: 24}}
                                    />
                                }
                                onPress={this.navigateToChat}
                            />
                        </View>
                    )
                }


            </View>
        )
    }

    /**
     * @function renderChatStatusSection
     * @description This method is used to render chat status section
     */
    renderChatStatusSection = () => {
        const {activeInActiveChatStatus} = this.state;
        return (
            <View
                onLayout={(event) => this.onLayout(event)}
                style={{...styles.actionList,  marginBottom: Platform.OS === 'ios' ? 20 : 40}}>
                <View style={{
                    ...styles.btnOptions, display: 'flex', alignItems: 'center',
                    flexDirection: 'row', paddingRight: 24, marginLeft: 0
                }}>
                    <Button
                        {...addTestID('back-btn')}
                        transparent
                        style={styles.backButton}
                        onPress={this.backModal}>
                        <EntypoIcons size={30} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                    </Button>
                    <Text style={styles.mainHeading}>Update chat status</Text>
                </View>
                <View style={{marginBottom: 32}}>
                    <FlatList
                        data={activeInActiveChatStatus}
                        renderItem={this.renderOption}
                        keyExtractor={item => item.name}
                    />
                </View>
                <View style={styles.gradientWrapper}>
                    <PrimaryButton
                        testId="edit-profile"
                        onPress={() => {
                            this.updateChatStatus()
                        }}
                        text={"Update chat status"}/>
                </View>
            </View>
        )
    }


    /**
     * @function getEmptyMessages
     * @description This method is used to render empty state
     */
    getEmptyMessages = (type) => {
        let emptyStateMsg = '';
        let emptyStateHead = '';
        switch (type) {
            case 'LEVEL_OF_ENGAGEMENT': {
                emptyStateHead = 'No engagement levels';
                emptyStateMsg = 'Right now we dont have engagement levels. If you don’t think this is right, then reach out to your provider.';
                break;
            }
            case 'CONNECTION': {
                emptyStateHead = 'Not a connection';
                emptyStateMsg = `You're not connected with current user. If you don’t think this is right, then check your scheduled appointments or reach out to your provider.`;
                break;
            }
        }
        return (
            <View style={styles.emptyView}>
                <LottieView
                    ref={animation => {
                        this.animation = animation;
                    }}
                    style={styles.emptyAnim}
                    resizeMode="cover"
                    source={alfie}
                    autoPlay={true}
                    loop/>
                <Text style={styles.emptyTextMain}>{emptyStateHead}</Text>
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
            </View>
        );
    };

    /**
     * @function renderLevelOfEngagementSection
     * @description This method is used to render level of Engagement Section
     */
    renderLevelOfEngagementSection = () => {
        const {levelOfEngagements,selectedEngagementLevel} = this.state;
        if(levelOfEngagements?.length>0) {
            const isDisabled = (!selectedEngagementLevel || ( this.connection?.levelOfEngagement?.id === selectedEngagementLevel?.id));
            return (
                <View style={{flex: 1}}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        //onLayout={(event) => this.onLayout(event)}
                        onScroll={({nativeEvent}) => {
                            if (
                                isCloseToBottom(nativeEvent) &&
                                this.state.hasMore &&
                                this.state.isLoadingMore !== true
                            ) {
                                this.fetchLevelOfEngagements(true);
                            }
                        }}
                        style={styles.actionList}>
                        <View style={{
                            ...styles.btnOptions, display: 'flex', alignItems: 'center',
                            flexDirection: 'row', paddingRight: 24, marginLeft: 0,
                        }}>
                            <Button
                                {...addTestID('back-btn')}
                                transparent
                                style={styles.backButton}
                                onPress={this.backModal}>
                                <EntypoIcons size={30} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                            </Button>
                            <Text style={styles.mainHeading}>Level of engagement</Text>
                        </View>
                        <View style={{marginBottom: 32}}>
                            <FlatList
                                data={levelOfEngagements}
                                renderItem={this.renderOption}
                                keyExtractor={item => item.id}
                            />
                        </View>
                    </ScrollView>
                    <View style={{
                        ...styles.actionList,
                        marginTop: 25,
                        marginBottom: Platform.OS === 'ios' ? 20 : 40,
                        paddingLeft: 24,
                        paddingRight: 24
                    }}>
                        <PrimaryButton
                            testId="edit-level-of-engagement"
                            disabled={isDisabled}
                            onPress={() => {
                                this.updateLevelOfEngagement()
                            }}
                            bgColor={isDisabled ? Colors.colors.primaryColorBG :  Colors.colors.mainBlue }
                            text={"Update level of engagement"}/>
                    </View>
                </View>
            )
        }else{
            return this.getEmptyMessages("LEVEL_OF_ENGAGEMENT")
        }
    }


    render() {
        const {connection, openModal, modalDetails} = this.state;
        let {activeSegmentId} = this.state;
        const isConnected = !!this.props.connections.activeConnections.find(conn => conn.connectionId === connection?.connectionId);
        const isRequested = !!this.props.connections.requestedConnections.find(con => con.connectionId === this.connection.connectionId)
        let tabs = [
            {title: 'EMR', segmentId: 'emr'},
            {title: 'Plan', segmentId: 'plan'},
        ];
        if (!isConnected) {
            activeSegmentId = 'emr';
        }

        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left onPress={this.goBack} style={{flex: 0, width: 64}}>
                        <Button
                            {...addTestID('back-btn')}
                            transparent
                            style={styles.backButton}
                            onPress={this.goBack}>
                            <EntypoIcons size={30} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                        </Button>


                    </Left>
                    <Body/>
                    <Right>
                        {
                            isConnected && (
                                <Button
                                    {...addTestID('back-btn')}
                                    transparent
                                    style={styles.rightButton}
                                    onPress={() => {
                                        this.openModal('modalButtonOptions')
                                    }}>
                                    <FeatherIcons size={30} color={Colors.colors.mainBlue}
                                                  name="more-horizontal"/>
                                </Button>
                            )
                        }
                    </Right>
                </Header>
                <Content
                    scrollIndicatorInsets={{right: 1}}
                    showsVerticalScrollIndicator={false}
                    style={styles.contentWrapper}>

                    {connection && (
                        <View style={styles.newMemberBox}>
                            <View style={styles.newMemberCard}>
                                {connection?.profilePicture ?
                                    <View style={{
                                        // backgroundColor: this.getProfileColorByFlag([]),
                                        backgroundColor: Colors.colors.whiteColor,
                                        width: 120,
                                        height: 120,
                                        borderRadius: 60,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderColor : this.state.profileHighlightedColor,
                                        borderWidth :  this.state.profileHighlightedColor ? 2 : 0
                                    }}>
                                        <Image
                                            {...addTestID('user-profile-pic')}
                                            style={{...styles.newMemberImg,
                                                backgroundColor: connection?.colorCode ? connection?.colorCode : DEFAULT_AVATAR_COLOR,
                                        }}
                                            resizeMode={'cover'}
                                            source={{
                                                uri: connection.profilePicture
                                                    ? S3_BUCKET_LINK +
                                                    connection.profilePicture
                                                    : S3_BUCKET_LINK + DEFAULT_IMAGE,
                                            }}
                                            alt="FAIcon"
                                        />
                                    </View>
                                    :
                                    <View style={{
                                        // backgroundColor: this.getProfileColorByFlag([]),
                                        backgroundColor: Colors.colors.whiteColor,
                                        width: 120,
                                        height: 120,
                                        borderRadius: 60,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderColor : this.state.profileHighlightedColor,
                                        borderWidth : this.state.profileHighlightedColor ? 2 : 0
                                    }}>
                                        <View
                                            {...addTestID('user-profile-image')}
                                            style={{
                                                ...styles.newProBg,
                                                backgroundColor: connection?.colorCode ? connection?.colorCode : DEFAULT_AVATAR_COLOR,

                                            }}>
                                            <Text
                                                style={styles.newProLetter}>{connection?.name.charAt(0).toUpperCase()}</Text></View>
                                    </View>
                                }
                                <View style={styles.memberInfo}>
                                    <Text {...addTestID('member-name')}
                                          style={styles.newMemberName}>{
                                        connection?.name
                                            ? connection?.name
                                            : ''}</Text>

                                    <Text style={styles.pointText}>
                                        {connection?.firstName} {connection?.lastName}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                    {connection && isConnected && (
                        <View style={{
                            paddingHorizontal: 24,
                            marginTop: 24,
                            // ...CommonStyles.styles.headerShadow
                        }}>
                            <CommonSegmentHeader
                                segments={tabs}
                                segmentChanged={(segmentId) => {
                                    this.setState({activeSegmentId: segmentId});
                                }}
                                setTabControl={callback => {
                                    this.setState({changeSegmentTab: callback});
                                }}
                            />
                        </View>
                    )}

                    {connection ?
                        <View style={{paddingHorizontal: 24, marginTop: 24}}>
                            {
                                activeSegmentId === 'emr' && this.renderEMR(isConnected)
                            }
                            {
                                activeSegmentId === 'plan' && this.renderPlan()
                            }

                        </View>
                        :
                        this.getEmptyMessages("CONNECTION")
                    }
                </Content>


                {activeSegmentId === 'plan' && !this.state.planLoading && <View
                    {...addTestID('view')}
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId="schedule"
                        iconName='plus'
                        type={'Feather'}
                        color={Colors.colors.whiteColor}
                        onPress={() => {
                            // this.props.nextStep(this.props.selectedItem)
                            this.props.navigation.navigate(Screens.ADD_PLAN_ITEMS_SCREEN, {
                                connection: this.state.connection,
                                assignedPlanItems: this.state.contextPlanItems
                            });
                        }}
                        text="Add to Plan"
                        size={24}
                    />

                </View>
                }

                {!isConnected && (
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>
                        <PrimaryButton
                            testId="connect"
                            iconName='user'
                            type={'Feather'}
                            color={Colors.colors.whiteColor}
                            onPress={this.connect}
                            disabled={isRequested ? true : false}
                            text={isRequested ? "Requested" : "Connect"}
                            size={24}
                        />
                    </View>
                )}
                {openModal && modalDetails && this.renderPageMainModal()}
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    backButton: {
        marginLeft: 15,
        width: 30,
    },
    rightButton: {
        // width: 30,
        marginRight: 10
    },
    header: {
        height: HEADER_SIZE,
        paddingLeft: 3,
        paddingRight: 0
    },
    contentWrapper: {
        backgroundColor: '#f7f9ff',
    },
    newMemberBox: {
        paddingHorizontal: 32
    },
    newMemberCard: {

        display: 'flex',
        flexDirection: 'row',
        // paddingTop: 50

    },
    memberInfo: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 24
    },
    newMemberImg: {
        width: 112,
        height: 112,
        borderRadius: 56,
        overflow: 'hidden',
        borderColor: Colors.colors.borderColor
    },
    newProBg: {
        width: 112,
        height: 112,
        borderRadius: 56,
        justifyContent: 'center',
        alignItems: 'center'
    },
    newProLetter: {
        ...TextStyles.mediaTexts.manropeExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.white,
        textTransform: 'uppercase'
    },
    newMemberName: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginTop: 8,
        // marginBottom: 4,
        textAlign: 'center',
    },
    pointText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.mediumContrast,
    },
    singleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 12
    },
    settingIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.colors.highContrastBG,
        paddingTop: 0,
        paddingBottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    settingIcon: {
        fontSize: 24,
        color: Colors.colors.neutral100Icon,
        marginLeft: 0,
        marginRight: 0
    },
    itemDetail: {
        flex: 2,
        paddingLeft: 12
    },
    itemName: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast
    },
    itemDes: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast
    },
    itemNextButton: {
        marginRight: 0,
        paddingRight: 0
    },
    planContent: {
        // paddingTop: 56,
    },
    planContentWrapper: {
        ...CommonStyles.styles.shadowBox,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        width: "100%",
        padding: 24,
        // marginVertical: 40,
    },
    planContentTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
    },
    planContentSubTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        paddingLeft: 24,
        paddingRight: 24,
        alignItems: "center",
        justifyContent: "center",
        // alignSelf: "center",
        textAlign: "center",
    },
    headerStyles: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.bodyTextL,
    },
    headerBgStyles: {
        backgroundColor: Colors.colors.screenBG,

    },
    bodyStyle: {
        paddingLeft: -20,
        marginLeft: 0,
        width: "100%",
        marginVertical: 0,
        paddingVertical: 0,
    },
    itemQty: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextS,
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    planImage: {
        marginBottom: 16,
        alignSelf: "center",
    },
    btnOptions: {
        marginBottom: 8,
    },
    modalHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },

    multiList: {
        borderBottomWidth: 0,
        borderColor: Colors.colors.mediumContrastBG,
        marginLeft: 0,
        paddingTop: 20,
        paddingBottom: 20,
        paddingRight: 24,
        borderRadius: 8,
    },
    multiListSelected: {
        borderBottomWidth: 0,
        borderColor: Colors.colors.mediumContrastBG,
        backgroundColor: Colors.colors.mainBlue05,
        marginLeft: 0,
        paddingRight: 24,
        paddingTop: 20,
        paddingBottom: 20,
    },

    checkListText: {
        paddingRight: 24,
        paddingLeft: 24,
        flex: 1,
        flexDirection: 'column',
    },
    multiListText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        alignSelf: 'flex-start'
    },
    multiListSubText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.mediumContrast,
        alignSelf: 'flex-start'
    },
    multiCheck: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        color: Colors.colors.mainBlue,
        padding: 0,
    },
    multiCheckSelected: {
        borderWidth: 1,
        borderColor: Colors.colors.mainBlue,
        color: Colors.colors.whiteColor,
        backgroundColor: Colors.colors.mainBlue,
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        paddingBottom: 20
    },
    emptyAnim: {
        width: '90%',
        // alignSelf: 'center',
        marginBottom: 30,
    },
    emptyTextMain: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        alignSelf: 'center',
        marginBottom: 8
    },
    emptyTextDes: {
        alignSelf: 'center',
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        marginBottom: 32
    },
    gradientWrapper: {
        paddingLeft: 20,
        paddingRight: 20
    },
    mainHeading : {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
    },
    readMoreButton: {display: 'flex', flexDirection: 'row', marginTop: 8,},
    readMoreButtonText: {
        ...TextStyles.mediaTexts.linkTextM,
        color: Colors.colors.primaryText,
        marginRight: 8,
    },
});
export default connectConnections()(MemberEMRDetailsScreen);
