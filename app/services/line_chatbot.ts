import type { ActionArgs } from '@remix-run/node'
import {
  Client,
  validateSignature,
  type WebhookRequestBody,
  type WebhookEvent,
  type MessageEvent,
  type TextMessage,
} from '@line/bot-sdk'
import invariant from 'tiny-invariant'
import {
  Configuration,
  OpenAIApi,
  type ChatCompletionRequestMessage,
} from 'openai'
import {
  getLineUserByLineId,
  createLineUser,
  type LineUser,
} from '~/models/line_user.server'
import {
  getLineChatMessageLog,
  createLineChatMessageLog,
} from '~/models/line_chat_message_logs.server'

export type LineMessageHandlerFn = (
  client: Client,
  user: LineUser,
  event: MessageEvent,
) => Promise<void>

const dispatchMessageHandler = async (webhookEvents: WebhookEvent[]) => {}

/**
 * 対象の line_id から LINE 公式アカウントを取得する
 * @param destination
 * @returns
 */
const findLineOfficialAccount = (destination: string) => {
  return {
    channelAccessToken: process.env.APP1_CHANNEL_ACCESS_TOKEN ?? '',
    channelSecret: process.env.APP1_CHANNEL_SECRET ?? '',
  }
}

/**
 * LINE Webhook リクエストを処理する
 * @param request
 */
export const processWebhookRequest = async (request: Request) => {
  const body = await request.text()
  const webhookRequest = JSON.parse(body) as WebhookRequestBody

  // LINE公式アカウント設定の取得
  const lineOfficialAccount = findLineOfficialAccount(
    webhookRequest.destination,
  )

  // webhook メッセージの検証
  invariant(
    validateSignature(
      body,
      lineOfficialAccount.channelSecret ?? '',
      request.headers.get('x-line-signature') ?? '',
    ),
    'Invalid signature',
  )

  // LINE Messenger API client
  const client = new Client({
    channelAccessToken: lineOfficialAccount.channelAccessToken,
    channelSecret: lineOfficialAccount.channelSecret,
  })

  return {
    client,
    lineOfficialAccount,
    events: webhookRequest.events,
  }
}
