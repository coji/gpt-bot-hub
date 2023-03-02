import type { ActionArgs } from '@remix-run/node'
import {
  Client,
  validateSignature,
  type WebhookRequestBody,
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

import fs from 'fs'
import path from 'path'
import mimeTypes from 'mime-types'

class LocalFileData {
  path: string
  constructor(path: string) {
    this.path = path
  }

  public get arrayBuffer() {
    var buffer = fs.readFileSync(this.path)
    var arrayBuffer = buffer.subarray(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    )
    return [arrayBuffer]
  }

  public get name() {
    return path.basename(this.path)
  }

  public get type() {
    return mimeTypes.lookup(path.extname(this.path)) || undefined
  }
}

function constructFileFromLocalFileData(localFileData: LocalFileData) {
  return new File(localFileData.arrayBuffer, localFileData.name, {
    type: localFileData.type,
  })
}

function storeFileByMsgId(client: Client, id: string, path: string) {
  return new Promise((resolve, reject) => {
    client
      .getMessageContent(id)
      .then((stream) => {
        stream
          .on('error', reject)
          .on('end', () => resolve(path))
          .pipe(fs.createWriteStream(path))
      })
      .catch(reject)
  })
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const prompt =
  'あなたは臨床心理士です。ユーザからの相談に親切に対応してください。'

const handleMessage = async (
  client: Client,
  user: LineUser,
  event: MessageEvent,
) => {
  const message = event.message
  if (message.type === 'text') {
    const logs: ChatCompletionRequestMessage[] = []
    for (const messageLog of await getLineChatMessageLog(user.id, 30)) {
      logs.push({
        role: 'system',
        content: messageLog.assistant_message,
      })
      logs.push({
        role: 'user',
        content: messageLog.user_message,
      })
    }

    const requestMessages: ChatCompletionRequestMessage[] = [
      {
        role: 'system',
        content: prompt,
      },
      ...logs,
      { role: 'user', content: message.text },
    ]
    const chatRes = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: requestMessages,
    })

    const assistant_message =
      chatRes.data.choices[0].message?.content.trim() || 'No response'
    console.log({
      prompts: requestMessages,
      request: message.text,
      response: assistant_message,
    })

    await createLineChatMessageLog({
      userId: user.id,
      user_message: message.text,
      assistant_message: assistant_message,
    })

    const replyMessage: TextMessage = {
      type: 'text',
      text: assistant_message,
    }
    return replyMessage
  }

  if (message.type === 'audio') {
    // オーディオ
    const filename = './audio.mp3'
    await storeFileByMsgId(client, message.id, filename)
    const file = constructFileFromLocalFileData(new LocalFileData(filename))

    const text = await openai.createTranscription(file, 'whisper-1')
    console.log(text.data)
    return null
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
    if (event.source.type === 'user' && event.type === 'message') {
      const user =
        (await getLineUserByLineId(event.source.userId)) ??
        (await createLineUser({
          line_id: event.source.userId,
          displayName: 'line user',
          locale: 'ja',
          picture: '',
        }))

      const replyMessage = await handleMessage(client, user, event)
      if (replyMessage) {
        await client.replyMessage(event.replyToken, replyMessage)
      }
    }
  }

  return { status: 200, body: 'OK' }
}
