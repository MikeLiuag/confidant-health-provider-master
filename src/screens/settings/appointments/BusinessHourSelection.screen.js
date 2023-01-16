import React, {Component} from 'react';
import {Body, Button, Container, Content, Header, Left, ListItem, Radio,
    Right, Text, Title, View} from 'native-base';
import {StatusBar, StyleSheet, Animated, TouchableHighlight,
    Easing, ScrollView} from 'react-native';
import AwesomeIcon from "react-native-vector-icons/FontAwesome";
import {HEADER_NORMAL, HEADER_X, isIphoneX, AlfieLoader, getTimeFromMilitaryStamp,
    SearchFloatingButton, compareDay, AlertUtil, addTestID, getHeaderHeight} from "ch-mobile-shared";
import SwitchToggle from "react-native-switch-toggle";
import {connectSettings} from "../../../redux";
import {SlotSelectionComponent} from "../../../components/appointments/SlotSelectionComponent";
import GradientButton from "../../../components/GradientButton";
import Overlay from "react-native-modal-overlay";
import {SwipeListView} from 'react-native-swipe-list-view';

const HEADER_SIZE = getHeaderHeight();
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

class BusinessHourSelectionScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.businessHours = navigation.getParam('businessHours', false);
        this.updateSettings = navigation.getParam('updateSettings', false);
        this.state = {
            businessHoursExpanded: false,
            editMode: false,
            settings: [],
            scale: new Animated.Value(1),
            selectedDays: [],
            daysSelectorModal: false,
            addButtonVisible: false,
            daySelectionDone: false
        };
    }


    startDelete = (item) => {
        console.log(item);
        this.props.deleteSlot({
            day: item.title,
            isBusiness: this.businessHours
        });
        setTimeout(() => {
            this.createSettingsFromProps();
            this.updateSettings();
        }, 20);
    };

    hideDeleteAnimated = (callback) => {
        Animated.spring(this.state.scale, {
            toValue: 0,
            duration: 300,
            speed: 60,
            easing: Easing.linear
        }).start();
        setTimeout(() => {

            this.hideDelete(callback);


        }, 0);
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    componentDidMount(): void {
        this.createSettingsFromProps();
    }

    toggleDay = (item) => {
        let {settings} = this.state;
        settings = settings.map(setting => {
            if (setting.title === item.title) {
                setting.checked = !setting.checked;
            }
            return setting;
        });
        this.props.toggleSlot({
            day: item.title,
            active: item.checked,
            isBusiness: this.businessHours
        });
        this.updateSettingsList();
        this.updateSettings();
        this.setState({settings});
    };

    updateSettingsList = ()=> {
        let {settings} = this.state;
        settings = settings.map(item => {
            item.toggleShown = true;
            return item;

        });
        this.setState({settings});

    }

    createSettingsFromProps = () => {
        let settings = [];
        let horizon = null;
        if (this.businessHours && this.props.settings.appointments.planningHorizon) {
            horizon = this.props.settings.appointments.planningHorizon;

        }
        if (!this.businessHours && this.props.settings.appointments.blockingHorizon) {
            horizon = this.props.settings.appointments.blockingHorizon;
        }
        if (horizon) {
            settings = Object.keys(horizon).map(day => {
                return {
                    title: day,
                    desc: horizon[day].availability,
                    checked: horizon[day].active,
                    toggleShown:true,
                }
            }).sort((i1, i2) => compareDay(i1.title, i2.title));
        }
        const addedDays = settings.map(setting => setting.title);
        const availableDays = DAYS.filter(day => !addedDays.includes(day));
        this.setState({settings, addButtonVisible: availableDays.length > 0});
    };


    hideToggle = (rowKey)=>{
        let {settings} = this.state;
        settings = settings.map(item => {
            if (item.title === rowKey) {
                item.toggleShown = false;
            }
            return item;

        });
        this.setState({settings});
    }

    showToggle = (rowKey)=>{
        let {settings} = this.state;
        settings = settings.map(item => {
            if (item.title === rowKey) {
                item.toggleShown = true;
            }
            return item;

        });
        this.setState({settings});
    }

    showDelete = (item) => {
        this.setState({
            x: new Animated.Value(0),
            scale: new Animated.Value(1)
        });
        this.hideDelete(() => {
            let {settings} = this.state;

            settings = settings.map(setting => {

                if (setting.title === item.title) {
                    setting.deleteShown = true;
                }
                return setting;

            });
            this.setState({settings});
        });
    };

    hideDelete = (callback) => {
        let {settings} = this.state;

        settings = settings.map(setting => {
            setting.deleteShown = false;
            return setting;
        });
        if (callback) {
            this.setState({settings}, callback);
        } else {
            this.setState({settings});
        }
    };

    showEditSlotModal = (item) => {
        this.setState({
            slotSelected: {...item, fromSelection: true}
        });
    };

    saveSlot = (payload) => {
        if(this.shouldSaveSlot(payload)) {
            this.props.updateSlot(payload);
        }
        this.setState({slotSelected: null});
        setTimeout(() => {
            this.updateSettings();
            this.createSettingsFromProps();
        }, 10);


    };

    closeDaySelector = () => {
        this.setState({daysSelectorModal: false});
    };

    openDaySelector = () => {
        this.setState({selectedDays: [], daysSelectorModal: true});
    };

    toggleDayFromSelection = (day) => {
        if (this.state.selectedDays.includes(day)) {
            this.setState({
                selectedDays: this.state.selectedDays.filter(d => d !== day)
            });
        } else {
            const {selectedDays} = this.state;
            selectedDays.push(day);
            this.setState({
                selectedDays
            });
        }
    };

    renderSelectableDays = () => {


        const addedDays = this.state.settings.map(setting => setting.title);
        const availableDays = DAYS.filter(day => !addedDays.includes(day));

        return (<ScrollView
            style={styles.daysBox}>
            {availableDays.sort((day1, day2) => compareDay(day1, day2)).map(day => {
                const itemSelected = this.state.selectedDays.indexOf(day) > -1;
                return (
                    <ListItem
                        key={day + '-selector'}
                        style={this.state.selectedDays.includes(day) ? {
                            ...styles.daysList,
                            backgroundColor: 'rgba(63,178,254, 0.08)'
                        } : styles.daysList}
                        onPress={() => {
                            this.toggleDayFromSelection(day);
                        }}
                    >
                        <Text style={this.state.selectedDays.includes(day) ? {
                                ...styles.daysListText,
                                fontWeight: '700',
                                color: '#3FB2FE'
                            }
                            : styles.daysListText}>{day}</Text>
                        <Radio
                            style={
                                itemSelected ? styles.multiRadioSelected : styles.multiRadio
                            }
                            color="#3fb2fe"
                            selectedColor="#fff"
                            selected={this.state.selectedDays.includes(day)}
                            onPress={() => {
                                this.toggleDayFromSelection(day);

                            }}
                        />
                    </ListItem>
                )
            })}
        </ScrollView>);
    };

    shouldSaveSlot = (payload)=>{

        let horizon = null;
        if (payload.isBusiness) {
            horizon = this.props.settings.appointments.blockingHorizon;
        } else {
            horizon = this.props.settings.appointments.planningHorizon;
        }
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
            this.state.selectedDays.forEach((day) => {
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
    addSlots = (payload) => {

        if (this.shouldSaveSlot(payload)) {
            this.props.addSlots({
                days: this.state.selectedDays,
                isBusiness: this.businessHours,
                slot: payload.slot
            });
        }
        this.setState({daySelectionDone: false, slotSelected: null, daysSelectorModal: false}, () => {
            this.updateSettings();
            this.createSettingsFromProps();
        });
    };

    render(): React.ReactNode {
        StatusBar.setBarStyle('dark-content', true);
        if (this.props.settings.isLoading) {
            return (<AlfieLoader/>);
        }
        return (
            <Container>
                <Header noShadow transparent style={styles.settingHeader}>
                    <StatusBar
                        backgroundColor="transparent"
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left onPress={this.backClicked}>
                        <Button transparent style={styles.backButton} onPress={this.backClicked}>
                            <AwesomeIcon name="angle-left" size={32} color="#3fb2fe"/>
                        </Button>
                    </Left>
                    <Body style={{flex: 2}}>
                        <Title
                            style={styles.settingTitle}>{this.businessHours ? 'Business Hours' : 'Blocked Time'}</Title>
                    </Body>
                    <Right>
                        {/*<Button*/}
                        {/*    style={styles.editBtn}*/}
                        {/*    transparent onPress={() => {*/}
                        {/*    this.hideDeleteAnimated(() => {*/}
                        {/*        this.setState({editMode: !this.state.editMode});*/}
                        {/*    });*/}

                        {/*}}>*/}

                        {/*    {this.state.settings.length>0 &&(*/}
                        {/*        <Text style={styles.editText}>{this.state.editMode ? 'Done' : 'Edit'}</Text>*/}
                        {/*    )}*/}
                        {/*</Button>*/}
                    </Right>
                </Header>
                {(this.state.slotSelected || this.state.daySelectionDone) && (
                    <SlotSelectionComponent
                        slot={this.state.slotSelected ? {
                            checked: this.state.slotSelected.checked,
                            day: this.state.slotSelected.title,
                            start: this.state.slotSelected.desc[0].start,
                            end: this.state.slotSelected.desc[0].end,
                        } : null}
                        isWorkingHourSlot={this.businessHours}
                        onClose={() => {
                            this.setState({slotSelected: null, daySelectionDone: false});
                        }}
                        isNew={this.state.daySelectionDone}
                        days={this.state.selectedDays}
                        saveSlot={this.saveSlot}
                        addSlots={this.addSlots}
                    />
                )}
                <Overlay
                    containerStyle={styles.overlayBG}
                    childrenWrapperStyle={styles.modalWrapper}
                    visible={this.state.daysSelectorModal}
                    onClose={this.closeDaySelector}
                    animationDuration={100}
                    closeOnTouchOutside
                >
                    <View style={{width: '100%'}}>
                        <View style={styles.modalHead}>
                            {/*<Button*/}
                            {/*    transparent*/}
                            {/*    style={styles.closeBtn}*/}
                            {/*    onPress={this.closeDaySelector}*/}
                            {/*>*/}
                            {/*    <Icon*/}
                            {/*        name="close"*/}
                            {/*        type={'AntDesign'}*/}
                            {/*        style={{color: '#3fb2fe', fontSize: 24, marginLeft: 10, marginRight: 10}}*/}
                            {/*    />*/}
                            {/*</Button>*/}
                            <View style={{flex: 1}}>
                                <Text style={styles.modalTitle}>Select
                                    days {this.businessHours ? 'of Business Hours' : 'to block time'}</Text>
                                <Text style={styles.modalDes}>Select all that applicable</Text>
                            </View>
                        </View>
                        {this.renderSelectableDays()}
                        <View style={styles.saveBox}>
                            <GradientButton
                                testId = "continue"
                                onPress={() => {
                                    if (this.state.selectedDays !== null && this.state.selectedDays.length > 0) {
                                        this.setState({daySelectionDone: true, daysSelectorModal: false});
                                    }

                                }}
                                disabled={this.state.selectedDays === null || this.state.selectedDays.length === 0}
                                text="Continue"
                            />
                        </View>
                    </View>
                </Overlay>
                <Content contentContainerStyle={{ paddingBottom: 50}}>
                    {/*<FlatList*/}
                    {/*    data={this.state.settings}*/}
                    {/*    style={styles.list}*/}
                    {/*    renderItem={({item}) => {*/}
                    {/*        const descriptions = item.desc.map(desc => {*/}
                    {/*            const startTime = getTimeFromMilitaryStamp(desc.start);*/}
                    {/*            const endTime = getTimeFromMilitaryStamp(desc.end);*/}
                    {/*            return (*/}
                    {/*                <Text style={styles.timingText} key={item.title + '-s-' + desc.start}*/}
                    {/*                      numberOfLines={1}>*/}
                    {/*                    {startTime.time + ' ' + startTime.amPm + ' - ' + endTime.time + ' ' + endTime.amPm}*/}
                    {/*                </Text>*/}
                    {/*            );*/}
                    {/*        });*/}
                    {/*        return (*/}
                    {/*            <View style={styles.singleItem}>*/}
                    {/*                {this.state.editMode && !item.deleteShown && (*/}
                    {/*                    <Button transparent style={styles.deleteButton} onPress={() => {*/}
                    {/*                        this.showDelete(item);*/}
                    {/*                    }}>*/}
                    {/*                        <AwesomeIcon name="minus-circle" size={22} color="#D0021B"/>*/}
                    {/*                    </Button>*/}
                    {/*                )}*/}
                    {/*                <TouchableOpacity style={styles.itemDetail} onPress={() => {*/}
                    {/*                    if (this.state.editMode) {*/}
                    {/*                        this.hideDeleteAnimated();*/}
                    {/*                    } else {*/}
                    {/*                        this.showEditSlotModal(item);*/}
                    {/*                    }*/}

                    {/*                }}>*/}
                    {/*                    <Text style={styles.itemName}>{item.title}</Text>*/}
                    {/*                    {item.desc && (*/}
                    {/*                        <View>*/}
                    {/*                            {descriptions}*/}
                    {/*                        </View>*/}
                    {/*                    )}*/}
                    {/*                </TouchableOpacity>*/}
                    {/*                <View style={styles.nextWrapper}>*/}
                    {/*                    {!this.state.editMode && (*/}
                    {/*                        <View style={{padding: 24}}>*/}
                    {/*                            <SwitchToggle*/}
                    {/*                                type={1}*/}
                    {/*                                buttonStyle={styles.switchBtn}*/}
                    {/*                                rightContainerStyle={{*/}
                    {/*                                    flex: 1,*/}
                    {/*                                    alignItems: 'center',*/}
                    {/*                                    justifyContent: 'center'*/}
                    {/*                                }}*/}
                    {/*                                leftContainerStyle={{*/}
                    {/*                                    flex: 1,*/}
                    {/*                                    alignItems: 'center',*/}
                    {/*                                    justifyContent: 'flex-start'*/}
                    {/*                                }}*/}
                    {/*                                buttonTextStyle={{fontSize: 10}}*/}
                    {/*                                textRightStyle={{*/}
                    {/*                                    fontSize: 10,*/}
                    {/*                                    color: 'black',*/}
                    {/*                                    fontWeight: '500',*/}
                    {/*                                    paddingLeft: 2*/}
                    {/*                                }}*/}
                    {/*                                textLeftStyle={{*/}
                    {/*                                    fontSize: 10,*/}
                    {/*                                    color: 'white',*/}
                    {/*                                    paddingRight: 0*/}
                    {/*                                }}*/}
                    {/*                                containerStyle={styles.switchContainer}*/}
                    {/*                                backgroundColorOn="#3fb2fe"*/}
                    {/*                                backgroundColorOff="#D1D1D1"*/}
                    {/*                                circleStyle={styles.switchCircle}*/}
                    {/*                                onPress={() => {*/}
                    {/*                                    this.toggleDay(item)*/}
                    {/*                                }}*/}
                    {/*                                switchOn={item.checked}*/}
                    {/*                                circleColorOff="#fff"*/}
                    {/*                                circleColorOn="#fff"*/}
                    {/*                                duration={200}*/}
                    {/*                            />*/}
                    {/*                        </View>*/}
                    {/*                    )}*/}
                    {/*                    <View>*/}
                    {/*                        {item.deleteShown && (*/}
                    {/*                            <Animated.View*/}
                    {/*                                style={[*/}
                    {/*                                    {width: 'auto', height: 80, backgroundColor: '#D0021B',},*/}
                    {/*                                    {*/}
                    {/*                                        transform: [*/}
                    {/*                                            {*/}
                    {/*                                                scaleY: this.state.scale,*/}
                    {/*                                            },*/}
                    {/*                                        ],*/}
                    {/*                                    },*/}
                    {/*                                ]}>*/}
                    {/*                                <Button*/}
                    {/*                                    onPress={() => {*/}
                    {/*                                        this.startDelete(item)*/}
                    {/*                                    }}*/}
                    {/*                                    transparent*/}
                    {/*                                    style={styles.deleteAnimatedButton}>*/}
                    {/*                                    <Text style={{color: 'white'}}>Delete</Text>*/}
                    {/*                                </Button>*/}
                    {/*                            </Animated.View>*/}
                    {/*                        )}*/}
                    {/*                    </View>*/}
                    {/*                </View>*/}
                    {/*            </View>*/}
                    {/*        )*/}
                    {/*    }}*/}
                    {/*    ListEmptyComponent={<View style={{ padding: 24}}>*/}
                    {/*        <Text style={styles.emptyText}>No {this.businessHours ? 'Business Hours' : 'Blocked Time'} Found</Text>*/}
                    {/*    </View>}*/}
                    {/*    keyExtractor={(item, index) => index.toString()}*/}
                    {/*/>*/}


                    {
                        this.state.settings.length<1?
                            <View style={{ padding: 24 }}>
                                <Text style={styles.emptyText}>No {this.businessHours ? 'Business Hours' : 'Blocked Time'} Found</Text>
                            </View>
                            :
                            <SwipeListView
                                data={this.state.settings}
                                style={styles.list}
                                keyExtractor={(rowData) => {
                                     return rowData.title.toString();
                                }}
                                renderItem={({item}) => {
                                    const descriptions = item.desc.map(desc => {
                                        const startTime = getTimeFromMilitaryStamp(desc.start);
                                        const endTime = getTimeFromMilitaryStamp(desc.end);
                                        return (
                                            <Text style={styles.timingText} key={item.title + '-s-' + desc.start}
                                                  numberOfLines={1}>
                                                {startTime.time + ' ' + startTime.amPm + ' - ' + endTime.time + ' ' + endTime.amPm}
                                            </Text>
                                        );
                                    });
                                    return (
                                        <TouchableHighlight
                                            {...addTestID('show-edit-slot-modal')}
                                            underlayColor={'#FFF'}
                                            onPress={() => { this.showEditSlotModal(item)}}>
                                            <View style={styles.singleItem}>
                                                <View style={styles.itemDetail}>
                                                    <Text style={styles.itemName}>{item.title}</Text>
                                                    {item.desc && (
                                                        <View>
                                                            {descriptions}
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.nextWrapper}>
                                                    {item.toggleShown && (
                                                        <View style={{padding: 24}}>
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
                                                                    this.toggleDay(item)
                                                                }}
                                                                switchOn={item.checked}
                                                                circleColorOff="#fff"
                                                                circleColorOn="#fff"
                                                                duration={200}
                                                            />
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </TouchableHighlight>
                                    )
                                }}
                                renderHiddenItem={({item}) => (
                                    <View style={styles.rowBack}>
                                        <Button
                                            onPress={() => {
                                                this.startDelete(item)
                                            }}
                                            transparent
                                            style={styles.backRightBtn}>
                                            <Text style={{color: 'white'}}>Delete</Text>
                                        </Button>
                                    </View>
                                )}
                                rightOpenValue={-85}
                                stopRightSwipe={-90}
                                closeOnScroll={true}
                                closeOnRowPress={true}
                                closeOnRowBeginSwipe={true}
                                closeOnRowOpen={true}
                                disableRightSwipe={true}
                                swipeToOpenPercent={100}
                                swipeToClosePercent={100}
                                onRowOpen={(rowKey) => {
                                    this.hideToggle(rowKey)
                                }}
                                onRowClose={(rowKey) => {
                                    this.showToggle(rowKey)
                                }}
                            />
                    }


                </Content>
                {this.state.addButtonVisible && !this.state.editMode && (
                    <SearchFloatingButton
                        icon="plus"
                        onPress={this.openDaySelector}
                        isFiltering={false}
                    />
                )}

            </Container>
        );
    }
}

const styles = StyleSheet.create({
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#fff',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingLeft: 15,
        maxHeight: 106
    },
    backRightBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 85,
        backgroundColor: '#d0021b',
        height: '100%',
        borderRadius: 0
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
    settingHeader: {
        height: HEADER_SIZE,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        paddingLeft: 3
    },
    settingTitle: {
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
        fontSize: 14,
        fontWeight: '600'
    },
    singleItem: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 0.5,
        paddingLeft: 23,
        backgroundColor: '#fff',
        //maxHeight: 106
    },
    emptyText: {
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
    expandableItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 23
    },
    itemDetail: {
        paddingTop: 23,
        paddingBottom: 23,
        flex: 2
    },
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
        width: 30,
        marginLeft: 15
    },
    deleteButton: {
        margin: 0,
        marginRight: 15,
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
    deleteAnimatedView: {
        height: '100%',
        // width: 100,
    },
    deleteAnimatedButton: {
        flex: 1,
        // alignSelf: 'center',
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
        textAlign: 'center'
    },
    saveBox: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24
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
        textTransform: 'capitalize'
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
});
export default connectSettings()(BusinessHourSelectionScreen);
