import React, {Component} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {Content, Text} from 'native-base';
import {
    addTestID, AlertUtil, Colors, CommonStyles, getHeaderHeight, isIphoneX, PrimaryButton, SecondaryButton, TextStyles
} from "ch-mobile-shared";
import Modal from "react-native-modalbox";
import {Picker} from "react-native-wheel-pick";
import {
    CRUD_OPERATIONS_ENUMS,
    MINUTE_PICKER_SCHEDULE,
    TIME_PICKER,
    TIME_TYPES
} from "../../constants/CommonConstants";
import Entypo from "react-native-vector-icons/Entypo";

const isIos = Platform.OS === 'ios';

const HEADER_SIZE = getHeaderHeight();

export class TimeSlotSelectionComponent extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            androidPickerVisible: false,
            startTime: null,
            endTime: null
        }
    }

    componentDidMount = () => {
        this.mapPropsToState();
    }

    getTimeFromMilitaryStamp = (stamp) => {
        const stringStamp = (stamp + "");
        let time, amPm, desc, hour, min;
        if (stringStamp.length === 1) {
            time = '00:00' + stringStamp;
            amPm = 'AM';
            desc = time + ' ' + amPm;
            hour = 0;
            min = stamp;
        } else if (stringStamp.length === 2) {
            time = '12:' + stringStamp;
            amPm = 'AM';
            desc = time + ' ' + amPm;
            hour = 0;
            min = stamp;
        } else if (stringStamp.length === 3) {
            hour = stringStamp.substr(0, 1);
            min = stringStamp.substr(1);
            amPm = 'AM';
            time = '0' + hour + ':' + min;
            desc = time + ' ' + amPm;
        } else {
            hour = stringStamp.substr(0, 2);
            min = stringStamp.substr(2);
            amPm = 'AM';
            if (parseInt(hour) >= 12) {
                if (hour > 12) {
                    hour = parseInt(hour);
                    if (hour < 10) {
                        hour = "0" + hour;
                    }
                }
                amPm = 'PM';
                if (hour === 12) {
                    amPm = 'AM';
                }
            }
            time = hour + ':' + min;
            desc = hour + ':' + min + ' ' + amPm;
        }
        return {
            time, amPm, hour, min, desc
        };

    };

    /**
     * @function mapPropsToState
     * @description Method used to map props to state.
     */
    mapPropsToState = () => {
        const {selectedSlot} = this.props;
        let startTime, endTime;
        if (selectedSlot) {
            const startMilitaryTime = this.getTimeFromMilitaryStamp(selectedSlot.start);
            const endMilitaryTime = this.getTimeFromMilitaryStamp(selectedSlot.end);
            startTime = {
                hour: startMilitaryTime.time.split(":")?.[0],
                min: startMilitaryTime.min,
                amPM: startMilitaryTime.amPm
            };
            endTime = {
                hour: endMilitaryTime.time.split(":")?.[0],
                min: endMilitaryTime.min, amPM: endMilitaryTime.amPm}
        } else {

            startTime = {hour: '00', min: '00', amPM: 'AM'};
            endTime = {hour: '00', min: '00', amPM: 'AM'}
        }
        this.setState({startTime, endTime})

    }

    hideDayTimeDrawer = () => {
        this.props.hideTimeModal();
    };


    /**
     * @function validateSelectedSlot
     * @description Method used to validate selected meeting slot.
     */
    validateSelectedSlot = (start, end) => {
        if(parseInt(end) === 0){
            end = 2400;
        }
        let diff = end - start;
        if(diff > 60){
            diff = diff - 40;
        }
        if(diff < 15){
            AlertUtil.showErrorMessage("Please add slot time greater than 15")
            return false;
        }
        if (start > end) {
            AlertUtil.showErrorMessage("Start Time cannot exceed end Time");
            return false;
        }
        if (start === end) {
            AlertUtil.showErrorMessage("Start Time and End Time cannot be same");
            return false;
        }
        if (end === 2400) {
            AlertUtil.showErrorMessage("End Time Time cannot be 12:00AM as it starts the next day");
            return false;
        }
        return true;
    }

    changeTimeSlot = () => {
        const {startTime, endTime} = this.state;
        let start = parseInt(startTime.hour * 100) + parseInt(startTime.min);
        let end = parseInt(endTime.hour * 100) + parseInt(endTime.min);
        if(parseInt(end) > 2400){
            end = 2400;
        }
        if (this.validateSelectedSlot(start, end)) {
            const slotDetails = {
                start, end
            }

            if (this.props.nextAppointment) {
                this.props.saveChanges(slotDetails);
            } else {
                const payload = {
                    slot: slotDetails,
                    day: this.props.selectedSchedule?.title,
                    isBusiness: true,
                    active: true
                };
                if (this.props.operationType === CRUD_OPERATIONS_ENUMS.ADD) {
                    this.props.addSlot(payload)
                } else {
                    this.props.updateSlot(payload)
                }
            }

        }
    }

    onHourSelected = (selectedValue, type) => {
        let time = this.state[type];
        time.hour = selectedValue;
        if(parseInt(selectedValue)>=12){
            time.amPM = "PM";
        }else{
            time.amPM = "AM";
        }
        if(parseInt(this.state[type].hour) !== 24){
            time.min='00'
        }

        this.setState({[type]: time})
    };

    onMinuteSelected = (selectedValue, type) => {
        let time = this.state[type];
        time.min = selectedValue;
        this.setState({[type]: time})
    };

    onMiddaySelected = (selectedValue, type) => {
        let time = this.state[type];
        time.amPM = selectedValue;
        this.setState({[type]: time})
    };


    /**
     * @function renderTimePicker
     * @description Method used to render time picker for start & end
     */
    renderTimePicker = (type) => {
        return (
            <View style={styles.timePickerWrapper}>
                <View style={styles.timeBox}>
                    <Text style={styles.pickerTitle}>{TIME_TYPES[type]}</Text>
                    <View style={styles.hrsBox}>
                        <Picker
                            style={styles.pickerStyle}
                            textColor={Colors.colors.lowContrast}
                            textSize={24}
                            itemStyle={pickerItemStyle}
                            selectedValue={this.state[type].hour}
                            itemSpace={24}
                            pickerData={TIME_PICKER}
                            onValueChange={(e) => {
                                this.onHourSelected(e, type)
                            }}
                        />
                    </View>
                    <View style={styles.iconSection}>
                        <Entypo name="dots-two-vertical"
                              style={styles.arrowIcon}/>
                    </View>
                    <View style={styles.minBox}>
                        <Picker
                            style={styles.pickerStyle}
                            textColor={Colors.colors.lowContrast}
                            textSize={24}
                            selectedValue={this.state[type].min}
                            itemSpace={24}
                            pickerData={parseInt(this.state[type].hour) !== 24 ? MINUTE_PICKER_SCHEDULE:['00']}
                            onValueChange={(e) => {
                                if(parseInt(this.state[type].hour) !== 24){
                                    this.onMinuteSelected(e, type)
                                }
                            }}
                            itemStyle={pickerItemStyle}
                        />
                    </View>
                    {/*<View style={styles.amBox}>
                        <Picker
                            style={styles.pickerStyle}
                            textColor={Colors.colors.lowContrast}
                            textSize={24}
                            selectedValue={this.state[type].amPM}
                            itemSpace={24}
                            pickerData={[this.state[type].amPM]}
                            onValueChange={(e) => {
                                this.onMiddaySelected(e, type)
                            }}
                            itemStyle={{...pickerItemStyle, ...TextStyles.mediaTexts.manropeRegular}}
                        />
                    </View>*/}
                </View>
            </View>
        )

    }

    render = () => {
        const {selectedSlot} = this.props;
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
                    //maxHeight: '87%'
                    height: 'auto',
                    position: 'absolute',
                }}
                entry={"bottom"}
                position={"bottom"} ref={"modalDayTimeDrawer"} swipeArea={100}>
                <View style={{...CommonStyles.styles.commonSwipeBar}}
                      {...addTestID('swipeBar')}
                />


                <Content showsVerticalScrollIndicator={false}>
                    <View style={{...styles.actionsTopWrapper, marginBottom: 0}}>
                        <View style={styles.modalTitleWrapper}>
                            <Text
                                style={styles.modalTitleText}>{this.props.operationType === CRUD_OPERATIONS_ENUMS.ADD ? "Add" : "Change"} Time
                                Slot</Text>
                        </View>
                        {/*{selectedSlot?.title && (
                        <View style={styles.modalTitleWrapper}>
                            <Text style={styles.modalTitleText}>{moment(selectedSlot?.title,'MM-DD-YYYY').format("dddd , MMMM D YYYY")}</Text>
                        </View>
                        )}*/}
                    </View>
                    <View style={styles.slotTimeWrapper}>
                        <View style={styles.slotTimerSingle}>
                            <Text style={styles.slotTimerTitle}>Start time</Text>
                            {this.state.startTime && this.renderTimePicker(TIME_TYPES.START_TIME)}
                        </View>
                        <View style={styles.slotTimerSingle}>
                            <Text style={styles.slotTimerTitle}>End time</Text>
                            {this.state.endTime && this.renderTimePicker(TIME_TYPES.END_TIME)}
                        </View>
                    </View>
                    <View style={styles.actionList}>
                        <View style={styles.btnOptions}>
                            <SecondaryButton
                                text="Cancel"
                                // textColor={Colors.colors.whiteColor}
                                borderColor={Colors.colors.mainBlue10}
                                onPress={() => {
                                    this.hideDayTimeDrawer();
                                }}
                            />
                        </View>
                        <View style={styles.btnOptions}>
                            <PrimaryButton
                                text={`${this.props?.operationType === CRUD_OPERATIONS_ENUMS.ADD ? "Add" : "Change"} time slot`}
                                textColor={Colors.colors.whiteColor}
                                onPress={() => {
                                    this.changeTimeSlot();
                                }}
                            />
                        </View>
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
    ...TextStyles.mediaTexts.manropeExtraBold,
    ...TextStyles.mediaTexts.TextH3,
    lineHeight: 40,
}

const styles = StyleSheet.create({
    actionList:{
      marginBottom: 40,
    },
    timePickerWrapper:{
        borderRadius: 8,
        marginLeft: 16,
        marginRight: 16,
        ...CommonStyles.styles.shadowBox,
    },
    timeBox: {
        height: isIos ? 140 : 102,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexShrink: 0,
        flexGrow: 0
    },
    pickerStyle: {
        backgroundColor: 'transparent',
        // width: '100%',
        // textAlign: 'left',
    },
    arrowIcon: {
        color: Colors.colors.neutral500Icon,
        fontSize: 24
    },
    hrsBox: {
        width: 95,
    },
    iconSection: {
        width: 40,
        alignItems: 'center'
    },
    minBox: {
        width: 95,
    },
    amBox: {
        width: 95
    },
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
    modalTitleWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32
    },
    modalTitleText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
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
    slotTimeWrapper: {
        marginBottom: 16,
    },
    slotTimerSingle: {
        marginBottom: 32,
    },
    slotTimerTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.black,
        marginBottom: 16,
    },
    slotTimerBox: {},
});
