import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import {
  Heading,
  Grid,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  HStack,
  VStack,
  chakra,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

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

interface TestResponse {
  text: string
}
const useTest = () => {
  return useMutation(async (form: ChatForm) => {
    const ret = await fetch('/api/test', {
      method: 'POST',
      body: JSON.stringify(form),
    })
    if (ret.ok) {
      return (await ret.json()) as TestResponse
    }
  })
}

interface ChatForm {
  userInput: string
  apiKey: string
  promptInput: string
}

export default function Private() {
  const test = useTest()
  const { user } = useLoaderData<typeof loader>()
  const { register, handleSubmit } = useForm<ChatForm>({
    defaultValues: {
      userInput: '',
      promptInput:
        'You are Assistant. Help the user as much as possible.\n' +
        '\n' +
        '{{memory}}\n' +
        'User: {{userInput}}\n' +
        'Assistant:',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    const ret = await test.mutateAsync(data)
  })

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

      <Box overflowY="auto" p="4">
        <Box p="4" color="gray.200" bgColor="black" rounded="md">
          <HStack alignItems="start">
            <VStack flexGrow="1" w="full">
              <chakra.form onSubmit={onSubmit} w="full">
                <FormControl>
                  <HStack>
                    <FormLabel>Input</FormLabel>
                    <Input
                      {...register('userInput')}
                      autoFocus
                      name="userInput"
                    ></Input>
                  </HStack>
                </FormControl>
              </chakra.form>

              <Box
                h="full"
                borderColor="white"
                border="1px solid"
                rounded="md"
                p="4"
              >
                hoge
              </Box>
            </VStack>

            <Box w="30rem">
              <VStack>
                <FormControl>
                  <FormLabel>API Key</FormLabel>
                  <Input {...register('apiKey')} type="password"></Input>
                </FormControl>
                <FormControl>
                  <FormLabel>Prompt</FormLabel>
                  <Textarea {...register('promptInput')} rows={10}></Textarea>
                </FormControl>
              </VStack>
            </Box>
          </HStack>
        </Box>
      </Box>

      <Box as="footer" p="2" textAlign="center">
        Copyright &copy; {new Date().getFullYear()} coji.
      </Box>
    </Grid>
  )
}
