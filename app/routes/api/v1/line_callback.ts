import type { ActionArgs } from '@remix-run/node'
import {
  Client,
  validateSignature,
  type WebhookRequestBody,
  type MessageEvent,
  type TextMessage,
} from '@line/bot-sdk'
import invariant from 'tiny-invariant'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const prompt =
  'あなたは臨床心理士です。ユーザからの相談に親切に対応してください。'

const handleMessage = async (client: Client, event: MessageEvent) => {
  const message = event.message
  if (message.type === 'text') {
    const chatRes = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        { role: 'user', content: message.text },
      ],
    })

    console.log({
      request: message.text,
      response: chatRes.data.choices[0],
    })

    const text =
      chatRes.data.choices[0].message?.content.trim() || 'No response'
    const replyMessage: TextMessage = {
      type: 'text',
      text,
    }
    await client.replyMessage(event.replyToken, replyMessage)
  }
}

export const action = async ({ request }: ActionArgs) => {
  const body = await request.text()
  const webhookRequest = JSON.parse(body) as WebhookRequestBody

  // webhook メッセージの検証
  invariant(
    validateSignature(
      body,
      process.env.APP1_CHANNEL_SECRET ?? '',
      request.headers.get('x-line-signature') ?? '',
    ),
    'Invalid signature',
  )

  const client = new Client({
    channelAccessToken: process.env.APP1_CHANNEL_ACCESS_TOKEN ?? '',
    channelSecret: process.env.APP1_CHANNEL_SECRET ?? '',
  })

  for (const event of webhookRequest.events) {
    if (event.type === 'message') {
      await handleMessage(client, event)
    }
  }

  return { status: 200, body: 'OK' }
}
