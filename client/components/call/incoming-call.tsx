"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, PhoneOff, Video, PhoneCall } from "lucide-react";
import { ICall, IUser } from "@/types";

interface IncomingCallProps {
  call: ICall;
  onAccept: (call: ICall) => void;
  onReject: (call: ICall) => void;
}

export default function IncomingCall({ call, onAccept, onReject }: IncomingCallProps) {
  const getDisplayName = (user: IUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.email;
  };

  const getCallIcon = () => {
    return call.type === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />;
  };

  const getCallTypeText = () => {
    return call.type === 'video' ? 'Video Call' : 'Audio Call';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        {/* Caller Avatar */}
        <div className="mb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={call.caller.avatar} alt={getDisplayName(call.caller)} />
            <AvatarFallback className="text-2xl">
              {getDisplayName(call.caller).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Caller Info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {getDisplayName(call.caller)}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            {getCallIcon()}
            {getCallTypeText()}
          </p>
        </div>

        {/* Call Actions */}
        <div className="flex items-center justify-center gap-4">
          {/* Accept Call */}
          <Button
            onClick={() => onAccept(call)}
            size="lg"
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white"
          >
            <PhoneCall className="w-8 h-8" />
          </Button>

          {/* Reject Call */}
          <Button
            onClick={() => onReject(call)}
            size="lg"
            variant="destructive"
            className="w-16 h-16 rounded-full"
          >
            <PhoneOff className="w-8 h-8" />
          </Button>
        </div>

        {/* Call Status */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Incoming call...
        </p>
      </div>
    </div>
  );
}
