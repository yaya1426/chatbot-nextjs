import { ChatApp } from "@/components/chat/ChatApp";
import { publicModels } from "@/lib/models";

export default function Page() {
  return <ChatApp models={publicModels()} />;
}
