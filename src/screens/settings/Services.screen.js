import React, {Component} from 'react';
import {Body, Button, Container, Content, Header, Icon, Left, Right, Text, Title, View} from 'native-base';
import {Animated, Easing, FlatList, Platform, StatusBar, StyleSheet, TouchableHighlight, TouchableOpacity} from 'react-native';
import {Screens} from '../../constants/Screens';
import {addTestID, SearchFloatingButton, AlertUtil, getHeaderHeight} from 'ch-mobile-shared';
import SwitchToggle from 'react-native-switch-toggle';
import ScheduleService from "../../services/ScheduleService";
import Loader from "../../components/Loader";
import {connectSettings} from "../../redux";
import {SwipeListView} from 'react-native-swipe-list-view';
import {isEqual} from 'lodash';


const HEADER_SIZE = getHeaderHeight();

class ServicesScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: this.props.settings.isLoading,
            scale: new Animated.Value(1),
            providerCustomServices: [],
        };
    }


    updateSettings = () => {
        const {settings} = this.props;
        let providerCustomServices = settings.providerCustomServices;
        providerCustomServices = providerCustomServices.map(service => {
            service.toggleShown = true;
            return service;
        });
        this.setState({providerCustomServices});
    }

    componentDidUpdate(prevProps,prevState,ss) {
        const preServices = prevProps.settings.providerCustomServices;
        const currentServices = this.props.settings.providerCustomServices;
        if (!isEqual(preServices, currentServices)) {
            this.updateSettings();
        }
    }

    componentDidMount = () => {
        this.updateSettings();
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    toggleService = (item) => {
        item.serviceAvailable = !item.serviceAvailable;
        let data: any = ScheduleService.updateProviderServiceStatus(item.id, item.serviceAvailable);
        if (data.errors) {
            AlertUtil.showErrorMessage(data.errors[0].endUserMessage);
            let hasAccess = true;
            if (data.errors[0].errorCode === 'FORBIDDEN') {
                hasAccess = false;
            }
            this.setState({
                isLoading: false,
                hasAccess,
                isError: data.errors[0]
            });
            item.serviceAvailable = !item.serviceAvailable;
        } else {
            this.setState({
                isLoading: false,
                isError: false,
            });
        }
    };


    hideToggle = (rowKey) => {
        let {providerCustomServices} = this.state;
        providerCustomServices = providerCustomServices.map(service => {
            if (service.id === rowKey) {
                service.toggleShown = false;
            }
            return service;
        });
        this.setState({providerCustomServices});
    };

    showToggle = (rowKey) => {
        let {providerCustomServices} = this.state;
        providerCustomServices = providerCustomServices.map(service => {
            if (service.id === rowKey) {
                service.toggleShown = true;
            }
            return service;
        });
        this.setState({providerCustomServices});
    };


    deleteService = async (serviceId) => {
        Animated.spring(this.state.scale, {
            toValue: 0,
            duration: 300,
            speed: 60,
            easing: Easing.linear
        }).start();
        setTimeout(() => {
            this.setState({
                editService: false,
            });

        }, 800);
        this.props.deleteService({serviceId});
        this.updateSettings();
    }

    navigateToNextScreen = (item) => {
        this.props.navigation.navigate(Screens.ADD_SERVICE_SCREEN, {
            updateService: item,
        })
    }

    render(): React.ReactNode {
        StatusBar.setBarStyle('dark-content', true);
        const {providerDefaultServices} = this.props.settings;
        const {providerCustomServices} = this.state;
        if (this.props.settings.isLoading) {
            return <Loader/>
        }
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
                            transparent
                            style={styles.backBtn}
                            onPress={this.backClicked}>
                            <Icon
                                name="angle-left"
                                type={'FontAwesome'}
                                style={styles.backIcon}
                            />
                        </Button>
                    </Left>
                    <Body>
                    <Title style={styles.servicesTitle}>Services</Title>
                    </Body>
                    <Right/>
                </Header>
                <Content style={{paddingTop: 24}}>
                    {providerCustomServices.length > 0 ?
                        <View>
                            <Text style={styles.servicesHead}>Your Services:</Text>
                            <SwipeListView
                                data={providerCustomServices}
                                style={{...styles.serviceList, marginBottom: 90, borderBottomColor: '#fff'}}
                                keyExtractor={(rowData) => {
                                    return rowData.id.toString();
                                }}
                                renderItem={({item}) => (
                                    <TouchableHighlight
                                        underlayColor={'#FFF'}
                                        onPress={() => {this.navigateToNextScreen(item)}}
                                    >
                                        <View style={styles.singleItem}>
                                            <View style={styles.itemDetailD}>
                                                <Text style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemDes} numberOfLines={1}>
                                                    {item.durationText}, ${item.cost}
                                                </Text>
                                            </View>
                                            <View style={{paddingRight: 24, justifyContent: 'center'}}>
                                                {
                                                    item.toggleShown && (
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
                                                            switchOn={item.serviceAvailable}
                                                            onPress={() => {
                                                                this.toggleService(item)
                                                            }}
                                                            circleColorOff="#fff"
                                                            circleColorOn="#fff"
                                                            duration={200}
                                                        />
                                                    )
                                                }

                                            </View>
                                        </View>
                                    </TouchableHighlight>
                                )}
                                renderHiddenItem={({item}) => (
                                    <View style={styles.rowBack}>
                                        <Button
                                            {...addTestID('delete-service-btn')}
                                            onPress={() => {
                                                this.deleteService(item.id)
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


                        </View>
                        : null
                    }
                </Content>
                {!this.state.editService ?
                    <SearchFloatingButton
                        icon="plus"
                        onPress={() => {
                            this.props.navigation.navigate(Screens.ADD_SERVICE_SCREEN);
                        }}
                        isFiltering={false}
                    /> : null}
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
    },
    backRightBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 85,
        backgroundColor: '#d0021b',
        height: 80,
        borderRadius: 0
    },
    settingHeader: {
        height: HEADER_SIZE,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        paddingLeft: 3
    },
    backBtn: {
        marginLeft: 15,
        width: 35
    },
    backIcon: {
        color: '#3fb2fe',
        fontSize: 30,
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
        paddingLeft: 0,
        paddingRight: 12,
        marginRight: 0
    },
    editText: {
        color: '#3fb2fe',
        fontFamily: 'Roboto-Bold',
        textAlign: 'center',
        letterSpacing: 0.3,
        fontSize: 14,
        fontWeight: '600'
    },
    servicesHead: {
        color: '#25345c',
        fontWeight: '600',
        fontFamily: 'Roboto-Bold',
        fontSize: 14,
        lineHeight: 25,
        letterSpacing: 0.56,
        paddingLeft: 24
    },
    serviceList: {
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        marginBottom: 24
    },
    singleItemD: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
    },
    deleteList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemDetail: {},
    itemDetailD: {
        padding: 24,
        flex: 2
    },
    singleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 0.5,
        backgroundColor: '#fff',
        // paddingLeft: 15
    },
    itemName: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        letterSpacing: 0.3,
        color: '#515d7d'
    },
    itemDes: {
        color: '#969fa8',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        lineHeight: 19,
        letterSpacing: 0.3
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
    deleteButton: {
        margin: 0,
        marginRight: 15,
        marginLeft: 22
    },
    deleteAnimatedView: {
        height: '100%',
        // width: 100,
    },
    deleteAnimatedButton: {
        flex: 1,
        // alignSelf: 'center',
    }
});
export default connectSettings()(ServicesScreen);
