import React, {Component} from 'react';
import {FlatList, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Body, Button, Container, Content, Header, Left, ListItem, Right, Text, Title} from 'native-base';
import {connectConnections} from '../../redux';
import {Screens} from '../../constants/Screens';
import {
    addTestID, AlertUtil,
    AlfieLoader,
    Colors, CommonStyles,
    getAvatar, getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    SecondaryButton,
    SliderSearch, TextStyles, valueExists,
} from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import Ionicon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import moment from "moment";
import EntypoIcons from "react-native-vector-icons/Entypo";
import {CONTACT_NOTES_FLAGS, CONTACT_NOTES_STATUS} from "../../constants/CommonConstants";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_Can.json";

const HEADER_SIZE = getHeaderHeight();

class AppointmentSelectMemberScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            selectedMember: null,
            listItems: [],
            filteredItems: [],
            showBack: true,
            stepperText: true
        };
    }

    async componentDidMount(): void {
        // const response = await AppointmentService.listProviders();
        // console.log(response);
        // if(response.errors) {
        //     AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
        //     this.setState({isLoading: false});
        // } else {
        let activeConnections = this.props.connections.activeConnections
            .filter(connection => connection.type === 'PATIENT')
            .sort((c1, c2) => {
                return moment(c2.lastModified).diff(c1.lastModified);
            });
        console.log(activeConnections)
        this.setState({listItems: activeConnections, filteredItems: activeConnections, isLoading: false});
        //     // this.setState({listItems: [], filteredItems: [], isLoading: false});
        // }
    }

    nextStep = () => {
        console.log(("nextStep**********"))
        const isPatientProhibitive = this.checkPatientProhibitive()
        if (isPatientProhibitive) {
            this.props.navigation.navigate(Screens.MEMBER_PROHIBITIVE_SCREEN, {
                selectedMember: this.state.selectedMember
            });
        } else {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
                selectedMember: this.state.selectedMember
            });
        }
    };

    checkPatientProhibitiveToMarkProfileRed = (item) => {

        const contactNotes = item?.contactNotes;
        let isPatientProhibitive = false;

        if (contactNotes?.length > 0) {
            for (let contactNote of contactNotes) {
                if (contactNote.flag === CONTACT_NOTES_FLAGS.PROHIBITIVE && contactNote.status === CONTACT_NOTES_STATUS.ACTIVE) {
                    isPatientProhibitive = true;
                    break;
                }
            }
        }
        return isPatientProhibitive;
    }

    checkPatientProhibitive = () => {
        const {selectedMember} = this.state
        const contactNotes = selectedMember?.contactNotes
        let isPatientProhibitive = false
        for (let contactNote of contactNotes) {
            if (contactNote.flag === CONTACT_NOTES_FLAGS.PROHIBITIVE && contactNote.status === CONTACT_NOTES_STATUS.ACTIVE) {
                isPatientProhibitive = true;
                break;
            }
        }
        return isPatientProhibitive;
    }

    openProfile = (connection) => {
        connection.userId = connection.connectionId;
        this.props.navigation.navigate(Screens.MEMBER_EMR_DETAILS_SCREEN, {
            connection
        });
    }

    propagate = (list) => {
        const filteredItems = list.members;
        let {selectedMember} = this.state;
        if (selectedMember) {
            let isMemberVisible = false;
            for (let member of filteredItems) {
                if (member.connectionId === selectedMember.connectionId) {
                    isMemberVisible = true;
                }
            }
            if (!isMemberVisible) {
                selectedMember = null;
            }
        }
        this.setState({filteredItems, selectedMember: selectedMember});
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };


    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return (<AlfieLoader/>);
        }
        console.log({items: this.state.filteredItems});
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header noShadow={false} transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <SliderSearch
                        options={{
                            screenTitle: 'Select Member',
                            searchFieldPlaceholder: 'Search Members',
                            listItems: {
                                members: this.state.listItems,
                            },
                            filter: (listItems, query) => {
                                return {
                                    members: listItems.members.filter(member =>
                                        member.name
                                            .toLowerCase()
                                            .includes(query.toLowerCase().trim()),
                                    ),
                                };
                            },
                            showBack: this.state.showBack,
                            backClicked: this.backClicked,
                        }}
                        propagate={this.propagate}
                    />
                </Header>
                <Content
                    scrollIndicatorInsets={{right: 1}}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{padding: 24}}>
                    <View style={styles.list}>
                        {this.state.filteredItems.length === 0 && (
                            <View>
                                <Text style={styles.noProText}>No Members found in your connections.</Text>
                            </View>
                        )}
                        <FlatList
                            scrollIndicatorInsets={{right: 1}}
                            showsVerticalScrollIndicator={false}
                            data={this.state.filteredItems}
                            renderItem={({item, index}) => {
                                const isPatientProhibitive = this.checkPatientProhibitiveToMarkProfileRed(item);
                                return (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={
                                            this.state.selectedMember && this.state.selectedMember.connectionId === item.connectionId
                                                ? [
                                                    styles.serviceCard,
                                                    {
                                                        borderWidth: 2,
                                                        borderColor: Colors.colors.mainPink80
                                                    },
                                                ]
                                                : styles.serviceCard
                                        }
                                        onPress={() => {
                                            this.setState({selectedMember: item})
                                        }}

                                    >
                                        <View style={styles.personalInfoMainWrapper}>
                                            <View style={styles.personalInfoWrapper}>
                                                <View style={isPatientProhibitive ? {
                                                    ...styles.imageBorder,
                                                    borderColor: Colors.colors.darkerPink
                                                } : styles.imageWrapper}>
                                                    {item.profilePicture ? (
                                                        <View>
                                                            <Image
                                                                style={styles.proImage}
                                                                resizeMode="cover"
                                                                source={{uri: getAvatar(item)}}/>
                                                            {/*<View style={{...styles.onlineStatus,backgroundColor: Colors.colors.successIcon}}/>*/}
                                                        </View>
                                                    ) : (
                                                        <View
                                                            style={{
                                                                ...styles.proBgMain,
                                                                backgroundColor: item.colorCode,
                                                            }}>
                                                            <Text style={styles.proLetterMain}>
                                                                {item.name.charAt(0).toUpperCase()}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.itemDetail}>
                                                    <Text style={styles.itemName}>{item.name}</Text>
                                                    <Text style={styles.itemDes} numberOfLines={1}>
                                                        {
                                                            valueExists(item.firstName) && valueExists(item.lastName) ?
                                                                `${item.firstName} ${item.lastName}` :
                                                                `Connected Since ${moment(item.lastModified).format('MMMM D, Y')}`
                                                        }

                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>

                </Content>

                {this.state.selectedMember && (
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>

                        <View style={styles.secondaryBtnWrapper}>
                            <SecondaryButton
                                testId="open-profile"
                                iconLeft='info'
                                type={'Feather'}
                                color={Colors.colors.mainBlue}
                                onPress={() => {
                                    this.openProfile(this.state.selectedMember)
                                }}
                                text="Open profile"
                                borderColor={Colors.colors.white}
                                size={24}
                            />
                        </View>
                        <PrimaryButton
                            testId="select-provider"
                            iconName='user'
                            type={'Feather'}
                            color={Colors.colors.whiteColor}
                            onPress={() => {
                                this.nextStep(this.state.selectedItem);
                            }}
                            text="Select member"
                            size={24}
                        />

                    </View>
                )}
            </Container>
        );
        // return (
        //     <Container>
        //         <LinearGradient
        //             start={{ x: 1, y: 1 }}
        //             end={{ x: 1, y: 0 }}
        //             colors={["#fff", "#fff", "#f7f9ff"]}
        //             style={{ flex: 1}}
        //         >
        //         <Header transparent style={styles.header}>
        //             <StatusBar
        //                 backgroundColor={Platform.OS === 'ios'? null : "transparent"}
        //                 translucent
        //                 barStyle={'dark-content'}
        //             />
        //             <SliderSearch
        //                 options={{
        //                     screenTitle: 'STEP 1 OF 4',
        //                     searchFieldPlaceholder: 'Search Member',
        //                     listItems: {
        //                         members: this.state.listItems,
        //                     },
        //
        //                     filter: (listItems, query) => {
        //                         return {
        //                             members: listItems.members.filter(member =>
        //                                 member.name
        //                                     .toLowerCase()
        //                                     .includes(query.toLowerCase().trim()),
        //                             ),
        //                         };
        //                     },
        //                     stepperText: this.state.stepperText,
        //                     showBack: this.state.showBack,
        //                     backClicked: this.backClicked,
        //                 }}
        //                 propagate={this.propagate}
        //             />
        //         </Header>
        //         <Content
        //             {...addTestID('select-member-content')}
        //         >
        //             <Text style={styles.apptHeading}>Request Appointment</Text>
        //             <Text style={styles.proText}>Select Member</Text>
        //             <View style={styles.list}>
        //                 {this.state.filteredItems.length===0 && (
        //                     <View>
        //                         <Text style={styles.noProText}>No Members found in your connections.</Text>
        //                     </View>
        //                 )}
        //                 <FlatList
        //                     data={this.state.filteredItems}
        //                     renderItem={({item, index}) => (
        //                         <TouchableOpacity
        //                             {...addTestID('member- ' + (index+1))}
        //                             activeOpacity={0.8}
        //                             style={this.state.selectedMember && this.state.selectedMember.connectionId===item.connectionId? [styles.singleItem, { borderColor: '#3fb2fe'}] : styles.singleItem}
        //                             onPress={()=>{this.setState({selectedMember: item})}}
        //                         >
        //                             <View style={styles.imageWrapper}>
        //
        //                                 {item.profilePicture?
        //                                     <Image
        //                                         style={styles.proImage}
        //                                         resizeMode="cover"
        //                                         source={{uri: getAvatar(item)}} />
        //                                     :
        //                                     <View style={{
        //                                         ...styles.proBgMain,
        //                                         backgroundColor: item.colorCode
        //                                     }}><Text
        //                                         style={styles.proLetterMain}>{item.name.charAt(0).toUpperCase()}</Text></View>
        //                                 }
        //
        //
        //
        //                             </View>
        //                             <View style={styles.itemDetail}>
        //                                 <Text style={styles.itemName}>{item.name}</Text>
        //                                 <Text style={styles.itemDes} numberOfLines={1}>
        //                                     Connected Since{' '}{moment(item.lastModified).format('MMMM D, Y')}
        //                                 </Text>
        //                             </View>
        //                             {
        //                                 this.state.selectedMember && this.state.selectedMember.connectionId===item.connectionId?
        //                                     <View style={styles.checkWrapper}>
        //                                         <Ionicon name="ios-checkmark-circle" size={25} color="#3fb2fe"/>
        //                                     </View> : null
        //                             }
        //                         </TouchableOpacity>
        //                     )}
        //                     keyExtractor={(item, index) => index.toString()}
        //                 />
        //             </View>
        //         </Content>
        //         <View style={styles.nextBtn}>
        //             {
        //                 this.state.selectedMember?
        //                     <GradientButton
        //                         testId = "next"
        //                         text="Next"
        //                         onPress={this.nextStep}
        //                     /> : null
        //             }
        //         </View>
        //         </LinearGradient>
        //     </Container>
        // );
    };
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 35,
        paddingLeft: 18,
        paddingRight: 18,
    },
    apptHeading: {
        marginTop: 30,
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        textAlign: 'center',
        lineHeight: 24,
        letterSpacing: 1,
        marginBottom: 16,
    },
    list: {},
    personalInfoMainWrapper:
        {
            flexDirection: 'column',
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 24,
            paddingBottom: 24,
        },
    personalInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageWrapper: {},
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    proBgMain: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proLetterMain: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.whiteColor,
    },
    itemDetail: {
        flex: 1,
        paddingLeft: 16,
    },
    itemName: {
        color: '#22242A',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 15,
        lineHeight: 16,
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    itemDes: {
        color: '#515D7D',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
    },
    checkWrapper: {},
    nextBtnwrap: {
        backgroundColor: 'rgba(63, 178, 254, 0.07)',
        borderRadius: 4,
        width: 55,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        marginLeft: 18,
        width: 40,
    },
    headerContent: {
        flexDirection: 'row',
    },
    headerRow: {
        flex: 3,
        alignItems: 'center',
    },
    headerText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    },
    extrasWrapper: {
        backgroundColor: Colors.colors.whiteColor,
        paddingBottom: 24,
        paddingRight: 24,
        paddingLeft: 24,
        paddingTop: 16
    },
    extrasHeading: {
        color: '#22242A',
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        fontSize: 15,
        lineHeight: 16,
        letterSpacing: 0.3,
        marginBottom: 8,
    },
    specialitiesBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    singleSpeciality: {
        backgroundColor: 'rgba(63, 178, 254, 0.07)',
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 16,
        paddingLeft: 16,
        marginRight: 8,
        borderRadius: 16,
        overflow: 'hidden',
        color: '#25345C',
        fontFamily: 'Roboto-Regular',
        fontWeight: '400',
        fontSize: 14,
        letterSpacing: 0.28,
    },
    reviewBtnText: {
        color: '#515d7d',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.7,
    },
    modal: {
        alignItems: 'center',
        borderColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: 620,
    },
    filterHead: {
        width: '100%',
        alignItems: 'center',
        borderBottomColor: '#F5F5F5',
        borderBottomWidth: 1,
        paddingTop: 24,
        paddingBottom: 24,
    },
    filterText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345C',
        fontSize: 17,
        lineHeight: 18,
        letterSpacing: 0.8,
        textAlign: 'center',
    },
    filterBody: {},
    filterScroll: {
        maxHeight: 450,
        paddingBottom: isIphoneX() ? 34 : 24
        // paddingVertical: 16
    },
    filterBtn: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: isIphoneX() ? 34 : 24,
    },
    swipeBar: {
        backgroundColor: '#f5f5f5',
        width: 80,
        height: 4,
        borderRadius: 2,
        top: -35,
    },
    arrowBtn: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 20,
        marginBottom: 24,
        justifyContent: 'center',
        width: 80,
    },
    checkBoxMain: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 0,
    },
    multiList: {
        // display: 'flex',
        // flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: Colors.colors.borderColor,
        backgroundColor: Colors.colors.whiteColor,
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 0,
    },
    checkBoxText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast
    },

    filterIcon: {
        height: 24,
        width: 24,
        marginRight: 12,
        paddingLeft: 0,
        paddingRight: 0
    },
    checkBoxSectionMain: {
        //paddingTop: 40
    },
    checkBoxSectionText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        marginTop: 16,
    },
    multiCheck: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        backgroundColor: Colors.colors.whiteColor
    },
    mainHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
    },
    countText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    serviceCard: {
        borderWidth: 2,
        borderColor: '#f5f5f5',
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column'
    },
    extrasSlots: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 24,
        marginBottom: 24
    },
    extrasSlotsInnerFirst: {
        marginRight: 16
    },

    extrasSlotsWeekText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.highContrast,

    },
    extrasSlotsSlotsText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    extrasDes: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },
    ratingWrapper: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.borderColorLight,
        padding: 24,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    reviewScore: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    totalReviews: {
        marginLeft: 8,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.highContrast,
    },
    noProText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    secondaryBtnWrapper: {
        // marginBottom: 16
    },
    onlineStatus: {
        position: 'absolute',
        top: 35,
        right: 4,
        height: 10,
        width: 10,
        borderWidth: 2,
        borderColor: Colors.colors.whiteColor,
        borderRadius: 6,
    },
    successTopWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.colors.successIcon,
        backgroundColor: Colors.colors.successBG,
        marginLeft: 16,
        marginRight: 16,
        borderRadius: 8,
        padding: 16,
        left: 0,
        right: 0,
        top: 48,
        position: 'absolute',
    },
    successBoxCheck: {
        padding: 8,
        borderRadius: 4,
        backgroundColor: Colors.colors.successIcon
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
    imageBorder: {
        borderStyle: 'solid',
        borderWidth: 2,
        borderRadius: 80,
        paddingHorizontal: 2,
        paddingVertical: 2,
    },
});
export default connectConnections()(AppointmentSelectMemberScreen);
