import { Bot, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GuideChatPanel } from './guide-chat-panel'
import { useGuideChat } from '../hooks/use-guide-chat'

export function GuideChatLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const guideChat = useGuideChat()
  const { t } = useTranslation()

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
        className="inline-flex h-[38px] items-center gap-1.5 rounded-xl border bg-card/95 px-3 text-xs font-medium shadow-xl backdrop-blur-md transition duration-150 hover:bg-accent"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="hiraya-guide-panel"
      >
        {isOpen ? <X className="size-3.5" /> : <Bot className="size-3.5 text-primary" />}
        {isOpen ? t('guide.launcher.minimize') : t('guide.launcher.ask')}
      </button>
    </div>
  )
}
