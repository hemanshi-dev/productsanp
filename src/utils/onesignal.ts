import OneSignal from 'react-onesignal';

// Initialize OneSignal
export const initializeOneSignal = async () => {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  
  if (!appId) {
    console.warn('OneSignal App ID not found. Push notifications will not work.');
    return;
  }

  try {
    await OneSignal.init({
      appId: appId,
      allowLocalhostAsSecureOrigin: true, // For development
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: 'push',
              autoPrompt: false, // We'll trigger manually after login
              categories: [], // Not needed for push type
              delay: {}, // No delay, we'll trigger manually
              text: {
                actionMessage: 'Subscribe to our notifications for the latest news and updates. You can disable anytime.',
                acceptButton: 'Subscribe',
                cancelMessage: 'Later',
              },
            },
          ],
        },
      },
    });
    
    console.log('OneSignal initialized successfully');
  } catch (error) {
    console.error('Error initializing OneSignal:', error);
  }
};

// Prompt user to subscribe to push notifications
export const promptPushSubscription = async () => {
  try {
    // Wait a bit to ensure OneSignal is fully initialized
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if push notifications are supported
    if (!OneSignal.Notifications.isPushSupported()) {
      console.log('Push notifications are not supported in this browser');
      return;
    }

    // Check if user has already granted permission
    if (OneSignal.Notifications.permission) {
      console.log('User already has push notification permission');
      return;
    }

    // Use OneSignal's slidedown prompt for better UX
    // This shows a custom popup instead of the native browser prompt
    await OneSignal.Slidedown.promptPush();
    
    console.log('Push notification prompt shown');
  } catch (error) {
    console.error('Error prompting for push subscription:', error);
    // Fallback to native browser prompt if slidedown fails
    try {
      const permission = await OneSignal.Notifications.requestPermission();
      if (permission) {
        console.log('Push notification permission granted via native prompt');
      }
    } catch (fallbackError) {
      console.error('Error with native permission prompt:', fallbackError);
    }
  }
};

// Set user email and tags after login
export const setOneSignalUser = async (email: string) => {
  try {
    // Add user email
    OneSignal.User.addEmail(email);
    
    // Add "Web" tag
    OneSignal.User.addTag('platform', 'Web');
    
    // Prompt for push notification subscription
    await promptPushSubscription();
    
    console.log('OneSignal user set:', { email, tag: 'Web' });
  } catch (error) {
    console.error('Error setting OneSignal user:', error);
  }
};

// Clear user data on logout
export const clearOneSignalUser = async () => {
  try {
    // Remove the platform tag
    OneSignal.User.removeTag('platform');
    console.log('OneSignal user cleared');
  } catch (error) {
    console.error('Error clearing OneSignal user:', error);
  }
};

