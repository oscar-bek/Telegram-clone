"use client";

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CallControls from './call-controls';
import { ICall, ICallState, IUser } from '@/types';

interface VideoCallProps {
  call: ICall;
  callState: ICallState;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export default function VideoCall({
  call,
  callState,
  localVideoRef,
  remoteVideoRef,
  onToggleAudio,
  onToggleVideo,
  onEndCall
}: VideoCallProps) {
  const getDisplayName = (user: IUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.email;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Remote Video (Full Screen) */}
      <div className="relative w-full h-full">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Call Info Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={call.receiver.avatar} alt={getDisplayName(call.receiver)} />
              <AvatarFallback>
                {getDisplayName(call.receiver).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <p className="font-medium">{getDisplayName(call.receiver)}</p>
              <p className="text-sm text-gray-200">Video Call</p>
            </div>
          </div>
          
          {/* Call Duration */}
          <div className="text-white text-sm">
            {/* You can add call duration logic here */}
            Live
          </div>
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-20 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Local Video Overlay */}
          {!callState.videoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <Avatar className="w-16 h-16">
                <AvatarImage src={call.caller.avatar} alt={getDisplayName(call.caller)} />
                <AvatarFallback className="text-xl">
                  {getDisplayName(call.caller).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <CallControls
          callState={callState}
          onToggleAudio={onToggleAudio}
          onToggleVideo={onToggleVideo}
          onEndCall={onEndCall}
          callType="video"
        />
      </div>
    </div>
  );
}
