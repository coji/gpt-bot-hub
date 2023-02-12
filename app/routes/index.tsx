import { Grid, Card, CardBody, Heading, Box, VStack } from '@chakra-ui/react'
import { GoogleLoginButton } from '~/features/oauth2-login/components/GoogleLoginButton'
import { useTransition } from '@remix-run/react'
import { json, type LoaderArgs } from '@remix-run/node'
import { auth } from '~/services/auth.server'

export const loader = async ({ request }: LoaderArgs) => {
  await auth.isAuthenticated(request, {
    successRedirect: '/private',
  })
  return json({})
}

export default function Index() {
  const { state } = useTransition()
  const isLoading = state !== 'idle'

  return (
    <Grid templateRows="1fr auto" h="100dvh" bgColor="gray.100">
      <VStack alignSelf="center" w="full">
        <Heading p="4" size="md">
          GPT Bot Hub
        </Heading>

        <Card p="4" borderRadius="xl" shadow="md" bgColor="white" minW="md">
          <CardBody>
            <GoogleLoginButton isDisabled={isLoading} w="full">
              Googleアカウントで続ける
            </GoogleLoginButton>
          </CardBody>
        </Card>
      </VStack>

      <Box p="2" textAlign="center">
        Copyright &copy; {new Date().getFullYear()} coji
      </Box>
    </Grid>
  )
}
