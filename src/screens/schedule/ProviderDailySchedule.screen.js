import React, {Component} from "react";
import {
    AlertUtil,
    Colors,
    CommonStyles,
    getAvatar,
    getHeaderHeight, getTimeFromMilitaryStamp,
    isIphoneX,
    SelectDateTimeV2Component,
    TextStyles
} from "ch-mobile-shared";
import {Dimensions, Platform, SafeAreaView, StatusBar, StyleSheet, View} from "react-native";
import {Body, Button, Container, Content, Header, Left, Right, Text, Title} from "native-base";
import EntypoIcons from 'react-native-vector-icons/Entypo';
import AntIcon from "react-native-vector-icons/AntDesign";
import Modal from 'react-native-modalbox';
import {TransactionSingleActionItem} from "ch-mobile-shared/src/components/TransactionSingleActionItem";
import FeatherIcon from "react-native-vector-icons/Feather";
import MCIcon from "react-native-vector-icons/MaterialCommunityIcons";
import Loader from "../../components/Loader";
import EventCalendar from "../../components/event-calendar/EventCalendar";
import moment from "moment";
import GradientButton from "../../components/GradientButton";
import Overlay from "react-native-modal-overlay";
import {TimeSlotSelectionComponent} from "../../components/time-picker-component/TimeSlotSelectionComponent";
import {connectSettings} from "../../redux";
import {CRUD_OPERATIONS_ENUMS} from "../../constants/CommonConstants";
import AppointmentService from "../../services/AppointmentService";
import {BookedAppointmentModal} from "../../components/provider-schedule/BookedAppointmentModal";
import {Screens} from "../../constants/Screens";
import ScheduleService from "../../services/ScheduleService";
import momentTimeZone from "moment-timezone";

const {width} = Dimensions.get('window');

const HEADER_SIZE = getHeaderHeight();

const actionButtonList = [
    {
        title: 'Accept appointment',
        iconBackground: Colors.colors.whiteColor,
        iconName: "checkcircle",
        iconColor: Colors.colors.successIcon,
        iconType: 'AntDesign',
        actionType : 'ACCEPT_APPOINTMENT',
        includesIn : ['PENDING']
    },
    {
        title: 'Cancel appointment',
        iconBackground: Colors.colors.whiteColor,
        iconName: "closecircleo",
        iconColor: Colors.colors.errorIcon,
        iconType: 'AntDesign',
        actionType : 'CANCEL_APPOINTMENT',
        includesIn : ['BOOKED']
    },
    {
        title: 'Decline appointment',
        iconBackground: Colors.colors.whiteColor,
        iconName: "closecircleo",
        iconColor: Colors.colors.errorIcon,
        iconType: 'AntDesign',
        actionType : 'CANCEL_APPOINTMENT',
        includesIn : ['PENDING']
    },
    {
        title: 'Change appointment',
        iconBackground: Colors.colors.whiteColor,
        iconName: "pencil",
        iconColor: Colors.colors.primaryIcon,
        iconType: 'FontAwesome',
        actionType : 'CHANGE_DATE',
        includesIn : ['PENDING']
    },
    {
        title: 'Cancel Request',
        iconBackground: Colors.colors.whiteColor,
        iconName: "closecircleo",
        iconColor: Colors.colors.errorIcon,
        iconType: 'AntDesign',
        actionType : 'CANCEL_APPOINTMENT',
        includesIn : ['PROPOSED','REQUESTED']
    },
    {
        title: 'Go to chat',
        iconBackground: Colors.colors.whiteColor,
        iconName: "message-circle",
        iconColor: Colors.colors.primaryIcon,
        iconType: 'Feather',
        actionType : 'GO_TO_CHAT',
        includesIn : ['PENDING','BOOKED','PROPOSED','REQUESTED']

    },
    {
        title: 'Change time',
        iconBackground: Colors.colors.whiteColor,
        iconName: "access-time",
        iconColor: Colors.colors.primaryIcon,
        iconType: 'MaterialIcons',
        actionType : 'CHANGE_TIME',
        includesIn : ['PROPOSED','BOOKED','REQUESTED']
    },
    {
        title: 'Change date',
        iconBackground: Colors.colors.whiteColor,
        iconName: "calendar",
        iconColor: Colors.colors.primaryIcon,
        iconType: 'Feather',
        actionType : 'CHANGE_DATE',
        includesIn : ['PROPOSED','BOOKED','REQUESTED']
    }

]

