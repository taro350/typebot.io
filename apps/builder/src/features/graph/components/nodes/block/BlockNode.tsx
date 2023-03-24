import {
  Flex,
  HStack,
  Popover,
  PopoverTrigger,
  Portal,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import {
  BubbleBlock,
  BubbleBlockContent,
  DraggableBlock,
  Block,
  BlockWithOptions,
  TextBubbleContent,
  TextBubbleBlock,
  LogicBlockType,
} from '@typebot.io/schemas'
import { isBubbleBlock, isDefined, isTextBubbleBlock } from '@typebot.io/lib'
import { BlockNodeContent } from './BlockNodeContent'
import { BlockSettings, SettingsPopoverContent } from './SettingsPopoverContent'
import { BlockNodeContextMenu } from './BlockNodeContextMenu'
import { SourceEndpoint } from '../../endpoints/SourceEndpoint'
import { useRouter } from 'next/router'
import { MediaBubblePopoverContent } from './MediaBubblePopoverContent'
import { ContextMenu } from '@/components/ContextMenu'
import { TextBubbleEditor } from '@/features/blocks/bubbles/textBubble/components/TextBubbleEditor'
import { BlockIcon } from '@/features/editor/components/BlockIcon'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  NodePosition,
  useBlockDnd,
  useDragDistance,
} from '@/features/graph/providers/GraphDndProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { ParentModalProvider } from '@/features/graph/providers/ParentModalProvider'
import { hasDefaultConnector } from '@/features/typebot/helpers/hasDefaultConnector'
import { TargetEndpoint } from '../../endpoints/TargetEndpoint'
import { SettingsModal } from './SettingsModal'
import { useOutsideClick } from '@/hooks/useOutsideClick'

