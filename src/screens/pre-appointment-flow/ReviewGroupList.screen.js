import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image, FlatList, TouchableOpacity, ScrollView} from 'react-native';
import {Container, Content, Text, View } from 'native-base';
import {
    addTestID,
    isIphoneX,
    Colors,
    PrimaryButton,
    TextStyles,
    CommonStyles,
    AlertUtil,
    CustomModal,
    AlfieLoader, getAvatar
} from 'ch-mobile-shared';
import { PreApptHeader } from "../../components/pre-appointment/PreApptHeader.component";
import { ApptListItem } from "../../components/pre-appointment/ApptListItem.component";
import Modal from 'react-native-modalbox';
import AntIcons from 'react-native-vector-icons/AntDesign';
import {Screens} from '../../constants/Screens';
import ProfileService from "../../services/ProfileService";
import moment from "moment";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_Can.json";


export default class ReviewGroupListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.connection = navigation.getParam('connection', null);
        this.manualView = navigation.getParam('manualView', false);
        this.state = {
            groupsData: [],
            selectedGroup : null,
            isLoading: true,
            sessionDetails: [],
            modalHeightProps: {
                height: 0
            }
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };


    detailDrawerClose = () => {
        this.refs.modalDetailView.close();
        this.setState({
            modalHeightProps: {
                height: 0,

            }
        });
    };

    onLayout(event) {
        const {height} = event.nativeEvent.layout;
        const newLayout = {
            height: height
        };
        setTimeout(()=>{
            this.setState({ modalHeightProps: newLayout });
        }, 10)

    }

    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.REVIEW_CHATBOT_LIST_SCREEN, {
            connection : this.connection
        });
    };


    /**
     * @function getGroupDetails
     * @description This method is used to get Groups Details for given user.
     */

    getGroupDetails = async (item, userId) => {
        if(item.attendanceCount > 0) {
            try {
                const payload = {
                    channelUrl: item.channelUrl,
                    userId: userId
                }
                const sessionDetails = await ProfileService.getUserGroupDetails(payload);
                if (sessionDetails.errors) {
                    AlertUtil.showErrorMessage(sessionDetails.errors[0].endUserMessage);
                    this.setState({isLoading: false});
                } else {
                    this.setState({sessionDetails, isLoading: false, selectedGroup: item});
                    this.refs.modalDetailView.open();

                }


            } catch (e) {
                this.setState({isLoading: false});
                console.log(e)
            }
        }
    };



    /**
     * @function getGroupsListing
     * @description This method is used to get Groups Details for given user.
     */

    getGroupsListing = async () => {
        try {
            const groupsData = await ProfileService.getUserGroups(this.connection.connectionId);
            if (groupsData.errors) {
                AlertUtil.showErrorMessage(groupsData.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                if(groupsData.length>0) {
                    this.setState({groupsData,isLoading: false});
                } else {
                    if(this.manualView) {
                        this.setState({isLoading: false});
                    } else {
                        this.props.navigation.replace(Screens.REVIEW_CHATBOT_LIST_SCREEN, {
                            connection : this.connection
                        });
                    }

                }
            }
        } catch (e) {
            this.setState({isLoading: false});
            console.log(e)
        }
    };


    componentDidMount = async ()=> {
        await this.getGroupsListing();
    }


    getEmptyMessages = () => {
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
                <Text style={styles.emptyTextMain}>No groups joined</Text>
                <Text style={styles.emptyTextDes}>The member isn't participating in any group.</Text>

            </View>
        );
    };



    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <AlfieLoader/>;
        }

        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <PreApptHeader
                    onPress={this.backClicked}
                    headerText={'Review groups'}
                />
                <Content>
                    {
                        this.state.groupsData.length>0 ? (
                            <View style={styles.groupList}>
                                <FlatList
                                    data={this.state.groupsData}
                                    renderItem={({item, index}) =>
                                        <ApptListItem
                                            key={index}
                                            title={item.name}
                                            onPress={() => {
                                                this.getGroupDetails(item, this.connection.connectionId)
                                            }}
                                            attendanceCount={item.attendanceCount}
                                            date={item.joinedAt}
                                            groupImage={item.providerImage}
                                            showGroups={true}
                                        />

                                    }
                                    keyExtractor={item => item.id}
                                />


                            </View>
                        ): this.getEmptyMessages()
                    }

                </Content>
                {
                    !this.manualView && (
                        <View
                            {...addTestID('view')}
                            style={styles.greBtn}>
                            <PrimaryButton
                                testId = "continue"
                                onPress={this.navigateToNextScreen}
                                text="Continue"
                            />
                        </View>
                    )
                }



                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.detailDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper,
                        maxHeight: this.state.sessionDetails.length > 2 ? '70%' : '45%',
                        // bottom: this.state.modalHeightProps.height,
                        // maxHeight: 720
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalDetailView"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content
                        // style={{ maxHeight: 600}}
                        showsVerticalScrollIndicator={false}>

                        {this.state.selectedGroup &&
                        <View>
                            <Text
                                style={{...CommonStyles.styles.commonAptHeader}}>{this.state.selectedGroup.name ? this.state.selectedGroup.name : 'N/A'}</Text>
                            <View style={styles.contentWrapper}>
                                <Image
                                    style={styles.patientImg}
                                    resizeMode={'contain'}
                                    source={{uri: getAvatar({profilePicture: this.state.selectedGroup.groupImage})}}
                                />
                                <View style={styles.patientDetails}>
                                    <Text
                                        style={styles.infoTitle}>{this.state.selectedGroup.attendanceCount ? this.state.selectedGroup.attendanceCount : '0'} sessions
                                        attended</Text>
                                    <Text
                                        style={styles.infoContent}>{this.state.selectedGroup.joinedAt ? 'Joined on ' + moment.utc(this.state.selectedGroup.joinedAt).format('MMMM D, YYYY') : 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        }

                        {this.state.sessionDetails.length > 0 &&
                        <View style={styles.aptContent}>
                            <Text style={styles.contentHead}>Group sessions history</Text>
                            <View style={styles.sessionList}>

                                {this.state.sessionDetails.map(details =>

                                    <View style={styles.singleSession}>
                                        <Text
                                            style={styles.sessionDate}>{details.heldAt ? moment(details.heldAt, 'DD-MM-YYYY').format('MMMM D, YYYY') : 'N/A'}</Text>
                                        <Text style={styles.sessionStatus}>{details.attended ? 'Attended' : 'Missed'}</Text>
                                        <View style={styles.sessionIcon}>
                                            <AntIcons size={25}
                                                      color={details.attended ? Colors.colors.successIcon : Colors.colors.errorIcon}
                                                      name="check"/>
                                        </View>
                                    </View>
                                )}

                            </View>
                        </View>

                        }
                    </Content>
                </Modal>

            </Container>
        );
    }
}

const styles = StyleSheet.create({
    groupList: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 30,
        paddingBottom: 30
    },
    singleGroupEntry: {
        ...CommonStyles.styles.shadowBox,
        padding: 24,
        marginBottom: 8,
        borderRadius: 12
    },
    groupMainTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 12
    },
    contentWrapper: {
        flexDirection: 'row'
    },
    patientImg: {
        width: 48,
        height: 48,
        borderRadius: 24
    },
    patientDetails: {
        paddingLeft: 12
    },
    infoTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
    aptContent: {
        paddingTop: 30
    },
    contentHead: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        marginBottom: 24
    },
    sessionList: {

    },
    singleSession: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.colors.borderColor,
        paddingBottom: 16,
        marginBottom: 16
    },
    sessionDate: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextM,
        flex: 1
    },
    sessionStatus: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
    sessionIcon: {
        paddingLeft: 20,
        marginTop: -5
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
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
});
