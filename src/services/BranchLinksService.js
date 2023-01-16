import branch from 'react-native-branch';

export default class BranchLinksService {

    // Create branch link for share provider profile
    static shareProviderProfileLink = async (channel, providerId)=>{
        let branchUniversalObject = await branch.createBranchUniversalObject(
            providerId,
            {
                locallyIndex: true,
                contentMetadata: {
                    customMetadata: {
                        providerId: providerId
                    },
                },
            },
        )

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $content_type: 'share-provider-profile',
        };

        let {url} = await branchUniversalObject.generateShortUrl(linkProperties, controlParams);
        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: "Provider Profile" + ' ' + url,
        };

        let {sharedChannel, completed, error} = await branchUniversalObject.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams
        );
    };

    // Create branch link for appointment event add to calendar
    static shareAppLink = async (channel)=>{
        let buo = await branch.createBranchUniversalObject(
            'ShareButtonLinkIdentifier',
        )

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $content_type: 'share-app-link',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: "App link" + ' ' + url,
        };

        let {sharedChannel, completed, error} = await buo.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams
        );
    };

    // Create branch link for connect provider
    static recommendProviderProfileLink = async (channel, providerId)=>{
        let buo = await branch.createBranchUniversalObject(
            providerId,
            {
                locallyIndex: true,
                contentMetadata: {
                    customMetadata: {
                        providerId: providerId,
                    },
                },
            },
        )

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $content_type: 'recommend-provider-profile',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: "Provider Profile" + ' ' + url,
        };

        let {sharedChannel, completed, error} = await buo.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams
        );
    }

    // Create branch link QR code for recommend provider profile
    static profileQRCodeLink = async ( providerId )=>{
        let buo = await branch.createBranchUniversalObject(
            providerId,
            {
                locallyIndex: true,
                contentMetadata: {
                    customMetadata: {
                        providerId: providerId,
                    },
                },
            },
        )

        let linkProperties = {
            feature: 'qr-code-profile'
        };

        let controlParams = {
            $content_type: 'recommend-provider-profile',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        return url;
    }

    // Create branch link for share public group link
    static shareGroupLink = async (channel, GroupChannelUrl)=>{
        let buo = await branch.createBranchUniversalObject(
            GroupChannelUrl,
            {
                locallyIndex: true,
                contentMetadata: {
                    customMetadata: {
                        GroupChannelUrl: GroupChannelUrl,
                    },
                },
            },
        )

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $content_type: 'group-recommendation',
        };

        let {url} = await buo.generateShortUrl(linkProperties , controlParams);
        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: "Join this Public Group here: " + ' ' + url,
        };

        let {sharedChannel, completed, error} = await buo.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams
        );
    };

    // Create branch link QR code for public group
    static groupQRCodeLink = async (GroupChannelUrl)=>{

        let buo = await branch.createBranchUniversalObject(
            GroupChannelUrl,
            {
                locallyIndex: true,
                contentMetadata: {
                    customMetadata: {
                        GroupChannelUrl: GroupChannelUrl,
                    },
                },
            },
        )

        let linkProperties = {
            feature: 'group-qr-code',
        };

        let controlParams = {
            $content_type: 'group-recommendation',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        return url;
    };


}
