import { ActionPanel, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { PrimaryAction } from "./actions";
import { FormInputActionSection } from "./actions/form-input";
import { PreferencesActionSection } from "./actions/preferences";
import { useChat } from "./hooks/useChat";
import { useConversations } from "./hooks/useConversations";
import { useQuestion } from "./hooks/useQuestion";
import { Chat, Conversation } from "./type";
import { ChatView } from "./views/chat";

export default function Ask(props: { conversation?: Conversation }) {
  const conversations = useConversations();
  const chat = useChat<Chat>(props.conversation?.chats ?? []);
  const question = useQuestion({ initialQuestion: "", disableAutoLoad: props.conversation ? true : false });

  const [conversation, setConversation] = useState<Conversation>(
    props.conversation ?? {
      id: uuidv4(),
      chats: [],
      pinned: false,
      updated_at: "",
      created_at: new Date().toISOString(),
    }
  );

  useEffect(() => {
    if (props.conversation?.id !== conversation.id) {
      conversations.add(conversation);
    }
  }, []);

  useEffect(() => {
    conversations.setData((prev) => {
      return prev.map((a) => {
        if (a.id === conversation.id) {
          return conversation;
        }
        return a;
      });
    });
  }, [conversation]);

  useEffect(() => {
    setConversation({ ...conversation, chats: chat.data, updated_at: new Date().toISOString() });
  }, [chat.data]);

  const getActionPanel = (question: string) => (
    <ActionPanel>
      <PrimaryAction title="Get Answer" onAction={() => chat.getAnswer(question)} />
      <FormInputActionSection initialQuestion={question} onSubmit={(question) => chat.getAnswer(question)} />
      <PreferencesActionSection />
    </ActionPanel>
  );

  return (
    <List
      searchText={question.data}
      isShowingDetail={chat.data.length > 0 ? true : false}
      filtering={false}
      isLoading={question.isLoading ? question.isLoading : chat.isLoading}
      onSearchTextChange={question.setData}
      throttle={false}
      navigationTitle={"Ask"}
      actions={question.data.length > 0 ? getActionPanel(question.data) : null}
      selectedItemId={chat.selectedChatId || undefined}
      onSelectionChange={(id) => {
        if (id !== chat.selectedChatId) {
          chat.setSelectedChatId(id);
        }
      }}
      searchBarPlaceholder={chat.data.length > 0 ? "Ask another question..." : "Ask a question..."}
    >
      <ChatView data={chat.data} question={question.data} setConversation={setConversation} use={{ chat }} />
    </List>
  );
}
