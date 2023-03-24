import { Flex, useColorModeValue } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { ChoiceInputBlock, Item, ItemIndices } from '@typebot.io/schemas'
import React, { useRef, useState } from 'react'
import { SourceEndpoint } from '../../endpoints/SourceEndpoint'
import { ItemNodeContent } from './ItemNodeContent'
import { ItemNodeContextMenu } from './ItemNodeContextMenu'
import { ContextMenu } from '@/components/ContextMenu'
import { isDefined } from '@typebot.io/lib'
import { Coordinates } from '@/features/graph/types'
import {
  NodePosition,
  useDragDistance,
} from '@/features/graph/providers/GraphDndProvider'
import { useOutsideClick } from '@/hooks/useOutsideClick'

type Props = {
  item: Item
  indices: ItemIndices
  onPointerDown?: (
    blockNodePosition: { absolute: Coordinates; relative: Coordinates },
    item: Item
  ) => void
  connectionDisabled?: boolean
}

export const ItemNode = ({
  item,
  indices,
  onPointerDown,
  connectionDisabled,
}: Props) => {
  const previewingBorderColor = useColorModeValue('blue.400', 'blue.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bg = useColorModeValue('white', undefined)
  const { typebot } = useTypebot()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const itemRef = useRef<HTMLDivElement | null>(null)
  const isConnectable =
    isDefined(typebot) &&
    !connectionDisabled &&
    !(
      typebot.groups[indices.groupIndex].blocks[indices.blockIndex] as
        | ChoiceInputBlock
        | undefined
    )?.options?.isMultipleChoice
  const onDrag = (position: NodePosition) => {
    if (!onPointerDown) return
    onPointerDown(position, item)
  }
  useDragDistance({
    ref: itemRef,
    onDrag,
    isDisabled: !onPointerDown,
  })
  const [isPopoverOpened, setIsPopoverOpened] = useState(false)

  useOutsideClick({
    ref: itemRef,
    handler: () => setIsPopoverOpened(false),
  })

  const handleMouseEnter = () => setIsMouseOver(true)
  const handleMouseLeave = () => setIsMouseOver(false)

  return (
    <Flex ref={itemRef} w="full">
      <ContextMenu<HTMLDivElement>
        renderMenu={() => <ItemNodeContextMenu indices={indices} />}
      >
        {(ref, isContextMenuOpened) => (
          <Flex data-testid="item" pos="relative" ref={ref} w="full">
            <Flex
              align="center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              shadow="sm"
              _hover={{ shadow: 'md' }}
              transition="box-shadow 200ms, border-color 200ms"
              rounded="md"
              bg={bg}
              borderWidth={isContextMenuOpened ? '2px' : '1px'}
              borderColor={
                isContextMenuOpened ? previewingBorderColor : borderColor
              }
              margin={isContextMenuOpened ? '-1px' : 0}
              w="full"
            >
              <ItemNodeContent
                item={item}
                isMouseOver={isMouseOver}
                indices={indices}
                isPopoverOpened={isPopoverOpened}
                onClick={() => setIsPopoverOpened(true)}
              />
              {typebot && isConnectable && (
                <SourceEndpoint
                  source={{
                    groupId: typebot.groups[indices.groupIndex].id,
                    blockId: item.blockId,
                    itemId: item.id,
                  }}
                  pos="absolute"
                  right="-49px"
                  pointerEvents="all"
                />
              )}
            </Flex>
          </Flex>
        )}
      </ContextMenu>
    </Flex>
  )
}
