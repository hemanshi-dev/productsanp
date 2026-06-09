import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '../firebase';

/**
 * Track a page view
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (!analytics) return;
  
  logEvent(analytics, 'page_view', {
    page_path: pagePath,
    page_title: pageTitle || pagePath,
  });
};

/**
 * Track a custom event
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (!analytics) return;
  
  logEvent(analytics, eventName, eventParams);
};

/**
 * Set user ID for analytics
 */
export const setAnalyticsUserId = (userId: string) => {
  if (!analytics) return;
  
  setUserId(analytics, userId);
};

/**
 * Set user properties
 */
export const setAnalyticsUserProperties = (properties: Record<string, any>) => {
  if (!analytics) return;
  
  setUserProperties(analytics, properties);
};

/**
 * Track user login
 */
export const trackLogin = (method: string) => {
  trackEvent('login', { method });
};

/**
 * Track user signup
 */
export const trackSignup = (method: string) => {
  trackEvent('sign_up', { method });
};

/**
 * Track image generation
 */
export const trackImageGeneration = (params?: {
  category?: string;
  style?: string;
  hasCustomModel?: boolean;
}) => {
  trackEvent('generate_image', params);
};

/**
 * Track button click
 */
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location || window.location.pathname,
  });
};

/**
 * Track purchase or payment
 */
export const trackPurchase = (value: number, currency: string = 'INR', items?: any[]) => {
  trackEvent('purchase', {
    value,
    currency,
    items,
  });
};

