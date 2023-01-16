import React from 'react';
import {DatePickerIOS, Platform, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button, Content, Text} from 'native-base';
import momentTimeZone from "moment-timezone";
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    getTimeFromMilitaryStamp,
    isIphoneX, PrimaryButton,
    TextStyles,
    getHeaderHeight, valueExists
} from "ch-mobile-shared";
import {DAYS, GROUP_MANAGEMENT_DETAILS_ACTIONS} from "../../constants/CommonConstants";
import Modal from "react-native-modalbox";

const HEADER_SIZE = getHeaderHeight();

export class MeetingSlotSelectionComponent extends React.PureComponent {

    constructor(props) {
        super(props);
        let {meetings} = this.props;
        meetings = meetings?.map(meeting => meeting.day);
        this.state = {
            startTime: false,
            selectedMeetingDay : valueExists(this.props.selectedMeetingDay) ? this.props.selectedMeetingDay : DAYS.filter(day => !meetings.includes(day))?.[0],
            meetingSlot: this.props.meetingSlot ? this.props.meetingSlot : {meetingStartTime: 900, meetingEndTime: 1800},
            androidPickerVisible: false
        }
    }
    hideDayTimeDrawer = () => {
        this.props.hideDayTimeDrawer();
    };

    /**
     * @function renderWeekDays
     * @description Method used to render week days
     */
    renderWeekDays = () => {
        let {meetings} = this.props;
        const {selectedMeetingDay} = this.state;
        meetings = meetings.map(meeting => meeting.day);
        let days = DAYS;
        if(!this.props.selectedMeetingDay) {
            days = days.filter(day => !meetings.includes(day))
        }
        return (
            <ScrollView contentContainerStyle={{alignItems: 'center'}} style={styles.monthWrapper}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}>
                {days.map(day => {
                    const isSelectedMonth = selectedMeetingDay === day;
                    return (
                        <TouchableOpacity style={styles.monthSlide} onPress={() => {
                            this.setState({selectedMeetingDay: day})
                        }}>
                            <Text style={isSelectedMonth ? styles.currentMonthText : styles.monthText}>{day}'s</Text>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        )
    }

    /**
     * @function androidDateChanged
     * @description Method used to change time slot ( on android Platform)
     * @params event , data
     */
    androidDateChanged = (event, date) => {
        const {meetingSlot} = this.state;
        if (event.type === 'set') {
            let newTime = momentTimeZone(date).format("HHmm");
            const slotSelected = JSON.parse(JSON.stringify(meetingSlot));
            if (this.state.startTime) {
                slotSelected.meetingStartTime = parseInt(newTime);
            } else {
                if (parseInt(newTime) === 0) {
                    newTime = 2400;
                }
                slotSelected.meetingEndTime = parseInt(newTime);
            }
            this.setState({meetingSlot: JSON.parse(JSON.stringify(slotSelected)), androidPickerVisible: false});
        } else {
            this.setState({androidPickerVisible: false});
        }

    };

    getDateFromMilitaryTime = (time) => {
        let strTime = time+ "";
        for(let i =strTime.length;i<4;i++) {
            strTime = "0"+strTime;
        }
        const hours = parseInt(strTime.substring(0,2));
        const min = parseInt(strTime.substring(2,4));
        return new Date(new Date().setHours(hours, min))
    };

    /**
     * @function renderPickerSections
     * @description Method is used to picker sections
     */
    renderPickerSections = () => {
        const {meetingSlot} = this.state;
        const startMilitaryTime = getTimeFromMilitaryStamp(meetingSlot.meetingStartTime);
        const endMilitaryTime = getTimeFromMilitaryStamp(meetingSlot.meetingEndTime);
        return (
            <View style={styles.pickers}>
                <View style={styles.pickerSection}>
                    <Text style={styles.pickerTitle}>Meeting starts at</Text>
                    <View style={styles.pickerWrapper}>
                        {
                            Platform.OS === 'ios' ?
                                <DatePickerIOS
                                    date={this.getDateFromMilitaryTime(this.state.meetingSlot?.meetingStartTime)}
                                    mode='time'
                                    style={styles.pickerStyle}
                                    onDateChange={(date) => {
                                        this.setState({startTime : true})
                                        let newTime = momentTimeZone(date).format("HHmm");
                                        const slotSelected = JSON.parse(JSON.stringify(meetingSlot));
                                        slotSelected.meetingStartTime = parseInt(newTime);
                                        this.setState({meetingSlot: JSON.parse(JSON.stringify(slotSelected))});
                                    }}
                                /> :

                                <View>
                                    <Button transparent
                                            style={styles.pickerBtn}
                                            onPress={() => {
                                                this.setState({startTime: true, androidPickerVisible: true})
                                            }}>
                                        <Text uppercase={false} style={styles.pickerBtnText}>Tap here to add time</Text>
                                        <Text uppercase={false}
                                              style={styles.pickerBtnText}>{startMilitaryTime?.desc}</Text>
                                    </Button>
                                    {this.state.androidPickerVisible && <DateTimePicker
                                        mode="time"
                                        display="spinner"
                                        style={styles.pickerStyle}
                                        textColor={Colors.colors.mediumContrast}
                                        textSize={15}
                                        value={new Date(new Date().setHours(startMilitaryTime.hour, startMilitaryTime.min))}
                                        selectedItemTextColor={Colors.colors.primaryText}
                                        itemStyle={pickerItemStyle}
                                        onChange={this.androidDateChanged}
                                    />}
                                </View>


                        }
                    </View>
                </View>

                <View style={styles.pickerSection}>
                    <Text style={styles.pickerTitle}>Meeting ends at</Text>
                    <View style={styles.pickerWrapper}>
                        {
                            Platform.OS === 'ios' ?
                                <DatePickerIOS
                                    date={this.getDateFromMilitaryTime(this.state.meetingSlot?.meetingEndTime)}
                                    mode='time'
                                    style={styles.pickerStyle}
                                    onDateChange={(date) => {
                                        this.setState({startTime : false});
                                        let newTime = momentTimeZone(date).format("HHmm");
                                        const slotSelected = JSON.parse(JSON.stringify(this.state.meetingSlot));
                                        if (parseInt(newTime) === 0) {
                                            newTime = 2400;
                                        }
                                        slotSelected.meetingEndTime = parseInt(newTime);
                                        this.setState({meetingSlot: JSON.parse(JSON.stringify(slotSelected))});
                                    }}
                                /> :
                                <View>
                                    <Button transparent
                                            style={styles.pickerBtn}
                                            onPress={() => {
                                                this.setState({startTime: false, androidPickerVisible: true})
                                            }}>
                                        <Text uppercase={false} style={styles.pickerBtnText}>Tap here to add time</Text>
                                        <Text uppercase={false}
                                              style={styles.pickerBtnText}>{endMilitaryTime?.desc}</Text>
                                    </Button>
                                    {this.state.androidPickerVisible && <DateTimePicker
                                        mode="time"
                                        display="spinner"
                                        style={styles.pickerStyle}
                                        textColor={Colors.colors.mediumContrast}
                                        textSize={15}
                                        value={new Date(new Date().setHours(endMilitaryTime.hour, endMilitaryTime.min))}
                                        selectedItemTextColor={Colors.colors.primaryText}
                                        itemStyle={pickerItemStyle}
                                        onChange={this.androidDateChanged}
                                    />}
                                </View>
                        }
                    </View>
                </View>
            </View>
        )
    }

    /**
     * @function validateSelectedMeetingSlot
     * @description Method used to validate selected meeting slot.
     */
    validateSelectedMeetingSlot = () => {
        const {meetingSlot,selectedMeetingDay} = this.state;
        if(!selectedMeetingDay){
            AlertUtil.showErrorMessage("Please select meeting day");
            return false;
        }
        if (meetingSlot.meetingStartTime > meetingSlot.meetingEndTime) {
            AlertUtil.showErrorMessage("Meeting Start Time cannot exceed meeting end Time");
            return false;
        }
        if (meetingSlot.meetingStartTime === meetingSlot.meetingEndTime) {
            AlertUtil.showErrorMessage("Meeting Start Time and meeting End Time cannot be same");
            return false;
        }
        if (meetingSlot.meetingEndTime === 2400) {
            AlertUtil.showErrorMessage("Meeting End Time Time cannot be 12:00AM as it starts the next day");
            return false;
        }
        return true;
    }

    /**
     * @function getMeetingsPopulatedDescription
     * @description Method is used to get description based on start/end time
     * @params selectedMeetingDay , meetingSlot
     */
    getMeetingsPopulatedDescription = (selectedMeetingDay, meetingSlot) => {
        const startMilitaryTime = getTimeFromMilitaryStamp(meetingSlot.meetingStartTime);
        const endMilitaryTime = getTimeFromMilitaryStamp(meetingSlot.meetingEndTime);
        return `Every ${selectedMeetingDay}'s, ${startMilitaryTime.desc} - ${endMilitaryTime.desc}`;
    }

    /**
     * @function saveGroupMeeting
     * @description Method used to perform crud operations for meeting
     * @params actionType
     */
    saveGroupMeeting = (actionType) => {
        if (this.validateSelectedMeetingSlot()) {
            const {selectedMeetingDay, meetingSlot, } = this.state;
            const meetingItem = {
                day: selectedMeetingDay,
                meetingStartTime: meetingSlot.meetingStartTime,
                meetingEndTime: meetingSlot.meetingEndTime,
                description: this.getMeetingsPopulatedDescription(selectedMeetingDay, meetingSlot)
            }
            this.props.saveGroupMeeting(actionType,meetingItem);
        }
    }

    render = () => {
        const {editValue} = this.props;
        return (
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    isOpen={this.props.openTimeModal}
                    //onClosed={this.props.closeOverlay}
                    onClosed={() => {
                        this.hideDayTimeDrawer();
                    }}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '80%'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalDayTimeDrawer"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <Text style={styles.groupOptionHeader}>Group meeting day & time</Text>
                        {this.renderWeekDays()}
                        {this.renderPickerSections()}
                        <View style={styles.greBtn}>
                            <PrimaryButton
                                text={`${editValue ? 'Edit' : 'Add'} group meeting`}
                                onPress={() => {
                                    this.saveGroupMeeting(editValue ? GROUP_MANAGEMENT_DETAILS_ACTIONS.UPDATE: GROUP_MANAGEMENT_DETAILS_ACTIONS.ADD);
                                }}
                            />
                        </View>
                    </Content>
                </Modal>
        )
    }
}

const pickerItemStyle = {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderTopColor: 'transparent',
    color: '#646c73',
    fontFamily: 'Roboto-Regular',
    fontSize: 18
};
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
    headerTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast
    },
    imageBox: {
        alignItems: 'center',
        marginBottom: 24
    },
    groupMainImg: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 0.5
    },
    editImgBtn: {},
    editImgText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.linkTextM,
        color: Colors.colors.primaryText,
        textAlign: 'center'
    },
    fieldsWrapper: {},
    inputWrap: {},
    textAreaTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        marginBottom: 12,
        marginTop: 40
    },
    toggleList: {
        marginTop: 24
    },
    singleToggle: {
        flexDirection: 'row',
        marginBottom: 24,
        marginTop: 16
    },
    toggleContent: {
        flex: 1,
        paddingRight: 16
    },
    toggleTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },
    toggleDes: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast,
    },
    donationAmountView: {
        ...CommonStyles.styles.shadowBox,
        borderWidth: 0.5,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 32,
        borderRadius: 8,
        // height: 64
    },
    donationAmountHeading: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast
    },
    donationAmountNumber: {
        ...TextStyles.mediaTexts.bodyTextL,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        paddingTop: 0,
        paddingBottom: 0,
        // height: 40
    },
    groupSectionList: {
        paddingBottom: 30
    },
    groupSection: {
        marginBottom: 24
    },
    groupHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    groupTitle: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast
    },
    groupItemList: {},
    groupSingleItem: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 0.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingRight: 16
    },
    groupContentText: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.highContrast,
        flex: 1,
        paddingRight: 10
    },
    moreBtn: {
        marginRight: 0,
        paddingRight: 0,
        paddingLeft: 0
    },
    moreIcon: {
        color: Colors.colors.primaryIcon,
        fontSize: 30
    },
    groupBtn: {},
    groupOptionHeader: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        marginBottom: 32
    },
    singleOption: {
        marginBottom: 16
    },
    monthWrapper: {
        flexDirection: 'row',
        marginBottom: 40
    },
    monthSlide: {
        marginRight: 24
    },
    currentMonthText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH2,
        color: Colors.colors.secondaryText
    },
    monthText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH2,
        color: Colors.colors.mainPink20
    },
    pickers: {
        marginBottom: 16
    },
    pickerSection: {
        marginBottom: 24
    },
    pickerTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.overlineTextM,
        color: Colors.colors.mediumContrast,
        marginBottom: 16,
        textTransform: 'uppercase'
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        borderRadius: 8,
        overflow: 'hidden',
        height: Platform.OS === 'ios' ? 120 : 50
    },
    pickerStyle: {
        backgroundColor: '#fff',
        width: 322,
        alignSelf: 'center',
        height: 180,
        fontSize: 15,
        marginTop: -50
    },
    pickerBtn: {},
    pickerBtnText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.overlineTextM,
        color: Colors.colors.mediumContrast,
        fontStyle: 'italic'
    },
    groupRuleInput: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.inputText,
        color: Colors.colors.highContrast
    },
    greBtn: {
        paddingBottom: isIphoneX() ? 34 : 24
    },
    editBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.whiteColor,
        position: 'absolute',
        bottom: -20
    },
    uploadCircle: {
        width: 120,
        height: 120,
        borderWidth: 1,
        borderColor: Colors.colors.blue3,
        backgroundColor: '#f7f9ff',
        borderStyle: 'dashed',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    labelDollar: {
        ...TextStyles.mediaTexts.inputLabel,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.inputValue,
    },
    confirmOverlay: {
        backgroundColor: 'rgba(37,52,92,0.5)',
    },
    confirmHeader: {
        color: Colors.colors.darkBlue,
        ...TextStyles.mediaTexts.bodyTextL,
        ...TextStyles.mediaTexts.manropeRegular,
        textAlign: 'center',
        marginBottom: 30,
        paddingLeft: 18,
        paddingRight: 18,
    },
    confirmBtns: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    confirmWrapper: {
        height: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 40 : 25,
        paddingTop: 36,
        alignSelf: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 3,
        shadowOffset: {width: 0, height: 10},
        shadowColor: '#f5f5f5',
        shadowOpacity: 0.5,
    },
    outlineBtn: {
        borderColor: Colors.colors.lightRed,
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: Colors.colors.whiteColor,
        height: 48,
        justifyContent: 'center',
        elevation: 0,
    },
    outlineText: {
        color: Colors.colors.lightRed,
        ...TextStyles.mediaTexts.overlineTextM,
        ...TextStyles.mediaTexts.manropeBold,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    noBtn: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center',
    },
});
