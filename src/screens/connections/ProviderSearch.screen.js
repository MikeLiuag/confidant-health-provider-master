import React, {Component} from "react";
import {StatusBar} from "react-native";
import {Screens} from "../../constants/Screens";
import {DEFAULT_AVATAR_COLOR, ERROR_NOT_FOUND} from '../../constants/CommonConstants';
import {ProviderSearchComponent, S3_BUCKET_LINK} from 'ch-mobile-shared';
import ProfileService from "../../services/ProfileService";
import {connectConnections} from "../../redux";

class ProviderSearchScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            notFound: false,
            provider: null,
            isSelf: false
        };
    }


    goBack = () => {
        this.props.navigation.goBack();
    };


    render = () => {
        let isConnected = false, isRequested = false;
        if (!this.state.isLoading && !this.state.notFound && this.state.provider) {
            const filteredConnection = this.props.connections.activeConnections.filter(connection => connection.connectionId === this.state.provider.userId);
            isConnected = filteredConnection && filteredConnection.length > 0;
            isRequested = this.props.connections.requestedConnections.filter((contact) => {
                return contact.connectionId === this.state.provider.userId;
            }).length > 0;
        }
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <ProviderSearchComponent
                goBack={this.goBack}
                isLoading={this.state.isLoading || this.props.connections.isLoading}
                notFound={this.state.notFound}
                provider={this.state.provider}
                isRequested={isRequested}
                isConnected={isConnected}
                isSelf={this.state.isSelf}
                connect={this.connect}
                openProfile={this.openProfile}
                hasError={this.hasError}
                searchProvider={this.searchProvider}
                resetSearch={this.resetSearch}
            />
        );
    };

    hasError = () => {
        this.setState({provider: null});
    };

    connect = (shouldAdd) => {
        if (shouldAdd) {
            this.props.connect({
                userId: this.state.provider.userId
            });
        } else {
            this.startChat();
        }
        // if (shouldAdd) {
        //     const provider = {
        //         avatar: this.state.provider.profileImage ? this.state.provider.profileImage : S3_BUCKET_LINK + DEFAULT_IMAGE,
        //         contactId: this.state.provider.userId,
        //         contactType: 'PROVIDER',
        //         userId: this.state.provider.userId,
        //         name: this.state.provider.fullName
        //     };
        //
        //     this.props.navigation.navigate(Screens.PROVIDER_ACCESS_SCREEN, {
        //         provider: provider,
        //         providerInfo: provider,
        //         patientInfo: this.state.patient,
        //     });
        // } else {
        //     this.startChat();
        // }

    };

    startChat = () => {
        const {provider} = this.state;
        const filteredConnection = this.props.connections.activeConnections.filter(connection => connection.connectionId === provider.userId);
        if (filteredConnection.length > 0) {
            const connection = filteredConnection[0];
            this.props.navigation.navigate(Screens.LIVE_CHAT, {
                connection
            });
        }

    };

    openProfile = () => {
        const {provider} = this.state;
        this.props.navigation.navigate(Screens.PROVIDER_PROFILE_SCREEN, {
            providerId: provider.userId,
            type:provider.type,
        });
        // this.props.navigation.navigate(Screens.PROVIDER_DETAIL_SCREEN, {
        //     provider: {
        //         userId: provider.userId,
        //         name: provider.fullName,
        //         avatar: provider.profileImage
        //     },
        //     patient: this.props.auth.meta
        // });
    };

    resetSearch = () => {
        this.setState({
            isLoading: false,
            notFound: false,
            provider: null,
        });
    };

    findConnectionDetails = (connectionId)=>{
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId ===connectionId);
        if(!connection){
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId ===connectionId);
        }
        return connection;
    }

    searchProvider = async (code) => {
        this.setState({isLoading: true, notFound: false, provider: null});
        const provider = await ProfileService.searchProviderByCode(code);
        if (provider.errors) {
            const errorCode = provider.errors[0].errorCode;
            if (errorCode === ERROR_NOT_FOUND) {
                this.setState({isLoading: false, notFound: true});
            }
        } else {
            provider.profileImage = provider.profileImage ? S3_BUCKET_LINK + provider.profileImage : provider.profileImage;
            if(!provider.profileImage){
                const filteredConnection = this.findConnectionDetails(provider.userId);
                provider.colorCode = filteredConnection && filteredConnection.length>0?filteredConnection[0].colorCode:DEFAULT_AVATAR_COLOR;
            }
            this.setState({provider, isSelf:provider.userId===this.props.auth.meta.userId, isLoading: false, notFound: false});
        }
    };
}

export default connectConnections()(ProviderSearchScreen);
