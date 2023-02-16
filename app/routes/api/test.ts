import * as promptable from 'promptable'
import { type ActionArgs, json } from '@remix-run/node'
import { requireLogin } from '~/services/auth.server'

export const action = async ({ request }: ActionArgs) => {
  const user = await requireLogin(request, '/')

  const data = await request.json()
  const clear = data.clear as string
  const userInput = data.userInput as string
  const promptInput = data.promptInput as string
  const apiKey = data.promptInput as string

  const openai = new promptable.OpenAI(apiKey || '')
  const chatHistory = new promptable.BufferedChatMemory()

  // clear the chat history
  if (clear) {
    chatHistory.clear()
    return json({ message: 'cleared' }, 200)
  }

  const prompt = promptable.prompts.chatbot()
  prompt.text = promptInput
  const memoryChain = new promptable.MemoryLLMChain(prompt, openai, chatHistory)

  chatHistory.addUserMessage(userInput)
  const botOutput = ((await memoryChain.run({ userInput })) as string).trim()
  chatHistory.addBotMessage(botOutput)

  console.log({
    user,
    data,
    prompots: { ...promptable.prompts.chatbot() },
  })

  return json({ text: botOutput })
}
