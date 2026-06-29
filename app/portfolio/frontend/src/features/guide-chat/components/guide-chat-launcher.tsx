import { Bot, X } from 'lucide-react'
import { useState } from 'react'

import { GuideChatPanel } from './guide-chat-panel'
import { useGuideChat } from '../hooks/use-guide-chat'

export function GuideChatLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const guideChat = useGuideChat()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen ? (
        <GuideChatPanel
          {...guideChat}
          onInputChange={guideChat.setInput}
          onSend={(message) => void guideChat.sendMessage(message)}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border bg-card/95 px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-md transition duration-150 hover:bg-accent"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="hiraya-guide-panel"
      >
        {isOpen ? <X className="size-4" /> : <Bot className="size-4 text-primary" />}
        {isOpen ? 'Minimize Guide' : 'Ask Hiraya Guide'}
      </button>
    </div>
  )
}
