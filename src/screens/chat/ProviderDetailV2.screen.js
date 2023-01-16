import React, {Component} from "react";
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    compareDay, ContentLoader,
    getAvatar,
    getHeaderHeight,
    getTimeFromMilitaryStamp, isIphoneX,
    SelectDateTimeV2Component,
    TextStyles,
    uuid4
} from "ch-mobile-shared";
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import {Body, Button, Container, Content, Header, Icon, Left, Right, Text} from "native-base";
import FAIcon from 'react-native-vector-icons/FontAwesome';
import {RenderTextChipComponent} from "ch-mobile-shared/src/components/RenderTextChipComponent";
import {RatingComponent} from "ch-mobile-shared/src/components/RatingComponent";
import AntIcon from "react-native-vector-icons/AntDesign";
import Modal from 'react-native-modalbox';
import {TransactionSingleActionItem} from "ch-mobile-shared/src/components/TransactionSingleActionItem";
import FeatherIcon from "react-native-vector-icons/Feather";
import {Screens} from "../../constants/Screens";
import {connectSettings} from "../../redux";
import {CONNECTION_TYPES, DEFAULT_AVATAR_COLOR} from "ch-mobile-shared/src/constants/CommonConstants";
import Loader from "../../components/Loader";
import ProfileService from "../../services/ProfileService";
import {APPOINTMENT_STATUS, DAYS, ERROR_NOT_FOUND, SEGMENT_EVENT} from "../../constants/CommonConstants";
import moment from "moment";
import momentTimeZone from "moment-timezone";
import AppointmentService from "../../services/AppointmentService";
import Analytics from "@segment/analytics-react-native";
import {TimeSlotSelectionComponent} from "../../components/time-picker-component/TimeSlotSelectionComponent";
import {isCloseToBottom} from "ch-mobile-shared/src/utilities";
import {BookedAppointmentSliderComponent} from "../../components/provider-schedule/BookAppointmentSliderComponent";
import {BookedAppointmentModal} from "../../components/provider-schedule/BookedAppointmentModal";
import ScheduleService from "../../services/ScheduleService";
import {PrimaryButton} from "ch-mobile-shared/src/components/PrimaryButton";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_phone_and_provider.json";

const HEADER_SIZE = getHeaderHeight();

const actionButtonList = [{
    title: 'Cancel appointment',
    iconBackground: Colors.colors.whiteColor,
    iconName: "closecircleo",
    iconColor: Colors.colors.errorIcon,
    iconType: 'AntDesign',
    actionType: 'CANCEL_APPOINTMENT'
}, {
    title: 'Go to chat',
    iconBackground: Colors.colors.whiteColor,
    iconName: "message-circle",
    iconColor: Colors.colors.primaryIcon,
    iconType: 'Feather',
    actionType: 'GO_TO_CHAT',

},/* {
    title: 'Change time',
    iconBackground: Colors.colors.whiteColor,
    iconName: "access-time",
    iconColor: Colors.colors.primaryIcon,
    iconType: 'MaterialIcons',
    actionType: 'CHANGE_TIME',
}, {
    title: 'Change date',
    iconBackground: Colors.colors.whiteColor,
    iconName: "calendar",
    iconColor: Colors.colors.primaryIcon,
    iconType: 'Feather',
    actionType: 'CHANGE_DATE'
}*/
]

