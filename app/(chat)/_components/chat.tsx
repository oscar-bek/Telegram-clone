import MessageCard from "@/components/cards/message.card";
import ChatLoading from "@/components/loadings/chat.loading";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { messageSchema } from "@/lib/validation";
import { Paperclip, Send, Smile } from "lucide-react";
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import emojies from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "next-themes";
import { useLoading } from "@/hooks/use-loading";
import { IMessage } from "@/types";
import { useSession } from "next-auth/react";
import { useCurrentContact } from "@/hooks/use-current";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UploadDropzone } from '@/lib/uploadthing'

interface Props {
 onSubmitMessage: (values: z.infer<typeof messageSchema>) => Promise<void>
	onReadMessages: () => Promise<void>
	onReaction: (reaction: string, messageId: string) => Promise<void>
	onDeleteMessage: (messageId: string) => Promise<void>
  messageForm: UseFormReturn<z.infer<typeof messageSchema>>;
  messages: IMessage[];
  onTyping: (e: ChangeEvent<HTMLInputElement>) => void
}

const Chat: FC<Props> = ({ onSubmitMessage, messageForm, messages, onReadMessages, onReaction, onDeleteMessage, onTyping }) => {
	const [open, setOpen] = useState(false)

  const { loadMessages } = useLoading();
const { editedMessage, setEditedMessage } = useCurrentContact();
  const { data: session } = useSession();
  const { currentContact } = useCurrentContact();
  const { resolvedTheme } = useTheme();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLFormElement | null>(null);
  const prevContactIdRef = useRef<string | null>(null);

  // Just current user and current contact's messages filtering
  const filteredMessages = messages.filter((message) => {
    const currentUserId = session?.currentUser?._id;
    const contactId = currentContact?._id;

    // Check if the message is between current user and current contact
    const isRelevantMessage =
      (message.sender._id === currentUserId &&
        message.receiver._id === contactId) ||
      (message.sender._id === contactId &&
        message.receiver._id === currentUserId);

    return isRelevantMessage;
  });

  useEffect(() => {
		if (editedMessage) {
			messageForm.setValue('text', editedMessage.text)
			scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}, [editedMessage])

  // FIXED: UseEffect for scrolling and message input
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  // FIXED: When Contact is updated and new messages arrive, change status to read messages
  useEffect(() => {
    const currentContactId = currentContact?._id;
    // Contact is updated or new messages arrive
    if (currentContactId && (
      prevContactIdRef.current !== currentContactId || // Contact is updated
      filteredMessages.length > 0 // New messages are available
    )) {
      onReadMessages();
      prevContactIdRef.current = currentContactId;
    }
  }, [currentContact?._id, filteredMessages.length]); // use length

  // FIXED: Cleanup when Component unmounts
  useEffect(() => {
    return () => {
      prevContactIdRef.current = null;
    };
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current;
    if (!input) return;

    const text = messageForm.getValues("text");
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    const newText = text.slice(0, start) + emoji + text.slice(end);
    messageForm.setValue("text", newText);

    setTimeout(() => {
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <div className='flex flex-col justify-end z-40 min-h-[92vh] sidebar-custom-scrollbar overflow-y-scroll'>
      {/* Loading */}
      {loadMessages && <ChatLoading />}

      {/* Messages - just filtered messages*/}
      {filteredMessages.map((message) => (
       <MessageCard key={message._id} message={message} onReaction={onReaction} onDeleteMessage={onDeleteMessage} />
      ))}

      {/* Start conversation */}
      {filteredMessages.length === 0 && (
        <div className="w-full h-[88vh] flex items-center justify-center">
         <div className='text-[100px] cursor-pointer' onClick={() => onSubmitMessage({ text: '✋' })}>
            ✋
          </div>
        </div>
      )}

      {/* Message input */}
      <Form {...messageForm}>
        <form
          onSubmit={messageForm.handleSubmit(onSubmitMessage)}
          className="w-full flex relative"
          ref={scrollRef}
        >
         <Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button size={'icon'} type='button' variant={'secondary'}>
								<Paperclip />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle />
							</DialogHeader>
							<UploadDropzone
								endpoint={'imageUploader'}
								onClientUploadComplete={res => {
									onSubmitMessage({ text: '', image: res[0].url })
									setOpen(false)
								}}
								config={{ appendOnPaste: true, mode: 'auto' }}
							/>
						</DialogContent>
					</Dialog>

          <FormField
            control={messageForm.control}
            name="text"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    className="bg-secondary border-l border-l-muted-foreground border-r border-r-muted-foreground h-9"
                    placeholder="Type a message"
                    value={field.value}
                    onBlur={() => field.onBlur()}
                   onChange={e => {
											field.onChange(e.target.value)
											onTyping(e)
											if (e.target.value === '') setEditedMessage(null)
										}}
                    ref={inputRef}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" type="button" variant="secondary">
                <Smile />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 border-none rounded-md absolute right-6 bottom-0">
              <Picker
                data={emojies}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                onEmojiSelect={(emoji: { native: string }) =>
                  handleEmojiSelect(emoji.native)
                }
              />
            </PopoverContent>
          </Popover>

          <Button type="submit" size={"icon"}>
            <Send />
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Chat;