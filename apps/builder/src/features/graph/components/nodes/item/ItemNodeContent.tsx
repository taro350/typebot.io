import { ButtonsItemNode } from '@/features/blocks/inputs/buttons/components/ButtonsItemNode'
import { ConditionItemNode } from '@/features/blocks/logic/condition/components/ConditionItemNode'
import { Item, ItemIndices, ItemType } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  item: Item
  indices: ItemIndices
  isMouseOver: boolean
  isPopoverOpened: boolean
  onClick: () => void
}

export const ItemNodeContent = ({
  item,
  indices,
  isMouseOver,
  isPopoverOpened,
  onClick,
}: Props) => {
  switch (item.type) {
    case ItemType.BUTTON:
      return (
        <ButtonsItemNode
          key={`${item.id}-${item.content}`}
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
    case ItemType.CONDITION:
      return (
        <ConditionItemNode
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
          isPopoverOpened={isPopoverOpened}
          onClick={onClick}
        />
      )
  }
}
