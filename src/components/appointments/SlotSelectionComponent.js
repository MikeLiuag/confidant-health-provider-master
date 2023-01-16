import React from 'react';
import {DatePickerIOS, Dimensions, Image, Platform, StyleSheet, View} from 'react-native';
import {Button, Icon, Text} from 'native-base';
import Overlay from "react-native-modal-overlay";
import momentTimeZone from "moment-timezone";
import DateTimePicker from '@react-native-community/datetimepicker';
import GradientButton from "../GradientButton";
import {addTestID, AlertUtil, getTimeFromMilitaryStamp, isIphoneX} from "ch-mobile-shared";

const isIos = Platform.OS === 'ios';
export class SlotSelectionComponent extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            fromSelected: true,
            slot: this.props.slot?this.props.slot:{start: 900, end: 1800},
            isWorkingHourSlot: this.props.isWorkingHourSlot,
            androidPickerVisible: false,
            saveInProgress: false
        }
    }
    durationClose = () => {
        this.props.onClose();
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

    getModalTitle = ()=>{
        if(this.props.slot) {
            return this.props.slot.day + ' ' + (this.props.isWorkingHourSlot ? 'Business' : 'Blocked') + ' Hours'
        } else {
            return 'Select Time Range ' + (this.props.isWorkingHourSlot?'of Availability': 'to Block');
        }
    };

    getButtonText = ()=>{
        if(this.props.slot) {
            return 'Save';
        } else {
            return this.props.isWorkingHourSlot?'Add Availability': 'Block Time';
        }
    };

    androidDateChanged = (event, date)=>{
        if(event.type==='set') {
            let newTime = momentTimeZone(date).format("HHmm");
            const slotSelected = JSON.parse(JSON.stringify(this.state.slot));
            if(this.state.fromSelected) {
                slotSelected.start = parseInt(newTime);
            }else {
                if(parseInt(newTime)===0) {
                    newTime = 2400;
                }
                slotSelected.end = parseInt(newTime);
            }
            this.setState({slot: JSON.parse(JSON.stringify(slotSelected)), androidPickerVisible: false});
        } else {
            this.setState({androidPickerVisible: false});
        }

    };

    render() {
        const startMilitaryTime = getTimeFromMilitaryStamp(this.state.slot.start);
        const endMilitaryTime = getTimeFromMilitaryStamp(this.state.slot.end);
        if(this.state.androidPickerVisible) {
            return (
                <DateTimePicker
                    mode="time"
                    display="spinner"
                    style={styles.pickerStyle}
                    textColor={'#646c73'}
                    textSize={15}
                    value={this.state.fromSelected?new Date(new Date().setHours(startMilitaryTime.hour, startMilitaryTime.min)):new Date(new Date().setHours(endMilitaryTime.hour, endMilitaryTime.min))}
                    selectedItemTextColor={'#3fb2fe'}
                    itemStyle={pickerItemStyle}
                    onChange={this.androidDateChanged}
                />
            );
        }
        return(
            <Overlay
                containerStyle={styles.overlayBG}
                childrenWrapperStyle={styles.modalWrapper}
                visible={isIos || !this.state.androidPickerVisible}
                onClose={this.durationClose}
                animationDuration={100}
                closeOnTouchOutside
            >
                <View style={{width: '100%'}}>
                    <View style={styles.modalHead}>
                        <View style={{flex: 1}}>
                            <Text style={styles.modalTitle}>{this.getModalTitle()}</Text>
                            {this.props.days && this.props.days.length>0 &&  (
                                <Text style={styles.modalDes}>on {this.props.days.join(', ')}</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.toFromBox}>
                        <View style={styles.btnBox}>
                            <Button
                                {...addTestID('From')}
                                onPress={()=>{
                                if(!this.state.fromSelected) {
                                    this.setState({fromSelected: true});
                                }
                            }} transparent style={this.state.fromSelected?styles.toBtn:styles.fromBtn}>
                                <Text
                                    style={this.state.fromSelected?{...styles.tabTitle, color: '#fff'}:styles.tabTitle}>From</Text>
                            </Button>
                            <Button
                                {...addTestID('To')}
                                onPress={()=>{
                                if(this.state.fromSelected) {
                                    this.setState({fromSelected: false});
                                }
                            }} transparent style={!this.state.fromSelected?styles.toBtn:styles.fromBtn}>
                                <Text
                                    style={!this.state.fromSelected?{...styles.tabTitle, color: '#fff'}:styles.tabTitle}>To</Text>
                            </Button>
                        </View>
                        <View style={styles.timeBox}>
                            <Text
                                style={this.state.fromSelected?styles.darkTime:styles.greyTime}>{startMilitaryTime.desc}</Text>
                            <Icon
                                name="arrow-right"
                                type={'Feather'}
                                style={styles.nextIcon}
                            />
                            <Text
                                style={!this.state.fromSelected?styles.darkTime:styles.greyTime}>{endMilitaryTime.desc}</Text>
                        </View>
                    </View>
                    <View style={styles.pickerBox}>
                        {
                            isIos ?
                                <DatePickerIOS
                                    date={this.state.fromSelected?this.getDateFromMilitaryTime(this.state.slot.start):this.getDateFromMilitaryTime(this.state.slot.end)}
                                    mode='time'
                                    style={styles.pickerStyle}
                                    onDateChange={(date)=>{
                                        let newTime = momentTimeZone(date).format("HHmm");
                                        const slotSelected = JSON.parse(JSON.stringify(this.state.slot));
                                        if(this.state.fromSelected) {
                                            slotSelected.start = parseInt(newTime);
                                        }else {
                                            if(parseInt(newTime)===0) {
                                                newTime = 2400;
                                            }
                                            slotSelected.end = parseInt(newTime);
                                        }
                                        this.setState({slot: JSON.parse(JSON.stringify(slotSelected))});
                                    }}
                                /> :
                                <Button
                                    {...addTestID('Tap-here-to-adjust')}
                                    transparent style={{justifyContent:'center'}} onPress={()=>{this.setState({androidPickerVisible: true})}}>
                                    <View><Text style={{fontSize: 17}}>Tap here to adjust {this.state.fromSelected?'start':'end'} time</Text></View>
                                </Button>
                        }
                    </View>
                    <View style={styles.saveBox}>
                        <GradientButton
                            testId = "save"
                            disabled={this.state.saveInProgress}
                            onPress={this.saveSlot}
                            text={this.getButtonText()}
                        />
                    </View>
                </View>
            </Overlay>
        );
    }

    saveSlot = ()=>{
        this.setState({saveInProgress: true});
        setTimeout(()=>{
            const slot = this.state.slot;
            if(slot.start>slot.end) {
                AlertUtil.showErrorMessage("Start Time cannot exceed End Time");
                this.setState({saveInProgress: false});
                return;
            }
            if(slot.start===slot.end) {
                AlertUtil.showErrorMessage("Start Time and End Time cannot be same");
                this.setState({saveInProgress: false});
                return;
            }
            if(slot.end === 2400) {
                AlertUtil.showErrorMessage("End Time cannot be 12:00AM as it starts the next day");
                this.setState({saveInProgress: false});
                return;
            }
            const payload = {
                day: this.state.slot.day,
                slot: this.state.slot,
                isBusiness: this.state.isWorkingHourSlot,
                active: this.state.slot.checked
            };

            this.setState({saveInProgress: false}, ()=>{
                if(this.props.slot) {
                    this.props.saveSlot(payload);
                } else {
                    this.props.addSlots(payload);
                }
            })
        }, 1200);

    };
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
    overlayBG: {
        backgroundColor: 'rgba(37,52,92,0.35)'
    },
    modalWrapper: {
        height: 'auto',
        padding: 0,
        alignSelf: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24
    },
    modalHead: {
        padding: 24,
        // paddingTop: 36,
        // flexDirection: 'row',
        alignItems: 'center'
    },
    closeBtn: {
        // width: 50,
        position: 'absolute',
        left: 10,
        top: 10,
        margin: 0,
        paddingTop: 0,
        paddingBottom: 0
    },
    modalTitle: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 17,
        lineHeight: 17,
        letterSpacing: 0.8,
        textAlign: 'center',
        flex: 2,
        textTransform: 'capitalize',
        marginBottom: 8,
        marginTop: 15
    },
    modalDes: {
        fontFamily: 'Roboto-Regular',
        color: '#969fa8',
        fontSize: 14,
        lineHeight: 15,
        letterSpacing: 0.3,
        textAlign: 'center',
        textTransform: 'none',
        paddingLeft: 15
    },
    daysBox: {
        maxHeight: 310,
        width: '100%',
        borderTopColor: '#f5f5f5',
        borderTopWidth: 1
    },
    daysList: {
        justifyContent: 'space-between',
        borderBottomWidth: 0,
        // backgroundColor: 'rgba(63,178,254, 0.08)',
        marginLeft: 0,
        paddingLeft: 24
    },
    daysListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#515d7d'
    },
    toFromBox: {
        // flexDirection: 'row'
    },
    btnBox: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 20
    },
    timeBox: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderColor: '#f5f5f5',
        borderBottomWidth: 1,
        paddingBottom: 24
    },
    nextIcon: {
        color: '#d1d1d1',
        fontSize: 24
    },
    fromBtn: {
        borderColor: 'rgba(0,0,0,0.07)',
        borderWidth: 1,
        width: '40%',
        minWidth: 140,
        borderRadius: 50,
        marginRight: 15,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        justifyContent: 'center',
        height: 32
    },
    toBtn: {
        borderColor: '#515d7d',
        backgroundColor: '#515d7d',
        borderWidth: 1,
        borderLeftWidth: 1,
        width: '40%',
        minWidth: 140,
        borderRadius: 50,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: 'center',
        height: 32
    },
    tabTitle: {
        color: '#515d7d',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.54,
        fontFamily: 'Roboto-Bold',
        fontWeight: '600'
    },
    greyTime: {
        color: '#969fa8',
        fontSize: 14,
        lineHeight: 25,
        letterSpacing: 0.56,
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        textAlign: 'center'
    },
    darkTime: {
        color: '#25345c',
        fontSize: 14,
        lineHeight: 25,
        letterSpacing: 0.56,
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        textAlign: 'center'
    },
    pickerBox: {
        paddingTop: 24,
        justifyContent: 'center'
    },
    pickerStyle: {
        backgroundColor: '#fff',
        width: 322,
        alignSelf: 'center',
        height: 180,
        fontSize: 15
    },
    saveBox: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    },
});
