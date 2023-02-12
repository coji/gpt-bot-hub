import invariant from 'tiny-invariant'
import { createHash } from 'crypto'
import { base64UrlEncode } from './utils'

invariant(process.env.GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_ID must be set')
invariant(process.env.GOOGLE_CLIENT_SECRET, 'GOOGLE_CLIENT_SECRET must be set')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const CODE_VERIFIER = 'verifier-text-is-here!'

interface GoogleUser {
  id: number
  email: string
  verified_email: boolean
  name: string
  picture: string
  hd: string
}

const isGoogleUser = (user: unknown): user is GoogleUser => {
  return typeof user === 'object' && user !== null && 'email' in user
}

export const REDIRECT_URI = '/api/auth/callback/google'

/**
 * Google 認証画面への URL を生成する
 */
export const generateAuthUrl = (request: Request) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    response_type: 'code',
    access_type: 'offline', // TODO: refresh_token を取得する場合は必要のはずだけど取れない
    scope: 'openid email profile',
    include_granted_scopes: 'true',
    redirect_uri: new URL(REDIRECT_URI, request.url).toString(),
    nonce: '1',
    state: 'state1',
    code_challenge: base64UrlEncode(
      createHash('sha256').update(CODE_VERIFIER).digest('base64'),
    ),
    code_challenge_method: 'S256',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * アクセストークンの取得
 * @param code 認証コード
 */
export const fetchAccessToken = async (request: Request) => {
  const code = new URL(request.url).searchParams.get('code')
  invariant(code, 'No code found in the URL.')

  const ret = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      code,
      code_verifier: CODE_VERIFIER,
      grant_type: 'authorization_code',
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: new URL(REDIRECT_URI, request.url).toString(),
      prompt: 'concent',
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  invariant(ret.ok, 'Failed to get access token from Google.')

  const json: unknown = await ret.json()
  console.log(json)
  const { access_token } = json as Record<string, string>
  return access_token
}

/**
 * Google ユーザ情報の取得
 * @param accessToken
 * @returns
 */
export const fetchUser = async (accessToken: string): Promise<GoogleUser> => {
  const ret = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  invariant(ret.ok, 'Failed to get user from GitHub.')
  const user: unknown = await ret.json()
  invariant(isGoogleUser(user), 'invalid google user')

  return user
}
