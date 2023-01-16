import React, {Component} from 'react';
import {FlatList, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Container, Content, Header, Text} from 'native-base';
import {connectConnections} from '../../../redux/index';
import {Screens} from '../../../constants/Screens';
import {AlfieLoader, getAvatar, isIphoneX, SliderSearch, AlertUtil, addTestID} from 'ch-mobile-shared';
import GradientButton from '../../../components/GradientButton';
import {AVATAR_COLOR_ARRAY} from '../../../constants/CommonConstants';
import Ionicon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import ProfileService from "../../../services/ProfileService";

class AppointmentUserListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.connection = navigation.getParam('connection', null);
        this.state = {
            isLoading: false,
            selectedMember: null,
            listItems: [],
            filteredItems: [],
            showBack: true,
            stepperText: true
        };
    }

    async componentDidMount(): void {
        this.setState({isLoading:true});
        const response = await ProfileService.getConnectionsByUserIDForAppointment(this.connection.userId);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            this.setState({listItems: response, filteredItems: response, isLoading: false});
        }
    }

    nextStep = () => {
        const memberId = this.connection.type === "PATIENT" ? this.connection.userId : this.state.selectedMember.connectionId;
        const providerId = this.connection.type === "PATIENT" ? this.state.selectedMember.connectionId : this.connection.userId;

        this.props.navigation.navigate(Screens.APPT_SERVICE_SCREEN, {
            selectedMember: this.state.selectedMember,
            connection: this.connection,
            memberId,
            providerId
        });
    };

    propagate = (list)=>{
        const filteredItems = list.members;
        let {selectedMember} = this.state;
        if(selectedMember) {
            let isMemberVisible = false;
            for(let member of filteredItems) {
                if(member.connectionId===selectedMember.connectionId) {
                    isMemberVisible = true;
                }
            }
            if(!isMemberVisible) {
                selectedMember = null;
            }
        }
        this.setState({filteredItems, selectedMember: selectedMember});
    };

    backClicked = ()=>{
        this.props.navigation.goBack();
    };

    capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if(this.state.isLoading) {
            return (<AlfieLoader/>);
        }
        return (
            <Container>
                <LinearGradient
                    start={{ x: 1, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    colors={["#fff", "#fff", "#f7f9ff"]}
                    style={{ flex: 1}}
                >
                    <Header transparent style={styles.header}>
                        <StatusBar
                            backgroundColor={Platform.OS === 'ios'? null : "transparent"}
                            translucent
                            barStyle={'dark-content'}
                        />
                        <SliderSearch
                            options={{
                                screenTitle: 'STEP 1 OF 4',
                                searchFieldPlaceholder: 'Search Member',
                                listItems: {
                                    members: this.state.listItems,
                                },

                                filter: (listItems, query) => {
                                    return {
                                        members: listItems.members.filter(member =>
                                            member.name
                                                .toLowerCase()
                                                .includes(query.toLowerCase().trim()),
                                        ),
                                    };
                                },
                                stepperText: this.state.stepperText,
                                showBack: this.state.showBack,
                                backClicked: this.backClicked,
                            }}
                            propagate={this.propagate}
                        />
                    </Header>
                    <Content>
                        <Text style={styles.apptHeading}>Request Appointment</Text>
                        <Text style={styles.proText}>{this.connection.type === 'PATIENT'?"Select Provider":"Select Member"}</Text>
                        <View style={styles.list}>
                            {this.state.filteredItems.length===0 && (
                                <View>
                                    <Text style={styles.noProText}>No {this.connection.type === 'PATIENT'?"providers":"members"} found in your connections.</Text>
                                </View>
                            )}
                            <FlatList
                                data={this.state.filteredItems}
                                renderItem={({item,index}) => (
                                    <TouchableOpacity
                                        {...addTestID('select-user- ' + (index+1))}
                                        activeOpacity={0.8}
                                        style={this.state.selectedMember && this.state.selectedMember.connectionId===item.connectionId? [styles.singleItem, { borderColor: '#3fb2fe'}] : styles.singleItem}
                                        onPress={()=>{this.setState({selectedMember: item})}}
                                    >
                                        <View style={styles.imageWrapper}>

                                            {item.profilePicture?
                                                <Image
                                                    style={styles.proImage}
                                                    resizeMode="cover"
                                                    source={{uri: getAvatar(item)}} />
                                                :
                                                <View style={{
                                                    ...styles.proBgMain,
                                                    backgroundColor: item.colorCode?item.colorCode:AVATAR_COLOR_ARRAY[index % AVATAR_COLOR_ARRAY.length]
                                                }}><Text
                                                    style={styles.proLetterMain}>{item.name.charAt(0).toUpperCase()}</Text></View>
                                            }



                                        </View>
                                        <View style={styles.itemDetail}>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemDes} numberOfLines={1}>
                                                {this.capitalize(item.meta)}
                                            </Text>
                                        </View>
                                        {
                                            this.state.selectedMember && this.state.selectedMember.connectionId===item.connectionId?
                                                <View style={styles.checkWrapper}>
                                                    <Ionicon name="ios-checkmark-circle" size={25} color="#3fb2fe"/>
                                                </View> : null
                                        }
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    </Content>
                    <View style={styles.nextBtn}>
                        {
                            this.state.selectedMember?
                                <GradientButton
                                    testId = "next"
                                    text="Next"
                                    onPress={this.nextStep}
                                /> : null
                        }
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 35,
        paddingLeft: 18,
        paddingRight: 18,
    },
    apptHeading: {
        marginTop: 30,
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        textAlign: 'center',
        lineHeight: 24,
        letterSpacing: 1,
        marginBottom: 16
    },
    proText: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 17,
        letterSpacing: 0.8,
        lineHeight: 18,
        textAlign: 'center',
        marginBottom: 30
    },
    list: {
        padding: 16
    },
    noProText: {
        color: '#969fa8',
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.32,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center'
    },
    singleItem: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 10,
        shadowOpacity: 0.8,
        elevation: 1,
        backgroundColor: '#fff',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    imageWrapper: {},
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 25,
        overflow: 'hidden'
    },
    proBgMain:{
        width: 48,
        height: 48,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proLetterMain: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    itemDetail: {
        flex: 1,
        paddingLeft: 16
    },
    itemName: {
        color: '#25345c',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 15,
        letterSpacing: 0.3
    },
    itemDes: {
        color: '#969fa8',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 19,
        letterSpacing: 0.28
    },
    checkWrapper: {},
    nextBtn: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX()? 34 : 24
    }
});
export default connectConnections()(AppointmentUserListScreen);
