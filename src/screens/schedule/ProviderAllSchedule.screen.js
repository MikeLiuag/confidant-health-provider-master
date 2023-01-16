import React, {Component} from "react";
import {
    AlertUtil,
    Colors,
    CommonStyles,
    getAvatar,
    getHeaderHeight,
    getTimeFromMilitaryStamp, isIphoneX,
    PrimaryButton,
    SecondaryButton,
    SelectDateTimeV2Component,
    TextStyles,
    uuid4
} from "ch-mobile-shared";
import {Dimensions, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View} from "react-native";
import {
    Accordion, Body, Button, Container, Content, Header, Icon, Left, Right, Text, Title
} from "native-base";
import EntypoIcons from 'react-native-vector-icons/Entypo';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import ProgressBarAnimated from "react-native-progress-bar-animated";
import AntIcon from "react-native-vector-icons/AntDesign";
import Modal from 'react-native-modalbox';
import {TransactionSingleActionItem} from "ch-mobile-shared/src/components/TransactionSingleActionItem";
import FeatherIcon from "react-native-vector-icons/Feather";
import MCIcon from "react-native-vector-icons/MaterialCommunityIcons";
import {Screens} from "../../constants/Screens";
import ScheduleService from "../../services/ScheduleService";
import {connectSettings} from "../../redux";
import Loader from "../../components/Loader";
import moment from "moment";
import {APPOINTMENT_STATUS, S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {BookedAppointmentModal} from "../../components/provider-schedule/BookedAppointmentModal";
import AppointmentService from "../../services/AppointmentService";
import {BookedAppointmentSliderComponent} from "../../components/provider-schedule/BookAppointmentSliderComponent";
import {CONNECTION_TYPES} from "ch-mobile-shared/src/constants/CommonConstants";
import momentTimeZone from "moment-timezone";
import {TimeSlotSelectionComponent} from "../../components/time-picker-component/TimeSlotSelectionComponent";

const HEADER_SIZE = getHeaderHeight();


const FILTER_OPTIONS = [
    {
        id: uuid4(),
        title: "1 hour Slots",
        duration: "1 hour",
        durationType: 60,
        selected: true
    },
    {
        id: uuid4(),
        title: "Initial Appointments",
        duration: "2 hours",
        durationType: 120,
        selected: false
    },
    {
        id: uuid4(),
        title: "30 min check-in",
        duration: "30 minutes",
        durationType: 30,
        selected: false
    },

];

const actionButtonList = [
    {
        title: 'Accept appointment',
        iconBackground: Colors.colors.whiteColor,
        iconName: "checkcircle",
        iconColor: Colors.colors.successIcon,
        iconType: 'AntDesign',
        actionType: 'ACCEPT_APPOINTMENT',
        includesIn: ['PENDING']
    },
    {
        title: 'Cancel appointment',
        iconBackground: Colors.colors.whiteColor,
        iconName: "closecircleo",
        iconColor: Colors.colors.errorIcon,
        iconType: 'AntDesign',
        actionType: 'CANCEL_APPOINTMENT',
        includesIn: ['BOOKED']
    },
    {
        title: 'Decline appointment',
        iconBackground: Colors.colors.whiteColor,
        iconName: "closecircleo",
        iconColor: Colors.colors.errorIcon,
        iconType: 'AntDesign',
        actionType: 'CANCEL_APPOINTMENT',
        includesIn: ['PENDING']
    },
    {
        title: 'Change appointment',
        iconBackground: Colors.colors.whiteColor,
        iconName: "pencil",
        iconColor: Colors.colors.primaryIcon,
        iconType: 'FontAwesome',
        actionType: 'CHANGE_DATE',
        includesIn: ['PENDING']
    },
    {
        title: 'Cancel Request',
        iconBackground: Colors.colors.whiteColor,
        iconName: "closecircleo",
        iconColor: Colors.colors.errorIcon,
        iconType: 'AntDesign',
        actionType: 'CANCEL_APPOINTMENT',
        includesIn: ['PROPOSED', 'REQUESTED']
    },
    {
        title: 'Go to chat',
        iconBackground: Colors.colors.whiteColor,
        iconName: "message-circle",
        iconColor: Colors.colors.primaryIcon,
        iconType: 'Feather',
        actionType: 'GO_TO_CHAT',
        includesIn: ['PENDING', 'BOOKED', 'PROPOSED', 'REQUESTED']

    },
    {
        title: 'Change time',
        iconBackground: Colors.colors.whiteColor,
        iconName: "access-time",
        iconColor: Colors.colors.primaryIcon,
        iconType: 'MaterialIcons',
        actionType: 'CHANGE_TIME',
        includesIn: ['PROPOSED', 'BOOKED', 'REQUESTED']
    },
    {
        title: 'Change date',
        iconBackground: Colors.colors.whiteColor,
        iconName: "calendar",
        iconColor: Colors.colors.primaryIcon,
        iconType: 'Feather',
        actionType: 'CHANGE_DATE',
        includesIn: ['PROPOSED', 'BOOKED', 'REQUESTED']
    }

]


class ProviderAllScheduleScreen extends Component<Props> {

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.viewProviderProfile = navigation.getParam('viewProviderProfile', false);
        this.providerId = navigation.getParam('providerId', null);
        this.scheduleDetails = navigation.getParam('scheduleDetails', null);
        this.state = {
            isLoading: true,
            weeklySchedule: null,
            filterOptions: FILTER_OPTIONS,
            durationType: 60,
            weekStartDate: this.getCurrentWeekStart(),
            services : []
        };
    }

    componentDidMount = async () => {
        if(this.viewProviderProfile){
            this.getAllServices()
        }
        this.getWeeklySchedule();
        this.mapPropsToState();
        this.scheduleRefresher = this.props.navigation.addListener(
            'willFocus',
            payload => {
                if(this.viewProviderProfile){
                    this.getAllServices()
                }
                this.getWeeklySchedule();
                this.mapPropsToState();
            },
        );
    }

    componentWillUnmount(): void {
        if (this.scheduleRefresher) {
            this.scheduleRefresher.remove();
        }
    }

    /**
     * @function getAllServices
     * @description This method is used to get all services .
     */
    getAllServices = async () => {
        try {
            const services = await AppointmentService.getProviderServices(this.providerId);
            if (services.errors) {
                console.warn(services.errors[0].endUserMessage);
            } else {
                this.setState({ services});
            }
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage("Whoops ! Something went wrong")
        }
    };

    getTimeFromMilitaryStamp = (stamp) => {
        const stringStamp = (stamp + "");
        let time, amPm, desc, hour, min;
        if (stringStamp?.length === 1) {
            time = '00:' + stringStamp;
            amPm = 'am';
            desc = time + ' ' + amPm;
            hour = 0;
            min = stamp;
        } else if (stringStamp?.length === 2) {
            time = '00:' + stringStamp;
            amPm = 'am';
            desc = time + ' ' + amPm;
            hour = 0;
            min = stamp;
        } else if (stringStamp?.length === 3) {
            hour = stringStamp.substr(0, 1);
            min = stringStamp.substr(1);
            amPm = 'am';
            time = '0' + hour + ':' + min;
            desc = time + ' ' + amPm;
        } else {
            hour = stringStamp.substr(0, 2);
            min = stringStamp.substr(2);
            amPm = 'am';
            if (parseInt(hour) >= 12) {
                if (hour > 12) {
                    hour = parseInt(hour);
                    if (hour < 10) {
                        hour = "0" + hour;
                    }
                }
                amPm = 'pm';
                if (hour === 12) {
                    amPm = 'am';
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
     * @function getCurrentWeekStart
     * @description This method is used to get current week start date.
     */
    getCurrentWeekStart = () => {
        return moment().startOf('isoWeek');
    }

    /**
     * @function updateWeekNextOrPrevious
     * @description This method is used to navigate next or prev week.
     */
    updateWeekNextOrPrevious = (type) => {
        let {weekStartDate} = this.state;
        if (type === 'NEXT') {
            weekStartDate = moment(weekStartDate).add(1, 'weeks').startOf('isoWeek');
        } else {
            weekStartDate = moment(weekStartDate).subtract(1, 'weeks').startOf('isoWeek');
        }
        this.setState({
            weekStartDate: weekStartDate
        }, () => {
            this.getWeeklySchedule()
        })

    }

    /**
     * @function isSameWeek
     * @description This method is used to check for same week .
     */
    isSameWeek = () => {
        let {weekStartDate} = this.state;
        const currentWeekStart = moment().startOf('isoWeek');
        weekStartDate = moment(weekStartDate).startOf('isoWeek').format('MM-DD-YYYY');
        return moment(weekStartDate, 'MM-DD-YYYY').isSame(currentWeekStart);
    }

    /**
     * @function getWeekSliderText
     * @description This method is used to render week slider title.
     */
    getWeekSliderText = () => {
        let {weekStartDate} = this.state;
        const isSameWeek = this.isSameWeek();
        if (isSameWeek) {
            return "This Week";
        } else {
            const date = moment(weekStartDate);
            return date.format('MMMM') + ' ' + date.startOf('isoWeek').format('D') + '-' +
                date.endOf('isoWeek').format('D')
        }
    }


    /**
     * @function renderWeekSliderSection
     * @description This method is used to render week slider section.
     */
    renderWeekSliderSection = () => {
        return (<View style={styles.scheduleSliderWrapper}>
            <View style={styles.sliderLeftWrapper}>
                <Button disabled={this.isSameWeek()} transparent style={styles.seeAllBtn} onPress={() => {
                    this.updateWeekNextOrPrevious('PREV')
                }}>
                    <AntIcon name="arrowleft" size={24} color={this.isSameWeek() ?
                        Colors.colors.neutral50Icon : Colors.colors.primaryIcon}/>
                </Button>
            </View>
            <View style={styles.sliderCenterWrapper}>
                <Text style={styles.sliderCenterText}>{this.getWeekSliderText()}</Text>
            </View>
            <View style={styles.sliderRightWrapper}>
                <Button transparent style={styles.seeAllBtn} onPress={() => {
                    this.updateWeekNextOrPrevious('NEXT')
                }}>
                    <AntIcon name="arrowright" size={24} color={Colors.colors.primaryIcon}/>
                </Button>
            </View>
        </View>)
    }

    /**
     * @function mapPropsToState
     * @description This method is used to map props to state.
     */
    mapPropsToState = () => {
        const {services} = this.state;
        this.setState({
            services: this.viewProviderProfile ? services : [...this.props?.settings?.providerCustomServices, ...this.props?.settings?.providerDefaultServices],
            providerDetails: this.props?.profile?.profile,
            providers: this.props?.connections?.activeConnections?.filter(connection => connection.type === CONNECTION_TYPES.PRACTITIONER),
            guests: this.props?.connections?.activeConnections?.filter(connection => connection.type === CONNECTION_TYPES.PATIENT),
            connections: this.props?.connections?.activeConnections?.filter(connection => connection.type === CONNECTION_TYPES.PATIENT),
        })
    }

    /**
     * @function backClicked
     * @description This method is used to navigate to the previous screen.
     */

    backClicked = () => {
        this.props.navigation.goBack();
    };

    /**
     * @function openModal
     * @description This method is used for open modal.
     */
    openModal = (type, selectedItem) => {
        this.setState({
            selectedItem: selectedItem,
            modalDetails: this.getRenderModalDetails(type),
            availableSlotsForAppointment: selectedItem?.title ? this.getAvailableSlotsByDate(selectedItem?.title) : [],
            openModal: true
        })
    }

    /**
     * @function closeModal
     * @description This method is used for closing modal.
     */
    closeModal = () => {
        this.setState({modalDetails: null, selectedItem: null, openModal: false})
    }


    /**
     * @function hideTimeModal
     * @description This method is used to hide time modal
     */
    hideTimeModal = () => {
        this.setState({openTimeModal: false})
    }

    /**
     * @function updateOrRemoveSlotByDate
     * @description This method is used to update OR remove slot by date.
     */
    updateOrRemoveSlotByDate = async (shouldDelete, slot) => {
        this.setState({isLoading: true});
        const {selectedItem} = this.state;
        try {
            const title = slot?.title || selectedItem?.title;
            const date = moment(title, 'MM-DD-YYYY').format('DD-MM-YYYY');
            let payload;
            if (shouldDelete) {
                payload = {
                    date: date,
                    end: slot ? slot.end : selectedItem.end,
                    start: slot ? slot.start : selectedItem.start
                }
            } else {
                payload = {
                    previousSlot: {
                        date: date,
                        end: selectedItem.end,
                        start: selectedItem.start
                    }, updatedSlot: {
                        date: date,
                        end: slot ? slot.end : selectedItem.end,
                        start: slot ? slot.start : selectedItem.start
                    }
                }
            }
            let scheduleUpdateCall = ScheduleService.updateSlotByDate;
            if (shouldDelete) {
                scheduleUpdateCall = ScheduleService.removeSlotByDate;
            }
            const response = await scheduleUpdateCall(payload);
            if (response.errors) {
                console.warn(response.errors[0].endUserMessage);
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false});
            } else {
                AlertUtil.showSuccessMessage(response.message)
                this.getWeeklySchedule();
            }
        } catch (error) {
            console.warn(error);
            this.setState({isLoading: false});
        }
    };

    /**
     * @function navigateToDailySchedule
     * @description This method is used to navigate to the schedule Screen.
     */

    navigateToDailySchedule = (daySchedule) => {
        const selectedSchedule = {
            desc: daySchedule.slots,
            title: daySchedule.title,
            day: daySchedule.title
        }
        this.props.navigation.navigate(Screens.PROVIDER_DAILY_SCHEDULE_SCREEN, {
            selectedSchedule: selectedSchedule,
            weeklyFlow: true,
            durationType: this.state.durationType,
            weekStartDate: this.state.weekStartDate
        });
    };


    /**
     * @function renderScreenHeader
     * @description This method is used to render page main header.
     */
    renderScreenHeader = () => {
        return (<Header noShadow={false} transparent style={styles.header}>
            <StatusBar
                backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                translucent
                barStyle={"dark-content"}
            />
            <Left style={{flex: 1}}>
                <Button
                    transparent
                    style={styles.backButton}
                    onPress={this.backClicked}>
                    <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                </Button>
            </Left>
            <Body style={{flex: 2}}>
                <Title style={styles.headerText}>Schedule</Title>
            </Body>
            <Right style={{flex: 1}}>
                <Button transparent style={styles.filterBtn} onPress={() => {
                    this.openModal('modalFilterAppointment', null);
                }}>
                    <MCIcon size={24} color={Colors.colors.mainBlue} name="tune-vertical"/>
                </Button>
            </Right>
        </Header>)
    }


    /**
     * @function getSlotsDetailWeekly
     * @description This method is used to get total & booked slots.
     */
    getSlotsDetailWeekly = () => {
        const {weeklySchedule} = this.state;
        let total = 0, booked = 0;
        weeklySchedule.map(daySchedule => {
            total = total + daySchedule.availableCount;
            booked = booked + daySchedule.bookedCount;
        });
        return {total, booked};
    }

    /**
     * @function renderBookedProgress
     * @description This method is used to render booked appointments progress.
     */
    renderBookedProgress = () => {
        const windowWidth = Dimensions.get('window').width;
        const {total, booked} = this.getSlotsDetailWeekly();
        let bookedPercentage = 0;
        if (total > 0) {
            bookedPercentage = (booked / total * 100).toFixed();
        }
        return (
            <View style={styles.progressWrapper}>
                <View style={styles.progressInfoWrapper}>
                    <Text style={styles.progressInfoText}>Booked</Text>
                    <Text style={styles.progressInfoValue}>{bookedPercentage}%</Text>
                </View>
                <View styl={styles.progressBarWrapper}>
                    <ProgressBarAnimated
                        width={windowWidth - 50}
                        value={bookedPercentage}
                        backgroundColor={Colors.colors.mainPink}
                        borderRadius={8}
                        borderColor={'#E5E5E5'}
                        height={8}
                    />
                </View>
            </View>)
    }

    /**
     * @function renderRemoveAllSlotsBtn
     * @description This method is used to render remove all slots button.
     */
    renderRemoveAllSlotsBtn = () => {
        let {total, booked} = this.getSlotsDetailWeekly();
        total = total - booked;
        return (<View style={styles.errorBtnWrapper}>
            <PrimaryButton
                text={total < 1 ? 'No slots' : 'Remove all slots'}
                disabled={total < 1}
                bgColor={total < 1 ? Colors.colors.lightRed : Colors.colors.errorIcon}
                textColor={Colors.colors.whiteColor}
                iconName='closecircleo'
                type='AntDesign'
                color={Colors.colors.whiteColor}
                size={22}
                onPress={() => {
                    this.openModal('modalRemoveAllSlots', null)
                }}
            />
        </View>)
    }


    /**
     * @function updateFilterList
     * @description This method is used to update filter options status.
     */
    updateFilterList = (selectedFilter) => {
        let {filterOptions, durationType} = this.state;
        filterOptions.map(filterOption => {
            if (filterOption.id === selectedFilter.id) {
                filterOption.selected = true;
                durationType = filterOption.durationType
            } else {
                filterOption.selected = false;
            }
        })
        this.setState({filterOptions, durationType});
    }

    /**
     * @function cancelAppointment
     * @description This method is used to cancel appointment.
     */
    cancelAppointment = async () => {
        this.setState({isLoading: true});
        const {selectedItem} = this.state;
        const appointment = selectedItem?.bookedAppointments?.find(bookAppointment => bookAppointment?.appointmentId === selectedItem?.appointmentId)
        const response = await AppointmentService.cancelAppointment(appointment.appointmentId, null);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            AlertUtil.showSuccessMessage("Appointment cancelled");
            this.setState({isLoading: false}, () => {
                this.closeModal();
                this.getWeeklySchedule()
            })
        }
    };

    /**
     * @function findConnection
     * @description This method is used to find connection.
     */
    findConnection = (connectionId) => {

        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }
        return connection && connection.length > 0 && connection[0] ? connection[0] : null
    }

    /**
     * @function navigateToLiveChat
     * @description This method is used to navigate to live chat screen
     */
    navigateToLiveChat = () => {
        const {selectedItem} = this.state;
        const appointment = selectedItem?.bookedAppointments?.find(bookAppointment => bookAppointment?.appointmentId === selectedItem?.appointmentId)
        let connection = this.findConnection(appointment.memberId);
        if (connection) {
            this.props.navigation.navigate(Screens.LIVE_CHAT, {
                connection: {...connection, profilePicture: getAvatar(connection)}
            });
        }
    }


    /**
     * @function renderRemoveAllSlotsModal
     * @description This method is used to render remove all slots.
     */
    renderRemoveAllSlotsModal = () => {
        let {total, booked} = this.getSlotsDetailWeekly();
        total = total - booked;
        return (<View>
            <View style={{...styles.actionsTopWrapper, marginBottom: 32}}>
                <View style={{
                    ...styles.modalTitleWrapper,
                    flexDirection: 'column',
                    marginBottom: 0,
                    alignItems: 'flex-start'
                }}>
                    <Text style={{...styles.modalTitleText, marginBottom: 8}}>You are about to remove all slots
                        this week.</Text>
                    <Text style={styles.modalTitleSubTextBottom}>You have <Text color={Colors.colors.highContrast}
                                                                                style={styles.boldText}>
                        {booked} appointment{booked > 1 ? "s" : ''}</Text> scheduled this week. It will remain active in
                        your schedule, <Text
                            color={Colors.colors.highContrast} style={styles.boldText}>{total} time
                            slot{(total - booked) > 1 ? "s" : ""}</Text> will be
                        removed.</Text>
                </View>
            </View>
            <View style={styles.actionList}>
                <View style={styles.btnOptions}>
                    <SecondaryButton
                        text={'Keep slots'}
                        textColor={Colors.colors.primaryText}
                        style={styles.extendedText}
                        onPress={() => {
                            this.closeModal();
                        }}
                    />
                </View>
                <View style={styles.btnOptions}>
                    <PrimaryButton
                        text={total < 1 ? 'No slots' : 'Remove all slots'}
                        disabled={total < 1}
                        bgColor={total < 1 ? Colors.colors.lightRed : Colors.colors.errorIcon}
                        textColor={Colors.colors.whiteColor}
                        iconName='closecircleo'
                        type='AntDesign'
                        color={Colors.colors.whiteColor}
                        size={22}
                        onPress={() => {
                            this.removeAllSlotsByWeek();
                        }}
                    />
                </View>
            </View>
        </View>)
    }


    /**
     * @function renderFilterModal
     * @description This method is used to render filter modal.
     */
    renderFilterModal = () => {
        const {filterOptions} = this.state;
        return (<View>
                <View style={{...styles.actionsTopWrapper, marginBottom: 32}}>
                    <View style={styles.modalTitleWrapper}>
                        <Text style={styles.modalTitleText}>Appointment types</Text>
                        <Text style={{
                            ...styles.modalTitleSubText,
                            paddingRight: 7, ...TextStyles.mediaTexts.manropeBold,
                            color: Colors.colors.lowContrast
                        }}>{filterOptions?.length} total</Text>
                    </View>
                </View>

                <View style={styles.actionList}>
                    {filterOptions?.map(filterOption => {
                        return (
                            <View style={styles.btnOptions}>
                                <View style={filterOption.selected ? {
                                    ...styles.itemWrap,
                                    borderColor: Colors.colors.mainBlue40,
                                    backgroundColor: Colors.colors.primaryColorBG
                                } : styles.itemWrap}>
                                    <TouchableOpacity style={styles.buttonRow} onPress={() => {
                                        this.updateFilterList(filterOption);
                                    }}>
                                        <Text style={{...styles.buttonTextMain, color: Colors.colors.primaryText}}>
                                            {filterOption.title}</Text>
                                        <Text style={styles.buttonTextSub}>{filterOption.duration}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    })}
                </View>

                <View style={styles.greBtn}>
                    <PrimaryButton
                        onPress={() => {
                            this.closeModal();
                            this.getWeeklySchedule()
                        }}
                        text="Continue"
                    />
                </View>
            </View>
        );
    }


    /**
     * @function renderSlotModal
     * @description This method is used to render slot modal.
     */
    renderSlotModal = () => {
        const {selectedItem} = this.state;
        const startTime = getTimeFromMilitaryStamp(selectedItem.start);
        const endTime = getTimeFromMilitaryStamp(selectedItem.end);
        const canBookAppointment = moment(selectedItem?.title, "MM-DD-YYYY").isSameOrAfter(moment().format("YYYY-MM-DD"), 'day');
        return (<View>
            <View style={{...styles.actionsTopWrapper, marginBottom: 32}}>
                <View style={styles.modalTitleWrapper}>
                    <Text
                        style={styles.modalTitleText}>{moment(selectedItem.title, "MM-DD-YYYY")
                        .format(this.viewProviderProfile? "MMMM D,":"dddd, D MMMM")}{' '}
                        {startTime.desc} - {endTime.desc}</Text>
                </View>
            </View>
            <View style={styles.actionList}>
                {!this.viewProviderProfile && (<View>
                        <View style={styles.btnOptions}>
                            <TransactionSingleActionItem
                                title={'Remove time slot'}
                                iconBackground={Colors.colors.whiteColor}
                                styles={styles.gButton}
                                renderIcon={(size, color) => <AntIcon size={22} color={Colors.colors.errorIcon}
                                                                      name="closecircleo"/>}
                                onPress={() => {
                                    this.closeModal();
                                    this.updateOrRemoveSlotByDate(true, null)
                                }}
                            />
                        </View>
                        <View style={styles.btnOptions}>
                            <TransactionSingleActionItem
                                title={'Change time slot'}
                                iconBackground={Colors.colors.whiteColor}
                                styles={styles.gButton}
                                renderIcon={(size, color) => <FeatherIcon size={22} color={Colors.colors.primaryIcon}
                                                                          name="edit-2"/>}
                                onPress={() => {
                                    this.setState({openModal: false, openTimeModal: true})
                                }}
                            />
                        </View>
                    </View>
                )}
                {canBookAppointment && (
                    <View style={styles.btnOptions}>
                        <TransactionSingleActionItem
                            title={'Book appointment'}
                            iconBackground={Colors.colors.whiteColor}
                            styles={styles.gButton}
                            renderIcon={(size, color) => <FeatherIcon size={22} color={Colors.colors.successIcon}
                                                                      name="calendar"/>}
                            onPress={() => {
                                this.setState(({openModal: false}), () => {
                                    this.openModal('modalBookAppointment', selectedItem)
                                })
                            }}
                        />
                    </View>
                )}
            </View>
        </View>)
    }

    /**
     * @function confirmAppointment
     * @description This method is used to confirm appointment.
     */
    confirmAppointment = async (appointmentId) => {
        this.setState({isLoading: true});
        const response = await AppointmentService.confirmAppointment(appointmentId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            AlertUtil.showSuccessMessage(response?.message || "Appointment confirmed");
            this.setState({
                openModal: false, selectedEvent: null, openTimeModal: false
            }, () => {
                this.getWeeklySchedule();
            })
        }
    };

    /**
     * @function renderAppointmentModal
     * @description This method is used to render appointment modal.
     */
    renderAppointmentModal = () => {
        let {selectedItem} = this.state;
        const startTimeAppt = moment(selectedItem.title + " "
            + (this.getTimeFromMilitaryStamp(selectedItem.start).time), 'MM-DD-YYYY HH:mm:ss').format('hh:mm a')
        const endTimeAppt = moment(selectedItem.title + " "
            + (this.getTimeFromMilitaryStamp(selectedItem.end).time), 'MM-DD-YYYY HH:mm:ss').format('hh:mm a')

        const selectedAppointment = selectedItem?.bookedAppointments?.find(bookAppointment => bookAppointment?.appointmentId === selectedItem?.appointmentId);
        let appointment = {
            ...selectedAppointment,
            startText: startTimeAppt,
            endText: endTimeAppt,
            date: selectedItem.title,
            participantImage: selectedAppointment?.memberImage,
            participantName: selectedAppointment?.memberName,
            selectedDate: selectedItem?.title
        }
        return (
            <BookedAppointmentModal
                appointment={appointment}
                confirmAppointment={this.confirmAppointment}
                cancelAppointment={this.cancelAppointment}
                navigateToLiveChat={this.navigateToLiveChat}
                changeTime={() => {
                    this.closeModal();
                    setTimeout(() => {
                        this.openModal('modalChangeSlot', selectedItem)
                    }, 500)
                }}
                changeDate={() => {
                    this.closeModal();
                    setTimeout(() => {
                        this.openModal('modalChangeDate', selectedItem)
                    }, 500)

                }}
                actionButtonList={actionButtonList}
                applyFilter={true}
            />
        )
    }

    /**
     * @function isBookAppointmentFlow
     * @description This method is return boolean value for appointment flow.
     */
    isBookAppointmentFlow = () => {
        const {modalDetails} = this.state;
        if (modalDetails) return (modalDetails?.ref === 'modalBookAppointment' || modalDetails?.ref === 'modalBookAppointmentFlows')
    }

    /**
     * @function renderPageMainModal
     * @description This method is used to render page main model.
     */
    renderPageMainModal = () => {
        const {openModal, modalDetails} = this.state;
        return (<Modal
            backdropPressToClose={true}
            backdropColor={Colors.colors.overlayBg}
            backdropOpacity={1}
            isOpen={openModal}
            onClosed={() => {
                this.closeModal();
            }}
            style={{
                ...CommonStyles.styles.commonModalWrapper,
                //maxHeight: modalDetails?.maxHeight,
                height: modalDetails?.maxHeight || 'auto',
                position: 'absolute',
                paddingLeft: this.isBookAppointmentFlow() ? 0 : 24,
                paddingRight: this.isBookAppointmentFlow() ? 0 : 24,
                paddingBottom: this.isBookAppointmentFlow() ? isIphoneX()? 36 : 24 : 24,
            }}
            entry={"bottom"}
            position={"bottom"}
            ref={modalDetails?.ref}
            swipeArea={100}>
            <View style={{...CommonStyles.styles.commonSwipeBar}}/>
            {modalDetails?.method()}
        </Modal>)
    }

    /**
     * @function renderAppointmentCard
     * @description This method is used to render slot with member detail.
     */

    renderAppointmentCard = (slotDetail) => {
        const tz = this.props?.settings?.appointments?.timezone;
        const now = parseInt(momentTimeZone().tz(tz).format('HHmm'));
        const isAfterCurrentDay = moment(slotDetail?.title, "MM-DD-YYYY").isSameOrAfter(moment(), 'day');
        const slotStartAfterCurrent = now < moment(slotDetail.start, "Hmm").format('HHmm');
        const sameDay = moment(slotDetail?.title, "MM-DD-YYYY").isSame(moment(), 'day');
        let shouldDisplay = sameDay ? (slotStartAfterCurrent === true) : true;
        const startTimeAppt = moment(slotDetail.title + " "
            + (this.getTimeFromMilitaryStamp(slotDetail.start).time), 'MM-DD-YYYY HH:mm:ss').format('hh:mm a')
        const endTimeAppt = moment(slotDetail.title + " "
            + (this.getTimeFromMilitaryStamp(slotDetail.end).time), 'MM-DD-YYYY HH:mm:ss').format('hh:mm a')

        if (slotDetail) {

            return (
                <View style={styles.appointmentCard}>
                    <View style={styles.appointmentCardTop}>
                        <View style={styles.appointmentTimingWrapper}>
                            <Text
                                style={styles.appointmentTimingText}>{startTimeAppt}</Text>
                            <FAIcon name="long-arrow-right" size={20} color={Colors.colors.neutral50Icon}/>
                            <Text
                                style={styles.appointmentTimingText}>{endTimeAppt}</Text>
                        </View>
                    </View>
                    {slotDetail?.bookedAppointments?.map(bookedAppointment => {
                        return (
                            <View style={styles.appointmentCardBottom}>
                                <View style={styles.appointmentPersonalInfoWrapper}>
                                    <View>
                                        {bookedAppointment?.memberImage ? <View>
                                            <Image
                                                style={styles.appointmentProImage}
                                                resizeMode="cover"
                                                source={{uri: S3_BUCKET_LINK + bookedAppointment.memberImage}}/>
                                            <View style={{
                                                ...styles.onlineStatus,
                                                backgroundColor: Colors.colors.successIcon
                                            }}/>
                                        </View> : <View
                                            style={{
                                                ...styles.appointmentProBgMain,
                                                backgroundColor: Colors.colors.warningBGDM,
                                            }}>
                                            <Text
                                                style={styles.appointmentProLetterMain}>{bookedAppointment.memberName.charAt(0).toUpperCase()}</Text>
                                        </View>
                                        }
                                    </View>
                                    <View style={styles.appointmentItemDetail}>
                                        <Text
                                            style={styles.appointmentItemName}>{bookedAppointment.memberName}</Text>
                                        <Text style={styles.appointmentItemDes}
                                              numberOfLines={1}>{bookedAppointment.serviceName}</Text>
                                    </View>
                                </View>
                                {!this.viewProviderProfile && (
                                    <View>
                                        <Button disabled={!(shouldDisplay && isAfterCurrentDay)}
                                                transparent style={styles.moreBtn} onPress={() => {
                                            this.openModal('modalNextAppointment', {
                                                ...slotDetail,
                                                appointmentId: bookedAppointment?.appointmentId
                                            });
                                        }}
                                        >
                                            <FeatherIcon style={{
                                                ...styles.moreIcon,
                                                color: shouldDisplay && isAfterCurrentDay ? Colors.colors.primaryIcon : Colors.colors.mainBlue20
                                            }}
                                                         type={'Feather'} name="more-horizontal" size={20}/>
                                        </Button>
                                    </View>
                                )}
                            </View>)
                    })}
                </View>
            )
        }

    }

    /**
     * @function renderSlotDetail
     * @description This method is used to render slot detail.
     */
    renderSlotDetail = (slotDetail) => {
        let startTime = moment(slotDetail.title + " " + (this.getTimeFromMilitaryStamp(slotDetail.start).time), 'MM-DD-YYYY HH:mm:ss').format('hh:mm a')
        let endTime = moment(slotDetail.title + " " + (this.getTimeFromMilitaryStamp(slotDetail.end).time), 'MM-DD-YYYY HH:mm:ss').format('hh:mm a');
        const tz = this.props?.settings?.appointments?.timezone;
        const now = parseInt(momentTimeZone().tz(tz).format('HHmm'));
        const isAfterCurrentDay = moment(slotDetail?.title, "MM-DD-YYYY").isSameOrAfter(moment(), 'day');
        const slotStartAfterCurrent = now < moment(slotDetail.start, 'Hmm').format('HHmm');
        const sameDay = moment(slotDetail?.title, "MM-DD-YYYY").isSame(moment(), 'day');
        let shouldDisplay = sameDay ? (slotStartAfterCurrent === true) : true;
        return (
            <View style={styles.availableSlotCard}>
                <View style={styles.appointmentTimingWrapper}>
                    <Text style={styles.appointmentTimingText}>{startTime}</Text>
                    <FAIcon name="long-arrow-right" size={20} color={Colors.colors.neutral50Icon}/>
                    <Text style={styles.appointmentTimingText}>{endTime}</Text>
                </View>
                <View>
                    <Button disabled={!(shouldDisplay && isAfterCurrentDay)}
                            transparent style={styles.moreBtn} onPress={() => {
                        this.openModal('modalNextSlot', slotDetail);
                    }}>
                        <FeatherIcon
                            style={{
                                ...styles.moreIcon,
                                color: shouldDisplay && isAfterCurrentDay ? Colors.colors.primaryIcon : Colors.colors.mainBlue20
                            }}
                            type={'Feather'}
                            name="more-horizontal" size={20}
                            color={Colors.colors.mainBlue20}/>
                    </Button>
                </View>
            </View>
        )
    }

    /**
     * @function _renderHeader
     * @description This method is render the accordion header.
     */
    _renderHeader = (slotDetail, expanded) => {
        return (<View style={styles.accordionHeaderWrapper}>
            <View style={styles.headTextWrap}>
                <Text
                    style={styles.headMainText}>{moment(slotDetail.title, 'MM-DD-YYYY').format('dddd , MMMM D')}</Text>
                <View style={styles.countWrapper}>
                    <Text
                        style={styles.selectedText}>{slotDetail.availableCount} available, {slotDetail.bookedCount} booked</Text>
                </View>
            </View>
            <Icon type={'SimpleLineIcons'} style={{fontSize: 22, color: Colors.colors.primaryIcon}}
                  name={expanded ? "arrow-up" : "arrow-down"}/>
        </View>);
    }

    /**
     * @function _renderContent
     * @description This method is render content in the accordion.
     */

    _renderContent = (dayDetail) => {
        const {slots, title} = dayDetail;
        return (
            slots && (
                <View style={styles.accordionContentWrapper}>
                    {slots?.map(slot => {
                        return (
                            <View>
                                {slot.bookedAppointments.length > 0 ?
                                    this.renderAppointmentCard({...slot, title})
                                    :
                                    this.renderSlotDetail({...slot, title})
                                }
                            </View>
                        )

                    })}
                    {!this.viewProviderProfile && (
                        <View style={styles.greBtn}>
                            <PrimaryButton
                                onPress={() => {
                                    this.navigateToDailySchedule(dayDetail)
                                }}
                                disabled={!moment(dayDetail?.title, "MM-DD-YYYY").isSameOrAfter(moment(), 'day')}
                                text="Manage day"
                            />
                        </View>
                    )}
                </View>
            )
        );
    }

    /**
     * @function renderDaysDetails
     * @description This method is used to render days detail.
     */
    renderDaysDetails = () => {
        const {weeklySchedule} = this.state;
        return (<View style={styles.scheduleListWrapper}>
            {weeklySchedule && (
                <Accordion
                    dataArray={weeklySchedule}
                    animation={true}
                    expanded={true}
                    style={{borderTopColor: Colors.colors.borderColor}}
                    renderHeader={this._renderHeader}
                    renderContent={this._renderContent}
                />
            )}
        </View>)
    }


    /**
     * @function getBookedApptList
     * @description This method is used to get booked appointments count.
     */
    getBookedApptList = (bookedAppointments) => {
        return bookedAppointments?.filter(appointment => appointment?.status === APPOINTMENT_STATUS.BOOKED)?.length;
    }

    /**
     * @function populateWeeklySchedule
     * @description This method is used to populate weekly schedule according to accordion.
     */
    populateWeeklySchedule = (weeklySchedule) => {
        return Object.keys(weeklySchedule?.schedule).map(daySchedule => {
            let bookedCount = 0;
            weeklySchedule.schedule[daySchedule].filter(slot => {
                bookedCount = bookedCount + this.getBookedApptList(slot.bookedAppointments);
            });
            return {
                title: daySchedule,
                availableCount: weeklySchedule.schedule[daySchedule].filter(slot => slot.bookedAppointments?.length < 1)?.length,
                bookedCount: bookedCount,
                slots: weeklySchedule.schedule[daySchedule]
            }
        });
    }

    /**
     * @function getWeeklySchedule
     * @description This method is used to get weekly schedule .
     */
    getWeeklySchedule = async () => {
        this.setState({isLoading: true});
        try {
            const {weekStartDate, durationType} = this.state;
            const payload = {
                durationType: durationType,
                providerId: this.viewProviderProfile ? this.providerId : this.props?.auth?.meta?.userId,
                timeZone: this.viewProviderProfile ? this.scheduleDetails?.timezone :
                    ( this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true)),
                weekStartDate: moment(weekStartDate).format('DD-MM-YYYY')
            }
            const weeklySchedule = await ScheduleService.getWeeklySchedule(payload);
            if (weeklySchedule.errors) {
                AlertUtil.showErrorMessage(weeklySchedule.errors[0].endUserMessage)
                this.setState({isLoading: false});
            } else {
                this.setState({
                    weeklySchedule: this.populateWeeklySchedule(weeklySchedule)
                        .sort((a, b) => moment(a.title, "MM-DD-YYYY").diff(moment(b.title, "MM-DD-YYYY"))),
                    isLoading: false
                });
            }
        } catch (error) {
            console.warn(error);
            this.setState({isLoading: false});
        }
    };


    /**
     * @function removeAllSlotsByWeek
     * @description This method is used to update OR remove slot by date.
     */
    removeAllSlotsByWeek = async () => {
        this.setState({isLoading: true});
        const {weekStartDate} = this.state;
        try {
            const payload = {
                weekStartDate: moment(weekStartDate).format('DD-MM-YYYY')
            }
            const response = await ScheduleService.removeAllSlotsByWeek(payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response?.errors?.[0]?.endUserMessage);
                this.setState({isLoading: false, openModal: false});
            } else {
                AlertUtil.showSuccessMessage(response.message)
                this.setState({
                    openModal: false,
                    isLoading: false
                }, () => {
                    this.getWeeklySchedule();
                });
            }
        } catch (error) {
            console.warn(error);
            this.setState({isLoading: false});
        }
    };


    /**
     * @function requestChanges
     * @description This method is used to request changes in appointment.
     */
    requestChanges = async () => {
        this.setState({isLoading: true});
        const {selectedItem, selectedSlot, selectedDate} = this.state;
        const selectedAppointment = selectedItem?.bookedAppointments?.find(bookAppointment => bookAppointment?.appointmentId === selectedItem?.appointmentId)
        const payload = {
            appointmentId: selectedAppointment.appointmentId,
            participantId: selectedAppointment.memberId,
            serviceId: selectedAppointment.serviceId,
            slot: {start: selectedSlot.start, end: selectedSlot.end},
            day: parseInt(selectedDate ? selectedDate.day : moment(selectedItem.title, "MM-DD-YYYY").format("D")),
            month: parseInt(selectedDate ? selectedDate?.month : moment(selectedItem.title, "MM-DD-YYYY").format("M")),
            year: parseInt(selectedDate ? selectedDate?.year : moment(selectedItem.title, "MM-DD-YYYY").format("YYYY")),
            comment: '',
        };
        const response = await AppointmentService.requestChanges(payload.appointmentId, payload);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false, openModal: false, selectedItem: null});
        } else {
            this.setState({isLoading: false, openModal: false, selectedItem: null}, () => {
                this.getWeeklySchedule()
            })
        }
    };

    /**
     * @function getAvailableSlotsByDate
     * @description This method is used to get available slots .
     * @params date
     */
    getAvailableSlotsByDate = (title) => {
        const {weeklySchedule} = this.state;
        const daySchedule = weeklySchedule.find(daySchedule => daySchedule.title === title);
        return daySchedule?.slots.filter(slot => slot?.bookedAppointments.length < 1).map(slot => {
            return {
                start: slot.start,
                end: slot.end,
                id: uuid4(),
                selected: false
            }
        })
    }


    /**
     * @function renderSlotChange
     * @description This method is used to render slot change view.
     */
    renderSlotChange = () => {
        const {selectedItem, availableSlotsForAppointment, selectedSlot} = this.state;
        return (
            <View style={{flex: 1}}>
                <Content enableResetScrollToCoords={false} showsVerticalScrollIndicator={false}>
                    <View style={{...styles.actionsTopWrapper, marginBottom: 32}}>
                        <View style={{
                            ...styles.modalTitleWrapper,
                            alignItems: 'flex-start',
                            flexDirection: 'column',
                            marginBottom: 0
                        }}>
                            <Text style={{
                                ...styles.modalTitleText,
                                marginBottom: 8
                            }}>{moment(selectedItem.title, "MM-DD-YYYY").format("MMMM D,YYYY")}</Text>
                            <Text style={styles.modalTitleSubTextBottom}>{availableSlotsForAppointment.length} time
                                slots available</Text>
                        </View>
                    </View>
                    {availableSlotsForAppointment && availableSlotsForAppointment.map(slot => {
                        const startTime = getTimeFromMilitaryStamp(slot.start);
                        const endTime = getTimeFromMilitaryStamp(slot.end);
                        const selected = slot?.id === selectedSlot?.id;
                        return (
                            <TouchableOpacity onPress={() => {
                                this.setState({selectedSlot: slot})
                            }} style={{
                                ...styles.slotView,
                                backgroundColor: selected ? Colors.colors.primaryColorBG : Colors.colors.whiteColor,
                                borderColor: selected ? Colors.colors.mainBlue40 : Colors.colors.borderColor
                            }}>
                                <Text style={{
                                    ...styles.slotText, color: selected ?
                                        Colors.colors.primaryText : Colors.colors.highContrast
                                }}>{startTime.desc} - {endTime.desc}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </Content>
                {selectedSlot && (
                    <View style={{...styles.actionList, marginTop: 25, marginBottom: 40}}>
                        <PrimaryButton
                            testId="continue"
                            onPress={() => {
                                this.requestChanges();
                            }}
                            text="Continue"
                        />
                    </View>
                )}
            </View>
        );
    }

    /**
     * @function renderDateChange
     * @description This method is used to render Date change view.
     */
    renderDateChange = () => {
        const {selectedItem} = this.state;
        const selectedAppointment = selectedItem?.bookedAppointments?.find(bookAppointment => bookAppointment?.appointmentId === selectedItem?.appointmentId)
        return (
            <View style={{flex: 1}}>
                <SelectDateTimeV2Component
                    originalAppointment={this.originalAppointment}
                    selectedMember={{connectionId: selectedAppointment.memberId}}
                    selectedService={{id: selectedAppointment.serviceId}}
                    backClicked={this.backClicked}
                    getAvailableSlots={AppointmentService.getAvailableSlots}
                    getMasterSchedule={AppointmentService.getMasterSchedule}
                    appointments={this.props.settings.appointments}
                    updateAppointment={(payload) => {
                        this.setState({
                            selectedSlot: payload?.selectedSchedule?.slot,
                            selectedDate: payload?.selectedSchedule
                        }, () => {
                            this.requestChanges()
                        })
                    }}
                    isMemberApp={false}
                    providerId={this.props?.auth?.meta?.userId}
                    modalView={true}
                    timezone={this.props?.settings?.appointments?.timezone}
                />
            </View>
        )
    }


    submitMutualAppointmentRequest = async (bookAppointmentFlowPayload)=>{
        const {selectedItem} = this.state;
        const appointmentRequest  = {
            memberId: bookAppointmentFlowPayload?.patient?.connectionId,
            providerId: this.providerId,
            serviceId: bookAppointmentFlowPayload.service.id,
            slot: {start: selectedItem.start, end: selectedItem.end},
            day: parseInt(moment(selectedItem.title, "MM-DD-YYYY").format("D")),
            month: parseInt(moment(selectedItem.title, "MM-DD-YYYY").format("M")),
            year: parseInt(moment(selectedItem.title, "MM-DD-YYYY").format("YYYY")),
            timeZone: this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true)
        }
        this.setState({isLoading: true});
        const response = await AppointmentService.requestMutualAppointment(appointmentRequest);

        if(response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false, openModal: false, selectedItem: null});
        } else {
            this.setState({isLoading: false, openModal: false, selectedItem: null}, () => {
                this.getWeeklySchedule()
            });
        }

    };

    /**
     * @function submitAppointmentRequest
     * @description This method is used to submit appointment request.
     */
    submitAppointmentRequest = async (bookAppointmentFlowPayload) => {
        try {
            const {selectedItem} = this.state;
            const payload = {
                participantId: bookAppointmentFlowPayload.patient.connectionId,
                serviceId: bookAppointmentFlowPayload.service.id,
                slot: {start: selectedItem.start, end: selectedItem.end},
                day: parseInt(moment(selectedItem.title, "MM-DD-YYYY").format("D")),
                month: parseInt(moment(selectedItem.title, "MM-DD-YYYY").format("M")),
                year: parseInt(moment(selectedItem.title, "MM-DD-YYYY").format("YYYY")),
                primaryConcern: "",
                timeZone: this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true)
            };

            this.setState({isLoading: true});
            const response = await AppointmentService.requestAppointment(payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors?.[0]?.endUserMessage);
                this.setState({isLoading: false, openModal: false});
            } else {
                AlertUtil.showSuccessMessage("Appointment Requested")
                this.setState({isLoading: false, openModal: false, selectedItem: null}, () => {
                    this.getWeeklySchedule()
                });
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage("Whoops! Something went wrong");
            this.setState({isLoading: false, openModal: false});
        }

    };

    /**
     * @function renderBookAppointmentModal
     * @description This method is used to render book appointment modal.
     */

    renderBookAppointmentModal = () => {
        const {services, providerDetails, providers, guests, connections, durationType} = this.state;
        return (
            <BookedAppointmentSliderComponent
                services={services}
                providerDetails={providerDetails}
                providers={providers}
                guests={guests}
                connections={connections}
                submitAppointmentRequest={this.viewProviderProfile ? this.submitMutualAppointmentRequest : this.submitAppointmentRequest}
                durationType={durationType}
                navigation = {this.props.navigation}
            />
        )
    }

    changeTimeSlot = (slot) => {
        this.hideTimeModal();
        this.updateOrRemoveSlotByDate(false, slot)
    }

    /**
     * @function getRenderModalDetails
     * @description This method is used to get render modal details
     */
    getRenderModalDetails = (type) => {
        switch (type) {
            case 'modalNextAppointment' :
                return {ref: "modalNextAppointment", maxHeight: '65%', method: () => this.renderAppointmentModal()};
            case 'modalNextSlot' :
                return {ref: "modalNextSlot", maxHeight: null, method: () => this.renderSlotModal()};
            case 'modalFilterAppointment' :
                return {ref: "modalFilterAppointment", maxHeight: null, method: () => this.renderFilterModal()};
            case 'modalRemoveAllSlots' :
                return {ref: "modalRemoveAllSlots", maxHeight: null, method: () => this.renderRemoveAllSlotsModal()};
            case 'modalChangeSlot' :
                return {ref: "modalChangeSlot", maxHeight: '80%', method: () => this.renderSlotChange()};
            case 'modalChangeDate' :
                return {ref: "modalChangeDate", maxHeight: '80%', method: () => this.renderDateChange()};
            case 'modalBookAppointment' :
                return {ref: "modalBookAppointment", maxHeight: '80%', method: () => this.renderBookAppointmentModal()};
            default :
                return null
        }
    }

    /**
     * @function renderTimeModalView
     * @description This method is used to render time modal view
     */
    renderTimeModalView = () => {
        const {openTimeModal, selectedItem} = this.state;
        return (
            <TimeSlotSelectionComponent
                openTimeModal={openTimeModal}
                selectedSlot={selectedItem}
                hideTimeModal={this.hideTimeModal}
                nextAppointment={true}
                saveChanges={this.changeTimeSlot}
            />
        )
    }


    render() {
        if (this.state.isLoading) {
            return <Loader/>
        }
        const {openModal, modalDetails, openTimeModal, weeklySchedule} = this.state;

        return (<Container style={{backgroundColor: Colors.colors.screenBG}}>
            {this.renderScreenHeader()}
            <Content enableResetScrollToCoords={false} showsVerticalScrollIndicator={false}>
                {this.renderWeekSliderSection()}
                {weeklySchedule && this.renderBookedProgress()}
                {weeklySchedule && this.renderDaysDetails()}
                {!this.viewProviderProfile && weeklySchedule && this.renderRemoveAllSlotsBtn()}
            </Content>
            {openModal && modalDetails && this.renderPageMainModal()}
            {openTimeModal && this.renderTimeModalView()}
        </Container>);
    }
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 23,
        paddingRight: 16,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },
    headerText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        alignSelf: 'center',
        padding: 0,
    },
    backButton: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    filterBtn: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    seeAllBtn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 28,
        paddingTop: 0,
        paddingBottom: 0,
    },
    arrowBtn: {
        paddingVertical: 0,
        height: 24,
    },
    seeAllBtnText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.buttonTextM,
        color: Colors.colors.primaryText,
        paddingRight: 8,
    },
    appointmentCard: {
        borderRadius: 12,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...CommonStyles.styles.shadowBox,
        marginBottom: 8,
    },
    appointmentCardTop: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'solid',
        borderBottomWidth: 1,
    },
    appointmentTimingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '75%'
    },
    appointmentTimingText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
    },
    appointmentCardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 28,
    },
    appointmentPersonalInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '70%'
    },
    appointmentProImage: {
        width: 48,
        height: 48,
        borderRadius: 80,
        overflow: 'hidden',
    },
    appointmentProBgMain: {
        width: 48,
        height: 48,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appointmentProLetterMain: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH6,
        color: Colors.colors.whiteColor,
    },
    appointmentItemDetail: {
        paddingLeft: 12,
    },
    appointmentItemName: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
    },
    appointmentItemDes: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.mediumContrast,
    },
    moreBtn: {
        paddingVertical: 0,
        height: 24,
    },
    moreIcon: {
        marginLeft: 0,
        marginRight: 0,
        color: Colors.colors.primaryIcon
    },
    availableSlotCard: {
        borderRadius: 12,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...CommonStyles.styles.shadowBox,
        paddingVertical: 24,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    btnOptions: {
        marginBottom: 8,
    },
    modalTitleWrapper: {
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionsTopWrapper: {
        marginBottom: 16,
    },
    modalTitleText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
    },
    modalTitleSubText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.mediumContrast,
    },
    modalTitleSubTextBottom: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.mediumContrast
    },
    scheduleSliderWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 23,
        paddingHorizontal: 24,
        marginBottom: 17,
    },
    sliderLeftWrapper: {
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    sliderCenterWrapper: {
        // flex:2,
    },
    sliderCenterText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
    },
    sliderRightWrapper: {
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    progressWrapper: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    progressInfoWrapper: {
        marginBottom: 16,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    progressInfoText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
    },
    progressInfoValue: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.secondaryText,
    },
    progressBarWrapper: {},
    scheduleListWrapper: {
        paddingHorizontal: 24,
        marginBottom: 48,
    },

    accordionHeaderWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    headTextWrap: {},
    headMainText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
        marginBottom: 4
    },
    countWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    selectedText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        marginRight: 3,
    },
    manageDayBtnWrapper: {
        marginBottom: 8,
    },
    accordionContentWrapper: {
        paddingTop: 12,
        paddingBottom: 4,
    },
    greBtn: {
        marginTop: 16,
        marginBottom: 8,
    },
    errorBtnWrapper: {
        paddingHorizontal: 24,
        marginBottom: 57,
    },
    boldText: {
        ...TextStyles.mediaTexts.manropeBold,
    },
    extendedText: {
        ...TextStyles.mediaTexts.linkTextL,
        ...TextStyles.mediaTexts.manropeExtraBold,
        width: "100%",
    },
    itemWrap: {
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        backgroundColor: Colors.colors.white,
        borderRadius: 12,

    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 29,
    },
    buttonTextMain: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast
    },
    buttonTextSub: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.mediumContrast
    },
    slotView: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 25,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderColor: Colors.colors.mainBlue
    },
    slotText: {
        ...TextStyles.mediaTexts.TextH7,
        ...TextStyles.mediaTexts.manropeMedium
    }
});
export default connectSettings()(ProviderAllScheduleScreen);
