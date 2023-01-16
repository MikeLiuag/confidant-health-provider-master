import React, {Component} from 'react';
import {FlatList, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button, CheckBox, Content, Header, Text} from 'native-base';
import {
    addTestID,
    Colors,
    CommonSegmentHeader,
    CommonStyles,
    Email_Input_Error,
    Email_Input_Label, EMAIL_REGEX,
    FloatingInputField,
    getAvatar,
    getHeaderHeight, isIphoneX,
    PrimaryButton,
    TextStyles
} from "ch-mobile-shared";
import moment from "moment";
import EntypoIcons from "react-native-vector-icons/Entypo";
import {Emergency_Phone_Input_Error, Emergency_Phone_Input_Label} from "ch-mobile-shared/src/constants/CommonLabels";
import MCIcon from "react-native-vector-icons/MaterialCommunityIcons";
import {RatingComponent} from "ch-mobile-shared/src/components/RatingComponent";
import {SliderSearch} from "ch-mobile-shared/src/components/slider-search";
import {PHONE_REGEX} from "ch-mobile-shared/src/constants";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_Can.json";
import {Screens} from "../../constants/Screens";
import {CONTACT_NOTES_FLAGS, CONTACT_NOTES_STATUS} from "../../constants/CommonConstants";

const HEADER_SIZE = getHeaderHeight();

