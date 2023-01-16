/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTBridgeDelegate.h>
#import <UserNotifications/UserNotifications.h>
#import <UIKit/UIKit.h>
#import <React/RCTRootView.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate>

@property (nonatomic, strong) NSDictionary *launchOptions;
@property (nonatomic, strong) UIWindow *window;
@property (nonatomic) RCTRootView *rootView;
@end
@interface RCTAnimatedSplash : NSObject <RCTBridgeModule>
+(void) show:(AppDelegate*)delegate postCtrl:(UIViewController*)postCtrl;
@end
