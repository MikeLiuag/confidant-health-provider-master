import React, {Component} from 'react';
import {Platform, StatusBar, StyleSheet, Image, ScrollView, TouchableOpacity, Linking} from 'react-native';
import {Container, Text, View,Left, Body, Title, Button, Right, Header, Content, Icon} from 'native-base';
import {
    Colors,
    TextStyles,
    CommonStyles,
    TransactionSingleActionItem,
    PrimaryButton,
    getHeaderHeight, isIphoneX, addTestID
} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import Modal from 'react-native-modalbox';
import EntypoIcons from "react-native-vector-icons/Entypo";
import {CommonMemberCard} from '../../components/group/CommonMemberCard';
import FeatherIcons from "react-native-vector-icons/Feather";

const HEADER_SIZE = getHeaderHeight();

export default class NewGroupDetailsScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            activeSegmentId: null
        };
    }

    goBack = () => {
        this.props.navigation.goBack();
    };


    componentDidMount(): void {

    }

    componentWillUnmount(): void {

    }

    showMoreOptions = () => {
        this.refs.modalMoreOptions.open();
    };

    hideMoreOptions = () => {
        this.refs.modalMoreOptions.close();
    };

    navigateToEdit = () => {
        this.props.navigation.navigate(Screens.NEW_EDIT_GROUP_DETAILS_SCREEN);
    }

    navigateToManage = () => {
        this.props.navigation.navigate(Screens.MANAGE_GROUP_MEMBERS_SCREEN);
    }

    render = () => {
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <Button
                            onPress={this.goBack}
                            transparent
                            style={styles.backButton}>
                            <EntypoIcons size={30} color={Colors.colors.white} name="chevron-thin-left"/>
                        </Button>
                    </Left>
                    <Body />
                    <Right>
                        <Button
                            onPress={this.showMoreOptions}
                            transparent
                            style={styles.moreBtn}>
                            <Icon style={styles.moreIcon} type={'Feather'} name="more-horizontal"/>
                        </Button>
                    </Right>
                </Header>
                <Content showsVerticalScrollIndicator={false}
                         style={styles.contentWrapper}>
                    <View style={styles.bgImgWrapper}>
                        <Image
                            style={styles.groupBgImg}
                            resizeMode={'cover'}
                            source={require('../../assets/images/group-img-3.png')}/>
                    </View>
                    <View style={styles.groupContent}>
                        <Text style={styles.groupMainTitle}>Healthier habits</Text>
                        <View style={styles.timeTypeWrap}>
                            <Text style={styles.timeText}>Thursdays, 6-7 pm</Text>
                            <View style={styles.greyDot}></View>
                            <Text style={styles.anonymousText}>Anonymous group</Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}>
                            <View style={styles.groupTags}>
                                <View style={styles.singleTag}>
                                    <Text style={styles.tagText}>Reducing Drinking</Text>
                                </View>
                                <View style={styles.singleTag}>
                                    <Text style={styles.tagText}>Reducing Drug Use</Text>
                                </View>
                                <View style={styles.singleTag}>
                                    <Text style={styles.tagText}>Goal Setting</Text>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.groupActionList}>
                            <View style={styles.singleOption}>
                                <TransactionSingleActionItem
                                    title={'Edit group'}
                                    onPress={this.navigateToEdit}
                                    iconBackground={Colors.colors.primaryColorBG}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <FeatherIcons size={22} color={Colors.colors.primaryIcon} name="edit-2"/>
                                    }
                                />
                            </View>
                            <View style={styles.singleOption}>
                                <TransactionSingleActionItem
                                    title={'Manage group members'}
                                    onPress={this.navigateToManage}
                                    iconBackground={Colors.colors.warningBG}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <FeatherIcons size={22} color={Colors.colors.warningIcon} name="users"/>
                                    }
                                />
                            </View>
                            <View style={styles.singleOption}>
                                <TransactionSingleActionItem
                                    title={'Share group'}
                                    iconBackground={Colors.colors.secondaryColorBG}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <FeatherIcons size={22} color={Colors.colors.secondaryIcon} name="share"/>
                                    }
                                />
                            </View>
                        </View>

                        <View style={styles.scheduleList}>
                            <View style={styles.singleSchedule}>
                                <Text style={styles.scheduleDay}>Every Monday</Text>
                                <Text style={styles.scheduleTime}>6-7 pm</Text>
                            </View>
                            <View style={styles.singleSchedule}>
                                <Text style={styles.scheduleDay}>Every Wednesday</Text>
                                <Text style={styles.scheduleTime}>6-7 pm</Text>
                            </View>
                            <View style={styles.singleSchedule}>
                                <Text style={styles.scheduleDay}>Every Friday</Text>
                                <Text style={styles.scheduleTime}>6-7 pm</Text>
                            </View>
                        </View>

                        <View style={styles.groupDes}>
                            <Text style={styles.groupDesTitle}>About this group</Text>
                            <Text style={styles.groupPara}>
                                Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniamont and a bunch more information.
                            </Text>
                            <Text style={styles.groupPara}>
                                Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniamont and a bunch more information.
                            </Text>
                            <Text style={styles.groupDesTitle}>Who can benefit</Text>
                            <View style={styles.benefitList}>
                                <View style={styles.singleBenefit}>
                                    <Icon style={styles.arrowIcon} type={'FontAwesome'} name="long-arrow-right"/>
                                    <Text style={styles.benefitText}>Clients seeing providers</Text>
                                </View>
                                <View style={styles.singleBenefit}>
                                    <Icon style={styles.arrowIcon} type={'FontAwesome'} name="long-arrow-right"/>
                                    <Text style={styles.benefitText}>Family members</Text>
                                </View>
                                <View style={styles.singleBenefit}>
                                    <Icon style={styles.arrowIcon} type={'FontAwesome'} name="long-arrow-right"/>
                                    <Text style={styles.benefitText}>Self-directed clients</Text>
                                </View>
                            </View>
                            <Text style={styles.groupDesTitle}>Rules of this group</Text>
                            <View style={styles.benefitList}>
                                <View style={styles.singleBenefit}>
                                    <Icon style={styles.arrowIcon} type={'Feather'} name="check-square"/>
                                    <Text style={styles.benefitText}>Lorem ipsum dolor sit amet, consectet</Text>
                                </View>
                                <View style={styles.singleBenefit}>
                                    <Icon style={styles.arrowIcon} type={'Feather'} name="check-square"/>
                                    <Text style={styles.benefitText}>Lorem ipsum dolor sit amet, consectet</Text>
                                </View>
                                <View style={styles.singleBenefit}>
                                    <Icon style={styles.arrowIcon} type={'Feather'} name="check-square"/>
                                    <Text style={styles.benefitText}>Lorem ipsum dolor sit amet, consectet</Text>
                                </View>
                            </View>
                            <Text style={styles.groupDesTitle}>Group organizer</Text>
                            <View style={styles.organizerWrap}>
                                <CommonMemberCard
                                    nameText={'Willard Purnell'}
                                    roleText={'Coach'}
                                />
                            </View>
                            <Text style={styles.groupDesTitle}>Group members</Text>
                            <View style={styles.memberList}>
                                <CommonMemberCard
                                    nameText={'Jane Cooper'}
                                    roleText={'Provider'}
                                />
                                <CommonMemberCard
                                    nameText={'Willard Purnell'}
                                    roleText={'Coach'}
                                />
                                <CommonMemberCard
                                    nameText={'Sharon Hanford'}
                                    roleText={'Matchmaker'}
                                />
                                <CommonMemberCard
                                    nameText={'Willard Purnell'}
                                    roleText={'Coach'}
                                />


                            </View>
                        </View>
                    </View>
                </Content>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.hideMoreOptions}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '45%'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalMoreOptions"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.singleOption}>
                            <TransactionSingleActionItem
                                title={'Edit group'}
                                onPress={this.navigateToEdit}
                                iconBackground={Colors.colors.primaryColorBG}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <FeatherIcons size={22} color={Colors.colors.primaryIcon} name="edit-2"/>
                                }
                            />
                        </View>
                        <View style={styles.singleOption}>
                            <TransactionSingleActionItem
                                title={'Share group'}
                                iconBackground={Colors.colors.secondaryColorBG}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <FeatherIcons size={22} color={Colors.colors.secondaryIcon} name="share"/>
                                }
                            />
                        </View>
                        <View style={styles.singleOption}>
                            <TransactionSingleActionItem
                                title={'Invite Members'}
                                iconBackground={Colors.colors.warningBG}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <FeatherIcons size={22} color={Colors.colors.warningIcon} name="user-plus"/>
                                }
                            />
                        </View>
                    </Content>
                </Modal>





            </Container>
        );
    };
}