export class BookedAppointmentSliderComponent extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 0,
            bookAppointmentFlowPayload: {},
            sliderModalDetail: this.getBookAppointmentFlowPageDetails(1),
            ...this.props,
        };
    }

    /**
     * @function validateEmail
     * @description This method is used to validate email.
     */
    validateEmail = () => {
        this.setState({emailFocus: false});
        let hasEmailError = !EMAIL_REGEX.test(this.state.email);
        this.setState({hasEmailError});
        return !hasEmailError;
    };

    /**
     * @function focusEmail
     * @description This method is used to navigate to focus on email field.
     */
    focusEmail = () => {
        this.setState({emailFocus: true});
    };

    /**
     * @function validatePhoneNumber
     * @description This method is used to validate phone numberss.
     */
    validatePhoneNumber = () => {
        let phoneNumberError = false;
        this.setState({phoneNumberFocus: false});
        if ((this.state.phoneNumber === null || this.state.phoneNumber === '') && this.props.profile.phoneNumber) {
            phoneNumberError = true;
        } else if (this.state.phoneNumber && this.state.phoneNumber !== '') {
            phoneNumberError = !PHONE_REGEX.test(this.state.phoneNumber.trim());

        }
        this.setState({phoneNumberError});
        return !phoneNumberError;
    };

    /**
     * @function focusPhoneNumber
     * @description This method is used to focus on phone number field.
     */
    focusPhoneNumber = () => {
        this.setState({phoneNumberFocus: true});
    };

    /**
     * @function onChangePhoneNumberText
     * @description This method is used to update phone number.
     */
    onChangePhoneNumberText = (phoneNumber) => {
        if (/^\d+$/.test(phoneNumber) || phoneNumber === '') {
            let {bookAppointmentFlowPayload} = this.state;
            bookAppointmentFlowPayload.phoneNumber = phoneNumber
            this.setState({bookAppointmentFlowPayload, phoneNumberError: null})
        }
    };

    /**
     * @function _renderInviteNewPatient
     * @description This method is render invite new patient.
     */

    /**
     * @function propagate
     * @description This method is used to propagate the patient list.
     */

    propagate = (connections) => {
        this.setState({connections});
    }

    _renderInviteNewPatient = () => {
        let {bookAppointmentFlowPayload} = this.state;
        return (
            <View>
                <View style={{paddingHorizontal: 24, marginBottom: 40, marginTop: 16}}>
                    <CommonSegmentHeader
                        segments={[
                            {title: 'Email', segmentId: 'email'},
                            {title: 'SMS', segmentId: 'sms'},
                        ]}
                        segmentChanged={(segmentId) => {
                            this.setState({activeSegmentId: segmentId});
                        }}
                    />
                </View>

                <View style={{paddingHorizontal: 24, marginBottom: 40}}>
                    {this.state.activeSegmentId === 'email' ?
                        <FloatingInputField
                            testId={'Email-Input'}
                            hasError={this.state.hasEmailError}
                            hasFocus={this.state.emailFocus}
                            keyboardType={'email-address'}
                            blur={this.validateEmail}
                            focus={this.focusEmail}
                            changeText={(email) => {
                                bookAppointmentFlowPayload.email = email
                                this.setState({bookAppointmentFlowPayload})
                            }}
                            returnKeyType={'send'}
                            submitEditing={this.performLogin}
                            value={this.state.email}
                            labelErrorText={Email_Input_Error}
                            labelText={Email_Input_Label}
                            inputIconType={'SimpleLineIcons'}
                            inputIconName={'envelope'}
                            editable={true}
                            clearText={() => {
                                this.setState({email: ''})
                            }}
                        /> :
                        <FloatingInputField
                            testId={'phone-input'}
                            hasError={this.state.hasPhoneNumberError}
                            hasFocus={this.state.phoneNumberFocus}
                            keyboardType={'phone-pad'}
                            blur={this.validatePhoneNumber}
                            focus={() => {
                                this.focusPhoneNumber();
                            }}
                            changeText={(phoneNumber) => {
                                this.onChangePhoneNumberText(phoneNumber)
                            }}
                            returnKeyType={'next'}
                            getRef={field => {
                                this.form.phoneNumberField = field;
                            }}
                            value={this.state.phoneNumber}
                            labelErrorText={Emergency_Phone_Input_Error}
                            labelText={Emergency_Phone_Input_Label}
                            editable={true}
                        />
                    }
                </View>
            </View>
        );
    }

    /**
     * @function _renderGroupList
     * @description This method is render groups in the list.
     */

    _renderGroupList = () => {
        let {groups, bookAppointmentFlowPayload} = this.state;
        return (
            <View>
                <FlatList
                    data={groups}
                    renderItem={({item, index}) => {
                        return (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    bookAppointmentFlowPayload.group = item;
                                    this.setState({bookAppointmentFlowPayload});
                                }}
                                style={styles.singleItemList}>
                                <View style={{...styles.patientInfoWrapper}}>
                                    <View>
                                        {item.groupImage ? (
                                            <View>
                                                <Image
                                                    {...addTestID('group-image-' + 1)}
                                                    style={styles.patientProImage}
                                                    resizeMode={"cover"}
                                                    key={'pic-'}
                                                    source={{uri: getAvatar(item?.groupImage)}}
                                                />
                                            </View>
                                        ) : (
                                            <View
                                                key={'pic-'}
                                                style={{
                                                    ...styles.patientProBgMain,
                                                    backgroundColor: Colors.colors.warningBGDM
                                                }}>
                                                <Text
                                                    style={styles.patientProLetterMain}>{item?.name.charAt(0).toUpperCase()}</Text></View>
                                        )}
                                    </View>
                                    <View style={styles.patientItemDetail}>
                                        <Text style={styles.patientItemName}>{item?.name}</Text>
                                        <Text style={{...styles.patientItemDes, color: Colors.colors.mediumContrast}}
                                              numberOfLines={1}>{item?.groupAnonymous}</Text>
                                    </View>
                                </View>
                                <View style={styles.checkWrapper}>
                                    <CheckBox value={item?.channelUrl}
                                              checked={item.channelUrl === bookAppointmentFlowPayload?.group?.channelUrl}
                                              color="#CFD2D3"/>
                                </View>
                            </TouchableOpacity>
                        )
                    }
                    }
                />
            </View>
        );
    }


    checkPatientProhibitive = () => {
        const {bookAppointmentFlowPayload} = this.state;
        const contactNotes = bookAppointmentFlowPayload?.patient?.contactNotes
        let isPatientProhibitive = false
        for (let contactNote of contactNotes) {
            if (contactNote.flag === CONTACT_NOTES_FLAGS.PROHIBITIVE && contactNote.status === CONTACT_NOTES_STATUS.ACTIVE) {
                isPatientProhibitive = true;
                break;
            }
        }
        return isPatientProhibitive;
    }

    checkPatientProhibitiveToMarkProfileRed = (item,flagType) => {

        const contactNotes = item?.contactNotes;

        let isPatientProhibitiveOrCautionNotes = false;

        if(contactNotes?.length > 0) {
            for (let contactNote of contactNotes) {
                if (flagType === CONTACT_NOTES_FLAGS.PROHIBITIVE) {
                    if (contactNote.flag === CONTACT_NOTES_FLAGS.PROHIBITIVE && contactNote.status === CONTACT_NOTES_STATUS.ACTIVE) {
                        isPatientProhibitiveOrCautionNotes = true;
                        break;
                    }
                } else if (flagType === CONTACT_NOTES_FLAGS.CAUTION) {
                    if (contactNote.flag === CONTACT_NOTES_FLAGS.CAUTION && contactNote.status === CONTACT_NOTES_STATUS.ACTIVE) {
                        isPatientProhibitiveOrCautionNotes = true;
                        break;
                    }
                }
            }
        }
        return isPatientProhibitiveOrCautionNotes;
    }
    /**
     * @function _renderPatientList
     * @description This method is render patients in the list.
     */

    _renderPatientList = () => {
        let {connections, bookAppointmentFlowPayload} = this.state;
        return (
            <View>
                {/*<View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.singleItemList}>
                        <View style={{...styles.patientInfoWrapper}}>
                            <View>
                                <View style={{...styles.patientProBgMain, backgroundColor: Colors.colors.successBG,}}>
                                    <AntIcon name="pluscircle" size={24} color={Colors.colors.successIcon}/>
                                </View>
                            </View>
                            <View style={styles.patientItemDetail}>
                                <Text style={styles.patientItemName}>Invite new patient</Text>
                            </View>
                        </View>
                        <View style={styles.checkWrapper}>
                            <CheckBox value="test" color="#CFD2D3"/>
                        </View>
                    </TouchableOpacity>
                </View>*/}
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={connections}
                    renderItem={({item, index}) => {
                        const isSelected = item.connectionId === bookAppointmentFlowPayload?.patient?.connectionId
                        return (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (bookAppointmentFlowPayload.patient && isSelected) {
                                        bookAppointmentFlowPayload.patient = null;
                                    } else {
                                        bookAppointmentFlowPayload.patient = item;
                                    }
                                    this.setState({bookAppointmentFlowPayload})
                                }}
                                style={isSelected
                                    ? [styles.singleItemList, styles.singleItemListSelected]
                                    : styles.singleItemList
                                }>
                                <View style={{...styles.patientInfoWrapper}}>
                                    <View>
                                        {item.profilePicture ? (
                                            <View
                                                style={this.checkPatientProhibitiveToMarkProfileRed(item,CONTACT_NOTES_FLAGS.PROHIBITIVE)?{...styles.imageBorder, borderColor: Colors.colors.darkerPink}:this.checkPatientProhibitiveToMarkProfileRed(item,CONTACT_NOTES_FLAGS.CAUTION)?{...styles.imageBorder, borderColor: Colors.colors.starRatingColor}:{...styles.imageBorder, borderColor: Colors.colors.primaryIcon}}>
                                                <Image
                                                    {...addTestID('patient-image-' + 1)}
                                                    style={styles.patientProImage}
                                                    resizeMode={"cover"}
                                                    key={'pic-'}
                                                    source={{uri: getAvatar(item?.profilePicture)}}
                                                />
                                            </View>
                                        ) : (
                                            <View
                                                style={this.checkPatientProhibitiveToMarkProfileRed(item,CONTACT_NOTES_FLAGS.PROHIBITIVE)?{...styles.imageBorder, borderColor: Colors.colors.darkerPink}:this.checkPatientProhibitiveToMarkProfileRed(item,CONTACT_NOTES_FLAGS.CAUTION)?{...styles.imageBorder, borderColor: Colors.colors.starRatingColor}:{...styles.imageBorder, borderColor: Colors.colors.primaryIcon}}>
                                                <View
                                                    key={'pic-'}
                                                    style={{
                                                        ...styles.patientProBgMain,
                                                        backgroundColor: Colors.colors.warningBGDM
                                                    }}>
                                                    <Text
                                                        style={styles.patientProLetterMain}>{item?.name?.charAt(0).toUpperCase()}</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.patientItemDetail}>
                                        <Text style={styles.patientItemName}>{item?.name}</Text>
                                        {item?.firstName !== null && item?.lastName !== null && (
                                            <Text style={styles.patientItemDes}
                                                  numberOfLines={1}>{item?.firstName + ' ' + item?.lastName}</Text>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.checkWrapper}>
                                    <CheckBox
                                        onPress={() => {
                                            if (bookAppointmentFlowPayload.patient && isSelected) {
                                                bookAppointmentFlowPayload.patient = null;
                                            } else {
                                                bookAppointmentFlowPayload.patient = item;
                                            }
                                            this.setState({bookAppointmentFlowPayload})
                                        }}
                                        style={
                                            isSelected ? [styles.singleCheck, styles.singleCheckSelected] : styles.singleCheck
                                        }
                                        value={item.connectionId}
                                        checked={isSelected}
                                        color={Colors.colors.mainBlue}/>
                                </View>
                            </TouchableOpacity>
                        )
                    }
                    }
                />
            </View>
        );
    }

    getEmptyMessages = () => {
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
                <Text style={styles.emptyTextMain}>No services</Text>
                <Text style={styles.emptyTextDes}>As per your selection, we do not have any service available.</Text>

            </View>
        );
    };

    /**
     * @function _renderServiceList
     * @description This method is render services in the list.
     */

    _renderServiceList = () => {
        let {services, bookAppointmentFlowPayload, durationType} = this.state;
        if (durationType) {
            services = services.filter(service => service.duration === durationType && service.serviceAvailable);
        }
        return (
            <View>
                {services?.length > 0 ?
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={services}
                        renderItem={({item, index}) => {
                            const isSelected = bookAppointmentFlowPayload?.service?.id === item.id
                            return (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        if (bookAppointmentFlowPayload.service && isSelected) {
                                            bookAppointmentFlowPayload.service = null;
                                        } else {
                                            bookAppointmentFlowPayload.service = item;
                                        }
                                        this.setState({bookAppointmentFlowPayload})
                                    }}
                                    style={isSelected
                                        ? [styles.singleItemList, styles.singleItemListSelected]
                                        : styles.singleItemList
                                    }>
                                    <View style={{...styles.patientItemDetail, paddingLeft: 0}}>
                                        <Text style={styles.patientItemName}>{item?.name}</Text>
                                        {item?.durationText !== null && (
                                            <Text
                                                style={{...styles.patientItemDes, color: Colors.colors.mediumContrast}}
                                                numberOfLines={1}>{item?.durationText} session</Text>
                                        )}
                                    </View>
                                    <View style={styles.checkWrapper}>
                                        <CheckBox
                                            onPress={() => {
                                                if (bookAppointmentFlowPayload.service && isSelected) {
                                                    bookAppointmentFlowPayload.service = null;
                                                } else {
                                                    bookAppointmentFlowPayload.service = item;
                                                }
                                                this.setState({bookAppointmentFlowPayload})
                                            }}
                                            style={
                                                isSelected ? [styles.singleCheck, styles.singleCheckSelected] : styles.singleCheck
                                            }
                                            value={item.id}
                                            checked={isSelected}
                                            color={Colors.colors.mainBlue}/>
                                    </View>
                                </TouchableOpacity>
                            )
                        }
                        }
                    /> :
                    this.getEmptyMessages()}
            </View>
        );
    }

    /**
     * @function _renderProviderList
     * @description This method is render providers in the list.
     */

    _renderProviderList = () => {
        let {providers, bookAppointmentFlowPayload} = this.state;
        return (
            <View>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={providers}
                    renderItem={({item, index}) => {
                        return (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    bookAppointmentFlowPayload.provider = item;
                                    this.setState({bookAppointmentFlowPayload})
                                }}
                                style={styles.singleItemList}>
                                <View style={{...styles.patientInfoWrapper}}>
                                    <View>
                                        {item.profilePicture ? (
                                            <View
                                                style={{...styles.imageBorder, borderColor: Colors.colors.darkerPink}}>
                                                <Image
                                                    {...addTestID('patient-image-' + 1)}
                                                    style={styles.patientProImage}
                                                    resizeMode={"cover"}
                                                    key={'pic-'}
                                                    source={{uri: getAvatar(item?.profilePicture)}}
                                                />
                                            </View>
                                        ) : (
                                            <View
                                                key={'pic-'}
                                                style={{
                                                    ...styles.patientProBgMain,
                                                    backgroundColor: Colors.colors.warningBGDM
                                                }}>
                                                <Text
                                                    style={styles.patientProLetterMain}>{item?.name.charAt(0).toUpperCase()}</Text></View>
                                        )}
                                    </View>

                                    <View style={styles.patientItemDetail}>
                                        <Text style={styles.patientItemName}>{item?.name}</Text>
                                        <Text style={{...styles.patientItemDes, color: Colors.colors.mediumContrast}}
                                              numberOfLines={1}>{item?.designation}</Text>
                                    </View>
                                </View>
                                <View style={styles.checkWrapper}>
                                    <CheckBox value={item?.id}
                                              checked={bookAppointmentFlowPayload?.provider?.connectionId === item.connectionId}
                                              color="#CFD2D3"/>
                                </View>
                            </TouchableOpacity>
                        )
                    }
                    }
                />
            </View>
        );
    }

    /**
     * @function _renderConfirmation
     * @description This method is render appointment confirmation.
     */

    _renderConfirmation = () => {
        const {bookAppointmentFlowPayload} = this.state;
        return (
            <View>
                <View style={styles.confirmationBoxWrapper}>
                    <Text style={styles.confirmationTitleText}>Patient contact</Text>
                    <View style={styles.singleItemWrapper}>
                        <View style={{...styles.patientInfoWrapper, marginBottom: 16}}>
                            <View>
                                <View
                                    style={{...styles.patientProBgMain, backgroundColor: Colors.colors.primaryColorBG}}>
                                    <MCIcon name="email-outline" size={24} color={Colors.colors.mainBlue}/>
                                </View>
                            </View>
                            <View style={styles.patientItemDetail}>
                                <Text
                                    style={styles.patientItemName}>{bookAppointmentFlowPayload?.email || bookAppointmentFlowPayload?.phoneNumber}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                {bookAppointmentFlowPayload?.group && (
                    <View style={styles.confirmationBoxWrapper}>
                        <Text style={styles.confirmationTitleText}>Connect to group</Text>
                        <View style={styles.singleItemWrapper}>
                            <View style={{...styles.patientInfoWrapper, marginBottom: 16}}>
                                <View>
                                    {bookAppointmentFlowPayload?.group?.profilePicture ? (
                                        <Image
                                            {...addTestID('connection-image-' + 1)}
                                            style={styles.patientProImage}
                                            resizeMode={"cover"}
                                            key={'pic-'}
                                            source={{uri: getAvatar(bookAppointmentFlowPayload?.group?.profilePicture)}}
                                        />
                                    ) : (
                                        <View
                                            key={'pic-'}
                                            style={{
                                                ...styles.patientProBgMain,
                                                backgroundColor: Colors.colors.warningBGDM
                                            }}>
                                            <Text
                                                style={styles.patientProLetterMain}>{bookAppointmentFlowPayload?.group?.name.charAt(0).toUpperCase()}</Text></View>
                                    )}
                                </View>
                                <View style={styles.patientItemDetail}>
                                    <Text
                                        style={styles.patientItemName}>{bookAppointmentFlowPayload?.group?.name}</Text>
                                    {bookAppointmentFlowPayload?.group?.publicGroup && (
                                        <Text style={{...styles.patientItemDes, color: Colors.colors.mediumContrast}}
                                              numberOfLines={1}>Public group</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                        {/*<Text style={styles.noSelectedText}>No groups  selected</Text>*/}
                    </View>
                )}
                {bookAppointmentFlowPayload?.provider && (
                    <View style={styles.confirmationBoxWrapper}>
                        <Text style={styles.confirmationTitleText}>Connect to provider</Text>
                        <View style={styles.singleItemWrapper}>
                            <View style={{...styles.patientInfoWrapper, marginBottom: 16}}>
                                <View>
                                    {bookAppointmentFlowPayload?.provider?.profilePicture ? (
                                        <Image
                                            {...addTestID('provider-' + 1)}
                                            style={styles.patientProImage}
                                            resizeMode={"cover"}
                                            key={'pic-'}
                                            source={{uri: getAvatar(bookAppointmentFlowPayload?.provider?.profilePicture)}}
                                        />
                                    ) : (
                                        <View
                                            key={'pic-'}
                                            style={{
                                                ...styles.patientProBgMain,
                                                backgroundColor: Colors.colors.warningBGDM
                                            }}>
                                            <Text
                                                style={styles.patientProLetterMain}>{bookAppointmentFlowPayload?.provider?.name.charAt(0).toUpperCase()}</Text></View>
                                    )}
                                </View>
                            </View>
                        </View>
                        <Text style={styles.noSelectedText}>No providers selected</Text>
                    </View>
                )}
            </View>
        );
    }

    /**
     * @function _renderReviewList
     * @description This method is render Reviews.
     */

    _renderReviewList = () => {
        const {feedbackSummaryDetails} = this.state;
        return (
            <View style={styles.reviewsWrapper}>
                {this.seeAllSection('Reviews')}
                {feedbackSummaryDetails?.recentReviews?.length > 0 && feedbackSummaryDetails?.recentReviews?.map(review => {
                    return (
                        <View style={styles.reviewBox}>
                            <View style={styles.reviewHead}>
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
                                    style={styles.reviewDate}>{moment.utc(review.createdAt).format("DD/MM/YYYY")}</Text>
                            </View>
                            <Text style={styles.reviewDetail}>{review.publicComment}</Text>
                        </View>
                    )
                })}
            </View>
        );
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
                    profilePicture: connection.profilePicture,
                    colorCode: connection.colorCode,
                    name: connection.name
                };
            }).slice(0, 6);
        return (
            <View style={styles.guestWrapper}>
                {this.seeAllSection('Guests')}
                <View style={styles.guestCard}>
                    <Text style={styles.guestCardText}>{activeMembers?.length} current guests</Text>
                    <View style={styles.guestList}>
                        {reducedPics && reducedPics.map((pic, index) =>
                            pic.profilePicture ? (
                                <Image
                                    {...addTestID('connection-image-' + index + 1)}
                                    style={styles.guestSinglePerson}
                                    resizeMode={"cover"}
                                    key={'pic-' + index}
                                    source={{uri: getAvatar(pic)}}
                                    alt="Image"
                                />
                            ) : (

                                <View
                                    key={'pic-' + index}
                                    style={{...styles.guestProBg, backgroundColor: pic.colorCode}}>
                                    <Text
                                        style={styles.guestProLetter}>{pic?.name?.charAt(0).toUpperCase()}</Text></View>

                            )
                        )}
                    </View>
                </View>
            </View>
        );
    }

    /**
     * @function renderPatientListModal
     * @description This method is used to render patient list modal.
     */
    renderPatientListModal = () => {
        const {connections} = this.state;
        return (
            <View>
                <StatusBar
                    backgroundColor={Platform.OS === 'ios' ? null : "transparent"}
                    translucent
                    barStyle={'dark-content'}
                />
                <View transparent noShadow style={styles.searchHeader}>
                    <SliderSearch
                        options={{
                            screenTitle: 'Select patient',
                            searchFieldPlaceholder: 'Search patient',
                            showBack: false,
                            isDrawer: false,
                            listItems: connections,
                            filter: (connections, query) => {
                                const active = connections.filter(connection =>
                                    connection.name
                                        .toLowerCase()
                                        .includes(query.toLowerCase().trim()),
                                );
                                return active;
                            },
                        }}
                        propagate={this.propagate}
                    />
                </View>
                {this._renderPatientList()}
            </View>
        )
    }

    /**
     * @function getPageToBeRender
     * @description This method is used to get page number for slider modal.
     */
    getPageToBeRender = () => {
        const {bookAppointmentFlowPayload} = this.state;
        if (!bookAppointmentFlowPayload?.patient) return 1;
        else if (!bookAppointmentFlowPayload?.service) return 2;
        else return 1;
    }

    /**
     * @function getBookAppointmentFlowPageDetails
     * @description This method is used to get page details for slider modal.
     */
    getBookAppointmentFlowPageDetails = (currentNumber) => {
        let pageNumber = currentNumber;
        if (!pageNumber) {
            pageNumber = this.getPageToBeRender();
        }
        switch (pageNumber) {
            case 1 :
                return {
                    method: () => this.renderPatientListModal(),
                    title: "Select Patient",
                    position: 1
                };
            case 2 :
                return {
                    method: () => this._renderServiceList(),
                    title: "Select Service",
                    position: 2
                };
            default :
                return null
        }
    }

    /**
     * @function bookAppointmentFlowBackNavigation
     * @description This method is used to handle back navigation for slider modal
     */
    bookAppointmentFlowBackNavigation = (currentPosition) => {
        this.setState({sliderModalDetail: this.getBookAppointmentFlowPageDetails(currentPosition - 1)})
    }

    /**
     * @function getModalBottomSpace
     * @description This method is used to get modal bottom space ( padding )
     */
    getModalBottomSpace = () => {
        const isIphone = Platform.OS === 'ios';
        if (isIphone) {
            return isIphoneX() && this.props?.allScheduleFlow ? 50 : 25
        } else {
            return this.props?.allScheduleFlow ? 30 : 15
        }

    }


    render() {
        const {sliderModalDetail, bookAppointmentFlowPayload} = this.state;
        return (
            <View style={{flex: 1}}>
                <Content enableResetScrollToCoords={false}
                         contentContainerStyle={{paddingBottom: 70}} showsVerticalScrollIndicator={false}
                         ref={c => this.scrollView = c}>
                    {sliderModalDetail.position !== 1 && (
                        <View style={{
                            ...styles.actionsTopWrapper, paddingHorizontal: 18,
                        }}>
                            <View style={styles.backButtonWrapper}>
                                <Button
                                    transparent
                                    style={styles.arrowBtn}
                                    onPress={() => this.bookAppointmentFlowBackNavigation(sliderModalDetail.position)}>
                                    <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                </Button>
                            </View>

                            <View style={{
                                ...styles.modalTitleWrapper,
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                marginLeft: 24,
                                marginBottom: 0,
                            }}>
                                <Text style={styles.modalTitleText}>{sliderModalDetail.title}</Text>
                                <Text style={{
                                    ...TextStyles.mediaTexts.bodyTextS, ...TextStyles.mediaTexts.manropeMedium,
                                    color: Colors.colors.lowContrast
                                }}>Step {sliderModalDetail.position} of 2</Text>
                            </View>
                        </View>
                    )}
                    <View>
                        {sliderModalDetail.method()}
                    </View>
                </Content>
                {(sliderModalDetail.position === 1 &&
                    bookAppointmentFlowPayload.patient) || (sliderModalDetail.position === 2 &&
                    bookAppointmentFlowPayload.service) ?
                    <View style={styles.btnOptions}>
                        <PrimaryButton
                            /*disabled = {(sliderModalDetail.position === 1 &&
                                !bookAppointmentFlowPayload.patient) || (sliderModalDetail.position === 2 &&
                                !bookAppointmentFlowPayload.service)}*/
                            text={sliderModalDetail.title}
                            textColor={Colors.colors.whiteColor}
                            onPress={() => {

                                const isPatientProhibitive=this.checkPatientProhibitive()
                                if (sliderModalDetail.position === 1 && isPatientProhibitive){
                                    this.props.navigation.navigate(Screens.MEMBER_PROHIBITIVE_SCREEN, {
                                        selectedMember:  bookAppointmentFlowPayload.patient
                                    });
                                } else {
                                    if (sliderModalDetail.position === 2) {
                                        this.props.submitAppointmentRequest(bookAppointmentFlowPayload);
                                    } else {
                                        setTimeout(() => {
                                            this.scrollView._root.scrollToPosition(0, 0, true);
                                        }, 10);
                                        this.setState({sliderModalDetail: this.getBookAppointmentFlowPageDetails(null)})
                                    }
                                }
                            }}
                        />
                    </View>
                    : null}
            </View>

        )
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
    backButton: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    personalInfoMainWrapper: {
        flexDirection: 'column',
        paddingHorizontal: 24,
        paddingTop: 24
    },
    personalInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    proImage: {
        width: 112,
        height: 112,
        borderRadius: 80,
        overflow: 'hidden',
    },
    proBgMain: {
        width: 112,
        height: 112,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proLetterMain: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.whiteColor,
    },
    itemDetail: {
        flex: 1,
        paddingLeft: 16,
    },
    itemName: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
        marginBottom: 5,
    },
    itemDes: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.mediumContrast,
    },
    ratingWrapper: {
        paddingTop: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    reviewScore: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    tagsWrapper: {
        marginLeft: 24,
    },
    mainContentWrapper: {
        paddingHorizontal: 24,
        marginVertical: 40,
    },
    scheduleWrapper: {
        marginBottom: 32,
    },
    headingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    headingTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
    },
    seeAllBtn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 24,
        paddingTop: 0,
        paddingBottom: 0,
    },
    arrowBtn: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 24,
    },
    seeAllBtnText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.buttonTextM,
        color: Colors.colors.primaryText,
        paddingRight: 8,
    },
    guestCard: {
        borderRadius: 12,
        paddingVertical: 32,
        paddingHorizontal: 40,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...CommonStyles.styles.shadowBox,
    },
    guestCardText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
        marginBottom: 27,
    },
    contentSubTitle: {
        ...TextStyles.mediaTexts.manropeExtraBold,
        ...TextStyles.mediaTexts.overlineTextM,
        color: Colors.colors.mediumContrast,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    guestWrapper: {
        marginBottom: 40,
    },
    peopleRow: {
        // flexDirection: 'row'
    },
    guestList: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    guestSinglePerson: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#fff',
        marginLeft: -15
    },
    guestProBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -15
    },
    guestProLetter: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH6,
        color: Colors.colors.whiteColor,
    },
    appointmentCard: {
        borderRadius: 12,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...CommonStyles.styles.shadowBox,
        marginBottom: 32,
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
    appointmentCardTopLeft: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    appointmentTopLeftText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.secondaryText,
        marginLeft: 11,
    },
    appointmentTopRightText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast,
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
        paddingTop: 0,
        paddingBottom: 0,
        height: 24,
    },
    moreIcon: {
        marginLeft: 0,
        marginRight: 0,
    },
    availableSlotCard: {
        borderRadius: 12,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...CommonStyles.styles.shadowBox,
        padding: 24,
        marginBottom: 32,
    },
    availableSlotLeft: {
        flexDirection: 'column',
    },
    availableSlotTopText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,
        marginBottom: 4,
    },
    availableSlotBottomText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.mediumContrast,
    },
    defaultAvailabilityCard: {
        borderRadius: 12,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...CommonStyles.styles.shadowBox,
        marginBottom: 8,
    },
    defaultAvailabilityTop: {
        padding: 24,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'solid',
        borderBottomWidth: 1,
    },
    defaultAvailabilityTopLeftText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
    },
    textCapitalize: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
        textTransform: 'capitalize'
    },
    defaultAvailabilityBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
        padding: 24,
    },
    noAvailabilityText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.lowContrast,
    },
    chipView: {
        backgroundColor: Colors.colors.highContrastBG,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 12,
        paddingRight: 12,
        borderRadius: 16,
        marginRight: 4,
        marginBottom: 8,
    },
    chipText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.lowContrast,
    },
    reviewsWrapper: {
        marginBottom: 40
    },
    reviewList: {
        paddingVertical: 16
    },
    reviewBox: {
        marginBottom: 16
    },

    reviewHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewDate: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.lowContrast,
    },
    reviewDetail: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
    },
    btnOptions: {
        ...CommonStyles.styles.stickyShadow,
        padding: 24,
        paddingBottom: 0
    },
    actionsTopWrapper: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center'
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
    },
    modalTitleSubText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.mediumContrast,
    },
    extendedText: {
        ...TextStyles.mediaTexts.linkTextL,
        ...TextStyles.mediaTexts.manropeExtraBold,
        width: "100%",
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
    noPaddingHorizontal: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    searchHeader: {
        justifyContent: 'flex-start',
        height: 50,
        paddingTop: 0,
        paddingBottom: 16,
        paddingHorizontal: 24,
        flexDirection: "row",
        left: 10,
        marginBottom: 10
    },
    singleItemList: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    singleItemListSelected: {
        backgroundColor: Colors.colors.primaryColorBG,
    },
    patientInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
    },
    patientProImage: {
        width: 48,
        height: 48,
        borderRadius: 80,
        overflow: 'hidden',
    },
    imageBorder: {
        borderStyle: 'solid',
        borderWidth: 2,
        borderRadius: 80,
        paddingHorizontal: 2,
        paddingVertical: 2,
    },
    patientProBgMain: {
        width: 48,
        height: 48,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    patientProLetterMain: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH6,
        color: Colors.colors.whiteColor,
    },
    patientItemDetail: {
        paddingLeft: 12,
        flex: 1
    },
    patientItemName: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
    },
    patientItemDes: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.lowContrast,
        // width: '70%',
        // flex: 1,
        flexBasis: '90%'
    },

    checkWrapper: {
        paddingRight: 10
    },
    singleCheck: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: Colors.colors.highContrastBG,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4
    },
    singleCheckSelected: {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.mainBlue,
        color: Colors.colors.mainBlue
    },
    confirmationBoxWrapper: {
        paddingHorizontal: 24,
    },
    confirmationTitleText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
        marginBottom: 8,
    },
    singleItemWrapper: {
        marginTop: 24,
        marginBottom: 16,
    },
    noSelectedText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
        marginBottom: 16,
    },
    loadMoreView: {
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loadMoreText: {
        color: Colors.colors.lightText2,
    },
    loadIcon: {
        marginLeft: 5,
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        paddingBottom: 10
    },
    emptyAnim: {
        width: '30%',
        // alignSelf: 'center',
        marginBottom: 10,
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
        marginBottom: 10
    },
});
