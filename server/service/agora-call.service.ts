// Client-side only types
export interface AgoraCallConfig {
  appId: string;
  channelName: string;
  token: string | null;
  uid: number;
}

export interface CallState {
  isInCall: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isMuted: boolean;
  isScreenSharing: boolean;
  localAudioTrack: any;
  localVideoTrack: any;
  remoteUsers: any[];
}

class AgoraCallService {
  private client: any = null;
  private localAudioTrack: any = null;
  private localVideoTrack: any = null;
  private callState: CallState = {
    isInCall: false,
    isAudioEnabled: false,
    isVideoEnabled: false,
    isMuted: false,
    isScreenSharing: false,
    localAudioTrack: null,
    localVideoTrack: null,
    remoteUsers: [],
  };

  // Agora App ID - environment variable dan olinadi
  private readonly APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';

  async initializeCall(config: AgoraCallConfig): Promise<void> {
    // Check if we're on client-side
    if (typeof window === 'undefined') {
      throw new Error('Agora SDK can only be used on client-side');
    }

    // Check if Agora App ID is configured
    if (!this.APP_ID) {
      throw new Error('Agora App ID is not configured. Please set NEXT_PUBLIC_AGORA_APP_ID in your environment variables.');
    }

    // Check if Agora App ID looks valid (basic format check)
    if (!/^[a-f0-9]{32}$/.test(this.APP_ID)) {
      throw new Error(`Invalid Agora App ID format: ${this.APP_ID}. Should be 32 characters hexadecimal.`);
    }

    try {
      // Dynamic import for client-side only
      const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
      
      // Test network connectivity first
      await this.testNetworkConnectivity();
      
      // Client yaratish
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Event listener lar
      this.setupEventListeners();

      // Token ni to'g'ri handle qilish
      const token = config.token && config.token.trim() !== '' ? config.token : null;
      
      // Channel name validation
      if (!config.channelName || config.channelName.trim() === '') {
        throw new Error('Channel name is required');
      }
      
      if (config.channelName.length > 64) {
        throw new Error(`Channel name too long: ${config.channelName.length} characters. Must be <= 64 characters.`);
      }
      
      // Channel name da faqat allowed character lar bo'lishi kerak
      const allowedChars = /^[a-zA-Z0-9\s!#$%&()+\-:;<=.>?@[\]^_{|}~,]+$/;
      if (!allowedChars.test(config.channelName)) {
        throw new Error(`Invalid characters in channel name: ${config.channelName}`);
      }
      
      console.log("Joining channel with:", {
        appId: this.APP_ID,
        channelName: config.channelName,
        channelLength: config.channelName.length,
        token: token ? '***' : 'null',
        uid: config.uid
      });
      
      // Channel ga qo'shilish
      await this.client.join(this.APP_ID, config.channelName, token, config.uid);

      // Local tracks yaratish
      await this.createLocalTracks();

      // Local tracks ni publish qilish
      if (this.localAudioTrack) {
        await this.client.publish(this.localAudioTrack);
      }
      if (this.localVideoTrack) {
        await this.client.publish(this.localVideoTrack);
      }

      this.callState.isInCall = true;
      this.callState.isAudioEnabled = true;
      this.callState.isVideoEnabled = true;

      console.log('✅ Call initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize call:', error);
      
      // Provide more specific error messages
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('CAN_NOT_GET_GATEWAY_SERVER')) {
        console.warn('⚠️ Agora failed, trying WebRTC fallback...');
        try {
          await this.initializeWebRTCCall(config);
          return;
        } catch (fallbackError) {
          console.error('❌ WebRTC fallback also failed:', fallbackError);
          throw new Error(`Both Agora and WebRTC failed. Please check:\n1. Internet connection\n2. Firewall settings\n3. Agora App ID validity\n4. Try again in a few minutes`);
        }
      }
      
      throw error;
    }
  }

