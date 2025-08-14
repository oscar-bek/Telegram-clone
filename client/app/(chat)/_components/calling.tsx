"use client";

import { Phone, Video, PhoneOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types";
import { useCall } from "@/hooks/use-call";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CallingProps {
  currentContact: IUser;
  callType: 'audio' | 'video';
}

const Calling = ({ currentContact, callType }: CallingProps) => {
  const { endCall } = useCall();

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          {/* Contact Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={currentContact.avatar} alt={getDisplayName(currentContact)} />
              <AvatarFallback className="text-2xl">
                {currentContact.firstName?.[0] || currentContact.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {getDisplayName(currentContact)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {callType === 'video' ? 'Video Call' : 'Audio Call'}
            </p>
          </div>

          {/* Calling Animation */}
          <div className="flex justify-center">
            <div className={`p-4 rounded-full ${
              callType === 'video' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            } animate-pulse`}>
              {callType === 'video' ? (
                <Video className="h-8 w-8" />
              ) : (
                <Phone className="h-8 w-8" />
              )}
            </div>
          </div>

          {/* Calling Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Calling...</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Waiting for {getDisplayName(currentContact)} to answer
            </p>
          </div>

          {/* Cancel Button */}
          <Button
            onClick={endCall}
            size="lg"
            variant="destructive"
            className="h-12 px-8 bg-red-500 hover:bg-red-600"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Cancel Call
          </Button>

          {/* Call Type Indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className={`w-2 h-2 rounded-full ${
              callType === 'video' ? 'bg-blue-500' : 'bg-green-500'
            }`} />
            <span>
              {callType === 'video' ? 'Video Call' : 'Audio Call'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calling;
