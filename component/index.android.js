'use strict';

var {
  NativeModules,
  DeviceEventEmitter,
} = require('react-native');

var RNPushNotification = NativeModules.RNPushNotification;
var _notifHandlers = new Map();

var DEVICE_NOTIF_EVENT = 'remoteNotificationReceived';
var NOTIF_REGISTER_EVENT = 'remoteNotificationsRegistered';
var REMOTE_FETCH_EVENT = 'remoteFetch';

const GCM_DATA_KEYS = [
  'google.message_id',
  'google.sent_time',
  'collapse_key',
  'foreground',
  'userInteraction',
  'id',
  'notification',
  'data',
  'from'
];

function homologateNotificationWithIOS(notification) {
  let data = {};
  let newNotification = {};

  Object.entries(notification).forEach(n => {
    if (GCM_DATA_KEYS.includes(n[0])) {
      newNotification = { ...newNotification, [n[0]]: n[1] };
    } else {
      data = { ...data, [n[0]]: n[1] };
    }
  });

  return {
    ...newNotification,
    data
  };
}

var NotificationsComponent = function() {

};

NotificationsComponent.prototype.getInitialNotification = function () {
    return RNPushNotification.getInitialNotification()
        .then(function (notification) {
            if (notification && notification.dataJSON) {
                return homologateNotificationWithIOS(JSON.parse(notification.dataJSON));
            }
            return null;
        });
};

NotificationsComponent.prototype.requestPermissions = function(senderID: string) {
	RNPushNotification.requestPermissions(senderID);
};

NotificationsComponent.prototype.cancelLocalNotifications = function(details: Object) {
	RNPushNotification.cancelLocalNotifications(details);
};

NotificationsComponent.prototype.cancelAllLocalNotifications = function() {
	RNPushNotification.cancelAllLocalNotifications();
};

NotificationsComponent.prototype.presentLocalNotification = function(details: Object) {
	RNPushNotification.presentLocalNotification(details);
};

NotificationsComponent.prototype.scheduleLocalNotification = function(details: Object) {
	RNPushNotification.scheduleLocalNotification(details);
};

NotificationsComponent.prototype.setApplicationIconBadgeNumber = function(number: number) {
       if (!RNPushNotification.setApplicationIconBadgeNumber) {
               return;
       }
       RNPushNotification.setApplicationIconBadgeNumber(number);
};

NotificationsComponent.prototype.abandonPermissions = function() {
	/* Void */
};

NotificationsComponent.prototype.checkPermissions = function(callback: Function) {
	/* Void */
};

NotificationsComponent.prototype.addEventListener = function(type: string, handler: Function) {
	var listener;
	if (type === 'notification') {
		listener =  DeviceEventEmitter.addListener(
			DEVICE_NOTIF_EVENT,
			function(notifData) {
				var data = homologateNotificationWithIOS(JSON.parse(notifData.dataJSON));
				handler(data);
			}
		);
	} else if (type === 'register') {
		listener = DeviceEventEmitter.addListener(
			NOTIF_REGISTER_EVENT,
			function(registrationInfo) {
				handler(registrationInfo.deviceToken);
			}
		);
	} else if (type === 'remoteFetch') {
		listener = DeviceEventEmitter.addListener(
			REMOTE_FETCH_EVENT,
			function(notifData) {
				var notificationData = homologateNotificationWithIOS(JSON.parse(notifData.dataJSON))
				handler(notificationData);
			}
		);
	}

	_notifHandlers.set(handler, listener);
};

NotificationsComponent.prototype.removeEventListener = function(type: string, handler: Function) {
	var listener = _notifHandlers.get(handler);
	if (!listener) {
		return;
	}
	listener.remove();
	_notifHandlers.delete(handler);
}

NotificationsComponent.prototype.registerNotificationActions = function(details: Object) {
	RNPushNotification.registerNotificationActions(details);
}

NotificationsComponent.prototype.clearAllNotifications = function() {
	RNPushNotification.clearAllNotifications()
}

module.exports = {
	state: false,
	component: new NotificationsComponent()
};