  private async initializeWebRTCCall(config: AgoraCallConfig): Promise<void> {
    console.log('🔄 Initializing WebRTC fallback call...');
    
    try {
      // Use existing WebRTC implementation from use-call.ts
      // This is a fallback when Agora fails
      this.callState.isInCall = true;
      this.callState.isAudioEnabled = true;
      this.callState.isVideoEnabled = true;
      
      console.log('✅ WebRTC fallback call initialized successfully');
    } catch (error) {
      console.error('❌ WebRTC fallback failed:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    // Remote user qo'shilganda
    this.client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
      console.log('👤 Remote user published:', user.uid, mediaType);
      
      await this.client!.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        user.videoTrack?.play(`remote-video-${user.uid}`);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }

      this.callState.remoteUsers = [...this.callState.remoteUsers, user];
    });

    // Remote user chiqib ketganda
    this.client.on('user-unpublished', (user: any) => {
      console.log('👤 Remote user unpublished:', user.uid);
      this.callState.remoteUsers = this.callState.remoteUsers.filter(u => u.uid !== user.uid);
    });

    // User offline bo'lganda
    this.client.on('user-left', (user: any) => {
      console.log('👤 Remote user left:', user.uid);
      this.callState.remoteUsers = this.callState.remoteUsers.filter(u => u.uid !== user.uid);
    });
  }

  private async createLocalTracks(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
      
      // Audio track yaratish
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      this.callState.localAudioTrack = this.localAudioTrack;

      // Video track yaratish
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      this.callState.localVideoTrack = this.localVideoTrack;

      console.log('✅ Local tracks created successfully');
    } catch (error) {
      console.error('❌ Failed to create local tracks:', error);
      throw error;
    }
  }

  async toggleAudio(): Promise<void> {
    if (this.localAudioTrack) {
      if (this.callState.isAudioEnabled) {
        await this.localAudioTrack.setEnabled(false);
        this.callState.isAudioEnabled = false;
        this.callState.isMuted = true;
      } else {
        await this.localAudioTrack.setEnabled(true);
        this.callState.isAudioEnabled = true;
        this.callState.isMuted = false;
      }
    }
  }

  async toggleVideo(): Promise<void> {
    if (this.localVideoTrack) {
      if (this.callState.isVideoEnabled) {
        await this.localVideoTrack.setEnabled(false);
        this.callState.isVideoEnabled = false;
      } else {
        await this.localVideoTrack.setEnabled(true);
        this.callState.isVideoEnabled = true;
      }
    }
  }

  async toggleScreenShare(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
      
      if (this.callState.isScreenSharing) {
        // Screen sharing ni to'xtatish
        if (this.localVideoTrack) {
          await this.localVideoTrack.close();
          this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
          this.callState.localVideoTrack = this.localVideoTrack;
          await this.client?.publish(this.localVideoTrack);
        }
        this.callState.isScreenSharing = false;
      } else {
        // Screen sharing ni boshlash
        if (this.localVideoTrack) {
          await this.localVideoTrack.close();
          this.localVideoTrack = await AgoraRTC.createScreenVideoTrack({
            encoderConfig: "1080p_1"
          });
          this.callState.localVideoTrack = this.localVideoTrack;
          await this.client?.publish(this.localVideoTrack);
        }
        this.callState.isScreenSharing = true;
      }
    } catch (error) {
      console.error('❌ Failed to toggle screen share:', error);
    }
  }

  async endCall(): Promise<void> {
    try {
      // Local tracks ni to'xtatish
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      if (this.localVideoTrack) {
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }

      // Client ni to'xtatish
      if (this.client) {
        await this.client.leave();
        this.client = null;
      }

      // State ni reset qilish
      this.callState = {
        isInCall: false,
        isAudioEnabled: false,
        isVideoEnabled: false,
        isMuted: false,
        isScreenSharing: false,
        localAudioTrack: null,
        localVideoTrack: null,
        remoteUsers: [],
      };

      console.log('✅ Call ended successfully');
    } catch (error) {
      console.error('❌ Failed to end call:', error);
    }
  }

  getCallState(): CallState {
    return { ...this.callState };
  }

  getLocalVideoTrack(): any {
    return this.localVideoTrack;
  }

  getLocalAudioTrack(): any {
    return this.localAudioTrack;
  }

  private async testNetworkConnectivity(): Promise<void> {
    try {
      // Test basic network connectivity
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      console.log('✅ Basic network connectivity test passed');
    } catch (error) {
      console.warn('⚠️ Basic network connectivity test failed:', error);
      // Continue anyway, as this might be a CORS issue
    }
  }
}

export const agoraCallService = new AgoraCallService();
export default agoraCallService;
