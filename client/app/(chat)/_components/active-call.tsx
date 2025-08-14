"use client";

import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, Settings, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCall } from "@/hooks/use-call";
import { IUser } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface ActiveCallProps {
  currentContact: IUser;
}

const ActiveCall = ({ currentContact }: ActiveCallProps) => {
  const { 
    localVideoRef, 
    remoteVideoRef, 
    isAudioEnabled, 
    isVideoEnabled, 
    isMuted,
    toggleAudio, 
    toggleVideo, 
    toggleMute,
    endCall,
    isCaller,
    callType
  } = useCall();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const getDisplayName = (user: IUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    } else {
      return user.email;
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border z-40">
        <div className="flex items-center gap-3 p-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              callType === 'video' ? 'bg-blue-500' : 'bg-green-500'
            }`} />
            <span className="text-sm font-medium">
              {getDisplayName(currentContact)}
            </span>
          </div>
          <Button
            onClick={() => setIsMinimized(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Container */}
      <div className="relative w-full h-full">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local Video (Picture-in-Picture) */}
        {callType === 'video' && (
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Call Info Overlay */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentContact.avatar} alt={getDisplayName(currentContact)} />
              <AvatarFallback>
                {currentContact.firstName?.[0] || currentContact.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <p className="font-medium">{getDisplayName(currentContact)}</p>
              <p className="text-sm text-gray-300">
                {callType === 'video' ? 'Video Call' : 'Audio Call'}
              </p>
            </div>
          </div>
        </div>

        {/* Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex justify-center items-center gap-4">
            {/* Mute Button */}
            <Button
              onClick={toggleMute}
              size="lg"
              variant={isMuted ? "destructive" : "secondary"}
              className="h-14 w-14 rounded-full"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {/* End Call Button */}
            <Button
              onClick={endCall}
              size="lg"
              variant="destructive"
              className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
              title="End Call"
            >
              <PhoneOff className="h-7 w-7" />
            </Button>

            {/* Video Toggle Button (only for video calls) */}
            {callType === 'video' && (
              <Button
                onClick={toggleVideo}
                size="lg"
                variant={isVideoEnabled ? "secondary" : "destructive"}
                className="h-14 w-14 rounded-full"
                title={isVideoEnabled ? "Turn off video" : "Turn on video"}
              >
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            )}

            {/* Audio Toggle Button */}
            <Button
              onClick={toggleAudio}
              size="lg"
              variant={isAudioEnabled ? "secondary" : "destructive"}
              className="h-14 w-14 rounded-full"
              title={isAudioEnabled ? "Turn off audio" : "Turn on audio"}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Minimize Button */}
        <Button
          onClick={() => setIsMinimized(true)}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
          title="Minimize"
        >
          <Minimize2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Audio-only call overlay */}
      {callType === 'audio' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="mb-8">
              <Avatar className="h-32 w-32 mx-auto mb-4">
                <AvatarImage src={currentContact.avatar} alt={getDisplayName(currentContact)} />
                <AvatarFallback className="text-4xl">
                  {currentContact.firstName?.[0] || currentContact.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-3xl font-semibold mb-2">
                {getDisplayName(currentContact)}
              </h2>
              <p className="text-xl text-blue-200">Audio Call</p>
            </div>
            
            {/* Audio Call Controls */}
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={toggleMute}
                size="lg"
                variant={isMuted ? "destructive" : "secondary"}
                className="h-14 w-14 rounded-full"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              <Button
                onClick={endCall}
                size="lg"
                variant="destructive"
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
                title="End Call"
              >
                <PhoneOff className="h-7 w-7" />
              </Button>

              <Button
                onClick={toggleAudio}
                size="lg"
                variant={isAudioEnabled ? "secondary" : "destructive"}
                className="h-14 w-14 rounded-full"
                title={isAudioEnabled ? "Turn off audio" : "Turn on audio"}
              >
                {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveCall;
