import React, {Component} from 'react';
import {Accordion, Body, Button, Container, Content, Header, Left, Right, Text, Title, View} from 'native-base';
import {FlatList, StatusBar, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {Screens} from '../../../constants/Screens';
import AwesomeIcon from "react-native-vector-icons/FontAwesome";
import {addTestID, AlertUtil, AlfieLoader, compareDay, getTimeFromMilitaryStamp, HEADER_NORMAL,
    HEADER_X, isIphoneX, getHeaderHeight} from "ch-mobile-shared";
import momentTimeZone from "moment-timezone";
import SwitchToggle from "react-native-switch-toggle";
import {connectSettings} from "../../../redux";
import {SlotSelectionComponent} from "../../../components/appointments/SlotSelectionComponent";
import {isEqual} from 'lodash';
const HEADER_SIZE = getHeaderHeight();
const BUSINESS_HOURS = 'Business Hours';
const BLOCKED_TIME = 'Blocked Time';

class AppointmentSettingsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            settings: [],
            businessModal: false,
            daysSelectorModal: false,
            itemSelected: true,
            isWorkingHourSlot: false,
            slotSelected: null
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    durationClose = () => {
        this.setState({
            businessModal: false,
            daysSelectorModal: false
        });
    };

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        const prevPlanning = prevProps.settings.appointments.planningHorizon;
        const currentPlanning = this.props.settings.appointments.planningHorizon;
        if (!isEqual(prevPlanning, currentPlanning)) {
            this.createSettingsFromProps();
        } else {
            const prevBlocking = prevProps.settings.appointments.blockingHorizon;
            const currentBlocking = this.props.settings.appointments.blockingHorizon;
            if (!isEqual(prevBlocking, currentBlocking)) {
                this.createSettingsFromProps();
            }
        }
    }

    componentDidMount(): void {
        this.createSettingsFromProps();
    }

    selectTimeZone = () => {
        this.props.navigation.navigate(Screens.TIME_ZONE_SELECTION, {
            updateUI: this.updateTimeZone
        });
    };


    updateTimeZone = (timezone) => {
        const {settings} = this.state;
        const prevZone = settings[0].des;
        const newZone = timezone;
        if (prevZone !== newZone) {
            settings[0].des = timezone;
            this.props.changeTimezone({prevZone, newZone});
            this.setState(settings);
        }

    };

    renderHeader = (item, expanded, count, onPress) => {
        return (
            <TouchableOpacity
                {...addTestID('appointment-setting')}
                activeOpacity={0.8}
                style={styles.expandableItem}
                onPress={onPress}
            >
                <View style={styles.itemDetail}>
                    <Text style={styles.itemName}>{item.title}</Text>
                    <Text style={styles.itemDes} numberOfLines={1}>
                        {count + ' Slots'}
                    </Text>
                </View>
                <View style={styles.nextWrapper}>
                    <Button transparent style={styles.nextButton} onPress={onPress}>
                        <AwesomeIcon name='angle-right' size={32}
                                     color="#3fb2fe"/>
                    </Button>
                </View>
            </TouchableOpacity>
        )
    };

    toggleDay = (item, header) => {
        let {settings} = this.state;
        settings = settings.map(setting => {
            if (setting.innerItems) {
                setting.innerItems = setting.innerItems.map(innerItem => {
                    if (innerItem.title === item.title && setting.title === header) {
                        innerItem.checked = !innerItem.checked;
                    }
                    return innerItem;
                });
            }
            return setting;
        });
        this.props.toggleSlot({
            day: item.title,
            active: item.checked,
            isBusiness: header === BUSINESS_HOURS
        });
        this.setState({settings});
    };


    renderContent = (items) => {
        const views = items.content.sort((i1,i2)=>compareDay(i1.title, i2.title)).map(item => {
            const slots = item.desc;
            const descriptions = slots.map((desc,ind) => {
                if (desc.start !== undefined && desc.end !== undefined) {
                    const startTime = getTimeFromMilitaryStamp(desc.start);
                    const endTime = getTimeFromMilitaryStamp(desc.end);
                    return (
                        <Text style={styles.timingText} numberOfLines={1}
                              key={items.title + '-' + item.title + '-' +ind+'-' + desc.start}>
                            {startTime.time + ' ' + startTime.amPm + ' - ' + endTime.time + ' ' + endTime.amPm}
                        </Text>
                    );
                } else {
                    return (
                        <Text style={styles.timingText} numberOfLines={1} key={items.title + '-' + item.title + '-'}>
                            Completely Blocked
                        </Text>
                    );
                }

            });
            return (
                <View key={item.title + '-' + items.title} style={styles.expandableItem}>

                    <Left>
                        <TouchableOpacity onPress={() => {
                            this.toggleDay(item, items.title)
                        }}>
                            <View style={styles.itemDetail}>
                                <Text style={styles.itemName}>{item.title}</Text>
                                {item.desc && (
                                    <View>
                                        {descriptions}
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                    </Left>
                    <Right>
                        <View style={styles.nextWrapper}>
                            {item.checkbox && (
                                <SwitchToggle
                                    type={1}
                                    buttonStyle={styles.switchBtn}
                                    rightContainerStyle={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    leftContainerStyle={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                    buttonTextStyle={{fontSize: 10}}
                                    textRightStyle={{
                                        fontSize: 10,
                                        color: 'black',
                                        fontWeight: '500',
                                        paddingLeft: 2
                                    }}
                                    textLeftStyle={{
                                        fontSize: 10,
                                        color: 'white',
                                        paddingRight: 0
                                    }}
                                    containerStyle={styles.switchContainer}
                                    backgroundColorOn="#3fb2fe"
                                    backgroundColorOff="#D1D1D1"
                                    circleStyle={styles.switchCircle}
                                    onPress={() => {
                                        this.toggleDay(item, items.title)
                                    }}
                                    switchOn={item.checked}
                                    circleColorOff="#fff"
                                    circleColorOn="#fff"
                                    duration={200}
                                />
                            )}

                        </View>
                    </Right>


                </View>
            );
        });
        return (
            <View>
                {views}
            </View>
        );
    };

    renderAccordion = (item) => {
        const data = [{title: item.title, content: item.innerItems}];
        return (
            <Accordion
                dataArray={data}
                animation={true}
                expanded={0}
                renderHeader={(dataItem, expanded) => {
                    return this.renderHeader(dataItem, expanded, item.innerItems.length, item.onPress);
                }}
                renderContent={this.renderContent}
            />
        )
    };

    navigateToBusinessHours = () => {
        this.props.navigation.navigate(Screens.BUSINESS_HOUR_SELECTION, {
            businessHours: true,
            updateSettings: this.createSettingsFromProps
        });
    };

    navigateToBlockedHours = () => {
        this.props.navigation.navigate(Screens.BUSINESS_HOUR_SELECTION, {
            businessHours: false,
            updateSettings: this.createSettingsFromProps
        });
    };

    createSettingsFromProps = () => {
        if (!this.props.settings.appointments.timezone) {
            AlertUtil.showMessage("No Schedule Setup. Setting timezone to your current timezone.",
                "Dismiss", "top", "warning");
        }
        const settings = [
            {
                title: 'Time Zone',
                des: this.props.settings.appointments.timezone ? this.props.settings.appointments.timezone : momentTimeZone.tz.guess(),
                onPress: this.selectTimeZone
            },
            {
                title: BUSINESS_HOURS,
                expandable: true,
                expanded: true,
                innerItems: this.props.settings.appointments.planningHorizon ?
                    Object.keys(this.props.settings.appointments.planningHorizon).map(day => {
                        return {
                            title: day,
                            desc: JSON.parse(JSON.stringify(this.props.settings.appointments.planningHorizon[day].availability)),
                            checked: this.props.settings.appointments.planningHorizon[day].active,
                            checkbox: true
                        }
                    })
                    : [],
                onPress: this.navigateToBusinessHours
            },
           /* {
                title: BLOCKED_TIME,
                expandable: true,
                expanded: true,
                innerItems: this.props.settings.appointments.blockingHorizon ?
                    Object.keys(this.props.settings.appointments.blockingHorizon).map(day => {
                        return {
                            title: day,
                            desc: JSON.parse(JSON.stringify(this.props.settings.appointments.blockingHorizon[day].availability)),
                            checked: this.props.settings.appointments.blockingHorizon[day].active,
                            checkbox: true
                        }
                    }) : [],
                onPress: this.navigateToBlockedHours
            }*/
        ];
        this.setState({settings, slotSelected: null, businessModal: false});
    };

    saveSlot = (payload) => {
        this.props.updateSlot(payload);
        this.setState({slotSelected: null});
        setTimeout(() => {
            this.createSettingsFromProps();
        }, 10);


    };


    render(): React.ReactNode {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if (this.props.settings.isLoading) {
            return (<AlfieLoader/>);
        }

        return (
            <Container>
                <Header noShadow transparent style={styles.settingHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios'? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left onPress={this.backClicked}>
                        <Button transparent style={styles.backButton} onPress={this.backClicked}>
                            <AwesomeIcon name="angle-left" size={32} color="#3fb2fe"/>
                        </Button>
                    </Left>
                    <Body
                        {...addTestID('appointments-body')}
                        style={{ flex: 2}}>
                        <Title style={styles.settingTitle}>Appointments</Title>
                    </Body>
                    <Right/>
                </Header>
                {/*Business Hours Overlay*/}
                {/*<Overlay*/}
                {/*    containerStyle={styles.overlayBG}*/}
                {/*    childrenWrapperStyle={styles.modalWrapper}*/}
                {/*    visible={this.state.businessModal}*/}
                {/*    onClose={this.durationClose}*/}
                {/*    animationDuration={100}*/}
                {/*    closeOnTouchOutside*/}
                {/*>*/}
                {/*    {this.state.slotSelected ? this.renderTimePicker() : null}*/}

                {/*</Overlay>*/}
                {this.state.slotSelected && (
                    <SlotSelectionComponent
                        slot={{
                            checked: this.state.slotSelected.checked,
                            day: this.state.slotSelected.title,
                            start: this.state.slotSelected.desc[0].start,
                            end: this.state.slotSelected.desc[0].end,
                        }}
                        isWorkingHourSlot={this.state.isWorkingHourSlot}
                        onClose={() => {
                            this.setState({slotSelected: null});
                        }}
                        saveSlot={this.saveSlot}
                    />
                )}


                {/*Block time days selector overlay*/}

                <Content>
                    <FlatList
                        data={this.state.settings}
                        style={styles.list}
                        renderItem={({item, index}) => item.expandable ? this.renderAccordion(item) : (

                            <TouchableOpacity
                                {...addTestID('appointment-item- ' + (index+1))}
                                activeOpacity={0.8}
                                style={styles.singleItem}
                                onPress={item.onPress}
                            >
                                <View style={styles.itemDetail}>
                                    <Text style={styles.itemName}>{item.title}</Text>
                                    <Text style={styles.itemDes} numberOfLines={1}>
                                        {item.des}
                                    </Text>
                                </View>
                                <View style={styles.nextWrapper}>
                                    <Button transparent style={styles.nextButton}>
                                        <AwesomeIcon name='angle-right' size={32}
                                                     color="#3fb2fe"/>
                                    </Button>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    settingHeader: {
        height: HEADER_SIZE,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        paddingLeft: 3
    },
    closeIcon: {
        color: '#3fb2fe',
        fontSize: 30,
    },
    nextIcon: {
        color: '#d1d1d1',
        fontSize: 25,
    },
    servicesTitle: {
        color: '#25345c',
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        lineHeight: 24,
        letterSpacing: 0.3,
        textAlign: 'center'
    },
    editBtn: {},
    editText: {
        color: '#3fb2fe',
        fontFamily: 'Roboto-Bold',
        textAlign: 'center',
        letterSpacing: 0.3,
        fontSize: 14,
        fontWeight: '600'
    },
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
        paddingTop: 36,
        flexDirection: 'row',
        alignItems: 'center'
    },
    closeBtn: {
        width: 50,
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
        textTransform: 'capitalize'
    },
    modalDes: {
        fontFamily: 'Roboto-Regular',
        color: '#969fa8',
        fontSize: 14,
        lineHeight: 15,
        letterSpacing: 0.3,
        textAlign: 'center'
    },
    daysBox: {
        maxHeight: 310,
        width: '100%',
        borderTopColor: '#f5f5f5',
        borderTopWidth: 1,
    },
    daysList: {
        justifyContent: 'space-between',
        borderBottomWidth: 0,
        // backgroundColor: 'rgba(63,178,254, 0.08)',
        marginLeft: 0,
        paddingLeft: 24,
    },
    daysListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#515d7d',
    },
    multiTextSelected: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '600',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#3fb2fe',
    },
    multiRadio: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
    },
    multiRadioSelected: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
        backgroundColor: '#3fb2fe',
        borderColor: '#3fb2fe',
    },
    toFromBox: {
        // flexDirection: 'row'
    },
    btnBox: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 24
    },
    timeBox: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderColor: '#f5f5f5',
        borderBottomWidth: 1,
        paddingBottom: 24
    },
    fromBtn: {
        borderColor: '#515d7d',
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
        fontWeight: '600'
    },
    darkTime: {
        color: '#25345c',
        fontSize: 14,
        lineHeight: 25,
        letterSpacing: 0.56,
        fontFamily: 'Roboto-Bold',
        fontWeight: '600'
    },
    pickerBox: {
        paddingTop: 24
    },
    pickerStyle: {
        backgroundColor: '#fff',
        width: 200,
        alignSelf: 'center',
        height: 180
    },
    saveBox: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    },
    fieldItem: {
        marginLeft: 0,
        borderColor: '#f5f5f5',
        borderBottomWidth: 1,
        paddingLeft: 24,
        paddingRight: 24,
        height: 64
    },
    fieldLabel: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
        color: '#646c73'
    },
    fieldInput: {
        color: '#515d7d',
        textAlign: 'right',
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 15
    },
    inputValue: {
        color: '#515d7d',
        textAlign: 'right',
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 15
    },
    desBox: {
        padding: 24
    },
    desTitle: {
        color: '#646c73',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
        marginBottom: 16
    },
    desContent: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 15,
        letterSpacing: 0.2,
        color: '#515d7d'
    },
    btnsty: {
        marginTop: 30,
        flex: 0.5,
        flexDirection: 'column',
        justifyContent: 'flex-end'
    },
    logoutBtn: {
        padding: 10,
        width: 160,
        height: 50,
        justifyContent: 'center',
        borderColor: '#25345C',
        backgroundColor: 'transparent',
        elevation: 0,
        borderWidth: 1.5,
        borderRadius: 3,
        marginLeft: '25%',
        marginBottom: 56
    },
    logoutText: {
        color: '#25345C',
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Roboto-Regular',
        paddingLeft: 10
    },
    settingTitle: {
        color: '#25345c',
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        lineHeight: 24,
        letterSpacing: 0.3,
        textAlign: 'center'
    },
    singleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        padding: 23
    },
    expandableItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 23
    },
    itemDetail: {},
    itemName: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 15,
        letterSpacing: 0.3,
        color: '#25345c',
        marginBottom: 5,
        textTransform: 'capitalize'
    },
    itemDes: {
        color: '#969fa8',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        lineHeight: 14,
        letterSpacing: 0.3
    },
    timingText: {
        color: '#969fa8',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        lineHeight: 14,
        letterSpacing: 0.3,
        marginTop: 6
    },
    backButton: {
        marginLeft: 15,
        width: 30
    },
    switchContainer: {
        marginTop: 0,
        width: 50,
        height: 30,
        borderRadius: 30,
        padding: 1
    },
    switchCircle: {
        width: 25,
        height: 25,
        borderRadius: 15,
        backgroundColor: '#979797',
        position: 'absolute'
    },
    switchBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },
});
export default connectSettings()(AppointmentSettingsScreen);
