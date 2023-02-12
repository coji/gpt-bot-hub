import { Box, Flex, type BoxProps } from '@chakra-ui/react'

interface ContinueWithLabelBarProps extends BoxProps {
  children: React.ReactNode
}
export const ContinueWithLabelBar = ({
  children,
  ...rest
}: ContinueWithLabelBarProps) => (
  <Box pos="relative" {...rest}>
    <Flex pos="absolute" align="center" inset="0">
      <Box
        w="full"
        borderWidth="100%"
        borderTop="1px"
        borderTopColor="gray.200"
      />
    </Flex>
    <Flex pos="relative" justify="center">
      <Box display="inline-block" px="2" bgColor="white">
        {children}
      </Box>
    </Flex>
  </Box>
)
