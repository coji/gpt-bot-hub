import {
  type InputGroupProps,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useDisclosure,
  useMergeRefs,
} from '@chakra-ui/react'
import * as React from 'react'
import { HiEye, HiEyeOff } from 'react-icons/hi'

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  InputGroupProps
>((props, ref) => {
  const { isOpen, onToggle } = useDisclosure()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const mergeRef = useMergeRefs(inputRef, ref)
  const onClickReveal = () => {
    onToggle()
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }

  return (
    <InputGroup {...props}>
      <InputRightElement>
        <IconButton
          aria-label={isOpen ? 'Mask password' : 'Reveal password'}
          icon={isOpen ? <HiEyeOff /> : <HiEye />}
          onClick={onClickReveal}
          tabIndex={-1}
          variant="link"
        />
      </InputRightElement>
      <Input
        ref={mergeRef}
        autoComplete="current-password"
        id="password"
        name="password"
        required
        type={isOpen ? 'text' : 'password'}
      />
    </InputGroup>
  )
})

PasswordInput.displayName = 'PasswordInput'
