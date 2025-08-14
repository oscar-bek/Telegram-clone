# Call Functionality Troubleshooting Guide

## Common Issues and Solutions

### 1. Console NotAllowedError: Permission Denied

**Problem**: Browser blocks access to microphone/camera
**Solution**: 
- Click "Allow" when the browser prompts for microphone/camera access
- Check browser settings to ensure permissions are granted
- Make sure no other apps are using your camera/microphone

### 2. "WebRTC requires a secure context" Error

**Problem**: WebRTC only works on HTTPS or localhost
**Solution**: 
- Use `localhost` for development (already configured)
- For production, ensure your site uses HTTPS

### 3. "No microphone or camera found" Error

**Problem**: Device doesn't have required hardware
**Solution**:
- Check if your device has a microphone/camera
- Try using a different device
- Check if hardware is properly connected

### 4. "Camera/Microphone already in use" Error

**Problem**: Another application is using your media devices
**Solution**:
- Close other video calling apps (Zoom, Teams, etc.)
- Close browser tabs that might be using camera/microphone
- Restart your browser

### 5. Call Not Connecting

**Problem**: WebRTC connection fails to establish
**Solution**:
- Check if both users are online
- Ensure firewall isn't blocking WebRTC traffic
- Try refreshing the page and reconnecting

### 6. Poor Call Quality

**Problem**: Audio/video quality is low
**Solution**:
- Check your internet connection speed
- Close other bandwidth-heavy applications
- Ensure good lighting for video calls
- Use a wired connection instead of WiFi if possible

## Browser-Specific Issues

### Chrome/Edge
- Check `chrome://settings/content/camera` and `chrome://settings/content/microphone`
- Ensure permissions are set to "Allow"

### Firefox
- Check `about:preferences#privacy` → Permissions
- Look for camera and microphone settings

### Safari
- Check Safari → Preferences → Websites → Camera/Microphone
- Ensure permissions are set to "Allow"

## Development Environment

### Local Development
- Calls work on `localhost` (secure context)
- Ensure all three servers are running:
  - Socket server (port 5000)
  - Backend server (port 3001)
  - Frontend (port 3000)

### Production Deployment
- Must use HTTPS for WebRTC to work
- Configure STUN servers for NAT traversal
- Ensure proper firewall rules for WebRTC

## Testing Call Functionality

1. **Basic Test**: Open two browser tabs/windows
2. **Login**: Use different accounts in each tab
3. **Make Call**: Click call button on one contact
4. **Accept Call**: Accept the call in the other tab
5. **Verify**: Check if audio/video streams are working

## Debug Information

### Check Console Logs
- Look for WebRTC connection logs
- Check for permission errors
- Verify socket connection status

### Network Tab
- Check WebRTC connection establishment
- Look for ICE candidate exchange
- Verify STUN server communication

## Getting Help

If you're still experiencing issues:

1. Check the browser console for error messages
2. Verify all servers are running correctly
3. Test with different browsers/devices
4. Check network connectivity and firewall settings
5. Open an issue with detailed error information

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `NotAllowedError` | Permission denied | Allow camera/microphone access |
| `NotFoundError` | No media device | Check hardware connection |
| `NotReadableError` | Device in use | Close other apps |
| `OverconstrainedError` | Unsupported resolution | Try different camera |
| `TypeError` | Invalid constraints | Check device settings |