class ProviderDailyScheduleScreen extends Component {
    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const selectedSchedule = navigation.getParam('selectedSchedule', null);
        const weeklyFlow = navigation.getParam('weeklyFlow', false);
        this.durationType = navigation.getParam('durationType', null);
        const weekStartDate = navigation.getParam('weekStartDate', null);
        this.state = {
            isLoading: true,
            events: [],
            selectedSchedule : selectedSchedule ,
            weeklyFlow : weeklyFlow,
            weekStartDate : weekStartDate,
            durationType : this.durationType,
            selectedEvent : null,
            openTimeModal : false,
            confirmModal : false,
            operationType :'',
        };
    }


    componentDidMount = ()=> {
        if(this.state.weeklyFlow) {
            this.getWeeklySchedule();
        }else{
            this.createScheduleFromProps()
        }
    }



    /**
     * @function createScheduleFromProps
     * @description This method is used to create schedule from props.
     */
    createScheduleFromProps = () => {
        const {selectedSchedule} = this.state;
        console.log({new : this.props.settings.appointments})
        const settings = {
            planning: this.props.settings.appointments.planningHorizon ?
                Object.keys(this.props.settings.appointments.planningHorizon).map(day => {
                    return {
                        title: day,
                        desc: JSON.parse(JSON.stringify(this.props.settings.appointments.planningHorizon[day].availability)),
                        active: this.props.settings.appointments.planningHorizon[day].active,
                    }
                })
                : [],
            blocked: this.props.settings.appointments.blockingHorizon ?
                Object.keys(this.props.settings.appointments.blockingHorizon).map(day => {
                    return {
                        title: day,
                        desc: JSON.parse(JSON.stringify(this.props.settings.appointments.blockingHorizon[day].availability)),
                        active: this.props.settings.appointments.blockingHorizon[day].active
                    }
                }) : []
        };

        this.setState({dailySchedule: settings.planning.find(plan=> plan.title === selectedSchedule.title?.toUpperCase())?.desc},()=>{
            this.populateDailyScheduleDetails()
        });
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
            time= '0' + hour + ':' + min;
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
                if(hour===12) {
                    amPm= 'am';
                }
            }
            time= hour + ':' + min;
            desc = hour + ':' + min + ' ' + amPm;
        }
        return {
            time, amPm, hour, min, desc
        };

    };

    /**
     * @function getWeeklySchedule
     * @description This method is used to get weekly schedule.
     */
    getWeeklySchedule = async () => {
        this.setState({isLoading: true});
        try {
            const {weekStartDate,durationType,selectedSchedule} = this.state;
            const payload = {
                durationType: this.durationType?this.durationType:durationType,
                providerId: this.props?.auth?.meta?.userId,
                timeZone: this.props?.settings?.appointments?.timezone || momentTimeZone.tz.guess(true),
                weekStartDate: moment(weekStartDate).format('DD-MM-YYYY')
            }
            const weeklySchedule = await ScheduleService.getWeeklySchedule(payload);
            if (weeklySchedule.errors) {
                AlertUtil.showErrorMessage(weeklySchedule.errors[0].endUserMessage)
                this.setState({isLoading: false});
            } else {
                this.setState({
                    dailySchedule: weeklySchedule.schedule[selectedSchedule.day]
                },()=>{
                    this.populateDailyScheduleDetails()
                });
            }
        } catch (error) {
            console.warn(error);
            this.setState({isLoading: false});
        }
    };

    /**
     * @function getDefaultMinimumSlot
     * @description getDefaultMinimum slot
     */
    getDefaultMinimumSlot = (events)=>{
        let diffList = [];
        events?.forEach(event => {
            let diffNumber = moment(moment(event.end, "YYYY-MM-DD HH:mm:ss").diff(moment(event.start, "YYYY-MM-DD HH:mm:ss"))).format("mm")
            diffList.push(parseInt(diffNumber));
        });
        return diffList?.length > 0 && Math.min(...diffList.filter(Number)) > 0 ? Math.min(...diffList.filter(Number))  : 60;
    }

    /**
     /**
     * @function populateDailyScheduleDetails
     * @description This method is used to populate daily schedule.
     */
    populateDailyScheduleDetails = () => {
        let {selectedSchedule, dailySchedule, weeklyFlow} = this.state;
        let events = []
        dailySchedule?.forEach(slot => {
            const title = weeklyFlow ? selectedSchedule.title?.toUpperCase() : moment().format("MM-DD-YYYY");
            if(slot?.bookedAppointments?.length>0){
                slot?.bookedAppointments?.forEach(bookedAppointmentDetail=> {
                    const startTimeAppt = moment(title + " "
                        + (this.getTimeFromMilitaryStamp(slot.start).time), 'MM-DD-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
                    const endTimeAppt = moment(title + " "
                        + (this.getTimeFromMilitaryStamp(slot.end).time), 'MM-DD-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')

                    const event = {
                        start: startTimeAppt,
                        end: endTimeAppt,
                        title: bookedAppointmentDetail?.serviceName ? `${bookedAppointmentDetail?.serviceName} with ${bookedAppointmentDetail?.memberName}` : "",
                        type: bookedAppointmentDetail?.status,
                        appointmentId : bookedAppointmentDetail?.appointmentId,
                        memberId : bookedAppointmentDetail?.memberId,
                        slot: {
                            ...slot,
                        },
                    }
                    events.push(event)
                })
            }else {
                let startTime = moment(title + " " + (this.getTimeFromMilitaryStamp(slot.start).time), 'MM-DD-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
                let endTime = moment(title + " " + (this.getTimeFromMilitaryStamp(slot.end).time), 'MM-DD-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')

                const event = {
                    start: startTime,
                    end: endTime,
                    title: '',
                    type: '',
                    slot: slot,
                }
                events.push(event)
            }
        })

        this.setState({events,durationType : this.getDefaultMinimumSlot(events), isLoading: false});
    }

    /**
     * @function openModal
     * @description This method is used for open modal.
     */
    openModal = (type,selectedEvent) => {
        this.setState({
            modalDetails: this.getRenderModalDetails(type),
            selectedEvent : selectedEvent,
            openModal: true})
    }

    /**
     * @function closeModal
     * @description This method is used for closing modal.
     */
    closeModal = () => {
        this.setState({modalDetails: null,selectedEvent:null,openModal: false})
    }

    /**
     * @function backClicked
     * @description This method is used to navigate to the previous screen.
     */

    backClicked = () => {
        this.props.navigation.goBack();
    };

    /**
     * @function hideTimeModal
     * @description This method is used to hide time modal.
     */
    hideTimeModal = ()=>{
        this.setState({openTimeModal : false})
    }

    /**
     * @function renderAvailableModal
     * @description This method is used to render modal view for available slot
     */
    renderAvailableModal = ()=>{
        const {selectedEvent,selectedSchedule,weeklyFlow} = this.state;
        const title = selectedSchedule?.title;
        const startTime = weeklyFlow? moment(selectedEvent.start).format("h:mm a") : getTimeFromMilitaryStamp(selectedEvent?.slot?.start).desc;
        const endTime = weeklyFlow ?  moment(selectedEvent.end).format("h:mm a") :getTimeFromMilitaryStamp(selectedEvent?.slot?.end).desc;
        return(
            <Content showsVerticalScrollIndicator={false}>
                <View style={{...styles.actionsTopWrapper, marginBottom: 32}}>
                    <View style={styles.modalTitleWrapper}>
                        <Text style={styles.modalTitleText}><Text style={styles.modalTitleTextCapitalize}>{weeklyFlow ? moment(title,"MM-DD-YYYY").format('dddd , MMMM D'): title}</Text>{' '}
                            {startTime}-{endTime}</Text>
                    </View>
                </View>
                <View style={styles.actionList}>
                    <View style={styles.btnOptions}>
                        <TransactionSingleActionItem
                            title={'Remove time slot'}
                            iconBackground={Colors.colors.whiteColor}
                            styles={styles.gButton}
                            renderIcon={(size, color) =>
                                <AntIcon size={22} color={Colors.colors.errorIcon} name="delete"/>
                            }
                            onPress = {()=>{
                                this.setState({confirmModal : true,openModal:false});
                            }}
                        />
                    </View>
                    <View style={styles.btnOptions}>
                        <TransactionSingleActionItem
                            title={'Change time slot'}
                            iconBackground={Colors.colors.whiteColor}
                            styles={styles.gButton}
                            renderIcon={(size, color) =>
                                <FeatherIcon size={22} color={Colors.colors.primaryIcon} name="edit-2"/>
                            }
                            onPress={() => {
                                this.setState({openModal :false,openTimeModal:true,operationType: CRUD_OPERATIONS_ENUMS.UPDATE});
                            }}
                        />
                    </View>
                </View>
            </Content>
        )
    }

    /**
     * @function eventClicked
     * @description This method is used to set selected event and open modal
     */
    eventClicked = (event) => {
        if(event?.slot?.bookedAppointments?.length>0){
            this.openModal('modalAppointment',event)
        } else {
            this.openModal('availableModal',event)
        }
    };


    /**
     * @function getRenderModalDetails
     * @description This method is used to get render modal details
     */
    getRenderModalDetails = (type) => {
        switch (type) {
            case 'availableModal' :
                return {ref: "availableModal", maxHeight: '45%', method: () => this.renderAvailableModal()};
            case 'modalAppointment' :
                return {ref: "modalAppointment", maxHeight: '67%', method: () => this.renderAppointmentModal()};
            case 'modalChangeDate' :
                return {ref: "modalChangeDate", maxHeight: '80%', method: () => this.renderDateChange()};
            default :
                return null
        }
    }

    /**
     * @function renderPageMainModal
     * @description This method is used to render page main model.
     */
    renderDateChange = ()=>{
        const {selectedEvent} = this.state;
        const selectedAppointment = selectedEvent?.slot?.bookedAppointments?.find(bookAppointment => bookAppointment?.appointmentId === selectedEvent?.appointmentId)
        return(
            <View style={{flex: 1}}>
            <SelectDateTimeV2Component
                originalAppointment={this.originalAppointment}
                selectedMember={{connectionId: selectedAppointment.memberId}}
                selectedService={{id: selectedAppointment.serviceId}}
                backClicked={this.backClicked}
                getAvailableSlots={AppointmentService.getAvailableSlots}
                getMasterSchedule={AppointmentService.getMasterSchedule}
                appointments={this.props.settings.appointments}
                updateAppointment={(payload)=>{
                    this.setState({
                        selectedEvent : {...this.state.selectedEvent,payload : payload.selectedSchedule}
                    },()=>{
                        this.requestChanges()
                    })
                }}
                isMemberApp={false}
                providerId = {this.props?.auth?.meta?.userId}
                modalView = {true}
                timezone={this.props?.settings?.appointments?.timezone}
            />
            </View>
        )
    }


    /**
     * @function renderPageMainModal
     * @description This method is used to render page main model.
     */
    renderPageMainModal = () => {
        return (
            <Modal
                backdropPressToClose={true}
                backdropColor={Colors.colors.overlayBg}
                backdropOpacity={1}
                isOpen={this.state.openModal}
                onClosed={() => {
                    this.setState({openModal: false, modalDetails: null})
                }}
                style={{
                    ...CommonStyles.styles.commonModalWrapper,
                    height: this.state.modalDetails?.maxHeight || 'auto',
                    position: 'absolute',
                    paddingBottom : isIphoneX()? 35 :0,
                    //maxHeight: this.state.modalDetails?.maxHeight,
                }}
                entry={"bottom"}
                position={"bottom"}
                ref={this.state.modalDetails?.ref}
                swipeArea={100}>
                <View style={{...CommonStyles.styles.commonSwipeBar}}/>
                {this.state.modalDetails?.method()}
            </Modal>
        )
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
                openModal:false,selectedEvent:null,openTimeModal:false
            },()=>{
                this.getWeeklySchedule();
            })
        }
    };

    /**
     * @function cancelAppointment
     * @description This method is used to cancel appointment.
     */
    cancelAppointment = async (appointmentId) => {
        this.setState({isLoading: true});
        const response = await AppointmentService.cancelAppointment(appointmentId, null);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            AlertUtil.showSuccessMessage(response?.message || "Appointment cancelled");
            this.setState({openModal:false,selectedEvent:null,openTimeModal:false},()=>{
                this.getWeeklySchedule()
            })
        }
    };

    /**
     * @function navigateToLiveChat
     * @description This method is used to navigate to live chat screen
     */
    navigateToLiveChat = () => {
        this.closeModal();
        const {selectedEvent} = this.state;
        const {connections} = this.props;
        let connection = connections.activeConnections.find(item => item.connectionId === selectedEvent?.memberId);
        if (connection) {
            this.props.navigation.navigate(Screens.LIVE_CHAT, {
                connection: {...connection, profilePicture: getAvatar(connection)}
            });
        }
    }

    /**
     * @function shouldSaveSlot
     * @description This method is used to return boolean value .
     */
    shouldSaveSlot = (payload)=>{

        let horizon = null;
        horizon = this.props.settings.appointments.planningHorizon;
        if(!horizon) {
            return true;
        }
        let shouldAdd = true;
        if(payload.day) {
            if (horizon[payload.day]) {
                const addedSlot = horizon[payload.day].availability[0];
                if (addedSlot.start === payload.slot.start && addedSlot.end === payload.slot.end) {
                    AlertUtil.showErrorMessage("A slot with same time is added in " + (this.businessHours ? 'Blocked' : 'Business') + ' hours, please remove that slot or pick a different time');
                    shouldAdd = false;
                }
            }
        } else {
            const selectedDays = [this.state.selectedSchedule?.title];
            selectedDays.forEach((day) => {
                if (horizon[day]) {
                    const addedSlot = horizon[day].availability[0];
                    if (addedSlot.start === payload.slot.start && addedSlot.end === payload.slot.end) {
                        AlertUtil.showErrorMessage("A slot with same time is added in " + (this.businessHours ? 'Blocked' : 'Business') + ' hours, please remove that slot or pick a different time');
                        shouldAdd = false;
                    }
                }
            });
        }
        return shouldAdd;
    };


    /**
     * @function addSlot
     * @description This method is used to add slot.
     */
    addSlot = (payload) => {
        console.log({payload})
        if (this.shouldSaveSlot(payload)) {
            this.hideTimeModal();
            if(this.state.weeklyFlow){
                this.updateOrRemoveSlotByDate(false,payload)
            }else {
                const day = payload?.day?.toUpperCase();
                this.setState({isLoading:true})
                this.props.addSlots({
                    ...payload, days: [day]
                });
                setTimeout(()=>{
                    this.setState({openModal:false,selectedEvent:null},()=>{
                        this.props?.getAppointmentsSilently();
                        this.createScheduleFromProps();
                    });
                },3000)
            }
        }
    }

    /**
     * @function deleteSlot
     * @description This method is used to delete slot.
     */
    deleteSlot = ()=>{
        const {selectedEvent,selectedSchedule} = this.state;
        if(this.state.weeklyFlow){
            this.updateOrRemoveSlotByDate(true,selectedEvent)
        }else {
            this.props.deleteSlot({
                day: selectedSchedule.title?.toUpperCase(), slot: selectedEvent.slot, isBusiness: true
            });
            this.setState({openModal:false,confirmModal:false,selectedEvent:null},()=>{
                this.createScheduleFromProps();
            });
        }
    }

    /**
     * @function updateSlot
     * @description This method is used to update slot.
     */
    updateSlot =  (payload)=>{
        if(this.shouldSaveSlot(payload)) {
            if(this.state.weeklyFlow){
                this.updateOrRemoveSlotByDate(false,payload)
            }else {
                this.props.updateSlot({
                    ...payload,selectedSlot:this.state.selectedEvent.slot
                });
                this.setState({openModal:false,selectedEvent:null,openTimeModal:false},()=>{
                    this.createScheduleFromProps();
                });
            }
        }
    }

    /**
     * @function updateOrRemoveSlotByDate
     * @description This method is used to update OR remove slot by date.
     */
    updateOrRemoveSlotByDate = async (shouldDelete, event) => {
        this.setState({isLoading: true});
        const {selectedSchedule,selectedEvent,operationType} = this.state;
        try {
            let payload;
            const date = moment(selectedSchedule?.title,'MM-DD-YYYY').format('DD-MM-YYYY');
            if (shouldDelete || operationType === CRUD_OPERATIONS_ENUMS.ADD) {
                payload = {
                    date: date,
                    end: event?.slot?.end,
                    start: event?.slot?.start
                }
            } else {
                payload = {
                    previousSlot: {
                        date: date,
                        end: selectedEvent?.slot?.end,
                        start: selectedEvent?.slot?.start

                    }, updatedSlot: {
                        date: date,
                        end: event?.slot?.end,
                        start: event?.slot?.start
                    }
                }
            }
            let scheduleUpdateCall = ScheduleService.addSlotByDate;
            if(operationType === CRUD_OPERATIONS_ENUMS.UPDATE){
                scheduleUpdateCall = ScheduleService.updateSlotByDate;
            }
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
                this.setState({selectedSchedule,openTimeModal :false, openModal: false,confirmModal:false}, () => {
                    this.getWeeklySchedule()
                })
            }
        } catch (error) {
            console.warn(error);
            this.setState({isLoading: false});
        }
    };

    /**
     * @function renderAppointmentModal
     * @description This method is used to render appointment modal.
     */
    renderAppointmentModal = () => {
        let {selectedEvent} = this.state;
        const selectedAppointment = selectedEvent?.slot?.bookedAppointments?.find(bookAppointment => bookAppointment?.appointmentId === selectedEvent?.appointmentId);
        const startTimeAppt = moment(selectedEvent.start).format('hh:mm a')
        const endTimeAppt = moment(selectedEvent.end).format('hh:mm a');
        let appointment = {
            ...selectedAppointment,
            startText : startTimeAppt,
            endText : endTimeAppt,
            date : selectedEvent.title,
            participantImage : selectedAppointment?.memberImage,
            participantName : selectedAppointment?.memberName,
            selectedDate: this.state.selectedSchedule?.title || this.state.selectedSchedule?.day
        }
        return (
            <BookedAppointmentModal
                appointment = {appointment}
                confirmAppointment={this.confirmAppointment}
                cancelAppointment = {this.cancelAppointment}
                navigateToLiveChat ={this.navigateToLiveChat}
                changeTime = {()=>{
                    this.setState({openModal : false,
                        openTimeModal : true,
                        operationType: CRUD_OPERATIONS_ENUMS.UPDATE
                    })
                }}
                changeDate =  {()=>{
                    this.closeModal();
                    setTimeout(() => {
                        this.openModal('modalChangeDate', selectedEvent)
                    }, 500)
                }}
                actionButtonList = {actionButtonList}
                applyFilter = {true}
            />
        )
    }

    /**
     * @function requestChanges
     * @description This method is used to request changes in appointment.
     */
    requestChanges = async () => {
        try {
            this.setState({isLoading: true});
            const {selectedEvent, selectedSchedule} = this.state;
            const selectedDate = selectedEvent?.payload?.selectedDate ? moment(selectedEvent?.payload?.selectedDate) : selectedSchedule.title?.toUpperCase();
            const selectedAppointment = selectedEvent?.slot?.bookedAppointments?.find(bookAppointment => bookAppointment?.appointmentId === selectedEvent?.appointmentId)
            const apiPayload = {
                appointmentId: selectedAppointment?.appointmentId,
                participantId: selectedAppointment?.memberId,
                serviceId: selectedAppointment?.serviceId,
                slot: {start: selectedEvent.payload.slot.start, end: selectedEvent.payload.slot.end},
                day: parseInt(moment(selectedDate).format("D")),
                month: parseInt(moment(selectedDate).format("M")),
                year: parseInt(moment(selectedDate).format("YYYY")),
                comment: '',
            };
            const response = await AppointmentService.requestChanges(apiPayload?.appointmentId, apiPayload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({openTimeModal: false, openModal: false, selectedEvent: null,isLoading: false});
            } else {
                this.setState({openTimeModal: false, openModal: false, selectedEvent: null},()=>{
                    if(this.state.weeklyFlow) {
                        this.getWeeklySchedule();
                    }
                })
            }
        }catch (e) {
            this.setState({openTimeModal: false, openModal: false, selectedEvent: null,isLoading: false});
        }
    };

    /**
     * @function renderConfirmModal
     * @description This method is used to render confirm Modal
     */
    renderConfirmModal = ()=>{
        const {confirmModal,selectedEvent,weeklyFlow} = this.state;
        const startTime = weeklyFlow? moment(selectedEvent.start).format("h:mm a") :getTimeFromMilitaryStamp(selectedEvent?.slot?.start).desc;
        const endTime = weeklyFlow ?  moment(selectedEvent.end).format("h:mm a") : getTimeFromMilitaryStamp(selectedEvent?.slot?.end).desc;
        return(
            <Overlay
                containerStyle={styles.confirmOverlay}
                childrenWrapperStyle={styles.confirmWrapper}
                visible={confirmModal}>
                <View style={{width: '100%'}}>
                    <Text style={styles.confirmHeader}>
                        {`Are you sure you want to remove this ${startTime} - ${endTime}?`}
                    </Text>
                    <View style={styles.confirmBtns}>
                        <Button style={{...styles.outlineBtn, flex: 1, marginTop: 10}}
                                onPress={() => {
                                    this.deleteSlot();
                                }}
                        >
                            <Text style={styles.outlineText}>Yes, Remove</Text>
                        </Button>
                        <View style={styles.noBtn}>
                            <GradientButton
                                onPress={() => {
                                    this.setState({confirmModal: false})
                                }}
                                text="No"
                            />
                        </View>
                    </View>
                </View>

            </Overlay>
        )
    }

    /**
     * @function renderHeader
     * @description This method is used to render header.
     */
    renderHeader = ()=>{
        const {selectedSchedule} = this.state;
        return(
            <Header noShadow={false} transparent style={styles.header}>
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
                    <Title style={styles.headerText}>
                        <Text style={styles.headerTextCapitalize}>{this.state?.weeklyFlow ?moment(selectedSchedule?.title,'MM-DD-YYYY').format('dddd , MMMM D'):`${selectedSchedule.title}'s schedule`}</Text></Title>
                </Body>
                <Right style={{flex: 1}}>
                    <Button transparent style={styles.filterBtn} onPress={() => {
                        this.setState({openTimeModal:true,operationType: CRUD_OPERATIONS_ENUMS.ADD});
                    }}>
                        <MCIcon size={24} color={Colors.colors.mainBlue} name="plus"/>
                    </Button>
                </Right>
            </Header>
        )
    }

    /**
     * @function renderTimeSlotView
     * @description This method is used to render time slot view.
     */
    renderTimeSlotView = ()=>{
        const {events,selectedSchedule,openTimeModal,selectedEvent,operationType} = this.state;
        const bookedAppointment = selectedEvent?.slot?.bookedAppointments?.length>0 || false;
        return(
            <TimeSlotSelectionComponent
                openTimeModal={openTimeModal}
                events = {events}
                selectedEvent={selectedEvent}
                selectedSlot = {selectedEvent?.slot}
                selectedSchedule = {selectedSchedule}
                hideTimeModal={this.hideTimeModal}
                operationType = {operationType}
                addSlot = {(payload)=>{
                    this.setState({
                        selectedEvent : {...this.state.selectedEvent,payload : payload}
                    },()=>{
                        this.addSlot(payload)
                    })
                }}
                updateSlot ={(payload)=>{
                    if(bookedAppointment){
                        this.setState({
                            selectedEvent : {...this.state.selectedEvent,payload : payload}
                        },()=>{
                            this.requestChanges()
                        })
                    }else{
                        this.updateSlot(payload)
                    }
                }}
            />
        )
    }

    /**
     * @function renderEvents
     * @description This method is used to render day events.
     */
    renderEvents = ()=>{
        const {events,selectedSchedule} = this.state;
        return(
            <SafeAreaView style={styles.container}>
                <View style={styles.container}>
                    <EventCalendar
                        eventTapped={this.eventClicked}
                        events={events}
                        width={width}
                        size={30}
                        initDate={this.state.weeklyFlow ? moment(selectedSchedule?.title,"MM-DD-YYYY").format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")}
                        scrollToFirst
                        isWeekly = {this.state.weeklyFlow}
                        durationType = {this.state.durationType}
                    />
                </View>
            </SafeAreaView>
        )
    }


    render() {
        if (this.props?.settings?.isLoading ||  this.props?.appointments?.isLoading ||  this.state.isLoading) {
            return <Loader/>
        }
        const {selectedSchedule,confirmModal,openTimeModal,
            modalDetails,openModal} = this.state;
        console.log({props : this.props})
        console.log({state : this.state})
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                {this.renderHeader()}

                <Content showsVerticalScrollIndicator={false}>
                    {selectedSchedule?.description && (
                        <View style={styles.scheduleTopTexWrapper}>
                            <Text style={styles.scheduleTopText}>{selectedSchedule?.description}</Text>
                        </View>
                    )}
                    {this.renderEvents()}
                </Content>
                {openTimeModal && this.renderTimeSlotView()}
                {openModal && modalDetails && this.renderPageMainModal()}
                {confirmModal && this.renderConfirmModal()}
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        paddingTop: 15,
        paddingLeft: 23,
        paddingRight: 16,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },
    backButton: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    headerText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        alignSelf: 'center',
        padding: 0,
    },
    headerTextCapitalize:{
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textTransform: 'capitalize'
    },
    filterBtn: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    moreIcon: {
        marginLeft: 0,
        marginRight: 0,
        color: Colors.colors.primaryIcon
    },
    moreBtn: {
        paddingVertical: 0,
        height: 24,
    },
    scheduleTopTexWrapper: {
        marginBottom: 40,
        marginTop: 16,
        paddingHorizontal: 24,
    },
    scheduleTopText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.mediumContrast,
    },
    timeSlotWrapper: {
        paddingHorizontal: 24,
        marginBottom: 40,
        marginTop : 40
    },
    timeSlotSingle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    slotTimeText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast,
        marginRight: 34,
        marginTop: -12,
        flex: 1,
    },
    slotBoxWrapper: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flex: 5,
    },
    slotBoxSingle: {
        marginVertical: 8,
        width: '100%',
    },
    slotBox: {
        height: '100%',
        borderRadius: 12,
        paddingVertical: 19,
        paddingHorizontal: 16,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        ...CommonStyles.styles.shadowBox,
    },
    slotBoxInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flex: 1,
    },
    slotBoxInfoWrap: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flex: 1,
        marginRight: 20,
    },
    slotBoxInfoTimeWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '90%',
        flexWrap: 'wrap',
    },
    slotBoxInfoTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.linkTextM,
        color: Colors.colors.highContrast,
    },
    slotBoxInfoTime: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.mediumContrast,
        marginRight: 8,
    },
    statusWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    statusBox: {
        width: 8,
        height: 8,
        borderRadius: 30,
        marginRight: 8,
        backgroundColor: Colors.colors.lowContrast,
    },
    confirmOverlay: {
        backgroundColor: 'rgba(37,52,92,0.5)',
    },
    confirmHeader: {
        color: '#25345c',
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.4,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        marginBottom: 30,
        paddingLeft: 18,
        paddingRight: 18,
    },
    confirmBtns: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    noBtn: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center',
    },
    outlineBtn: {
        borderColor: '#f78795',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
        height: 48,
        justifyContent: 'center',
        elevation: 0,
    },
    outlineText: {
        color: '#f78795',
        fontSize: 13,
        letterSpacing: 0.7,
        lineHeight: 19.5,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
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
    greBtn: {
        padding: 24,
        paddingTop: 10,
        paddingBottom: isIphoneX() ? 36 : 24
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
    modalTitleText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textTransform: 'lowercase'
    },
    modalTitleTextCapitalize:{
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textTransform: 'capitalize'
    },
    modalTitleSubText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.mediumContrast,
    },
});
export default connectSettings()(ProviderDailyScheduleScreen);
