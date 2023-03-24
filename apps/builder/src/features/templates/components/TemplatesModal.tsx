import {
  Button,
  chakra,
  Divider,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Tag,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@/components/icons'
import { Standard } from '@typebot.io/react'
import { Typebot } from '@typebot.io/schemas'
import React, { useCallback, useEffect, useState } from 'react'
import { templates } from '../data'
import { TemplateProps } from '../types'
import { useToast } from '@/hooks/useToast'
import { sendRequest } from '@typebot.io/lib'

type Props = {
  isOpen: boolean
  onClose: () => void
  onTypebotChoose: (typebot: Typebot) => void
}

export const TemplatesModal = ({ isOpen, onClose, onTypebotChoose }: Props) => {
  const [typebot, setTypebot] = useState<Typebot>()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateProps>(
    templates[0]
  )
  const [isLoading, setIsLoading] = useState(false)

  const { showToast } = useToast()

  const fetchTemplate = useCallback(
    async (template: TemplateProps) => {
      setSelectedTemplate(template)
      const { data, error } = await sendRequest(
        `/templates/${template.fileName}`
      )
      if (error)
        return showToast({ title: error.name, description: error.message })
      setTypebot(data as Typebot)
    },
    [showToast]
  )

  useEffect(() => {
    fetchTemplate(templates[0])
  }, [fetchTemplate])

  const onUseThisTemplateClick = () => {
    if (!typebot) return
    onTypebotChoose(typebot)
    setIsLoading(true)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent h="85vh">
        <ModalBody h="full" as={HStack} p="0" spacing="0">
          <Stack w="full" h="full" spacing="4">
            <Heading pl="10" pt="4" fontSize="2xl">
              {selectedTemplate.emoji}{' '}
              <chakra.span ml="2">{selectedTemplate.name}</chakra.span>
            </Heading>
            {typebot && (
              <Standard
                key={typebot.id}
                typebot={typebot}
                style={{
                  borderRadius: '0.25rem',
                  backgroundColor: '#fff',
                }}
              />
            )}
          </Stack>

          <Stack
            h="full"
            py="6"
            w="300px"
            px="4"
            borderLeftWidth={1}
            justify="space-between"
          >
            <Stack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={onUseThisTemplateClick}
                isLoading={isLoading}
              >
                Use this template
              </Button>
              <Divider />
              <Stack>
                {templates.map((template) => (
                  <Tooltip
                    key={template.name}
                    isDisabled={!template.isComingSoon}
                    label="Coming soon!"
                  >
                    <span>
                      <Button
                        onClick={() => fetchTemplate(template)}
                        w="full"
                        variant={
                          selectedTemplate.name === template.name
                            ? 'solid'
                            : 'ghost'
                        }
                        isDisabled={template.isComingSoon}
                      >
                        <HStack justifyContent="space-between" w="full">
                          <HStack overflow="hidden">
                            <Text>{template.emoji}</Text>
                            <Text noOfLines={0} display="block">
                              {template.name}
                            </Text>
                          </HStack>

                          {template.isNew && (
                            <Tag colorScheme="orange" size="sm" flexShrink={0}>
                              New
                            </Tag>
                          )}
                        </HStack>
                      </Button>
                    </span>
                  </Tooltip>
                ))}
              </Stack>
            </Stack>

            <Stack>
              <Divider />
              <Tooltip label="Coming soon!" placement="top">
                <span>
                  <Button
                    w="full"
                    variant="ghost"
                    isDisabled
                    leftIcon={<ExternalLinkIcon />}
                  >
                    Community templates
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
