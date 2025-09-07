import { useSignal } from "@preact/signals";
import { useRef, useEffect } from "preact/hooks";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Define the message structure
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Create the markdown processor pipeline
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeKatex)
  .use(rehypeStringify, { allowDangerousHtml: true });

export default function AIChat({ lang = 'zh' }: { lang?: string }) {
  const messages = useSignal<Message[]>([]);
  const inputText = useSignal("");
  const isLoading = useSignal(false);
  const abortController = useSignal<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom of the chat container when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.value.length, messages.value[messages.value.length - 1]?.content]); // Depend on message count and last message content

  const sendMessage = async () => {
    const messageText = inputText.value.trim();
    if (!messageText || isLoading.value) return;

    messages.value = [...messages.value, { role: "user", content: messageText }];
    const currentInput = inputText.value;
    inputText.value = "";
    isLoading.value = true;
    abortController.value = new AbortController();

    const apiUrl = import.meta.env.DEV ? 'http://localhost:8787/chat' : '/chat';

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput, lang }),
        signal: abortController.value.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get response reader");

      messages.value = [...messages.value, { role: "assistant", content: "" }];
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lastMessage = messages.value[messages.value.length - 1];
        if (lastMessage) {
          lastMessage.content += chunk;
          messages.value = [...messages.value]; // Trigger signal update
        }
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        const errorMessage = error.message || "Sorry, something went wrong.";
        const lastMessage = messages.value[messages.value.length - 1];
        if(lastMessage && lastMessage.role === 'assistant'){
            lastMessage.content = errorMessage;
            messages.value = [...messages.value];
        } else {
            messages.value = [...messages.value, { role: "assistant", content: errorMessage }];
        }
      }
    } finally {
      isLoading.value = false;
      abortController.value = null;
    }
  };

  const handleStop = () => {
    if (abortController.value) {
      abortController.value.abort();
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 min-h-0">
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 p-2 border rounded dark:border-gray-600">
        {messages.value.map((msg, index) => (
          <div key={index} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-start max-w-[85%]">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl mr-2">
                {msg.role === 'user' ? (
                  <span>👤</span>
                ) : (
                  <span>🤖</span>
                )}
              </div>
              <div 
                className={`rounded-2xl px-4 py-2 ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 dark:bg-blue-600 text-gray-100 dark:text-gray-100 rounded-tr-none' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
                } prose dark:prose-invert max-w-full`}
                dangerouslySetInnerHTML={{ __html: processor.processSync(msg.content).toString() }}
              />
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center">
        <textarea
          value={inputText.value}
          onInput={(e) => inputText.value = (e.target as HTMLTextAreaElement).value}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={3}
          className="textarea textarea-bordered w-full dark:bg-gray-700 dark:text-white resize-y"
          placeholder={lang === 'zh' ? '输入您的问题... (Shift+Enter 换行)' : 'Enter your question... (Shift+Enter for new line)'}
          disabled={isLoading.value}
        />
        <button 
          type={isLoading.value ? "button" : "submit"}
          className="btn btn-primary ml-2 btn-square"
          onClick={isLoading.value ? handleStop : undefined}
          disabled={!isLoading.value && !inputText.value.trim()}
          aria-label={isLoading.value ? "Stop Generation" : "Send Message"}
        >
          {isLoading.value ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-current dark:fill-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h12v12H6z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-current dark:stroke-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
