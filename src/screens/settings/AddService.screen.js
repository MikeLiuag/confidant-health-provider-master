import React, {Component} from 'react';
import {Body, Button, Container, Content, Form, Header, Icon, Input, Item, Label, Left, ListItem, Radio, Right, Text, Title, View} from 'native-base';
import {Keyboard, Platform, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import {
    addTestID,
    AlertUtil,
    getHeaderHeight,
    isIphoneX,
    NAME_REGEX,
    DEFAULT_STATES_OPTIONS,
    PROVIDER_ROLES
} from 'ch-mobile-shared';
import {Picker} from 'react-native-wheel-pick';
import GradientButton from '../../components/GradientButton';
import Loader from "../../components/Loader";
import {connectSettings} from "../../redux";
import SwitchToggle from "react-native-switch-toggle";
import Modal from 'react-native-modalbox';
import ScheduleService from "../../services/ScheduleService";
import {COST_REGEX} from "../../constants/CommonConstants";
import MultiSelect from 'react-native-multiple-select';

const HEADER_SIZE = getHeaderHeight();

const serviceDuration = ['15 min', '30 min', '45 min', '1 Hour', '1 Hour 15 min', '1 Hour 30 min',
    '1 Hour 45 min', '2 Hour', '2 Hour 15 min', '2 Hour 30 min', '2 Hour 45 min', '3 Hour'];

class AddServiceScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.providerProfile= props.profile.profile;
        const {navigation} = this.props;
        this.updateService = navigation.getParam('updateService', null);
        this.validServiceName = true;
        this.state = {
            isLoading: this.props.settings.isLoading,
            durationModal: false,
            showBuffer: false,
            showDurationBox: false,
            serviceName: this.updateService ? this.updateService.name : '',
            serviceDuration: this.updateService ? this.updateService.durationText : '',
            serviceBufferTime: this.updateService ? this.getDurationText(this.updateService.bufferTime) : '',
            serviceCost: this.updateService && this.updateService.cost !== null ? this.updateService.cost.toString() : '0',
            serviceMarketCost: this.updateService && this.updateService.marketCost !== null ? this.updateService.marketCost.toString() : '0',
            serviceRecommendedCost: this.updateService && this.updateService.recommendedCost !== null ? this.updateService.recommendedCost.toString() : '0',
            serviceDescription: this.updateService ? this.updateService.description : '',
            privateService: this.updateService ? this.updateService.privateService : false,
            stateUsageInAppointment : this.updateService ? this.updateService.stateUsageInAppointment : false,
            requireSupervisorSignOff : this.updateService ? this.updateService.requireSupervisorSignOff : false,
            selectedDuration: '',
            pickerType: '',
            serviceNameFocus: false,
            costFocus: false,
            costRecommendedFocus: false,
            descriptionFocus: false,
            serviceDurationError: false,
            serviceBufferTimeError: false,
            serviceTypes: [],
            showServiceTypeBox: false,
            serviceTypeError: false,
            serviceTypeModal: false,
            operatingStates: this.updateService ? this.populateOperatingStates(this.updateService.operatingStates) : [],
            selectedServiceTypes: this.updateService && this.updateService.serviceTypes? this.updateService.serviceTypes : []

        };
    }


    backClicked = () => {
        this.props.navigation.goBack();
    };
    allOperatingStates =()=>{
       const operatingStates= DEFAULT_STATES_OPTIONS.map(state => {
            return {
                id: state,
                title: state,
            };
        })
        return operatingStates;
    };
    populateOperatingStates = (items) => {

        if(items==null)
            items=[];
        let operatingStates=[];
        DEFAULT_STATES_OPTIONS.forEach((state) => {
            items.forEach((item) => {
                if(state.toLowerCase().trim()===item.toLowerCase().trim())
                {
                    operatingStates.push(state)
                }
            });
        });
        //this.setState({operatingStates})
        return operatingStates;
    };

    onSelectedItemsChange = operatingStates => {
        this.setState({ operatingStates });
    };


    durationClose = () => {
        this.setState({
            durationModal: false,
            showBuffer: false,
            showDurationBox: false
        });
    };

    serviceTypeClose = () => {
        this.setState({
            serviceTypeModal: false,
            showServiceTypeBox: false,
        });
    };

    showDuration = (pickerType) => {
        this.setState({
            pickerType: pickerType,
            selectedDuration: '',
            showBuffer: pickerType === 'serviceBufferTime',
            showDurationBox: pickerType === 'serviceDuration'
        });
        Keyboard.dismiss();
        this.refs.modal6.open()
    };

    showServiceType = () => {
        this.setState({
            showServiceTypeBox: true,
        });
        Keyboard.dismiss();
        this.refs.ServiceTypeModal.open()
    };


    /**
     * @function getDurationMints
     * @description This method is used to get selected duration mints.
     * @param selectedDuration
     */
    getDurationMints = (selectedDuration) => {
        if (selectedDuration.includes("H") && selectedDuration.includes("m")) {
            const time = selectedDuration.split(" ");
            const hours = parseInt(time[0].trim());
            const min = parseInt(time[2].trim());
            const hoursToMints = hours * 60;
            return hoursToMints + min;

        } else if (selectedDuration.includes("H")) {
            const time = selectedDuration.split(" ");
            const hours = parseInt(time[0].trim());
            return hours * 60;
        } else {
            const time = selectedDuration.split(" ");
            return parseInt(time[0].trim());
        }
    };

    componentDidMount = async () => {
        await this.getServiceTypes();
    };

    /**
     * @function getServiceTypes
     * @description This method is used to get service types list.
     */
    getServiceTypes = async () => {
        this.setState({isLoading: true});
        try {
            const response = await ScheduleService.getProviderServiceTypes();
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                const serviceTypes = response.serviceTypes.map(item => item.name);
                this.setState({serviceTypes,isLoading: false});
            }
            this.setState({isLoading: false});
        } catch (e) {
            console.log(e)
        }
    };


    /**
     * @function validateServiceName
     * @description This method is used to validate service Name.
     */
    validateServiceName = () => {
        const {serviceName} = this.state;
        let serviceNameError = false;
        if (serviceName.trim() === null || serviceName.trim() === '') {
            serviceNameError = true;
        } else if (serviceName && serviceName !== '') {
            serviceNameError = !NAME_REGEX.test(serviceName.trim());
        }

        return !serviceNameError;
    }

    /**
     * @function validateCost
     * @description This method is used to validate service cost.
     */
    validateCost = () => {
        let {serviceCost} = this.state;
        if (serviceCost.startsWith('.')) {
            serviceCost = '0' + serviceCost;
        }
        if (serviceCost.indexOf('.') === -1) {
            serviceCost = serviceCost + '.0';
        }
        if (serviceCost.indexOf('.') === serviceCost.length - 1) {
            return false;
        }
        const costError = !COST_REGEX.test(serviceCost);
        return !costError;
    };


    /**
     * @function validateRecommendedCost
     * @description This method is used to validate recommended cost.
     */
    validateRecommendedCost = () => {
        let {serviceRecommendedCost} = this.state;
        if (serviceRecommendedCost.startsWith('.')) {
            serviceRecommendedCost = '0' + serviceRecommendedCost;
        }
        if (serviceRecommendedCost.indexOf('.') === -1) {
            serviceRecommendedCost = serviceRecommendedCost + '.0';
        }
        if (serviceRecommendedCost.indexOf('.') === serviceRecommendedCost.length - 1) {
            return false;
        }
        const costError = !COST_REGEX.test(serviceRecommendedCost);
        return !costError;
    };


    /**
     * @function validateMarketCost
     * @description This method is used to validate market cost.
     */
    validateMarketCost = () => {
        let {serviceMarketCost} = this.state;
        if (serviceMarketCost.startsWith('.')) {
            serviceMarketCost = '0' + serviceMarketCost;
        }
        if (serviceMarketCost.indexOf('.') === -1) {
            serviceMarketCost = serviceMarketCost + '.0';
        }
        if (serviceMarketCost.indexOf('.') === serviceMarketCost.length - 1) {
            return false;
        }
        const costError = !COST_REGEX.test(serviceMarketCost);
        return !costError;
    };

    /**
     * @function validateDurationTime
     * @description This method is used to validate duration time.
     */
    validateDurationTime = () => {
        const {serviceDuration, serviceBufferTime} = this.state;
        if (serviceDuration === '') {
            this.setState({serviceDurationError: true});
            return false;
        } else if (serviceBufferTime === '') {
            this.setState({serviceBufferTimeError: true});
            return false;
        }
        return true;
    }


    isProviderOperatingStateIncludeServiceState = () => {
        const {operatingStates,stateUsageInAppointment} = this.state;
        let isExists=false;
        if(stateUsageInAppointment)
        {
            if(this.providerProfile.operatingStates?.some(selectedState => operatingStates.includes(selectedState)))
            {
                isExists=true;
            }
            return isExists;
        }
        else
            return true;
    }


    /**
     * @function isFormValid
     * @description This method is used to validate form values.
     */
    isFormValid = () => {


        if (!this.validateServiceName()) {
            AlertUtil.showErrorMessage("Invalid service name");
            this.setState({serviceNameFocus: true});
            return false;
        }
        const {operatingStates,stateUsageInAppointment} = this.state;
        if (stateUsageInAppointment && operatingStates?.length < 1) {
            AlertUtil.showErrorMessage("Please Select minimum one state");
            return false;
        }
        if (this.updateService !== null) {
            if (this.updateService.name.toLowerCase().trim() !== this.state.serviceName.toLowerCase().trim()) {
                if (!this.checkForUniqueServiceName()) {
                    AlertUtil.showErrorMessage("Service with same name already exists");
                    this.setState({serviceNameFocus: true});
                    this.validServiceName = false;
                    return false;
                }
            }
        }
        if (this.updateService === null) {
            if (!this.checkForUniqueServiceName()) {
                AlertUtil.showErrorMessage("Service with same name already exists");
                this.setState({serviceNameFocus: true});
                this.validServiceName = false;
                return false;
            }
        }

        if (this.state.selectedServiceTypes.length < 1) {
            AlertUtil.showErrorMessage("Select service type");
            this.setState({serviceTypeError:true})
            return false;
        }

        if (!this.validateCost()) {
            AlertUtil.showErrorMessage("Please enter valid cost up to 2 decimal places");
            this.setState({costFocus: true});
            return false;
        }

        if (!this.validateRecommendedCost()) {
            AlertUtil.showErrorMessage("Please enter valid recommended cost up to 2 decimal places");
            this.setState({costRecommendedFocus: true});
            return false;
        }


        if (!this.validateMarketCost()) {
            AlertUtil.showErrorMessage("Please enter valid market cost up to 2 decimal places");
            this.setState({costMarketFocus: true});
            return false;
        }


        if (Number(this.state.serviceCost) > 2000) {
            AlertUtil.showErrorMessage("Cost cannot exceed by $2000");
            this.setState({costFocus: true});
            return false;
        }

        if (Number(this.state.serviceMarketCost) > 2000) {
            AlertUtil.showErrorMessage("Market Cost cannot exceed by $2000");
            this.setState({costMarketFocus: true});
            return false;
        }


        if (Number(this.state.serviceRecommendedCost) > 2000) {
            AlertUtil.showErrorMessage("Recommended Cost cannot exceed by $2000");
            this.setState({costRecommendedFocus: true});
            return false;
        }


        if (!this.validateDurationTime()) {
            AlertUtil.showErrorMessage("Invalid Duration");
            return false;
        }

        return true;

    };


    /**
     * @function saveService
     * @description This method is used to save service.
     */
    saveService = async () => {
        if (this.isFormValid()) {
            const {
                serviceName, serviceCost, serviceMarketCost, serviceRecommendedCost, serviceDuration,
                serviceBufferTime, serviceDescription, privateService, selectedServiceTypes,operatingStates,stateUsageInAppointment,requireSupervisorSignOff
            } = this.state;
            const serviceRequest = {
                serviceId: this.updateService ? this.updateService.id : null,
                duration: this.getDurationMints(serviceDuration),
                buffer: this.getDurationMints(serviceBufferTime),
                name: serviceName.trim(),
                cost: parseFloat(serviceCost),
                marketCost: parseFloat(serviceMarketCost),
                recommendedCost: parseFloat(serviceRecommendedCost),
                description: serviceDescription ? serviceDescription.trim() : '',
                shouldUpdate: this.updateService ? true : false,
                operatingStates: operatingStates,
                stateUsageInAppointment: stateUsageInAppointment,
                requireSupervisorSignOff: requireSupervisorSignOff,
                privateService: privateService,
                serviceTypes: selectedServiceTypes,
                onSuccess: () => {
                    this.props.navigation.goBack()
                }
            }
            this.props.saveService({serviceRequest});
        }
    };


    /**
     * @function saveSelectedDuration
     * @description This method is save selected duration.
     */
    saveSelectedDuration = () => {
        const {pickerType, selectedDuration} = this.state;
        if (pickerType === 'serviceBufferTime') {
            this.setState({
                durationModal: false,
                serviceBufferTime: selectedDuration ? selectedDuration : '15 min',
                showBuffer: false,
                serviceBufferTimeError: false,
            });
        } else {
            this.setState({
                durationModal: false,
                serviceDuration: selectedDuration ? selectedDuration : '15 min',
                showDurationBox: false,
                serviceDurationError: false,
            });
        }
        this.refs.modal6.close()
    };

    saveSelectedServiceType = () => {
        this.setState({
            serviceTypeModal: false,
            serviceTypeBox: false,
            serviceTypeError: false,
        });
        this.refs.ServiceTypeModal.close()
    };

    /**
     * @function getDurationText
     * @description This method is used to get duration text.
     * @param Duration Value
     */
    getDurationText = (duration) => {
        const minText = ' min', hourText = ' Hour';
        if (duration < 60) {
            return duration + minText;
        }
        const hour = parseInt(duration / 60), min = duration % 60;
        let text = hour + hourText;
        if (min > 0) {
            text = text + ' ' + min + minText;
        }
        return text;
    };

    onChangedCost = (serviceCost) => {
        return serviceCost.replace(/^0+/, '');
    };

    ShowMaxAlert = (text) => {
        let textLength = text.length.toString();
        if (textLength > 50) {
            AlertUtil.showMessage("Sorry, Service name exceeds the maximum length.", 'Close', 'top', "warning")
        }
    };

    toggleService = () => {
        this.setState({
            privateService: !this.state.privateService
        });
    };

    toggleStateUsageInAppointment = () => {
        this.setState({
            stateUsageInAppointment: !this.state.stateUsageInAppointment
        });
    };

    toggleStateRequireSupervisorSignOff = () => {
        this.setState({
            requireSupervisorSignOff: !this.state.requireSupervisorSignOff
        });
    };

    /**
     * @function checkForUniqueServiceName
     * @description This method is used to check service name uniqueness.
     */
    checkForUniqueServiceName = () => {
        let isUniqueServiceName = false;
        const {serviceName} = this.state;
        const {providerCustomServices} = this.props.settings;
        providerCustomServices.forEach(service => {
            if (service.name.toLowerCase().trim() === serviceName.toLowerCase().trim()) {
                isUniqueServiceName = true;
            }
        });
        return !isUniqueServiceName;
    }

    replaceSpace = (str) => {
        return str.replace(/\u0020/, '\u00a0')
    }

    /**
     * @function selectServiceType
     * @description This method is used to add or remove service type from the list.
     * @param serviceType
     */
    selectServiceType = (serviceType)=>{

        let {selectedServiceTypes} = this.state;
        if (!selectedServiceTypes.includes(serviceType)) {
            selectedServiceTypes.push(serviceType);
        } else {
            selectedServiceTypes = selectedServiceTypes.filter(selectedServiceType => selectedServiceType !== serviceType);
        }
        this.setState({selectedServiceTypes});
    }


    render(): React.ReactNode {

        StatusBar.setBarStyle('dark-content', true);
        if (this.props.settings.isLoading) {
            return <Loader/>
        }
        let operatingStates=this.allOperatingStates()
        const {selectedServiceTypes,serviceTypes} = this.state;
        return (
            <Container>
                <Header noShadow transparent style={styles.settingHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <Button
                            {...addTestID('back')}
                            transparent
                            style={styles.backBtn}
                            onPress={this.backClicked}>
                            <Icon
                                name="close"
                                type={'AntDesign'}
                                style={styles.closeIcon}
                            />
                        </Button>
                    </Left>
                    <Body style={{paddingLeft: 0}}>
                        <Title
                            style={styles.servicesTitle}>{this.updateService ? "Edit Service" : "Add Service"}</Title>
                    </Body>
                    <Right>
                        <Button
                            {...addTestID('save-service')}
                            transparent
                            style={styles.editBtn}
                            onPress={this.saveService}
                        >
                            <Text uppercase={false} style={styles.editText}>Save</Text>
                        </Button>
                    </Right>
                </Header>
                <Modal
                    backdropPressToClose={true}
                    backdropColor="rgba(37,52,92,0.35)"
                    backdropOpacity={1}
                    onClosed={this.durationClose}
                    style={[styles.modal, styles.modal4]}
                    entry={"bottom"}
                    position={"bottom"} ref={"modal6"} swipeArea={100}>
                    <View style={{width: '100%'}}>
                        <View style={styles.modalHead}>
                            <Text
                                style={styles.modalTitle}>{this.state.pickerType === 'serviceBufferTime' ? "Select Buffer Time" : "Select Service Duration"}</Text>
                        </View>
                        <View style={styles.pickerBox}>
                            <Picker
                                {...addTestID('service-time')}
                                style={styles.pickerStyle}
                                textColor={'#646c73'}
                                textSize={18}
                                selectedItemTextColor={'#3fb2fe'}
                                itemStyle={pickerItemStyle}
                                selectedValue={this.state.pickerType === 'serviceBufferTime' ? this.state.serviceBufferTime : this.state.serviceDuration}
                                pickerData={serviceDuration}
                                onValueChange={selectedDuration => {
                                    this.setState({selectedDuration: selectedDuration})
                                }}
                            />
                        </View>
                        <View style={styles.saveBox}>
                            <GradientButton
                                testId="save"
                                onPress={this.saveSelectedDuration}
                                text="Save"
                            />
                        </View>
                    </View>
                </Modal>
                <Modal
                    backdropPressToClose={true}
                    backdropColor="rgba(37,52,92,0.35)"
                    backdropOpacity={1}
                    onClosed={this.serviceTypeClose}
                    style={[styles.modal, styles.modal4]}
                    entry={"bottom"}
                    position={"bottom"} ref={"ServiceTypeModal"} swipeArea={100}>
                    <View style={{width: '100%'}}>
                        <View style={styles.modalHead}>
                            <Text style={styles.modalTitle}>Select Service Type</Text>
                        </View>
                            <ScrollView style={styles.serviceTypeScroll}>
                                {serviceTypes && serviceTypes.length>0 && serviceTypes.map((serviceType, index) => {
                                    return (
                                        <ListItem
                                            key={index}
                                            onPress={() => {
                                                this.selectServiceType(serviceType)
                                            }}
                                            style={selectedServiceTypes.includes(serviceType)
                                                    ? [
                                                        styles.multiList,
                                                        {backgroundColor: 'rgba(63,178,254, 0.08)'},
                                                    ]
                                                    : styles.multiList
                                            }
                                        >
                                            <Text
                                                style={selectedServiceTypes.includes(serviceType)
                                                        ? [
                                                            styles.multiListText,
                                                            {
                                                                fontWeight: '700',
                                                                color: '#3FB2FE',
                                                            },
                                                        ]
                                                        : styles.multiListText
                                                }>
                                                {serviceType}
                                            </Text>
                                            <Radio
                                                style={selectedServiceTypes.includes(serviceType) ? styles.multiRadioSelected : styles.multiRadio}
                                                color="#3fb2fe"
                                                selectedColor="#fff"
                                                selected={selectedServiceTypes.includes(serviceType)}
                                                onPress={() => {
                                                    this.selectServiceType(serviceType)
                                                }}
                                            />
                                        </ListItem>
                                    );
                                })
                             }

                            </ScrollView>
                            <View style={styles.serviceTypeBtn}>
                                <GradientButton
                                    onPress={() => this.saveSelectedServiceType()}
                                    disabled={selectedServiceTypes.length === 0}
                                    text="Close"
                                />
                            </View>
                    </View>
                </Modal>

                <Content showsVerticalScrollIndicator={false}>
                    <Form>
                        <Item fixedLabel
                              style={this.state.serviceNameFocus && (!this.validateServiceName() || !this.validServiceName) ? {
                                  ...styles.fieldItem,
                                  borderColor: '#d0021b'
                              } : this.state.serviceNameFocus ? {
                                  ...styles.fieldItem,
                                  borderColor: '#3fb2fe'
                              } : styles.fieldItem}>
                            <Label style={styles.fieldLabel}>Service Name</Label>
                            <Input
                                {...addTestID('input-service-name')}
                                style={styles.fieldInput}
                                onFocus={() => {
                                    this.validServiceName = this.updateService !== null ? this.validateServiceName() : true;
                                    this.setState({serviceNameFocus: true});
                                }}
                                onBlur={() => {
                                    this.setState({serviceNameFocus: false})
                                }}
                                placeholder="Enter service name"
                                placeholderTextColor="#b3bec9"
                                value={this.replaceSpace(this.state.serviceName)}
                                onChangeText={(serviceName) => {
                                    this.ShowMaxAlert(serviceName);
                                    this.setState({serviceName: serviceName})
                                }}
                                maxLength={50}
                            />
                        </Item>
                        <Item fixedLabel
                              style={this.state.showServiceTypeBox ? {
                                  ...styles.fieldItem,
                                  borderColor: '#3fb2fe'
                              } : this.state.serviceTypeError ? {
                                  ...styles.fieldItem,
                                  borderColor: '#d0021b'
                              } : styles.fieldItem}>
                            <Label style={styles.fieldLabel}>Service Type{selectedServiceTypes.length>1?"s":""}</Label>
                            <TouchableOpacity
                                {...addTestID('serviceType')}
                                style={{flex: 1}}
                                onPress={() => {
                                    this.showServiceType()
                                }}>
                                <Text style={selectedServiceTypes && selectedServiceTypes.length>0 ? styles.inputValue : {
                                    ...styles.inputValue,
                                    color: '#b3bec9'
                                }}>
                                    {selectedServiceTypes  && selectedServiceTypes.length>0 ? selectedServiceTypes.join(",") : 'Select service type'}
                                </Text>
                            </TouchableOpacity>
                        </Item>
                        <Item style={{...styles.fieldItem}}>
                            <View style={styles.multiSelectWrapper}>
                                <MultiSelect
                                    hideTags
                                    items={operatingStates}
                                    uniqueKey="id"
                                    ref={(component) => { this.multiSelect = component }}
                                    onSelectedItemsChange={this.onSelectedItemsChange}
                                    selectedItems={this.state.operatingStates}
                                    selectText="Select State For Service Availability"
                                    searchInputPlaceholderText="Search State"
                                    onChangeInput={ (text)=> {}}
                                    altFontFamily="Manrope-Regular"
                                    tagRemoveIconColor="#0374DD"
                                    tagBorderColor="#0374DD"
                                    tagTextColor="#0374DD"
                                    selectedItemTextColor="#0374DD"
                                    selectedItemIconColor="#0374DD"
                                    itemTextColor="#646c73"
                                    displayKey="title"
                                    submitButtonColor="#0374DD"
                                    submitButtonText="Select"
                                    searchInputStyle={{ color: '#646c73' }}
                                    styleDropdownMenu={{borderColor: 'red'}}
                                    styleInputGroup={{borderColor: 'red'}}
                                    styleItemsContainer={{ borderColor: 'red'}}
                                    styleRowList={{backgroundColor: '#fff', boxShadow: 'none'}}
                                    styleSelectorContainer={{backgroundColor: 'brown'}}
                                    styleListContainer={{borderBottomWidth:0,}}
                                    styleMainWrapper={{paddingTop: 10,}}
                                />
                                <View style={styles.multiListTags}>
                                    {this.multiSelect && this.multiSelect.getSelectedItemsExt(this.state.operatingStates)}
                                </View>
                            </View>
                        </Item>
                        <Item fixedLabel
                              style={styles.fieldItem}>
                            <Label style={{...styles.fieldLabel, justifyContent: 'space-between'}}>State Usage In Appointment</Label>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                                    switchOn={this.state.stateUsageInAppointment}
                                    onPress={() => {
                                        this.toggleStateUsageInAppointment()
                                    }}
                                    circleColorOff="#fff"
                                    circleColorOn="#fff"
                                    duration={200}
                                />
                            </View>
                        </Item>
                       {this.providerProfile.signOffRole===PROVIDER_ROLES.DEFAULT &&
                           <Item fixedLabel
                              style={styles.fieldItem}>
                            <Label style={{...styles.fieldLabel, justifyContent: 'space-between'}}>Requires Supervisor Signoff</Label>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                                    switchOn={this.state.requireSupervisorSignOff}
                                    onPress={() => {
                                        this.toggleStateRequireSupervisorSignOff()
                                    }}
                                    circleColorOff="#fff"
                                    circleColorOn="#fff"
                                    duration={200}
                                />
                            </View>
                        </Item> }
                        <Item fixedLabel
                              style={this.state.showDurationBox ? {
                                  ...styles.fieldItem,
                                  borderColor: '#3fb2fe'
                              } : this.state.serviceDurationError ? {
                                  ...styles.fieldItem,
                                  borderColor: '#d0021b'
                              } : styles.fieldItem}>
                            <Label style={styles.fieldLabel}>Duration</Label>
                            <TouchableOpacity
                                {...addTestID('duration')}
                                style={{flex: 1}}
                                onPress={() => {
                                    this.showDuration('serviceDuration')
                                }}>
                                <Text style={this.state.serviceDuration ? styles.inputValue : {
                                    ...styles.inputValue,
                                    color: '#b3bec9'
                                }}>{this.state.serviceDuration ? this.state.serviceDuration : '0 min'}</Text>
                            </TouchableOpacity>
                        </Item>
                        <Item fixedLabel
                              style={this.state.showBuffer ? {
                                  ...styles.fieldItem,
                                  borderColor: '#3fb2fe'
                              } : this.state.serviceBufferTimeError ? {
                                  ...styles.fieldItem,
                                  borderColor: '#d0021b'
                              } : styles.fieldItem}>
                            <Label style={styles.fieldLabel}>Buffer Time</Label>
                            <TouchableOpacity
                                {...addTestID('buffer-time')}
                                style={{flex: 1}}
                                onPress={() => {
                                    this.showDuration('serviceBufferTime')
                                }}>
                                <Text style={this.state.serviceBufferTime ? styles.inputValue : {
                                    ...styles.inputValue,
                                    color: '#b3bec9'
                                }}>{this.state.serviceBufferTime ? this.state.serviceBufferTime : '0 min'}</Text>
                            </TouchableOpacity>
                        </Item>

                        <Item fixedLabel
                              style={this.state.costFocus && !this.validateCost() ? {
                                  ...styles.fieldItem,
                                  borderColor: '#d0021b'
                              } : this.state.costFocus ? {
                                  ...styles.fieldItem,
                                  borderColor: '#3fb2fe'
                              } : styles.fieldItem}>
                            <Label style={{...styles.fieldLabel, justifyContent: 'space-between'}}>Cost</Label>
                            <TouchableOpacity
                                {...addTestID('cost')}
                                style={{flex: 1, alignItems: 'flex-end'}}
                                onPress={() => {
                                    this._costServiceInput._root.focus()
                                }}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Label style={this.state.serviceCost > 0 ? styles.labelDollar : {
                                        ...styles.labelDollar,
                                        color: '#b3bec9'
                                    }}>$</Label>
                                    <Input
                                        {...addTestID('input-service-cost')}
                                        style={this.state.serviceCost > 0 ? {
                                            ...styles.dollarInput,
                                            maxWidth: this.state.serviceCost.length * 10,
                                            color: '#515d7d'
                                        } : {...styles.dollarInput, maxWidth: this.state.serviceCost.length * 10}}
                                        ref={input => {
                                            this._costServiceInput = input;
                                        }}
                                        keyboardType="decimal-pad"
                                        placeholder={'0'}
                                        placeholderTextColor={'#b3bec9'}
                                        value={this.state.serviceCost}
                                        onBlur={() => {
                                            this.setState({costFocus: false});
                                        }}
                                        onFocus={() => {
                                            this.setState({costFocus: true});

                                        }}
                                        onChangeText={serviceCost => {
                                            this.setState({
                                                serviceCost: this.onChangedCost(serviceCost),
                                            });
                                        }}
                                        maxLength={5}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Item>


                        <Item fixedLabel
                              style={this.state.costMarketFocus && !this.validateMarketCost() ? {
                                  ...styles.fieldItem,
                                  borderColor: '#d0021b'
                              } : this.state.costMarketFocus ? {
                                  ...styles.fieldItem,
                                  borderColor: '#3fb2fe'
                              } : styles.fieldItem}>
                            <Label style={{...styles.fieldLabel, justifyContent: 'space-between'}}>Market Cost</Label>
                            <TouchableOpacity
                                {...addTestID('marketCost')}
                                style={{flex: 1, alignItems: 'flex-end'}}
                                onPress={() => {
                                    this._costMarketServiceInput._root.focus()
                                }}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Label style={this.state.serviceMarketCost > 0 ? styles.labelDollar : {
                                        ...styles.labelDollar,
                                        color: '#b3bec9'
                                    }}>$</Label>
                                    <Input
                                        {...addTestID('input-market-cost')}
                                        style={this.state.serviceMarketCost > 0 ? {
                                            ...styles.dollarInput,
                                            maxWidth: this.state.serviceMarketCost.length * 10,
                                            color: '#515d7d'
                                        } : {...styles.dollarInput, maxWidth: this.state.serviceMarketCost.length * 10}}
                                        ref={input => {
                                            this._costMarketServiceInput = input;
                                        }}
                                        keyboardType="decimal-pad"
                                        placeholder={'0'}
                                        placeholderTextColor={'#b3bec9'}
                                        value={this.state.serviceMarketCost}
                                        onBlur={() => {
                                            this.setState({costMarketFocus: false});
                                        }}
                                        onFocus={() => {
                                            this.setState({costMarketFocus: true});

                                        }}
                                        onChangeText={serviceMarketCost => {
                                            this.setState({
                                                serviceMarketCost: this.onChangedCost(serviceMarketCost),
                                            });
                                        }}
                                        maxLength={5}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Item>

                        <Item fixedLabel
                              style={this.state.costRecommendedFocus && !this.validateRecommendedCost() ? {
                                  ...styles.fieldItem,
                                  borderColor: '#d0021b'
                              } : this.state.costRecommendedFocus ? {
                                  ...styles.fieldItem,
                                  borderColor: '#3fb2fe'
                              } : styles.fieldItem}>
                            <Label style={{...styles.fieldLabel, justifyContent: 'space-between'}}>Recommended
                                Cost</Label>
                            <TouchableOpacity
                                {...addTestID('recommendedCost')}
                                style={{flex: 1, alignItems: 'flex-end'}}
                                onPress={() => {
                                    this._costRecommendedServiceInput._root.focus()
                                }}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Label style={this.state.serviceRecommendedCost > 0 ? styles.labelDollar : {
                                        ...styles.labelDollar,
                                        color: '#b3bec9'
                                    }}>$</Label>
                                    <Input
                                        {...addTestID('input-recommended-cost')}
                                        style={this.state.serviceRecommendedCost > 0 ? {
                                            ...styles.dollarInput,
                                            maxWidth: this.state.serviceRecommendedCost.length * 10,
                                            color: '#515d7d'
                                        } : {
                                            ...styles.dollarInput,
                                            maxWidth: this.state.serviceRecommendedCost.length * 10
                                        }}
                                        ref={input => {
                                            this._costRecommendedServiceInput = input;
                                        }}
                                        keyboardType="decimal-pad"
                                        placeholder={'0'}
                                        placeholderTextColor={'#b3bec9'}
                                        value={this.state.serviceRecommendedCost}
                                        onBlur={() => {
                                            this.setState({costRecommendedFocus: false});
                                        }}
                                        onFocus={() => {
                                            this.setState({costRecommendedFocus: true});

                                        }}
                                        onChangeText={serviceRecommendedCost => {
                                            this.setState({
                                                serviceRecommendedCost: this.onChangedCost(serviceRecommendedCost),
                                            });
                                        }}
                                        maxLength={5}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Item>
                    </Form>
                    <Item fixedLabel
                          style={styles.fieldItem}>
                        <Label style={{...styles.fieldLabel, justifyContent: 'space-between'}}>Private Service</Label>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                                switchOn={this.state.privateService}
                                onPress={() => {
                                    this.toggleService()
                                }}
                                circleColorOff="#fff"
                                circleColorOn="#fff"
                                duration={200}
                            />
                        </View>
                    </Item>
                    <View style={styles.desBox}>
                        <Text style={styles.desTitle}>Service Description</Text>
                        <TextInput
                            {...addTestID('input-service-description')}
                            style={styles.desContent}
                            placeholder="Enter service description"
                            value={this.state.serviceDescription}
                            onBlur={() => {
                                this.setState({descriptionFocus: false});
                            }}
                            onFocus={() => {
                                this.setState({descriptionFocus: true});
                            }}
                            onChangeText={serviceDescription => {
                                this.setState({
                                    serviceDescription: serviceDescription
                                });
                            }}
                            multiline={true}
                        />
                    </View>
                </Content>
            </Container>
        );
    }
}

