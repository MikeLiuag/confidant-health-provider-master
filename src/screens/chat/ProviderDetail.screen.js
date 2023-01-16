import React, {Component} from "react";
import {
    AlertUtil,
    Colors,
    CommonStyles,
    compareDay, ContentLoader,
    getAvatar, getDSTOffset,
    getHeaderHeight, isIphoneX,
    TextStyles
} from "ch-mobile-shared";
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
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
import {APPOINTMENT_STATUS, DAYS, ERROR_NOT_FOUND} from "../../constants/CommonConstants";
import moment from "moment";
import momentTimeZone from "moment-timezone";
import AppointmentService from "../../services/AppointmentService";
import {isCloseToBottom} from "ch-mobile-shared/src/utilities";
import {BookedAppointmentSliderComponent} from "../../components/provider-schedule/BookAppointmentSliderComponent";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_phone_and_provider.json";
import EntypoIcons from "react-native-vector-icons/Entypo";

const HEADER_SIZE = getHeaderHeight();

class ProviderDetailScreenV2 extends Component<Props> {
    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.providerId = navigation.getParam('providerId', null);
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
            type: 'current',
            size: 90,
            refDate: moment(),
            tz: this.props?.settings?.appointments?.timezone ? this.props?.settings?.appointments?.timezone : momentTimeZone.tz.guess(true),
            update: false,
            slots: [],
            cancelAppointment: null,
            appointments: {}
        };
    }

    componentDidMount = async () => {
        this.getAllAppointments();
        this.getAllServices();
        this.getProviderSchedule();
        this.getProviderInfo();
        this.getAllGroups();
        this.getFeedbackSummary();
        this.getReviewDetails(false);
        this.mapPropsToState();
        this.publicProfileRefreshHandler = this.props.navigation.addListener('willFocus', payload => {
            this.getAllAppointments();
            this.getProviderSchedule();
            this.getAllGroups();
            this.getFeedbackSummary();
            this.getReviewDetails(false);
            this.mapPropsToState();

        });
    };

    componentWillUnmount(): void {
        if (this.publicProfileRefreshHandler) {
            this.publicProfileRefreshHandler.remove();
        }
    }


    /**
     * @function getTimeFromMilitaryStamp
     * @description This method is used to get time from military stamp
     */

    getTimeFromMilitaryStamp = (stamp) => {
        const stringStamp = (stamp + "");
        let time, amPm, desc, hour, min;
        if (stringStamp.length === 1) {
            time = '12:0' + stringStamp;
            amPm = 'am';
            desc = time + ' ' + amPm;
            hour = 0;
            min = stamp;
        } else if (stringStamp.length === 2) {
            time = '12:' + stringStamp;
            amPm = 'am';
            desc = time + ' ' + amPm;
            hour = 0;
            min = stamp;
        } else if (stringStamp.length === 3) {
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
                    hour = parseInt(hour) - 12;
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
     * @function getProviderSchedule
     * @description This method is used to get getProviderSchedule by provider id.
     */
    getProviderSchedule = async () => {
        try {
            console.log({self : this.props?.auth?.meta?.userId})
            console.log({providerId : this.providerId})
            const scheduleDetails = await AppointmentService.getProviderSchedule(this.providerId);
            console.log({scheduleDetails})
            if (scheduleDetails.errors) {
                AlertUtil.showErrorMessage(scheduleDetails.errors[0].endUserMessage);
            } else {
                this.setState({
                    scheduleDetails: scheduleDetails
                })
            }
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage("Whoops ! Something went wrong");
        }
    };


    getProviderInfo = async () => {
        try {
            const providerDetails = await ProfileService.getProviderProfile(this.providerId);
            if (providerDetails.errors) {
                AlertUtil.showErrorMessage(providerDetails.errors[0].endUserMessage)
            } else {
                this.setState({
                    providerDetails: providerDetails
                });
            }
        } catch (e) {
            AlertUtil.showErrorMessage("Whoops ! Something went wrong")
        }
    };


    /**
     * @function mapPropsToState
     * @description This method is used to map props to state.
     */
    mapPropsToState = () => {
        this.setState({
            providers: this.props?.connections?.activeConnections?.filter(connection => connection.type === CONNECTION_TYPES.PRACTITIONER),
            guests: this.props?.connections?.activeConnections?.filter(connection => connection.type === CONNECTION_TYPES.PATIENT),
            connections: this.props?.connections?.activeConnections?.filter(connection => connection.type === CONNECTION_TYPES.PATIENT),
            openTimeModal: false,
            isDatePickerVisible: false,
            modalType: '',
            selectedSlot: null,
            openModal: false,

        })
    }

    /**
     * @function getAllServices
     * @description This method is used to get all services .
     */
    getAllServices = async () => {
        try {
            const services = await AppointmentService.getProviderServices(this.providerId);
            console.log({services})
            if (services.errors) {
                console.warn(services.errors[0].endUserMessage);
            } else {
                this.setState({services});
            }
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage("Whoops ! Something went wrong")
        }
    };


    /**
     * @function getAllAppointments
     * @description This method is used to get all appointments .
     */
    getAllAppointments = async () => {
        try {
            const {tz, size, type, refDate} = this.state;
            let appointments = await AppointmentService.getAppointmentsV2(type, size, refDate.format('DD-MM-yyyy'), tz, this.providerId);
            if (appointments.errors) {
                AlertUtil.showErrorMessage(appointments.errors[0].endUserMessage)
            } else {
                const {tz} = this.state;
                appointments = appointments?.singleAppointments
                    .filter(appointment => appointment.status === APPOINTMENT_STATUS.BOOKED && moment.tz(appointment.endTime, tz).isSameOrAfter(moment().format('YYYY-MM-DD HH:mm:ss'), 'm'))
                    .sort((a, b) => moment.utc(a?.startTime).diff(moment.utc(b?.startTime)));

                this.setState({appointments});
            }
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage("Whoops ! Something went wrong")
        }
    };

    /**
     * @function getNextAvailableSlot
     * @description This method is used to get next available slots list.
     */
    getNextAvailableSlot = () => {
        const {scheduleDetails} = this.state;
        return scheduleDetails?.nextAvailableSlot;
    }


    /**
     * @function getAllGroups
     * @description This method is used to get all groups .
     */
    getAllGroups = async () => {
        try {
            const groups = await ProfileService.getAllGroups(this.providerId, true);
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
            const feedbackSummaryDetails = await ProfileService.getProviderFeedbackSummary(this.providerId);
            if (feedbackSummaryDetails.errors) {
                console.warn(feedbackSummaryDetails.errors[0].endUserMessage);
                if (feedbackSummaryDetails.errors[0].errorCode !== ERROR_NOT_FOUND) {
                    AlertUtil.showErrorMessage(feedbackSummaryDetails.errors[0].endUserMessage);
                }
            } else {
                this.setState({
                    feedbackSummaryDetails: feedbackSummaryDetails,
                    isLoading: false
                });
            }
        } catch (error) {
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
            const reviewsDetail = await ProfileService.getProviderFeedback(this.providerId, currentPage);
            if (reviewsDetail.errors) {
                console.warn(reviewsDetail.errors[0].endUserMessage);
                if (reviewsDetail.errors[0].errorCode !== ERROR_NOT_FOUND) {
                    AlertUtil.showErrorMessage(reviewsDetail.errors[0].endUserMessage);
                    this.setState({isLoading: false})
                }
            } else {
                const currentPage = reviewsDetail.currentPage;
                const totalPages = reviewsDetail.totalPages;
                const nextReviews = reviewsDetail.feedbackList;
                const hasMore = currentPage < totalPages - 1
                this.setState({
                    reviewsDetail: reviewsDetail.feedbackList && currentPage !== reviewsDetail?.currentPage ? [...reviewsDetail.feedbackList, ...nextReviews] : [...nextReviews],
                    hasMore: hasMore,
                    currentPage: hasMore ? currentPage + 1 : currentPage,
                    isLoadingMore: false,
                    isLoading: false
                });
            }
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage('Unable to retrieve reviews');
            this.setState({isLoading: false})
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
        this.props.navigation.navigate(Screens.PROVIDER_ALL_SCHEDULE_SCREEN, {
            viewProviderProfile: true,
            providerId: this.providerId,
            scheduleDetails : this.state.scheduleDetails
        });
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
                                style={styles.proLetterMain}>{providerDetails?.fullName?.charAt(0).toUpperCase()}</Text></View>}
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
            case 'Reviews' :
                return {
                    title: "Recent Reviews", method: async () => {
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
     * @function renderBookAppointmentModal
     * @description This method is used to render book appointment modal.
     */

    renderBookAppointmentModal = () => {
        const {
            services, providerDetails, providers, guests, connections, modalType, scheduleDetails
        } = this.state;
        const nextAvailableSlot = this.getNextAvailableSlot();
        const nextAppointment = scheduleDetails?.nextAppointment;
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
            submitAppointmentRequest={this.submitMutualAppointmentRequest}
            durationType={durationType}
            navigation = {this.props.navigation}
        />)
    }

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
            <Left style={{flex: 1}}>
                <Button
                    transparent
                    style={styles.backButton}
                    onPress={this.backClicked}>
                    <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
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
                height: this.state.modalDetails?.maxHeight || 'auto',
                position: 'absolute',
                paddingLeft: this.isBookAppointmentFlow() ? 0 : 24,
                paddingRight: this.isBookAppointmentFlow() ? 0 : 24,
                paddingBottom: isIphoneX() ? 35 : 0
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
     * @function nextSlotModal
     * @description This method is used to render next available slot modal.
     */
    nextSlotModal = () => {
        const nextAvailableSlot = this.getNextAvailableSlot();
        const startTime = this.getTimeFromMilitaryStamp(nextAvailableSlot?.availableSlot?.[0].start);
        const endTime = this.getTimeFromMilitaryStamp(nextAvailableSlot?.availableSlot?.[0].end);
        return (<Content showsVerticalScrollIndicator={false}>
            <View style={{...styles.actionsTopWrapper, marginBottom: 32}}>
                <View style={styles.modalTitleWrapper}>
                    <Text
                        style={styles.modalTitleText}>{moment(nextAvailableSlot.nextAvailableDay, 'DD-MM-YYYY').format("MMMM D")}, {startTime.desc} - {endTime.desc}</Text>
                </View>
            </View>
            <View style={styles.actionList}>
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
                                startingValue={review?.rating}
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

    submitMutualAppointmentRequest = async (bookAppointmentFlowPayload) => {
        const nextAvailableSlot = this.getNextAvailableSlot();

        const appointmentRequest = {
            memberId: bookAppointmentFlowPayload?.patient?.connectionId,
            providerId: this.providerId,
            serviceId: bookAppointmentFlowPayload.service.id,
            slot: nextAvailableSlot?.availableSlot?.[0],
            day: parseInt(moment(nextAvailableSlot?.nextAvailableDay, 'DD-MM-YYYY').format("D")),
            month: parseInt(moment(nextAvailableSlot?.nextAvailableDay, 'DD-MM-YYYY').format("M")),
            year: parseInt(moment(nextAvailableSlot?.nextAvailableDay, 'DD-MM-YYYY').format("YYYY")),
            primaryConcern: "",
            timeZone: this.props.settings.appointments.timezone || momentTimeZone.tz.guess(true)
        }
        this.setState({isLoading: true});
        const response = await AppointmentService.requestMutualAppointment(appointmentRequest);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false, openModal: false, selectedItem: null});
        } else {
            this.setState({isLoading: false, openModal: false, selectedItem: null}, () => {
                this.getProviderSchedule()
            });
        }

    };


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


    /**
     * @function nextAppointmentSection
     * @description This method is used to render next appointment section.
     */
    nextAppointmentSection = () => {

        const {appointments,tz} = this.state;
        if (appointments?.length > 0) {
            let nextAppointment = appointments?.[0];
            const dstOffset = getDSTOffset();
            let startMoment = moment.tz(nextAppointment.startTime,tz).utcOffset(dstOffset);
            let endMoment = moment.tz(nextAppointment.endTime,tz).utcOffset(dstOffset);
            nextAppointment.startText = startMoment.format("h:mm a");
            nextAppointment.endText = endMoment.format("h:mm a");

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
                                    {nextAppointment?.participantImage ?
                                        <Image style={styles.appointmentProImage}
                                               resizeMode={"cover"}
                                               source={{uri: getAvatar({profilePicture: nextAppointment?.participantImage})}}
                                               alt="Icon"
                                        /> : <View style={{
                                            ...styles.appointmentProBgMain,
                                            backgroundColor: Colors.colors.mainBlue
                                        }}
                                        ><Text
                                            style={styles.appointmentProLetterMain}>{nextAppointment?.participantName.charAt(0).toUpperCase()}</Text></View>}
                                </View>
                            </View>
                            <View style={styles.appointmentItemDetail}>
                                <Text
                                    style={styles.appointmentItemName}>{nextAppointment?.participantName}</Text>
                                <Text style={styles.appointmentItemDes}
                                      numberOfLines={1}>{nextAppointment?.serviceName}</Text>
                            </View>
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
        const nextAvailableSlot = this.getNextAvailableSlot();
        if (nextAvailableSlot && nextAvailableSlot?.availableSlot?.length > 0) {
            const startTime = this.getTimeFromMilitaryStamp(nextAvailableSlot?.availableSlot?.[0].start);
            const endTime = this.getTimeFromMilitaryStamp(nextAvailableSlot?.availableSlot?.[0].end);
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
     * @function renderScheduleMain
     * @description This method is used to render schedule main view.
     */
    renderScheduleMain = () => {
        return (<View style={styles.scheduleWrapper}>
            {this.seeAllSection('Schedule')}
            {this.nextAppointmentSection()}
            {this.nextAvailableSlot()}
        </View>)
    }


    render() {
        if (this.state.isLoading) {
            return <Loader/>
        }
        const {openTimeModal, openModal, modalDetails} = this.state;

        console.log({state : this.state})
        return (<Container style={{backgroundColor: Colors.colors.screenBG}}>
            {this.renderPageHeader()}
            <Content showsVerticalScrollIndicator={false}>
                {this.renderProviderPersonalDetails()}
                <View style={styles.mainContentWrapper}>
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