export const BlockNode = ({
  block,
  isConnectable,
  indices,
  onPointerDown,
}: {
  block: Block
  isConnectable: boolean
  indices: { blockIndex: number; groupIndex: number }
  onPointerDown?: (
    blockNodePosition: NodePosition,
    block: DraggableBlock
  ) => void
}) => {
  const bg = useColorModeValue('gray.50', 'gray.850')
  const previewingBorderColor = useColorModeValue('blue.400', 'blue.300')
  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const { query } = useRouter()
  const {
    setConnectingIds,
    connectingIds,
    setFocusedGroupId,
    isReadOnly,
    previewingBlock,
  } = useGraph()
  const { mouseOverBlock, setMouseOverBlock } = useBlockDnd()
  const [isPopoverOpened, setIsPopoverOpened] = useState(false)

  const { typebot, updateBlock } = useTypebot()
  const [isEditing, setIsEditing] = useState<boolean>(
    isTextBubbleBlock(block) && block.content.plainText === ''
  )
  const blockRef = useRef<HTMLDivElement | null>(null)

  const isConnecting =
    connectingIds?.target?.groupId === block.groupId &&
    connectingIds?.target?.blockId === block.id

  const isPreviewing = isConnecting || previewingBlock?.id === block.id

  const onDrag = (position: NodePosition) => {
    if (block.type === 'start' || !onPointerDown) return
    onPointerDown(position, block)
  }

  useDragDistance({
    ref: blockRef,
    onDrag,
    isDisabled: !onPointerDown || block.type === 'start',
  })

  const closeSettingsPopover = () => {
    if (isPopoverOpened) setIsPopoverOpened(false)
    if (isEditing) setIsEditing(false)
  }

  useOutsideClick({
    ref: blockRef,
    handler: closeSettingsPopover,
  })

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure()

  useEffect(() => {
    if (query.blockId?.toString() === block.id && !isPopoverOpened)
      setIsPopoverOpened(true)
  }, [block.id, isPopoverOpened, query])

  const handleMouseEnter = () => {
    if (isReadOnly) return
    if (mouseOverBlock?.id !== block.id && blockRef.current)
      setMouseOverBlock({ id: block.id, element: blockRef.current })
    if (connectingIds)
      setConnectingIds({
        ...connectingIds,
        target: { groupId: block.groupId, blockId: block.id },
      })
  }

  const handleMouseLeave = () => {
    if (mouseOverBlock) setMouseOverBlock(undefined)
    if (connectingIds?.target)
      setConnectingIds({
        ...connectingIds,
        target: { ...connectingIds.target, blockId: undefined },
      })
  }

  const updateBubbleTextContent = (content: TextBubbleContent) => {
    const updatedBlock = { ...block, content } as Block
    updateBlock(indices, updatedBlock)
  }

  const handleClick = (e: React.MouseEvent) => {
    setFocusedGroupId(block.groupId)
    e.stopPropagation()
    if (isTextBubbleBlock(block) && !isEditing) setIsEditing(true)
    else setIsPopoverOpened(true)
  }

  const openSettingsModal = () => {
    setIsPopoverOpened(false)
    onModalOpen()
  }

  const handleBlockUpdate = (updates: Partial<Block>) =>
    updateBlock(indices, { ...block, ...updates })

  const updateBubbleBlockContent = (content: BubbleBlockContent) =>
    updateBlock(indices, { ...block, content } as BubbleBlock)

  const hasIcomingEdge = typebot?.edges.some((edge) => {
    return edge.to.blockId === block.id
  })

  return (
    <Flex
      pos="relative"
      ref={blockRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-testid={`block`}
      className="prevent-group-drag"
    >
      {isEditing && isTextBubbleBlock(block) ? (
        <TextBubbleEditor
          id={block.id}
          initialValue={block.content.richText}
          onChange={updateBubbleTextContent}
        />
      ) : (
        <ContextMenu<HTMLDivElement>
          renderMenu={() => <BlockNodeContextMenu indices={indices} />}
        >
          {(ref, isContextMenuOpened) => (
            <Popover
              placement="left"
              isLazy
              isOpen={isPopoverOpened}
              closeOnBlur={false}
            >
              <PopoverTrigger>
                <HStack
                  ref={ref}
                  flex="1"
                  userSelect="none"
                  p="3"
                  borderWidth={
                    isContextMenuOpened || isPreviewing ? '2px' : '1px'
                  }
                  borderColor={
                    isContextMenuOpened || isPreviewing
                      ? previewingBorderColor
                      : borderColor
                  }
                  margin={isContextMenuOpened || isPreviewing ? '-1px' : 0}
                  rounded="lg"
                  cursor={'pointer'}
                  bg={bg}
                  align="flex-start"
                  w="full"
                  transition="border-color 0.2s"
                >
                  <BlockIcon
                    type={block.type}
                    mt="1"
                    data-testid={`${block.id}-icon`}
                  />
                  <BlockNodeContent block={block} indices={indices} />
                  {(hasIcomingEdge || isDefined(connectingIds)) && (
                    <TargetEndpoint
                      pos="absolute"
                      left="-34px"
                      top="16px"
                      blockId={block.id}
                      groupId={block.groupId}
                    />
                  )}
                  {isConnectable && hasDefaultConnector(block) && (
                    <SourceEndpoint
                      source={{
                        groupId: block.groupId,
                        blockId: block.id,
                      }}
                      pos="absolute"
                      right="-34px"
                      bottom="10px"
                    />
                  )}
                </HStack>
              </PopoverTrigger>
              {hasSettingsPopover(block) && (
                <Portal>
                  <SettingsPopoverContent
                    block={block}
                    onExpandClick={openSettingsModal}
                    onBlockChange={handleBlockUpdate}
                  />
                  <ParentModalProvider>
                    <SettingsModal isOpen={isModalOpen} onClose={onModalClose}>
                      <BlockSettings
                        block={block}
                        onBlockChange={handleBlockUpdate}
                      />
                    </SettingsModal>
                  </ParentModalProvider>
                </Portal>
              )}
              {typebot && isMediaBubbleBlock(block) && (
                <MediaBubblePopoverContent
                  typebotId={typebot.id}
                  block={block}
                  onContentChange={updateBubbleBlockContent}
                />
              )}
            </Popover>
          )}
        </ContextMenu>
      )}
    </Flex>
  )
}

const hasSettingsPopover = (block: Block): block is BlockWithOptions =>
  !isBubbleBlock(block) && block.type !== LogicBlockType.CONDITION

const isMediaBubbleBlock = (
  block: Block
): block is Exclude<BubbleBlock, TextBubbleBlock> =>
  isBubbleBlock(block) && !isTextBubbleBlock(block)
