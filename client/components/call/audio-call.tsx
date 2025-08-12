"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ICall, ICallState } from '@/types';
import { Phone } from 'lucide-react';
import { IUser } from '@/types';
import CallControls from "./call-controls";

interface AudioCallProps {
  call: ICall;
  callState: ICallState;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export default function AudioCall({
  call,
  callState,
  onToggleAudio,
  onToggleVideo,
  onEndCall
}: AudioCallProps) {
  const getDisplayName = (user: IUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.email;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center justify-center">
      {/* Caller Avatar */}
      <div className="mb-8">
        <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
          <AvatarImage src={call.receiver.avatar} alt={getDisplayName(call.receiver)} />
          <AvatarFallback className="text-4xl bg-white/20 text-white">
            {getDisplayName(call.receiver).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Caller Info */}
      <div className="text-center text-white mb-12">
        <h2 className="text-3xl font-bold mb-2">
          {getDisplayName(call.receiver)}
        </h2>
        <p className="text-xl text-blue-100 flex items-center justify-center gap-2">
          <Phone className="w-5 h-5" />
          Audio Call
        </p>
      </div>

      {/* Call Status */}
      <div className="text-center text-white mb-8">
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-lg">Live</span>
        </div>
        {/* You can add call duration here */}
      </div>

      {/* Call Controls */}
      <div className="mb-8">
        <CallControls
          callState={callState}
          onToggleAudio={onToggleAudio}
          onToggleVideo={onToggleVideo}
          onEndCall={onEndCall}
          callType="audio"
        />
      </div>

      {/* Additional Info */}
      <div className="text-center text-blue-100 text-sm">
        <p>Tap the microphone button to mute/unmute</p>
        <p>Tap the speaker button to toggle speaker mode</p>
      </div>
    </div>
  );
}
