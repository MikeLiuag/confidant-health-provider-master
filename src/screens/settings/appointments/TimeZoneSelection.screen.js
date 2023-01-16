import React, {Component} from 'react';
import {Container, Content, Header, Text, View} from 'native-base';
import {FlatList, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {HEADER_NORMAL, HEADER_X, isIphoneX, SliderSearch, getHeaderHeight} from "ch-mobile-shared";
import momentTimeZone from "moment-timezone";

const HEADER_SIZE = getHeaderHeight();
const US_TIMEZONES = [
    {
        title: 'America/Chicago',
        states: ['Alabama', 'Arkansas', 'Illinois', 'Iowa', 'Kansas', 'Louisiana', 'Minnesota', 'Mississippi',
            'Missouri', 'Nebraska', 'North Dakota', 'Oklahoma', 'South Dakota', 'Tennessee', 'Texas', 'Wisconsin']
    },
    {
        title: 'US/Alaska',
        states: ['Alaska']
    },
    {
        title: 'America/Phoenix',
        states: ['Arizona']
    },
    {
        title: 'America/Los_Angeles',
        states: ['California', 'Nevada', 'Oregon']
    },
    {
        title: 'America/Denver',
        states: ['Colorado', 'Montana', 'New Mexico', 'Utah', 'Wyoming']
    },
    {
        title: 'America/New_York',
        states: ['Connecticut', 'Delaware', 'Florida', 'Georgia', 'Kentucky', 'Maine', 'Maryland', 'Massachusetts',
            'New Hampshire', 'New Jersey', 'New York', 'North Carolina', 'Ohio', 'Pennsylvania', 'Rhode Island',
            'South Carolina', 'Vermont', 'Virginia', 'Washington', 'West Virginia']
    },
    {
        title: 'US/Hawaii',
        states: ['Hawaii']
    },
    {
        title: 'America/Boise',
        states: ['Idaho']
    },
    {
        title: 'America/Indianapolis',
        states: ['Indiana']
    },
    {
        title: 'America/Detroit',
        states: ['Michigan']
    },
]
export class TimeZoneSelectionScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.updateInUI = navigation.getParam('updateUI', null);
        this.state = {
            zones: [],
            filteredZones: []
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    componentWillUnmount(): void {
        if(this.timeOut) {
            clearTimeout(this.timeOut);
            this.timeOut = null;
        }
    }

    propagate = (list) => {
        this.setState({filteredZones: list.zones});
    };

    componentDidMount(): void {
        this.getTimeZones();
    }

    getTimeZones = () => {
        let zones = momentTimeZone.tz.names().map(zone => {
            const moment = momentTimeZone().tz(zone);
            return {
                title: zone,
                id: zone,
                des: 'UTC ' + moment.format('Z') + ', ' + moment.format('hh:mm a')
            };
        });
        const sortedZones = [];
        US_TIMEZONES.forEach(zone=>{
            zone.states.forEach(state=>{
                const moment = momentTimeZone().tz(zone.title);
                sortedZones.push({
                    title: state,
                    id: zone.title,
                    des: 'UTC ' + moment.format('Z') + ', ' + moment.format('hh:mm a')
                });
            });
        });
        sortedZones.push(...zones);
        this.setState({zones: sortedZones, filteredZones: sortedZones});
        this.timeOut = setTimeout(() => {
            this.updateTime();
        }, 10000)
    };

    updateZones = (zones) => {

        return zones.map(zone => {
            const moment = momentTimeZone().tz(zone.id);
            zone.des = 'UTC ' + moment.format('Z') + ', ' + moment.format('hh:mm a');
            return zone;
        });

    };

    updateTime = () => {

        const filteredZones = this.updateZones(this.state.filteredZones);
        const zones = this.updateZones(this.state.zones);
        this.setState({zones, filteredZones});
        this.timeOut = setTimeout(() => {
            this.updateTime();
        }, 10000)
    };

    render(): React.ReactNode {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container>
                <Header noShadow transparent style={styles.settingHeader}>
                    <StatusBar
                        backgroundColor="transparent"
                        translucent
                        barStyle={'dark-content'}
                    />
                    <SliderSearch
                        options={{
                            screenTitle: 'Time Zone',
                            searchFieldPlaceholder: 'Search Time Zone',
                            listItems: {
                                zones: this.state.zones,
                            },

                            filter: (listItems, query) => {
                                return {
                                    zones: listItems.zones.filter(zone =>
                                        zone.title
                                            .toLowerCase()
                                            .includes(query.toLowerCase().trim()),
                                    ),
                                };
                            },
                            showBack: true,
                            backClicked: this.backClicked,
                        }}
                        propagate={this.propagate}
                    />
                </Header>
                <Content>
                    <FlatList
                        data={this.state.filteredZones}
                        style={styles.list}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.singleItem}
                                onPress={() => {
                                    if (this.updateInUI) {
                                        this.updateInUI(item.id);
                                        this.backClicked();
                                    }
                                }}
                            >
                                <View style={styles.itemDetail}>
                                    <Text style={styles.itemName}>{item.title}</Text>
                                    <Text style={styles.itemDes} numberOfLines={1}>
                                        {item.des}
                                    </Text>
                                    {item.title!==item.id && (
                                        <Text style={{...styles.itemDes, marginTop: 2}} numberOfLines={1}>
                                            {item.id}
                                        </Text>
                                    )}

                                </View>
                                <View style={styles.nextWrapper}>
                                    {/*<Button transparent style={styles.nextButton}>*/}
                                    {/*    <AwesomeIcon name="angle-right" size={32} color="#3fb2fe"/>*/}
                                    {/*</Button>*/}
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<View style={{ padding: 24}}>
                            <Text style={styles.emptyText}>No Time Zone Found</Text>
                        </View>}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({

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
        paddingLeft: 22
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
    itemDetail: {},
    itemName: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 15,
        letterSpacing: 0.3,
        color: '#25345c',
        marginBottom: 5
    },
    itemDes: {
        color: '#969fa8',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        lineHeight: 14,
        letterSpacing: 0.3
    }
});
