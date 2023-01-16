import React, {Component} from 'react';
import {StatusBar, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import {Container, Header, Content, Text, View } from 'native-base';
import {
    addTestID,
    AlertUtil,
    AlfieLoader,
    getAvatar,
    isIphoneX,
    SliderSearch,
    getHeaderHeight,
    PrimaryButton
} from 'ch-mobile-shared';
import {connectConnections} from '../../redux';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {DEFAULT_AVATAR_COLOR, HEADER_NORMAL, HEADER_X} from "../../constants/CommonConstants";
import GradientButton from '../../components/GradientButton';
import LinearGradient from "react-native-linear-gradient";
import Ionicon from "react-native-vector-icons/Ionicons";
import ProfileService from "../../services/ProfileService";
const HEADER_SIZE = getHeaderHeight();


class SuggestSecondConnectionScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        const {navigation} = this.props;
        const selectedConnection = navigation.getParam('selectedConnection', null);
        this.filterPredicate = navigation.getParam('filterPredicate', null);
        this.state = {
            isLoading: true,
            selectedConnection: selectedConnection,
            matchmakerConnections : this.props.connections.activeConnections.filter(data => data.connectionId !== selectedConnection.userId), //filter already selected user from active connection list
            filteredConnections : [],
            selectedItem: null,
            searchConnectionList:[],
            searchQuery: '',
        };
    }

    selectConnection = (selectedItem) => {
        this.setState({selectedItem: selectedItem});

    };

    suggestConnection = async (suggestedFirstUser, suggestedSecondUser) => {
        this.setState({
            isLoading: true
        });
        const payload = {
            suggestedFirstUser: suggestedFirstUser.userId,
            suggestedSecondUser: suggestedSecondUser.connectionId
        };
        let suggestConnectionsResponse = await ProfileService.suggestConnection(payload);
        if (suggestConnectionsResponse.errors) {
            this.setState({
                isLoading: false

            });
            console.warn(suggestConnectionsResponse.errors[0].endUserMessage);
            AlertUtil.showErrorMessage(suggestConnectionsResponse.errors[0].endUserMessage);
        } else {
            this.setState({
                isLoading: false
            });

            this.props.navigation.navigate(Screens.CONNECTION_REQUEST_SCREEN,{
                selectedConnectionFirst : suggestedFirstUser,
                selectedConnectionSecond : suggestedSecondUser
            });

            // return;
        }


    }

    getMatchmakerConnections = async () => {

        this.setState({
            isLoading: true
        });
        let userConnections = await ProfileService.getConnectionsByUserID(this.state.selectedConnection.userId);
        if (userConnections.errors) {
            this.setState({
                isLoading: false,

            });
            console.warn(userConnections.errors[0].endUserMessage);
            AlertUtil.showErrorMessage(userConnections.errors[0].endUserMessage);
        } else {

            const connectionIds = userConnections.map(connections => connections.connectionId);
            let remainingConnections =  this.state.matchmakerConnections
                    .filter(groups => groups.type !== 'CHAT_GROUP')
                .filter(data => !connectionIds.includes(data.connectionId));
            if(this.filterPredicate) {
                remainingConnections = remainingConnections.filter(this.filterPredicate);
            }
            this.setState({
                isLoading: false,
                filteredConnections : remainingConnections
            });

           // return;
        }
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    componentDidMount = async () => {
        await this.getMatchmakerConnections();
    };

    propagate = result => {
        if(result.searchConnectionList) {
            this.setState({
                searchConnectionList: result.searchConnectionList,
            });
        }else{
            this.setState({
                searchQuery: '',
                searchConnectionList: [],
            });
        }
    };


    capitalize = (str) => {
        if(str.toLowerCase()){
            return str.charAt(0).toUpperCase() + str.slice(1);
        }else{
            const lowerCase =  str.toLowerCase();
            return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);

        }
    }




    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return (
                <AlfieLoader/>);
        }

        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#F7F9FF', '#F7F9FF']}
                    style={{flex: 1}}
                >
                    <Header transparent style={styles.header}>
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle="dark-content"
                            translucent
                        />
                        <SliderSearch
                            options={{
                                screenTitle: '',
                                searchFieldPlaceholder: 'Search Connections',
                                listItems: {
                                    filteredConnections: this.state.filteredConnections,
                                },
                                filter: (listItems, query) => {
                                    this.setState({searchQuery: query});
                                    const filteredConnections = listItems.filteredConnections.filter(connection =>
                                        connection.name
                                            .toLowerCase()
                                            .includes(query.toLowerCase().trim()),
                                    );
                                    return {searchConnectionList: filteredConnections};
                                },
                                showBack:true,
                                backClicked: this.backClicked,
                            }}
                            propagate={this.propagate}/>
                    </Header>
                    <Content contentContainerStyle={{ paddingBottom: 40 }}>
                        <View style={styles.textBox}>
                            <Text style={styles.conMainText}>
                                Suggest Connection
                            </Text>
                            <View
                                style={styles.selectedConnected}>
                                <View
                                    {...addTestID('selected-connection')}
                                    style={styles.imgView}>

                                    {this.state.selectedConnection.profilePicture ?
                                        <Image
                                            style={styles.suggestImg}
                                            resizeMode={'contain'}
                                            source={{uri: getAvatar(this.state.selectedConnection)}}/>
                                        :
                                        <View style={{
                                            ...styles.proBg,
                                            backgroundColor: this.state.selectedConnection.colorCode?this.state.selectedConnection.colorCode:DEFAULT_AVATAR_COLOR
                                        }}><Text
                                            style={styles.proLetter}>{this.state.selectedConnection.name.charAt(0).toUpperCase()}</Text></View>
                                    }

                                </View>

                                <View style={styles.textWrapper}>
                                    <Text style={styles.suggestTitle}>{this.state.selectedConnection.name ? this.state.selectedConnection.name : 'N/A'}</Text>
                                    <Text style={styles.suggestSub}>{this.state.selectedConnection.type}</Text>
                                </View>
                                <View style={styles.checkWrapper}>
                                    <Ionicon name="ios-checkmark-circle" size={25} color="#77c70b"/>
                                </View>
                            </View>
                            <Text style={styles.conSubText}>
                                 {this.state.selectedConnection.name ? ' Connect ' + this.state.selectedConnection.name + ' with: ': 'N/A'}
                            </Text>
                        </View>
                        <View>
                            {(!this.state.searchQuery && this.state.filteredConnections.length > 0) || (this.state.searchQuery !== '' && this.state.searchConnectionList && this.state.searchConnectionList.length> 0) ?
                            <FlatList
                                data={this.state.searchQuery?this.state.searchConnectionList:this.state.filteredConnections}
                                style={styles.suggestionList}
                                extraData={this.state.selectedItem}
                                renderItem={({item, index}) =>
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => this.selectConnection(item)}
                                        style={this.state.selectedItem === item ? {...styles.singleSuggestion, borderColor: '#3fb2fe', borderWidth: 1} : styles.singleSuggestion}>

                                        <View style={styles.imgView}>
                                            {item.profilePicture ?
                                                <Image
                                                    style={styles.suggestImg}
                                                    resizeMode={'contain'}
                                                    source={{uri: getAvatar(item)}}/>
                                                :
                                                <View style={{
                                                    ...styles.proBg,
                                                    backgroundColor: item.colorCode?item.colorCode:DEFAULT_AVATAR_COLOR
                                                }}><Text
                                                    style={styles.proLetter}>{item.name.charAt(0).toUpperCase()}</Text></View>
                                            }
                                        </View>

                                        <View style={styles.textWrapper}>
                                            <Text style={styles.suggestTitle}>{item.name}</Text>
                                            <Text style={styles.suggestSub}>{this.capitalize(item.type.replace('_',' '))}</Text>
                                        </View>
                                        <View style={styles.checkWrapper}>
                                            {
                                                this.state.selectedItem === item ?
                                                    <Ionicon name="ios-checkmark-circle" size={25} color="#3fb2fe"/>  : null
                                            }

                                        </View>
                                    </TouchableOpacity>
                                }
                                keyExtractor={item => item.id}
                            />
                                :
                                <View style={styles.emptyView}>
                                <Text>No Record Found</Text>
                                </View>
                            }


                        </View>
                    </Content>
                    {this.state.selectedItem && (

                            <View style={styles.greBtn}>
                                <PrimaryButton
                                    testId = "suggest-connection"
                                    onPress={() => {
                                        this.suggestConnection(this.state.selectedConnection,this.state.selectedItem)
                                    }}
                                    text="Suggest Connection"
                                />
                            </View>
                    )}



                </LinearGradient>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_SIZE,
        paddingLeft: 22
    },
    textBox: {
        marginTop: 30,
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16
    },
    conMainText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 24,
        lineHeight: 24,
        letterSpacing: 1,
        marginBottom: 40,
        textAlign: 'center'
    },
    conSubText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 17,
        lineHeight: 18,
        letterSpacing: 0.8,
        marginBottom: 24,
        textAlign: 'center',
        color: '#515d7d'
    },
    suggestionList: {
        padding: 16
    },
    singleSuggestion: {
        padding: 16,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderRadius: 8,
        overflow: 'hidden'
    },
    selectedConnected: {
        padding: 16,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        borderRadius: 8,
        overflow: 'hidden'
    },
    imgView: {

    },
    suggestImg: {
        width: 48,
        height: 48,
        borderRadius: 30,
        overflow: 'hidden'
    },
    textWrapper: {
        flex: 1,
        paddingLeft: 16
    },
    suggestTitle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '500',
        color: '#25345C',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    suggestSub: {
        fontFamily: 'Roboto-Regular',
        color: '#969fa8',
        fontSize: 13,
        lineHeight: 19,
        letterSpacing: 0.28
    },
    checkWrapper: {
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX()? 36 : 24
    },
    disableBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        color: '#515d7d',
        paddingBottom: isIphoneX()? 36 : 24
    },
    proBg: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 48,
        height: 48,
        borderRadius: 30,

    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20
    },
});

export default connectConnections()(SuggestSecondConnectionScreen);
