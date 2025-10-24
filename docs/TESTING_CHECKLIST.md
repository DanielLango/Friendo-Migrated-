# RevenueCat Testing Checklist

Use this checklist to ensure your subscription system works perfectly before launch.

## Pre-Testing Setup

- [ ] RevenueCat account created
- [ ] iOS subscriptions created in App Store Connect
- [ ] Android subscriptions created in Google Play Console
- [ ] Stores connected to RevenueCat
- [ ] Entitlements configured (entitlement: "pro")
- [ ] Offerings configured (offering: "default")
- [ ] API keys added to `.env.local`
- [ ] Development build created (not Expo Go)

## iOS Testing

### Sandbox Setup
- [ ] Sandbox tester account created in App Store Connect
- [ ] Signed out of Apple ID on test device
- [ ] Signed in with sandbox tester account

### Purchase Flow
- [ ] App launches without errors
- [ ] Add 3 friends successfully
- [ ] Schedule 2 meetings successfully
- [ ] Paywall appears automatically
- [ ] Both subscription options display correctly
- [ ] Prices show correctly ($0.99/mo, $9.99/yr)
- [ ] Can select monthly plan
- [ ] Can select yearly plan
- [ ] Purchase monthly subscription works
- [ ] Purchase yearly subscription works
- [ ] Success message appears
- [ ] Premium features unlock immediately
- [ ] Paywall doesn't show again after purchase

### Restore Flow
- [ ] Delete and reinstall app
- [ ] Tap "Restore" button
- [ ] Previous subscription restores successfully
- [ ] Premium features unlock
- [ ] Success message appears

### Edge Cases
- [ ] Cancel purchase → No charge, stays on free plan
- [ ] Purchase with no internet → Appropriate error message
- [ ] Multiple rapid taps on purchase → No duplicate charges
- [ ] Close paywall → Can still use free features

## Android Testing

### Test User Setup
- [ ] Test user added in Google Play Console
- [ ] Signed in with test account on device

### Purchase Flow
- [ ] App launches without errors
- [ ] Add 3 friends successfully
- [ ] Schedule 2 meetings successfully
- [ ] Paywall appears automatically
- [ ] Both subscription options display correctly
- [ ] Prices show correctly
- [ ] Can select monthly plan
- [ ] Can select yearly plan
- [ ] Purchase monthly subscription works
- [ ] Purchase yearly subscription works
- [ ] Success message appears
- [ ] Premium features unlock immediately
- [ ] Paywall doesn't show again after purchase

### Restore Flow
- [ ] Delete and reinstall app
- [ ] Tap "Restore" button
- [ ] Previous subscription restores successfully
- [ ] Premium features unlock
- [ ] Success message appears

### Edge Cases
- [ ] Cancel purchase → No charge, stays on free plan
- [ ] Purchase with no internet → Appropriate error message
- [ ] Multiple rapid taps on purchase → No duplicate charges
- [ ] Close paywall → Can still use free features

## Cross-Platform Testing

- [ ] Purchase on iOS → Restore on Android (same account)
- [ ] Purchase on Android → Restore on iOS (same account)
- [ ] Premium status syncs across devices

## Premium Features Testing

Once subscribed:

- [ ] Premium badge/indicator shows (if implemented)
- [ ] Can access cancellation tracking (when implemented)
- [ ] Can access birthday reminders (when implemented)
- [ ] Can access profile pictures (when implemented)
- [ ] Can add more than 50 friends (when implemented)

## Subscription Management

- [ ] User can manage subscription in App Store
- [ ] User can manage subscription in Google Play
- [ ] User can cancel subscription
- [ ] After cancellation, premium features remain until period ends
- [ ] After period ends, reverts to free plan
- [ ] Can resubscribe after cancellation

## Analytics & Monitoring

- [ ] Purchases appear in RevenueCat dashboard
- [ ] Customer info updates correctly
- [ ] Active subscriptions count is accurate
- [ ] Revenue tracking is correct
- [ ] Events are logged properly

## Error Handling

- [ ] Network error → User-friendly message
- [ ] Invalid product → Graceful fallback
- [ ] Store unavailable → Appropriate message
- [ ] Already subscribed → Correct handling
- [ ] Expired subscription → Correct handling

## Performance

- [ ] Paywall loads quickly (< 2 seconds)
- [ ] No lag when selecting plans
- [ ] Purchase completes in reasonable time
- [ ] App doesn't crash during purchase
- [ ] No memory leaks

## UI/UX

- [ ] Paywall design matches mockups
- [ ] Text is readable and clear
- [ ] Buttons are easy to tap
- [ ] Loading states are clear
- [ ] Success states are celebratory
- [ ] Error states are helpful
- [ ] Can close paywall easily
- [ ] Restore button is visible

## Legal & Compliance

- [ ] Terms of Service link works
- [ ] Privacy Policy link works
- [ ] Subscription terms are clear
- [ ] Auto-renewal is mentioned
- [ ] Cancellation policy is clear
- [ ] Pricing is transparent

## Production Readiness

- [ ] All tests pass on iOS
- [ ] All tests pass on Android
- [ ] Subscriptions approved in both stores
- [ ] API keys are production keys (not test)
- [ ] Error logging is set up
- [ ] Analytics are configured
- [ ] Support email is set up
- [ ] Refund policy is documented

## Post-Launch Monitoring (First Week)

- [ ] Monitor conversion rate daily
- [ ] Check for crash reports
- [ ] Review user feedback
- [ ] Monitor churn rate
- [ ] Check revenue accuracy
- [ ] Respond to support requests
- [ ] Fix any critical issues immediately

## Post-Launch Monitoring (First Month)

- [ ] Weekly conversion rate review
- [ ] Monthly revenue report
- [ ] Churn analysis
- [ ] User feedback analysis
- [ ] A/B test paywall variations (optional)
- [ ] Optimize pricing (optional)

---

## Notes

- Test thoroughly before launch
- Use real devices, not just simulators
- Test on multiple iOS versions
- Test on multiple Android versions
- Test on different screen sizes
- Document any issues found
- Keep this checklist updated

## Sign-Off

- [ ] iOS testing complete - Tested by: __________ Date: __________
- [ ] Android testing complete - Tested by: __________ Date: __________
- [ ] Cross-platform testing complete - Tested by: __________ Date: __________
- [ ] Ready for production - Approved by: __________ Date: __________