const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingHorizontal: 24,
        elevation: 0,
        height: HEADER_SIZE,
    },
    backButton: {
        marginLeft: 0,
        paddingLeft: 0
    },
    moreBtn: {
        marginRight: 0,
        paddingRight: 0
    },
    moreIcon: {
        color: Colors.colors.white,
        fontSize: 30
    },
    contentWrapper: {
        marginTop: -130,
        zIndex: -1
    },
    bgImgWrapper: {
        height: 320,
        zIndex: -1
    },
    groupBgImg: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%'
    },
    groupContent: {
        paddingVertical: 24
    },
    groupMainTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        paddingHorizontal: 24
    },
    timeTypeWrap: {
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center'
    },
    timeText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.lowContrast
    },
    greyDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.neutral50Icon,
        marginHorizontal: 8
    },
    anonymousText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.lowContrast
    },
    groupTags: {
        marginVertical: 24,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center'
    },
    singleTag: {
        backgroundColor: Colors.colors.highContrastBG,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginRight: 4
    },
    tagText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast
    },
    groupActionList: {
        paddingHorizontal: 24,
        marginTop: 16
    },
    scheduleList: {
        paddingHorizontal: 24,
        marginTop: 40,
        marginBottom: 16
    },
    singleSchedule: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 24,
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: Colors.colors.borderColor
    },
    scheduleDay: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },
    scheduleTime: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.secondaryText
    },
    groupDes: {
        paddingHorizontal: 24
    },
    groupDesTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
        marginBottom: 16
    },
    groupPara: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        marginBottom: 16
    },
    benefitList: {
        marginVertical: 16
    },
    singleBenefit: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    arrowIcon: {
        fontSize: 24,
        color: Colors.colors.secondaryIcon,
        marginRight: 12
    },
    benefitText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.mediumContrast,
    },
    organizerWrap: {
        paddingVertical: 16
    },
    memberList: {
        paddingVertical: 16
    },
    singleOption: {
        marginBottom: 16
    }
});
