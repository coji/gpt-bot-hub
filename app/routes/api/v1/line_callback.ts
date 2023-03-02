import type { ActionArgs } from '@remix-run/node'
import {
  Client,
  validateSignature,
  type WebhookRequestBody,
  type MessageEvent,
  type TextMessage,
} from '@line/bot-sdk'
import invariant from 'tiny-invariant'

const handleMessage = async (client: Client, event: MessageEvent) => {
  const message = event.message
  if (message.type === 'text') {
    const text = 'hello ' + message.text
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
