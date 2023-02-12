import { getUserByEmail, createUser } from '~/models/user.server'
import invariant from 'tiny-invariant'
import type { StrategyVerifyCallback } from 'remix-auth'
import {
  type SupportedSocialProviderProfile,
  type SupportedSocialProviderExtraParams,
} from './supported-social-provider.server'
import type { OAuth2StrategyVerifyParams } from 'remix-auth-oauth2'
import type { SessionUser } from '../auth.server'
import { isSupportedSocialProvider } from './supported-social-provider.server'

export const verifyUser: StrategyVerifyCallback<
  SessionUser,
  OAuth2StrategyVerifyParams<
    SupportedSocialProviderProfile,
    SupportedSocialProviderExtraParams
  >
> = async ({ profile, accessToken, refreshToken, extraParams, context }) => {
  console.log('verify  user', {
    profile,
    accessToken,
    refreshToken,
    extraParams,
  })
  invariant(
    isSupportedSocialProvider(profile.provider),
    'provider not supported',
  )
  invariant(profile.id, 'profile.id is required')
  invariant(profile.emails?.[0].value, 'profile.email is required')

  let user = await getUserByEmail(profile.emails?.[0].value)
  if (!user) {
    // 新規ユーザ
    user = await createUser({
      email: profile.emails?.[0].value,
      displayName: profile.displayName,
      picture: profile.photos?.[0].value,
      locale: profile._json.locale,
    })
    if (!user) {
      throw new Error('User not found')
    }
  }

  return { userId: user.id }
}