const pickerItemStyle = {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderTopColor: 'transparent'
};

const styles = StyleSheet.create({

    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24
    },
    modal4: {
        maxHeight: 450
    },
    settingHeader: {
        height: HEADER_SIZE,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        paddingLeft: 0
    },
    backBtn: {
        marginLeft: 15,
        // width: 35
    },
    multiSelectWrapper:{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    multiListTags:{
      marginVertical: 8
    },
    closeIcon: {
        color: '#3fb2fe',
        fontSize: 24,
    },
    servicesTitle: {
        color: '#25345c',
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        lineHeight: 24,
        letterSpacing: 0.3,
        textAlign: 'center'
    },
    editBtn: {
        marginRight: 0,
        paddingRight: 12
    },
    editText: {
        color: '#3fb2fe',
        fontFamily: 'Roboto-Bold',
        textAlign: 'center',
        letterSpacing: 0.3,
        fontSize: 16,
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
        borderColor: '#f5f5f5',
        borderBottomWidth: 1,
        padding: 24,
        paddingTop: 36
    },
    modalTitle: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 17,
        lineHeight: 17,
        letterSpacing: 0.8,
        textAlign: 'center'
    },
    pickerBox: {
        paddingTop: 24
    },
    pickerStyle: {
        backgroundColor: '#fff',
        width: '100%',
        height: 200
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
        minHeight: 64,
    },
    fieldLabel: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
        color: '#646c73'
    },
    switchBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
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
        backgroundColor: '#fff',
        position: 'absolute'
    },
    labelDollar: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
        color: '#515d7d',
        marginTop: -5
    },
    dollarInput: {
        color: '#b3bec9',
        textAlign: 'right',
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 15,
        paddingLeft: 0,
        paddingRight: 0,
        minWidth: 12
    },
    fieldInput: {
        color: '#515d7d',
        textAlign: 'right',
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 15,
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
    serviceTypeScroll: {
        maxHeight: 300
    },
    serviceTypeBtn: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: isIphoneX() ? 34 : 24
    },
    multiList: {
        justifyContent: 'space-between',
        borderBottomWidth: 0,
        marginLeft: 0,
        paddingLeft: 24
    },
    multiListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#515d7d',
        paddingRight: 10,
        flex: 1
    },
    multiRadio: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4
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
        borderColor: '#3fb2fe'
    },
})

export default connectSettings()(AddServiceScreen);
