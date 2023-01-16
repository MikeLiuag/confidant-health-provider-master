/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"
#import <RNCPushNotificationIOS.h>
#import "RNSplashScreen.h"
#import <OneSignal/OneSignal.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <RNBranch/RNBranch.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
//  [RNBranch useTestInstance];
  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];
  OneSignal.inFocusDisplayType = OSNotificationDisplayTypeNone;
  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  [RCTAnimatedSplash show:(AppDelegate *)self postCtrl:(UIViewController*)rootViewController];
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  self.rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"ConfidantHealthProvider"
                                            initialProperties:nil];

  self.rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  rootViewController.view = self.rootView;

   if (@available(iOS 13, *)) {
          self.window.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
      }

      if (@available(iOS 14, *)) {
        UIDatePicker *picker = [UIDatePicker appearance];
        picker.preferredDatePickerStyle = UIDatePickerStyleWheels;
      }

  return YES;
}
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    if ([RNBranch application:app openURL:url options:options])  {
        // do other deep link routing for the Facebook SDK, Pinterest SDK, etc
    }
    return YES;
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray *restorableObjects))restorationHandler {
    return [RNBranch continueUserActivity:userActivity];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RNCPushNotificationIOS didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  NSLog(@"Got Notification");
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
   {
     NSLog( @"Handle push from background or closed" );
     // if you set a member variable in didReceiveRemoteNotification, you  will know if this is from closed or background
     NSLog(@"%@", response.notification.request.content);
     [RNCPushNotificationIOS didReceiveRemoteNotification:response.notification.request.content.userInfo
                                   fetchCompletionHandler:completionHandler];
    }


// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  NSLog(@"Got Notification");
  NSLog(@"%@", notification);
  [RNCPushNotificationIOS didReceiveLocalNotification:notification];
}
@end

@implementation RCTAnimatedSplash
static AppDelegate*(mainDelegate);
static UIViewController*(postController);
RCT_EXPORT_MODULE(AnimatedSplash);

RCT_EXPORT_METHOD(hide) {
  dispatch_async(dispatch_get_main_queue(), ^{
     // do work here
    mainDelegate.window.rootViewController = postController;
    [mainDelegate.window makeKeyAndVisible];
  });

}

+(void)show:(AppDelegate*)delegate postCtrl:(UIViewController*)postCtrl
{
  mainDelegate = delegate;
  postController=postCtrl;
  UIStoryboard *launchStoryboard = [UIStoryboard storyboardWithName:@"LaunchScreen" bundle:nil];
  UIViewController *launchController = [launchStoryboard instantiateViewControllerWithIdentifier:@"LaunchViewController"];

  delegate.window.rootViewController = launchController;
  [delegate.window makeKeyAndVisible];
}

@end
