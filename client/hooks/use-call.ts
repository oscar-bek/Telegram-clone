import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { ICall, ICallState, IUser } from '@/types';
import { useSession } from 'next-auth/react';



export const useCall = () => {
  const { socket } = useAuth();
  const { data: session } = useSession();
  const [currentCall, setCurrentCall] = useState<ICall | null>(null);
  const [incomingCall, setIncomingCall] = useState<ICall | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callState, setCallState] = useState<ICallState>({
    audioEnabled: true,
    videoEnabled: true
  });

  // WebRTC refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async (callType: 'audio' | 'video') => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video'
      });

      localStreamRef.current = stream;

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        if (peerConnection) {
          peerConnection.addTrack(track, stream);
        }
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && currentCall) {
          socket?.emit('iceCandidate', {
            callId: currentCall.id,
            candidate: event.candidate,
            targetUserId: currentCall.receiver._id
          });
        }
      };

      return peerConnection;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      throw error;
    }
  }, [currentCall, socket]);

  // Make a call
  const makeCall = useCallback(async (receiver: IUser, callType: 'audio' | 'video') => {
    if (!socket || !session?.currentUser) return;

    try {
      const peerConnection = await initializeWebRTC(callType);
      
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send call request
      socket.emit('callRequest', {
        caller: session.currentUser,
        receiver,
        callType
      });

      // Store offer for later
      peerConnectionRef.current = peerConnection;
    } catch (error) {
      console.error('Error making call:', error);
    }
  }, [socket, initializeWebRTC, session?.currentUser]);

  // Accept incoming call
  const acceptCall = useCallback(async (call: ICall) => {
    if (!socket) return;

    try {
      const peerConnection = await initializeWebRTC(call.type);
      
      // Accept the call
      socket.emit('callAccepted', {
        callId: call.id,
        receiver: call.receiver
      });

      setCurrentCall(call);
      setIncomingCall(null);
      setIsInCall(true);

      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer
      socket.emit('answer', {
        callId: call.id,
        answer,
        targetUserId: call.caller._id
      });

      peerConnectionRef.current = peerConnection;
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  }, [socket, initializeWebRTC]);

  // Reject incoming call
  const rejectCall = useCallback((call: ICall, reason?: string) => {
    if (!socket) return;

    socket.emit('callRejected', {
      callId: call.id,
      receiver: call.receiver,
      reason: reason || 'Call rejected'
    });

    setIncomingCall(null);
  }, [socket]);

  // End current call
  const endCall = useCallback(() => {
    if (!socket || !currentCall) return;

    socket.emit('callEnded', {
      callId: currentCall.id,
      userId: currentCall.caller._id
    });

    // Clean up WebRTC
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setCurrentCall(null);
    setIsInCall(false);
    setCallState({ audioEnabled: true, videoEnabled: true });
  }, [socket, currentCall]);

  // Toggle audio/video
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, audioEnabled: audioTrack.enabled }));
        
        if (currentCall) {
          socket?.emit('callStateChanged', {
            callId: currentCall.id,
            userId: currentCall.caller._id,
            audioEnabled: audioTrack.enabled,
            videoEnabled: callState.videoEnabled
          });
        }
      }
    }
  }, [currentCall, socket, callState.videoEnabled]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({ ...prev, videoEnabled: videoTrack.enabled }));
        
        if (currentCall) {
          socket?.emit('callStateChanged', {
            callId: currentCall.id,
            userId: currentCall.caller._id,
            audioEnabled: callState.audioEnabled,
            videoEnabled: videoTrack.enabled
          });
        }
      }
    }
  }, [currentCall, socket, callState.audioEnabled]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data: any) => {
      setIncomingCall({
        id: data.callId,
        caller: data.caller,
        receiver: data.caller, // This should be the current user
        type: data.callType,
        status: 'ringing',
        startTime: new Date(data.timestamp)
      });
    };

    const handleCallAccepted = (data: any) => {
      if (currentCall && data.callId === currentCall.id) {
        setCurrentCall(prev => prev ? { ...prev, status: 'active' } : null);
        setIsInCall(true);
      }
    };

    const handleCallRejected = (data: any) => {
      if (currentCall && data.callId === currentCall.id) {
        endCall();
      }
    };

    const handleCallEnded = (data: any) => {
      if (currentCall && data.callId === currentCall.id) {
        endCall();
      }
    };

    const handleOffer = async (data: any) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          
          socket.emit('answer', {
            callId: data.callId,
            answer,
            targetUserId: data.fromUserId
          });
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      }
    };

    const handleAnswer = async (data: any) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    };

    const handleIceCandidate = async (data: any) => {
      if (peerConnectionRef.current) {
        try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error('Error handling ICE candidate:', error);
        }
      }
    };

    const handleCallStateChanged = (data: any) => {
      // Handle remote user's audio/video state changes
      console.log('Remote user state changed:', data);
    };

    socket.on('incomingCall', handleIncomingCall);
    socket.on('callAccepted', handleCallAccepted);
    socket.on('callRejected', handleCallRejected);
    socket.on('callEnded', handleCallEnded);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('iceCandidate', handleIceCandidate);
    socket.on('callStateChanged', handleCallStateChanged);

    return () => {
      socket.off('incomingCall', handleIncomingCall);
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callRejected', handleCallRejected);
      socket.off('callEnded', handleCallEnded);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('iceCandidate', handleIceCandidate);
      socket.off('callStateChanged', handleCallStateChanged);
    };
  }, [socket, currentCall, endCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return {
    currentCall,
    incomingCall,
    isInCall,
    callState,
    localVideoRef,
    remoteVideoRef,
    makeCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo
  };
};