class ProviderDetailScreenV2 extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            connections: [],
            services: [],
            groups: [],
            providers: [],
            activeSegmentId: 'email',
            guests: [],
            providerDetails: {},
            feedbackSummaryDetails: null,
            reviewsDetail: [],
            currentPage: 0,
            nextAppointment: null,
            openTimeModal: false,
            isDatePickerVisible: false,
            modalType: '',
            selectedSlot: null,
            openModal: false,
            tz: this.props?.settings?.appointments?.timezone ? this.props?.settings?.appointments?.timezone : momentTimeZone.tz.guess(true),
            update: false,
            slots: [],
            cancelAppointment : null
        };
    }

    componentDidMount = async () => {
        this.props.refreshAppointments();
        this.props.getAppointmentsSilently();
        this.mapPropsToState();
        this.createScheduleFromProps();
        this.getAvailableSlots();
        this.getAllGroups();
        this.getFeedbackSummary();
        this.getReviewDetails(false);
        this.publicProfileRefreshHandler = this.props.navigation.addListener('willFocus', payload => {
            this.props.refreshAppointments();
            this.props.getAppointmentsSilently();
            this.mapPropsToState();
            this.createScheduleFromProps();
            this.getAvailableSlots();
            this.getAllGroups();
            this.getFeedbackSummary();
            this.getReviewDetails(false);

        });
    };

    componentWillUnmount(): void {
        if (this.publicProfileRefreshHandler) {
            this.publicProfileRefreshHandler.remove();
        }
    }

    getAppointments = () => {
        const {tz} = this.state;
        return this.props?.appointments?.currentAppointments
            .filter(appointment => appointment.status === APPOINTMENT_STATUS.BOOKED && moment.tz(appointment.endTime, tz).isSameOrAfter(moment().format('YYYY-MM-DD HH:mm:ss'), 'm'))
            .sort((a, b) => moment.utc(a?.startTime).diff(moment.utc(b?.startTime)));
    }


    /**
     * @function mapPropsToState
     * @description This method is used to map props to state.
     */
    mapPropsToState = () => {
        this.setState({
            services: [...this.props?.settings?.providerCustomServices, ...this.props?.settings?.providerDefaultServices],
            providerDetails: this.props?.profile?.profile,
            providers: this.props?.connections?.activeConnections?.filter(connection => connection.type === CONNECTION_TYPES.PRACTITIONER),
            guests: this.props?.connections?.activeConnections?.filter(connection => connection.type === CONNECTION_TYPES.PATIENT),
            connections: this.props?.connections?.activeConnections?.filter(connection => connection.type === CONNECTION_TYPES.PATIENT),
            nextAppointment: this.getAppointments()?.[0],
            nextAvailableSlot: this.getNextAvailableSlot(),
            openTimeModal: false,
            isDatePickerVisible: false,
            modalType: '',
            selectedSlot: null,
            openModal: false,
            isLoading: false,

        })
    }


    /**
     * @function isDateToday
     * @description This method is used to check current date & selected Date.
     */
    isDateToday = (date) => {
        return moment(moment().format('YYYY-MM-DD')).isSame(moment(date, 'DD-MM-YYYY').format("YYYY-MM-DD"));
    };


    /**
     * @function getNextAvailableSlot
     * @description This method is used to get next available slots list.
     */
    getNextAvailableSlot = () => {
        console.log({"slots" : this.props?.settings?.appointments})
        const {tz} = this.state;
        let nextAvailableSlot = this.props?.settings?.appointments?.nextAvailableSlot;
        if (nextAvailableSlot?.availableSlot?.length > 0 && this.isDateToday(nextAvailableSlot?.nextAvailableDay)) {
            nextAvailableSlot.availableSlot = nextAvailableSlot?.availableSlot?.filter(slot => {
                const now = parseInt(momentTimeZone().tz(tz).format('HHmm'));
                return now < slot.start;
            });
        }
        return nextAvailableSlot;
    }


    /**
     * @function getAllGroups
     * @description This method is used to get all groups .
     */
    getAllGroups = async () => {
        try {
            const groups = await ProfileService.getAllGroups(this.props?.auth?.meta?.userId, true);
            if (groups.errors) {
                console.warn(groups.errors[0].endUserMessage);
            } else {
                this.setState({
                    groups: groups
                });
            }
        } catch (error) {
            console.warn(error);
        }
    };

    /**
     * @function getFeedbackSummary
     * @description This method is used to get feedback summary by provider id.
     */
    getFeedbackSummary = async () => {
        this.setState({
            isLoading: true
        })
        try {
            const feedbackSummaryDetails = await ProfileService.getProviderFeedbackSummary(this.props?.auth?.meta?.userId);
            if (feedbackSummaryDetails.errors) {
                console.warn(feedbackSummaryDetails.errors[0].endUserMessage);
                if (feedbackSummaryDetails.errors[0].errorCode !== ERROR_NOT_FOUND) {
                    AlertUtil.showErrorMessage(feedbackSummaryDetails.errors[0].endUserMessage);
                }
                this.setState({
                    isLoading: false,
                });
            } else {
                this.setState({
                    feedbackSummaryDetails: feedbackSummaryDetails, isLoading: false
                });
            }
        } catch (error) {
            this.setState({
                isLoading: false
            })
            console.warn(error);
            AlertUtil.showErrorMessage('Unable to retrieve feedback summary');
        }
    };


    /**
     * @function getReviewDetails
     * @description This method is used to get reviews details .
     */
    getReviewDetails = async (isLazy) => {
        isLazy ? this.setState({isLoadingMore: true}) : this.setState({isLoading: true});

        const {currentPage} = this.state;
        try {
            const reviewsDetail = await ProfileService.getProviderFeedback(this.props?.auth?.meta?.userId, currentPage);
            if (reviewsDetail.errors) {
                console.warn(reviewsDetail.errors[0].endUserMessage);
                if (reviewsDetail.errors[0].errorCode !== ERROR_NOT_FOUND) {
                    AlertUtil.showErrorMessage(reviewsDetail.errors[0].endUserMessage);
                }
                this.setState({
                    isLoading: false
                });
            } else {
                const currentPage = reviewsDetail.currentPage;
                const totalPages = reviewsDetail.totalPages;
                const nextReviews = reviewsDetail.feedbackList;
                const hasMore = currentPage < totalPages - 1
                this.setState({
                    reviewsDetail: reviewsDetail.feedbackList && currentPage !== reviewsDetail?.currentPage ? [...reviewsDetail.feedbackList, ...nextReviews] : [...nextReviews],
                    hasMore: hasMore,
                    currentPage: hasMore ? currentPage + 1 : currentPage,
                    isLoading: false,
                    isLoadingMore: false,
                });
            }
        } catch (error) {
            this.setState({
                isLoading: false
            })
            console.warn(error);
            AlertUtil.showErrorMessage('Unable to retrieve reviews');
        }
    };

    /**
     * @function addRemainingDays
     * @description This method is used to add remaining days for default schedule .
     */
    addRemainingDays = (planning, availableDaysHorizon) => {
        let planningHorizon = planning;
        availableDaysHorizon = availableDaysHorizon.map(day => {
            return {
                title: day, desc: [], active: false,
            }
        })
        planningHorizon = [...planningHorizon, ...availableDaysHorizon].sort((i1, i2) => compareDay(i1.title, i2.title))
        return planningHorizon;
    }

    /**
     * @function createScheduleFromProps
     * @description This method is used to create schedule from props.
     */
    createScheduleFromProps = () => {
        const settings = {
            planning: this.props.settings.appointments.planningHorizon ? Object.keys(this.props.settings.appointments.planningHorizon).map(day => {
                return {
                    title: day,
                    desc: JSON.parse(JSON.stringify(this.props.settings.appointments.planningHorizon[day].availability)),
                    active: this.props.settings.appointments.planningHorizon[day].active,
                }
            }).sort((i1, i2) => compareDay(i1.title, i2.title)) : [],
            blocked: this.props.settings.appointments.blockingHorizon ? Object.keys(this.props.settings.appointments.blockingHorizon).map(day => {
                return {
                    title: day,
                    desc: JSON.parse(JSON.stringify(this.props.settings.appointments.blockingHorizon[day].availability)),
                    active: this.props.settings.appointments.blockingHorizon[day].active
                }
            }).sort((i1, i2) => compareDay(i1.title, i2.title)) : []
        };

        const addedDays = settings.planning.map(setting => setting.title);
        let availableDays = DAYS.filter(day => !addedDays.includes(day.toUpperCase()));
        if (availableDays?.length > 0) {
            settings.planning = this.addRemainingDays(settings.planning, availableDays)
        }
        this.setState({schedule: settings});
    };


    /**
     * @function findAvatarColorCode
     * @description This method is used to find avatar color code.
     */
    findAvatarColorCode = (connectionId) => {

        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
        }
        return connection && connection.length > 0 && connection[0].colorCode ? connection[0].colorCode : DEFAULT_AVATAR_COLOR
    }

    /**
     * @function backClicked
     * @description This method is used to navigate to the previous screen.
     */

    backClicked = () => {
        this.props.navigation.goBack();
    };

    /**
     * @function navigateToSeeAllSchedule
     * @description This method is used to navigate to see all schedule screen.
     */

    navigateToSeeAllSchedule = () => {
        this.props.navigation.navigate(Screens.PROVIDER_ALL_SCHEDULE_SCREEN);
    };


    /**
     * @function navigateToSeeAllGuests
     * @description This method is used to navigate to see All guests
     */

    navigateToSeeAllGuests = () => {
        this.props.navigation.navigate(Screens.CONNECTIONS);
    };

    /**
     * @function renderProviderPersonalDetails
     * @description This method is used to render provider personal section.
     */
    renderProviderPersonalDetails = () => {
        const {feedbackSummaryDetails, providerDetails} = this.state;
        const hasMoreReviews = feedbackSummaryDetails?.totalReviews > 1;
        return (<View>
            <View style={styles.personalInfoMainWrapper}>
                <View style={styles.personalInfoWrapper}>
                    <View style={styles.imageWrapper}>
                        <View>
                            {providerDetails?.profileImage ? <Image style={styles.proImage}
                                                                    resizeMode={"cover"}
                                                                    source={{uri: getAvatar({profilePicture: providerDetails?.profileImage})}}
                                                                    alt="Icon"
                            /> : <View style={{
                                ...styles.proBgMain,
                                backgroundColor: providerDetails?.colorCode ? providerDetails?.colorCode : DEFAULT_AVATAR_COLOR
                            }}><Text
                                style={styles.proLetterMain}>{providerDetails?.fullName.charAt(0).toUpperCase()}</Text></View>}
                        </View>
                    </View>
                    <View style={styles.itemDetail}>
                        <Text style={styles.itemName}>{providerDetails?.fullName}</Text>
                        <Text style={styles.itemDes} numberOfLines={1}>
                            {providerDetails?.designation ? providerDetails?.designation : "Therapist"}
                        </Text>
                        <View style={styles.ratingWrapper}>
                            <RatingComponent
                                readonly={true}
                                type='custom'
                                showRating={false}
                                ratingCount={3}
                                size={20}
                                ratingImage={require('../../assets/images/starRating.png')}
                                ratingColor={Colors.colors.mainPink}
                                ratingBackgroundColor={Colors.colors.lowContrast}
                                fractions={2}
                                startingValue={feedbackSummaryDetails?.combinedRating || 0}
                            />
                            <Text style={styles.reviewScore}>
                                {feedbackSummaryDetails?.recentReviews ? feedbackSummaryDetails.totalReviews : "No"}
                                {' '}review{hasMoreReviews ? 's' : ''}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.tagsWrapper}>
                <RenderTextChipComponent renderList={providerDetails?.speciality}/>
            </View>
        </View>)
    }

    /**
     * @function getActiveMembers
     * @description This method is used to get active members list
     */
    getActiveMembers = () => {
        return this.props?.connections?.activeConnections?.filter(connection => connection.type === CONNECTION_TYPES.PATIENT);
    };


    /**
     * @function getSeeAllRenderMethod
     * @description This method is used to get see all render method by given type.
     */
    getSeeAllRenderMethod = (title) => {
        switch (title) {
            case 'Schedule' :
                return {
                    title: title, method: () => this.navigateToSeeAllSchedule()
                }
            case 'Guests' :
                return {
                    title: title, method: () => this.navigateToSeeAllGuests()
                }
            case 'Reviews' :
                return {
                    title: title, method: async () => {
                        await this.getFeedbackSummary();
                        this.openModal("modalAllReviews")
                    }
                }
            default :
                return null
        }
    }

    /**
     * @function seeAllSchedule
     * @description This method is used to render see All section.
     */
    seeAllSection = (title) => {
        const renderSeeAll = this.getSeeAllRenderMethod(title);
        return (<View style={styles.headingWrapper}>
            <Text style={styles.headingTitle}>{renderSeeAll.title}</Text>
            <Button transparent style={styles.seeAllBtn} onPress={renderSeeAll.method}>
                <Text uppercase={false} style={styles.seeAllBtnText}>See {title === "Schedule" ? "full" : "all"}</Text>
                <AntIcon name="arrowright" size={20} color={Colors.colors.primaryIcon}/>
            </Button>
        </View>)
    }

    /**
     * @function _renderDefaultAvailability
     * @description This method is used to render default availability.
     */

    _renderDefaultAvailability = () => {
        const {schedule} = this.state;
        return (<View>
            <View>
                <Text style={styles.contentSubTitle}>Default Availability</Text>
            </View>
            {schedule?.planning?.length > 0 && schedule?.planning?.map(availability => {
                return (<View style={styles.defaultAvailabilityCard}>
                    <View style={styles.defaultAvailabilityTop}>
                        <Text style={styles.defaultAvailabilityTopLeftText}><Text
                            style={styles.textCapitalize}>{availability.title}</Text>'s</Text>
                        <Button transparent style={styles.arrowBtn} onPress={() => {
                            this.navigateToDailySchedule(availability)
                        }}>
                            <AntIcon name="arrowright" size={24} color={Colors.colors.primaryIcon}/>
                        </Button>
                    </View>
                    <View style={{
                        ...styles.defaultAvailabilityBottom,
                        justifyContent: availability?.desc?.length > 0 ? 'flex-start' : 'center'
                    }}>
                        {availability.desc && availability.desc.length > 0 ? availability.desc.map(time => {
                            return (<View style={styles.chipView}>
                                <Text
                                    style={styles.chipText}>{getTimeFromMilitaryStamp(time?.start).desc} - {getTimeFromMilitaryStamp(time?.end).desc}</Text>
                            </View>)
                        }) : <Text style={styles.noAvailabilityText}>No available time slots</Text>}
                    </View>
                </View>)
            })}
        </View>);
    }

    /**
     * @function cancelAppointment
     * @description This method is used to cancel appointment.
     */
    cancelAppointment = async () => {
        this.closeModal();
        this.setState({isLoading: true});
        const nextAppointment = this.getAppointments()?.[0];
        const response = await AppointmentService.cancelAppointment(nextAppointment?.appointmentId, null);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            AlertUtil.showSuccessMessage("Appointment cancelled");
            this.props.refreshAppointments();
            setTimeout(() => {
                this.setState({
                    nextAppointment: null,
                    cancelAppointment: nextAppointment?.appointmentId,
                    isLoading: false
                });
            }, 0)
        }

    };

    /**
     * @function navigateToLiveChat
     * @description This method is used to navigate to live chat screen
     */
    navigateToLiveChat = () => {
        this.closeModal();
        const nextAppointment = this.getAppointments()?.[0];
        const {connections} = this.props;
        let connection = connections.activeConnections.find(item => item.connectionId === nextAppointment.participantId);
        if (connection) {
            this.props.navigation.navigate(Screens.LIVE_CHAT, {
                connection: {...connection, profilePicture: getAvatar(connection)}
            });
        }
    }

    /**
     * @function updateOrRemoveSlotByDate
     * @description This method is used to update OR remove slot by date.
     */
    updateOrRemoveSlotByDate = async (shouldDelete) => {
        this.setState({isLoading: true});
        const {selectedSlot} = this.state;
        let nextAvailableSlot = this.getNextAvailableSlot();
        try {
            let payload;
            if (shouldDelete) {
                payload = {
                    date: moment(nextAvailableSlot?.nextAvailableDay, 'DD-MM-YYYY').format('DD-MM-YYYY'),
                    end: selectedSlot ? selectedSlot.end : nextAvailableSlot?.availableSlot?.[0]?.end,
                    start: selectedSlot ? selectedSlot?.start : nextAvailableSlot?.availableSlot?.[0]?.start
                }
            } else {
                payload = {
                    previousSlot: {
                        date: moment(nextAvailableSlot?.nextAvailableDay, 'DD-MM-YYYY').format('DD-MM-YYYY'),
                        end: nextAvailableSlot?.availableSlot?.[0]?.end,
                        start: nextAvailableSlot?.availableSlot?.[0]?.start
                    }, updatedSlot: {
                        date: moment(nextAvailableSlot?.nextAvailableDay, 'DD-MM-YYYY').format('DD-MM-YYYY'),
                        end: selectedSlot ? selectedSlot.end : nextAvailableSlot?.availableSlot?.[0]?.end,
                        start: selectedSlot ? selectedSlot?.start : nextAvailableSlot?.availableSlot?.[0]?.start
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
                this.props.getAppointmentsSilently();
                setTimeout(() => {
                    this.setState({nextAvailableSlot: null, openModal: false, isLoading: false});
                }, 2000)
            }
        } catch (error) {
            console.warn(error);
            this.setState({isLoading: false});
        }
    };

    /**
     * @function renderReviewsModal
     * @description This method is used to render reviews modal.
     */
    renderReviewsModal = () => {
        const {reviewsDetail, hasMore, isLoadingMore} = this.state;
        return (<View style={{paddingBottom: 24}}>
            <View style={{...styles.actionsTopWrapper}}>
                <View style={styles.modalTitleWrapper}>
                    <Text style={styles.modalTitleText}>Reviews</Text>
                    <Text style={{
                        ...styles.modalTitleSubText, ...TextStyles.mediaTexts.manropeMedium,
                        color: Colors.colors.lowContrast
                    }}>{reviewsDetail?.length} total</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} onScroll={({nativeEvent}) => {
                if (isCloseToBottom(nativeEvent) && hasMore && isLoadingMore !== true) {
                    this.getReviewDetails(true);
                }
            }} style={styles.reviewList}>
                {reviewsDetail?.length > 0 && reviewsDetail?.map(review => {
                    return (<View style={{...styles.reviewBox, marginBottom: 34}}>
                        <View style={styles.reviewHead}>
                            <View style={{display:'flex',flexDirection:'row'}}>
                            <RatingComponent
                                readonly={true}
                                type='custom'
                                showRating={false}
                                ratingCount={3}
                                size={20}
                                ratingImage={require('../../assets/images/starRating.png')}
                                ratingColor={Colors.colors.mainPink}
                                ratingBackgroundColor={Colors.colors.lowContrast}
                                fractions={2}
                                startingValue={review.rating}
                            />
                            <Text
                                style={styles.reviewDetail}>{review?.rating || "N/A"}</Text>
                            </View>
                            <Text
                                style={styles.reviewDate}>{moment.utc(review.createdAt).format("DD/MM/YYYY")}</Text>
                        </View>
                        <Text style={styles.reviewDetail}>{review.publicComment}</Text>
                    </View>)
                })}
                {isLoadingMore !== null ? (<View style={styles.loadMoreView}>
                    <Text style={styles.loadMoreText}>
                        {isLoadingMore ? 'Load More' : 'No more reviews'}
                    </Text>
                    <ActivityIndicator
                        style={styles.loadIcon}
                        animating={isLoadingMore}
                        size="small"
                        color={Colors.colors.lightText2}
                    />
                </View>) : null}

            </ScrollView>
        </View>)
    }

    /**
     * @function getRenderModalDetails
     * @description This method is used to get render modal details
     */
    getRenderModalDetails = (type) => {
        switch (type) {
            case 'modalNextAppointment' :
                return {ref: "modalNextAppointment", maxHeight: null, method: () => this.nextAppointmentModal()};
            case 'modalNextSlot' :
                return {ref: "modalNextSlot", maxHeight: null, method: () => this.nextSlotModal()};
            case 'modalAllReviews' :
                return {ref: "modalAllReviews", maxHeight: '85%', method: () => this.renderReviewsModal()};
            case 'modalBookAppointment' :
                return {ref: "modalBookAppointment", maxHeight: '80%', method: () => this.renderBookAppointmentModal()};
            case 'modalChangeDate' :
                return {ref: "modalChangeDate", maxHeight: '80%', method: () => this.renderDateChange()};
            case 'modalChangeSlot' :
                return {ref: "modalChangeSlot", maxHeight: '80%', method: () => this.renderSlotChange()};
            default :
                return null
        }
    }


    /**
     * @function openModal
     * @description This method is used for open modal.
     */
    openModal = (type, modalType) => {
        this.setState({modalDetails: this.getRenderModalDetails(type), modalType: modalType, openModal: true})
    }

    /**
     * @function closeModal
     * @description This method is used for closing modal.
     */
    closeModal = () => {
        this.setState({modalDetails: null, openModal: false, modalType: ''})
    }

    /**
     * @function isBookAppointmentFlow
     * @description This method is return boolean value for appointment flow.
     */
    isBookAppointmentFlow = () => {
        const {modalDetails} = this.state;
        if (modalDetails) return (modalDetails?.ref === 'modalBookAppointment' || modalDetails?.ref === 'modalBookAppointmentFlows')
    }

    openSettings = () => {
        this.props.navigation.navigate(Screens.SETTINGS_SCREEN);
    };

    /**
     * @function renderPageHeader
     * @description This method is used to render page header
     */
    renderPageHeader = () => {
        return (<Header noShadow={false} transparent style={styles.header}>
            <StatusBar
                backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                translucent
                barStyle={"dark-content"}
            />
            <Left>
                <Button
                    {...addTestID('setting')}
                    transparent style={styles.backButton} onPress={this.openSettings}>
                    <Image style={{height: 24, width: 23}} source={require('../../assets/images/setting-ico.png')}/>
                </Button>
            </Left>
            <Body/>
            <Right/>
        </Header>)
    }

    /**
     * @function renderPageMainModal
     * @description This method is used to render page main model.
     */
    renderPageMainModal = () => {
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
                height: this.state.modalDetails?.maxHeight || 'auto',
                position: 'absolute',
                paddingLeft: this.isBookAppointmentFlow() ? 0 : 24,
                paddingRight: this.isBookAppointmentFlow() ? 0 : 24,
                //paddingBottom: this.isBookAppointmentFlow() ? 0 : 24
                paddingBottom: isIphoneX() ? 24 : 0
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
     * @function navigateToDailySchedule
     * @description This method is used to navigate to the daily schedule Screen.
     */

    navigateToDailySchedule = (selectedSchedule) => {
        this.props.navigation.navigate(Screens.PROVIDER_DAILY_SCHEDULE_SCREEN, {
            selectedSchedule: selectedSchedule, businessHours: false
        });
    };

    /**
     * @function requestChanges
     * @description This method is used to request changes in appointment.
     */
    requestChanges = async () => {
        this.setState({isLoading: true});
        const {selectedSlot, selectedDate} = this.state;
        const nextAppointment = this.getAppointments()?.[0];
        const payload = {
            appointmentId: nextAppointment?.appointmentId,
            participantId: nextAppointment?.participantId,
            serviceId: nextAppointment?.serviceId,
            slot: {start: selectedSlot?.start, end: selectedSlot?.end},
            day: parseInt(selectedDate ? selectedDate?.day : moment(nextAppointment?.startTime).format("D")),
            month: parseInt(selectedDate ? selectedDate?.month : moment(nextAppointment?.startTime).format("M")),
            year: parseInt(selectedDate ? selectedDate?.year : moment(nextAppointment?.startTime).format("YYYY")),
            comment: '',
        };
        const response = await AppointmentService.requestChanges(payload.appointmentId, payload);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false, openTimeModal: false, openModal: false});
        } else {
            AlertUtil.showSuccessMessage("Appointment changes requested successfully");
            this.setState({isLoading: false, openTimeModal: false, openModal: false})
        }
    };

    /**
     * @function _renderReviewList
     * @description This method is render Reviews.
     */

    _renderReviewList = () => {
        const {feedbackSummaryDetails} = this.state;
        if (feedbackSummaryDetails?.recentReviews?.length > 0) {
            return (<View style={styles.reviewsWrapper}>
                {this.seeAllSection('Reviews')}
                {feedbackSummaryDetails?.recentReviews?.length > 0 && feedbackSummaryDetails?.recentReviews?.map(review => {
                    return (<View style={styles.reviewBox}>

                        <View style={styles.reviewHead}>
                            <View style={{display:'flex',flexDirection:'row'}}>
                            <RatingComponent
                                readonly={true}
                                type='custom'
                                showRating={false}
                                ratingCount={3}
                                size={20}
                                ratingImage={require('../../assets/images/starRating.png')}
                                ratingColor={Colors.colors.mainPink}
                                ratingBackgroundColor={Colors.colors.lowContrast}
                                fractions={2}
                                startingValue={review.rating}
                            />
                            <Text
                                style={styles.reviewDetail}>{review?.rating || "N/A"}</Text>
                        </View>
                            <Text
                                style={styles.reviewDate}>{moment.utc(review.createdAt).format("DD/MM/YYYY")}</Text>
                        </View>
                        <Text style={styles.reviewDetail}>{review.publicComment}</Text>
                    </View>)
                })}
            </View>);
        }
    }

    /**
     * @function _renderGuestList
     * @description This method is render Guest List.
     */

    _renderGuestList = () => {
        const activeMembers = this.getActiveMembers();
        const reducedPics = activeMembers
            .sort((c1, c2) => {
                if (c1.profilePicture && !c2.profilePicture) {
                    return -1;
                } else {
                    return 1;
                }
            })
            .map(connection => {

                return {
                    profilePicture: connection.profilePicture, colorCode: connection.colorCode, name: connection.name
                };
            }).slice(0, 6);
        return (<View style={styles.guestWrapper}>
            {this.seeAllSection('Guests')}
            <View style={styles.guestCard}>
                <Text style={styles.guestCardText}>{activeMembers?.length} current guests</Text>
                <View style={styles.guestList}>
                    {reducedPics && reducedPics.map((pic, index) => pic.profilePicture ? (<Image
                        {...addTestID('connection-image-' + index + 1)}
                        style={styles.guestSinglePerson}
                        resizeMode={"cover"}
                        key={'pic-' + index}
                        source={{uri: getAvatar(pic)}}
                        alt="Image"
                    />) : (

                        <View
                            key={'pic-' + index}
                            style={{...styles.guestProBg, backgroundColor: pic.colorCode}}>
                            <Text style={styles.guestProLetter}>{pic.name.charAt(0).toUpperCase()}</Text></View>

                    ))}
                </View>
            </View>
        </View>);
    }

    /**
     * @function hideTimeModal
     * @description This method is used to hide time modal
     */
    hideTimeModal = () => {
        this.setState({openTimeModal: false})
    }

    /**
     * @function changeNextAppointmentSlot
     * @description This method is used to call request changes function by passing values
     */
    changeNextAppointmentSlot = () => {
        const {modalType} = this.state;
        if (modalType === 'NEXT_SLOT') {
            this.updateOrRemoveSlotByDate(false)
        } else {
            this.requestChanges();
        }
    }

    /**
     * @function submitAppointmentRequest
     * @description This method is used to submit appointment request.
     */
    submitAppointmentRequest = async (bookAppointmentFlowPayload) => {
        const nextAvailableSlot = this.getNextAvailableSlot();
        const payload = {
            participantId: bookAppointmentFlowPayload.patient.connectionId,
            serviceId: bookAppointmentFlowPayload.service.id,
            slot: nextAvailableSlot?.availableSlot?.[0],
            day: parseInt(moment(nextAvailableSlot?.nextAvailableDay, 'DD-MM-YYYY').format("D")),
            month: parseInt(moment(nextAvailableSlot?.nextAvailableDay, 'DD-MM-YYYY').format("M")),
            year: parseInt(moment(nextAvailableSlot?.nextAvailableDay, 'DD-MM-YYYY').format("YYYY")),
            primaryConcern: "",
            timeZone: this.props.settings.appointments.timezone || momentTimeZone.tz.guess(true)
        };
        this.setState({isLoading: true});
        const response = await AppointmentService.requestAppointment(payload);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false, openModal: false, modalType: ''});
        } else {
            AlertUtil.showSuccessMessage("Appointment requested successfully");
            const segmentPayload = {
                selectedMember: this.selectedMember?.name,
                appointmentDuration: this.selectedService?.duration,
                appointmentCost: this.selectedService?.cost,
                appointmentMarketRate: this.selectedService?.marketCost,
                appointmentRecommendedPayment: this.selectedService?.recommendedCost,
                selectedService: this.selectedService?.name,
                selectedSchedule: this.selectedSchedule?.dateDesc,
                requestedAt: moment.utc(Date.now()).format('MMMM Do YYYY, h:mm:ss a'),
                startTime: this.selectedSchedule?.slotStartTime?.time + this.selectedSchedule?.slotStartTime?.amPm,
                endTime: this.selectedSchedule?.slotEndTime?.time + this.selectedSchedule?.slotEndTime?.amPm,
                appointmentStatus: APPOINTMENT_STATUS.PROPOSED,
                requestMessage: payload?.comment,
                providerId: this.props.auth?.data?.userId,
                providerName: this.props.auth?.data?.name,
                providerRole: this.props.profile?.profile?.designation,
                serviceType: this.selectedService?.serviceType,
                isProviderApp: true,
                appointmentName: this.selectedService?.name,
                userId: this.selectedService?.participantId
            };
            await Analytics.track(SEGMENT_EVENT.APPOINTMENT_REQUESTED, segmentPayload);
            this.setState({openModal: false, modalType: ''}, () => {
                this.props.refreshAppointments();
                this.props.getAppointmentsSilently();
                this.mapPropsToState();
            });
        }

    };

    /**
     * @function renderBookAppointmentModal
     * @description This method is used to render book appointment modal.
     */

    renderBookAppointmentModal = () => {
        const {
            services, providerDetails, providers, guests, connections, modalType
        } = this.state;
        const nextAvailableSlot = this.getNextAvailableSlot();
        const nextAppointment = this.getAppointments()?.[0];
        let durationType;
        if (modalType === 'NEXT_SLOT') {
            let start = nextAvailableSlot?.availableSlot?.[0]?.start;
            let end = nextAvailableSlot?.availableSlot?.[0]?.end;
            if (end === 0) {
                end = 2400
            }
            if (start === 0) {
                start = 1200
            }
            durationType = parseInt(moment.utc(moment(end, "Hmm").diff(moment(start, "Hmm"))).format("mm"))
        } else {
            durationType = nextAppointment?.serviceDuration
        }
        return (<BookedAppointmentSliderComponent
            services={services}
            providerDetails={providerDetails}
            providers={providers}
            guests={guests}
            connections={connections}
            submitAppointmentRequest={this.submitAppointmentRequest}
            durationType={durationType}
            navigation = {this.props.navigation}
        />)
    }

    updateSlotsForAppointmentList = (selectedSlot) => {
        this.setState({selectedSlot})
    }

    getAvailableSlots = async () => {
        const nextAppointment = this.getAppointments()?.[0];
        if (nextAppointment) {
            const date = moment(nextAppointment?.startTime, "YYYY-MM-DD").format("DD-MM-YYYY");
            const tz = this.props?.settings?.appointments.timezone ? this.props?.settings?.appointments.timezone : momentTimeZone.tz.guess(true);
            const participantId = this.props?.auth?.meta?.userId;
            const serviceId = nextAppointment?.serviceId;
            let response = await AppointmentService.getAvailableSlots(participantId, serviceId, date, tz);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                const hasSlots = response.length > 0;
                if (this.isDateToday(moment(nextAppointment?.startTime, "YYYY-MM-DD").format("DD"))) {
                    response = response.filter(slot => {
                        const now = parseInt(momentTimeZone().tz(tz).format('HHmm'));
                        return now < slot.start;
                    });
                }
                response = response.map(slot => {
                    return {
                        ...slot, id: uuid4()
                    }
                })
                this.setState({slots: response});
            }
        }
    }

    emptyState = () => {
        let emptyStateMsg = 'You do not have any slots right now . If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.';
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

                <Text style={styles.emptyTextMain}>You have no slots</Text>
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
            </View>
        );
    };

    renderSlotChange = () => {
        let {selectedSlot, slots} = this.state;
        const nextAppointment = this.getAppointments()?.[0];
        slots = slots && slots?.length > 0 && slots.map(slot => {
            const startTime = getTimeFromMilitaryStamp(slot?.start);
            const endTime = getTimeFromMilitaryStamp(slot?.end);
            const selected = slot?.id === selectedSlot?.id;
            return (
                <TouchableOpacity onPress={() => {
                    this.updateSlotsForAppointmentList(slot)
                }} style={{
                    ...styles.slotView,
                    backgroundColor: selected ? Colors.colors.primaryColorBG : Colors.colors.whiteColor,
                    borderColor: selected ? Colors.colors.mainBlue40 : Colors.colors.borderColor
                }}>
                    <Text style={{
                        ...styles.slotText, color: selected ?
                            Colors.colors.primaryText : Colors.colors.highContrast
                    }}>{startTime?.desc} - {endTime?.desc}</Text>
                </TouchableOpacity>
            )
        })

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
                            }}>{moment(nextAppointment?.startTime, "YYYY-MM-DD").format("MMMM D,YYYY")}</Text>
                            <Text style={styles.modalTitleSubTextBottom}>{slots?.length} time slots available</Text>
                        </View>
                    </View>
                    {slots?.length > 0 ? slots : this.emptyState()}
                </Content>
                {selectedSlot && (
                    <View style={{...styles.actionList, marginTop: 25, marginBottom: Platform.OS === 'ios' ? 20 : 40}}>
                        <PrimaryButton
                            testId="continue"
                            disabled={!selectedSlot}
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
     * @function nextAppointmentModal
     * @description This method is used to render next appointment model.
     */
    nextAppointmentModal = () => {
        const nextAppointment = this.getAppointments()?.[0];

        return (<BookedAppointmentModal
            appointment={nextAppointment}
            cancelAppointment={this.cancelAppointment}
            navigateToLiveChat={this.navigateToLiveChat}
            changeTime={() => {
                this.closeModal();
                setTimeout(() => {
                    this.openModal('modalChangeSlot', 'NEXT_APPOINTMENT')
                }, 100)
            }}
            changeDate={() => {
                this.openModal('modalChangeDate', 'NEXT_APPOINTMENT')
            }}
            actionButtonList={actionButtonList}
        />)
    }

    /**
     * @function renderDateChange
     * @description This method is used to render date change modal.
     */
    renderDateChange = () => {
        const nextAppointment = this.getAppointments()?.[0];
        return (<SelectDateTimeV2Component
            originalAppointment={this.originalAppointment}
            selectedMember={{connectionId: nextAppointment?.participantId}}
            selectedService={{id: nextAppointment?.serviceId}}
            backClicked={this.backClicked}
            getAvailableSlots={AppointmentService.getAvailableSlots}
            getMasterSchedule={AppointmentService.getMasterSchedule}
            appointments={this.props.settings.appointments}
            updateAppointment={(payload) => {
                this.setState({
                    selectedSlot: payload?.selectedSchedule?.slot,
                    selectedDate: payload?.selectedSchedule
                }, () => {
                    this.changeNextAppointmentSlot()
                })
            }}
            isMemberApp={false}
            providerId={this.props?.auth?.meta?.userId}
            modalView={true}
            timezone={this.props?.settings?.appointments?.timezone}
        />)
    }

    /**
     * @function renderTimeSlotView
     * @description This method is used to render time slot view.
     */
    renderTimeSlotView = () => {
        const {openTimeModal, modalType} = this.state;
        const nextAvailableSlot = this.getNextAvailableSlot();
        const nextAppointment = this.getAppointments()?.[0];
        let selectedSlot = {};
        if (modalType === 'NEXT_SLOT') {
            selectedSlot = {
                ...nextAvailableSlot?.availableSlot?.[0]
            }
        } else {
            selectedSlot = {
                start: moment.tz(nextAppointment?.startTime, this.props.settings.appointments.timezone).format("HHmm"),
                end: moment.tz(nextAppointment?.endTime, this.props.settings.appointments.timezone).format("HHmm")
            }
        }
        return (<TimeSlotSelectionComponent
            openTimeModal={openTimeModal}
            selectedSlot={selectedSlot}
            hideTimeModal={this.hideTimeModal}
            nextAppointment={true}
            saveChanges={(payload) => {
                this.setState({
                    selectedSlot: payload,
                }, () => {
                    this.changeNextAppointmentSlot()
                })
            }}
        />)
    }


    /**
     * @function nextAppointmentSection
     * @description This method is used to render next appointment section.
     */
    nextAppointmentSection = () => {
        const nextAppointment = this.getAppointments()?.[0];
        console.log({nextAppointment})
        const deletedAppointment = this.state?.cancelAppointment === nextAppointment?.appointmentId;
        if (deletedAppointment) {
            return (
                <View>
                    <Text style={styles.contentSubTitle}>Next Appointment</Text>
                    <ContentLoader type="next-appointment" numItems="1"/>
                </View>
            )
        } else if (nextAppointment) {
            const day = moment(nextAppointment?.startTime).format("dddd");
            return (<View>
                <View>
                    <Text style={styles.contentSubTitle}>Next Appointment</Text>
                </View>
                <View style={styles.appointmentCard}>
                    <View style={styles.appointmentCardTop}>
                        <View style={styles.appointmentCardTopLeft}>
                            <FAIcon name="calendar-check-o" size={20}
                                    color={Colors.colors.secondaryText}/>
                            <Text style={styles.appointmentTopLeftText}>{day}</Text>
                        </View>
                        <Text
                            style={styles.appointmentTopRightText}>{nextAppointment?.startText} - {nextAppointment?.endText}</Text>
                    </View>
                    <View style={styles.appointmentCardBottom}>
                        <View style={styles.appointmentPersonalInfoWrapper}>
                            <View>
                                <View>
                                    {nextAppointment?.participantImage ? <Image style={styles.appointmentProImage}
                                                                                resizeMode={"cover"}
                                                                                source={{uri: getAvatar({profilePicture: nextAppointment?.participantImage})}}
                                                                                alt="Icon"
                                    /> : <View style={{
                                        ...styles.appointmentProBgMain, backgroundColor: Colors.colors.mainBlue
                                    }}
                                    ><Text
                                        style={styles.appointmentProLetterMain}>{nextAppointment?.participantName.charAt(0).toUpperCase()}</Text></View>}
                                </View>
                            </View>
                            <View style={styles.appointmentItemDetail}>
                                <Text style={styles.appointmentItemName}>{nextAppointment?.participantName}</Text>
                                <Text style={styles.appointmentItemDes}
                                      numberOfLines={1}>{nextAppointment?.serviceName}</Text>
                            </View>
                        </View>
                        <View>
                            <Button transparent style={styles.moreBtn} onPress={() => {
                                this.openModal("modalNextAppointment", 'NEXT_APPOINTMENT');
                            }}>
                                <Icon style={styles.moreIcon} type={'Feather'} name="more-horizontal"
                                      size={24} color={Colors.colors.primaryIcon}/>
                            </Button>
                        </View>
                    </View>
                </View>
            </View>)
        }
    }

    /**
     * @function nextAvailableSlot
     * @description This method is used to render next available slot section.
     */
    nextAvailableSlot = () => {
        console.log({state : this.state})
        const nextAvailableSlot = this.getNextAvailableSlot();
        if (nextAvailableSlot && nextAvailableSlot?.availableSlot?.length > 0) {
            const startTime = getTimeFromMilitaryStamp(nextAvailableSlot?.availableSlot?.[0].start);
            const endTime = getTimeFromMilitaryStamp(nextAvailableSlot?.availableSlot?.[0].end);
            return (<View>
                <View><Text style={styles.contentSubTitle}>Next Available Slot</Text></View>
                <View style={styles.availableSlotCard}>
                    <View style={styles.availableSlotLeft}>
                        <Text
                            style={styles.availableSlotTopText}>{moment(nextAvailableSlot?.nextAvailableDay, 'DD-MM-YYYY').format("dddd , MMMM D")}</Text>
                        <Text
                            style={styles.availableSlotBottomText}>{startTime.time + ' ' + startTime.amPm + ' - ' + endTime.time + ' ' + endTime.amPm}</Text>
                    </View>
                    <View>
                        <Button transparent style={styles.moreBtn} onPress={() => {
                            this.openModal('modalNextSlot', 'NEXT_SLOT')
                        }}>
                            <Icon style={styles.moreIcon} type={'Feather'} name="more-horizontal"
                                  size={24} color={Colors.colors.primaryIcon}/>
                        </Button>
                    </View>
                </View>
            </View>)
        }
    }

    /**
     * @function nextSlotModal
     * @description This method is used to render next available slot modal.
     */
    nextSlotModal = () => {
        const nextAvailableSlot = this.getNextAvailableSlot();
        const startTime = getTimeFromMilitaryStamp(nextAvailableSlot?.availableSlot?.[0].start);
        const endTime = getTimeFromMilitaryStamp(nextAvailableSlot?.availableSlot?.[0].end);
        return (<Content enableResetScrollToCoords={false} showsVerticalScrollIndicator={false}>
            <View style={{...styles.actionsTopWrapper, marginBottom: 32}}>
                <View style={styles.modalTitleWrapper}>
                    <Text
                        style={styles.modalTitleText}>{moment(nextAvailableSlot.nextAvailableDay, 'DD-MM-YYYY').format("MMMM D")}, {startTime.desc} - {endTime.desc}</Text>
                </View>
            </View>
            <View style={styles.actionList}>
                <View style={styles.btnOptions}>
                    <TransactionSingleActionItem
                        title={'Remove time slot'}
                        iconBackground={Colors.colors.whiteColor}
                        styles={styles.gButton}
                        renderIcon={(size, color) => <AntIcon size={22} color={Colors.colors.errorIcon}
                                                              name="closecircleo"/>}
                        onPress={() => {
                            this.closeModal();
                            this.updateOrRemoveSlotByDate(true)
                        }}
                    />
                </View>
                {/*<View style={styles.btnOptions}>
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
                </View>*/}
                <View style={styles.btnOptions}>
                    <TransactionSingleActionItem
                        title={'Book appointment'}
                        iconBackground={Colors.colors.whiteColor}
                        styles={styles.gButton}
                        renderIcon={(size, color) => <FeatherIcon size={22} color={Colors.colors.successIcon}
                                                                  name="calendar"/>}
                        onPress={() => {
                            this.setState(({openModal: false}), () => {
                                this.openModal('modalBookAppointment', 'NEXT_SLOT')
                            })
                        }}
                    />
                </View>
            </View>
        </Content>)
    }


    /**
     * @function renderScheduleMain
     * @description This method is used to render schedule main view.
     */
    renderScheduleMain = () => {
        return (<View style={styles.scheduleWrapper}>
            {this.seeAllSection('Schedule')}
            {this.nextAppointmentSection()}
            {this.nextAvailableSlot()}
            {this._renderDefaultAvailability()}
        </View>)
    }


    render() {
        if (this.props?.settings?.isLoading || this.props?.appointments?.isLoading || this.state.isLoading) {
            return <Loader/>
        }
        const {openTimeModal, openModal, modalDetails} = this.state;
        return (<Container style={{backgroundColor: Colors.colors.screenBG}}>
            {this.renderPageHeader()}
            <Content enableResetScrollToCoords={false} showsVerticalScrollIndicator={false}>
                {this.renderProviderPersonalDetails()}
                <View style={styles.mainContentWrapper}>
                    {this._renderGuestList()}
                    {this.renderScheduleMain()}
                    {this._renderReviewList()}
                </View>
            </Content>
            {openModal && modalDetails && this.renderPageMainModal()}
            {openTimeModal && this.renderTimeSlotView()}
        </Container>);
    }
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15, paddingLeft: 23, paddingRight: 16, height: HEADER_SIZE, ...CommonStyles.styles.headerShadow
    }, backButton: {
        paddingLeft: 0, paddingRight: 0,
    }, personalInfoMainWrapper: {
        flexDirection: 'column', paddingHorizontal: 24, paddingTop: 24
    }, personalInfoWrapper: {
        flexDirection: 'row', alignItems: 'center',
    }, proImage: {
        width: 112, height: 112, borderRadius: 80, overflow: 'hidden',
    }, proBgMain: {
        width: 112, height: 112, borderRadius: 80, justifyContent: 'center', alignItems: 'center',
    }, proLetterMain: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.TextH3, color: Colors.colors.whiteColor,
    }, itemDetail: {
        flex: 1, paddingLeft: 16,
    }, itemName: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
        marginBottom: 5,
    }, itemDes: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.TextH7, color: Colors.colors.mediumContrast,
    }, ratingWrapper: {
        paddingTop: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    }, reviewScore: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    }, tagsWrapper: {
        marginLeft: 24,
    }, mainContentWrapper: {
        paddingHorizontal: 24, marginVertical: 40,
    }, scheduleWrapper: {
        marginBottom: 32,
    }, headingWrapper: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
    }, headingTitle: {
        ...TextStyles.mediaTexts.serifProBold, ...TextStyles.mediaTexts.TextH4, color: Colors.colors.highContrast,
    }, seeAllBtn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 24,
        paddingTop: 0,
        paddingBottom: 0,
    }, arrowBtn: {
        paddingTop: 0, paddingBottom: 0, height: 24, color: Colors.colors.primaryIcon
    }, seeAllBtnText: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.buttonTextM,
        color: Colors.colors.primaryText,
        paddingRight: 8,
    }, guestCard: {
        borderRadius: 12,
        paddingVertical: 32,
        paddingHorizontal: 40,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', ...CommonStyles.styles.shadowBox,
    }, guestCardText: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
        marginBottom: 27,
    }, contentSubTitle: {
        ...TextStyles.mediaTexts.manropeExtraBold, ...TextStyles.mediaTexts.overlineTextM,
        color: Colors.colors.mediumContrast,
        marginBottom: 16,
        textTransform: 'uppercase',
    }, guestWrapper: {
        marginBottom: 40,
    }, peopleRow: {
        // flexDirection: 'row'
    }, guestList: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    }, guestSinglePerson: {
        width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff', marginLeft: -15
    }, guestProBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -15
    }, guestProLetter: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.TextH6, color: Colors.colors.whiteColor,
    }, appointmentCard: {
        borderRadius: 12,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', ...CommonStyles.styles.shadowBox,
        marginBottom: 32,
    }, appointmentCardTop: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'solid',
        borderBottomWidth: 1,
    }, appointmentCardTopLeft: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    }, appointmentTopLeftText: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.secondaryText,
        marginLeft: 11,
    }, appointmentTopRightText: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast,
    }, appointmentCardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 28,
    }, appointmentPersonalInfoWrapper: {
        flexDirection: 'row', alignItems: 'center', width: '70%'
    }, appointmentProImage: {
        width: 48, height: 48, borderRadius: 80, overflow: 'hidden',
    }, appointmentProBgMain: {
        width: 48, height: 48, borderRadius: 80, justifyContent: 'center', alignItems: 'center',
    }, appointmentProLetterMain: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.TextH6, color: Colors.colors.whiteColor,
    }, appointmentItemDetail: {
        paddingLeft: 12,
    }, appointmentItemName: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.TextH7, color: Colors.colors.highContrast,
    }, appointmentItemDes: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.subTextS, color: Colors.colors.mediumContrast,
    }, moreBtn: {
        paddingTop: 0, paddingBottom: 0, height: 24,
    }, moreIcon: {
        marginLeft: 0, marginRight: 0, color: Colors.colors.primaryIcon
    }, availableSlotCard: {
        borderRadius: 12,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', ...CommonStyles.styles.shadowBox,
        padding: 24,
        marginBottom: 32,
    }, availableSlotLeft: {
        flexDirection: 'column',
    }, availableSlotTopText: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,
        marginBottom: 4,
    }, availableSlotBottomText: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.subTextS, color: Colors.colors.mediumContrast,
    }, defaultAvailabilityCard: {
        borderRadius: 12,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', ...CommonStyles.styles.shadowBox,
        marginBottom: 8,
    }, defaultAvailabilityTop: {
        padding: 24,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'solid',
        borderBottomWidth: 1,
    }, defaultAvailabilityTopLeftText: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.subTextM, color: Colors.colors.highContrast,
    }, textCapitalize: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
        textTransform: 'capitalize'
    }, defaultAvailabilityBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
        padding: 24,
    }, noAvailabilityText: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.TextH7, color: Colors.colors.lowContrast,
    }, chipView: {
        backgroundColor: Colors.colors.highContrastBG,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 12,
        paddingRight: 12,
        borderRadius: 16,
        marginRight: 4,
        marginBottom: 8,
    }, chipText: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.TextH7, color: Colors.colors.lowContrast,
    }, reviewsWrapper: {
        marginBottom: 40
    }, reviewList: {
        paddingVertical: 16
    }, reviewBox: {
        marginBottom: 16
    },

    reviewHead: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
    }, reviewDate: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.inputLabel, color: Colors.colors.lowContrast,
    }, reviewDetail: {
        ...TextStyles.mediaTexts.manropeRegular, ...TextStyles.mediaTexts.TextH7, color: Colors.colors.highContrast,
    }, btnOptions: {
        marginBottom: 8,
    }, actionsTopWrapper: {
        marginBottom: 16,
    }, modalTitleWrapper: {
        marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    }, modalTitleText: {
        ...TextStyles.mediaTexts.serifProBold, ...TextStyles.mediaTexts.TextH3, color: Colors.colors.highContrast,
    }, modalTitleSubText: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.mediumContrast,
    }, extendedText: {
        ...TextStyles.mediaTexts.linkTextL, ...TextStyles.mediaTexts.manropeExtraBold, width: "100%",
    }, slotTimeWrapper: {
        marginBottom: 16,
    }, slotTimerSingle: {
        marginBottom: 32,
    }, slotTimerTitle: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.black,
        marginBottom: 16,
    }, slotTimerBox: {}, noPaddingHorizontal: {
        paddingLeft: 0, paddingRight: 0,
    }, searchHeader: {
        backgroundColor: '#fff',
        elevation: 0,
        justifyContent: 'flex-start',
        height: HEADER_SIZE,
        paddingTop: 15,
        paddingBottom: 35,
        paddingLeft: 24,
        paddingRight: 24,
    }, singleItemList: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between'
    }, patientInfoWrapper: {
        flexDirection: 'row', alignItems: 'center',
    }, patientProImage: {
        width: 48, height: 48, borderRadius: 80, overflow: 'hidden',
    }, imageBorder: {
        borderStyle: 'solid', borderWidth: 2, borderRadius: 80, paddingHorizontal: 2, paddingVertical: 2,
    }, patientProBgMain: {
        width: 48, height: 48, borderRadius: 80, justifyContent: 'center', alignItems: 'center',
    }, patientProLetterMain: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.TextH6, color: Colors.colors.whiteColor,
    }, patientItemDetail: {
        paddingLeft: 12,
    }, patientItemName: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.TextH7, color: Colors.colors.highContrast,
    }, patientItemDes: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.subTextS, color: Colors.colors.lowContrast,
    },

    checkWrapper: {
        paddingRight: 10
    }, confirmationBoxWrapper: {
        paddingHorizontal: 24,
    }, confirmationTitleText: {
        ...TextStyles.mediaTexts.serifProBold, ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
        marginBottom: 8,
    }, singleItemWrapper: {
        marginTop: 24, marginBottom: 16,
    }, noSelectedText: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
        marginBottom: 16,
    }, loadMoreView: {
        marginBottom: 10, display: 'flex', flexDirection: 'row', justifyContent: 'center',
    }, loadMoreText: {
        color: Colors.colors.lightText2,
    }, loadIcon: {
        marginLeft: 5,
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
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20,
    },
    emptyAnim: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: 30,
        paddingLeft: 20
    },
    emptyTextMain: {
        color: '#25345C',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        alignSelf: 'center',
        fontSize: 15,
        letterSpacing: 0.5,
        lineHeight: 15,
        marginBottom: 20
    },
    emptyTextDes: {
        color: '#969FA8',
        fontFamily: 'Roboto-Regular',
        alignSelf: 'center',
        fontSize: 14,
        letterSpacing: 0,
        lineHeight: 21,
        paddingLeft: 30,
        paddingRight: 30,
        textAlign: 'center'
    },
});

export default connectSettings()(ProviderDetailScreenV2);
