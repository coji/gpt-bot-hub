import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { Heading, Grid, Box, Button } from '@chakra-ui/react'

import { auth } from '~/services/auth.server'
import { getUserById } from '~/models/user.server'

export const loader = async ({ request }: LoaderArgs) => {
  const { userId } = await auth.isAuthenticated(request, {
    failureRedirect: '/',
  })
  const user = await getUserById(userId)
  if (!user) {
    return await auth.logout(request, { redirectTo: '/' })
  }
  return json({ user })
}

export default function Private() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <Grid templateRows="auto 1fr auto" h="100dvh" bgColor="gray.100">
      <Heading display="flex" p="4">
        <Box flex="1">Private page</Box>
        <Form method="post" action="/logout">
          <Button colorScheme="blue" type="submit">
            ログアウト
          </Button>
        </Form>
      </Heading>

      <Box overflowX="auto" p="4">
        <Box p="4" color="gray.200" bgColor="black" rounded="md">
          <Box whiteSpace="pre">{JSON.stringify(user, null, 2)}</Box>
        </Box>
      </Box>

      <Box as="footer" p="2" textAlign="center">
        Copyright &copy; {new Date().getFullYear()} coji.
      </Box>
    </Grid>
  )
}
