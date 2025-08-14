"use client";

import { Phone, Video, PhoneOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types";
import { useCall } from "@/hooks/use-call";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface IncomingCallProps {
  call: {
    id: string;
    caller: IUser;
    type: 'audio' | 'video';
    status: string;
    startTime: Date;
  };
}

const IncomingCall = ({ call }: IncomingCallProps) => {
  const { acceptCall, rejectCall } = useCall();

  const handleAccept = () => {
    acceptCall(call.id);
  };

  const handleReject = () => {
    rejectCall(call.id, 'Call rejected');
  };

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
          {/* Caller Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={call.caller.avatar} alt={getDisplayName(call.caller)} />
              <AvatarFallback className="text-2xl">
                {call.caller.firstName?.[0] || call.caller.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Caller Info */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {getDisplayName(call.caller)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {call.type === 'video' ? 'Video Call' : 'Audio Call'}
            </p>
          </div>

          {/* Call Icon */}
          <div className="flex justify-center">
            <div className={`p-4 rounded-full ${
              call.type === 'video' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            }`}>
              {call.type === 'video' ? (
                <Video className="h-8 w-8" />
              ) : (
                <Phone className="h-8 w-8" />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleAccept}
              size="lg"
              className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white"
              title="Accept Call"
            >
              <Phone className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={handleReject}
              size="lg"
              variant="destructive"
              className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 text-white"
              title="Reject Call"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          {/* Call Status */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Incoming call...
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
