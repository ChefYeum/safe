import * as PushNotifications from '@pusher/push-notifications-server';

export const sendWarningToDevices = () => {
    const beamsClient = new PushNotifications({
        instanceId: '3e44d417-0f2c-4f86-830b-4384e60a183c',
        secretKey: '38EDD5EE8B8E3132E6E9EEAA050569FA949918DF0A30A05C44044A03E3FA329D'
    });
      
    return beamsClient.publish(['events'], {
        fcm: {
          notification: {
            title: 'Warning! Suspicious activity reported near you!',
            body: 'Suspicious activity has been reported near you by SAFE. Please move away from the area.'
          }
        }
      })
}