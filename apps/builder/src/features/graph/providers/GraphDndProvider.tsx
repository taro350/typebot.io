import { DraggableBlock, DraggableBlockType, Item } from '@typebot.io/schemas'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Coordinates } from '../types'

type NodeElement = {
  id: string
  element: HTMLDivElement
}

const graphDndContext = createContext<{
  draggedBlockType?: DraggableBlockType
  setDraggedBlockType: Dispatch<SetStateAction<DraggableBlockType | undefined>>
  draggedBlock?: DraggableBlock
  setDraggedBlock: Dispatch<SetStateAction<DraggableBlock | undefined>>
  draggedItem?: Item
  setDraggedItem: Dispatch<SetStateAction<Item | undefined>>
  mouseOverGroup?: NodeElement
  setMouseOverGroup: (node: NodeElement | undefined) => void
  mouseOverBlock?: NodeElement
  setMouseOverBlock: (node: NodeElement | undefined) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export type NodePosition = { absolute: Coordinates; relative: Coordinates }

export const GraphDndProvider = ({ children }: { children: ReactNode }) => {
  const [draggedBlock, setDraggedBlock] = useState<DraggableBlock>()
  const [draggedBlockType, setDraggedBlockType] = useState<
    DraggableBlockType | undefined
  >()
  const [draggedItem, setDraggedItem] = useState<Item | undefined>()
  const [mouseOverGroup, _setMouseOverGroup] = useState<NodeElement>()
  const [mouseOverBlock, _setMouseOverBlock] = useState<NodeElement>()

  const setMouseOverGroup = useCallback(
    (node: NodeElement | undefined) => {
      if (node && !draggedBlock && !draggedBlockType) return
      _setMouseOverGroup(node)
    },
    [draggedBlock, draggedBlockType]
  )

  const setMouseOverBlock = useCallback(
    (node: NodeElement | undefined) => {
      if (node && !draggedItem) return
      _setMouseOverBlock(node)
    },
    [draggedItem]
  )

  return (
    <graphDndContext.Provider
      value={{
        draggedBlock,
        setDraggedBlock,
        draggedBlockType,
        setDraggedBlockType,
        draggedItem,
        setDraggedItem,
        mouseOverGroup,
        setMouseOverGroup,
        mouseOverBlock,
        setMouseOverBlock,
      }}
    >
      {children}
    </graphDndContext.Provider>
  )
}

export const useDragDistance = ({
  ref,
  onDrag,
  distanceTolerance = 20,
  isDisabled = false,
}: {
  ref: React.MutableRefObject<HTMLDivElement | null>
  onDrag: (position: { absolute: Coordinates; relative: Coordinates }) => void
  distanceTolerance?: number
  isDisabled: boolean
}) => {
  const mouseDownPosition = useRef<{
    absolute: Coordinates
    relative: Coordinates
  }>()

  useEffect(() => {
    const resetMousePosition = () => {
      if (mouseDownPosition) mouseDownPosition.current = undefined
    }

    const currentRef = ref.current
    currentRef?.addEventListener('pointerup', resetMousePosition)
    return () => {
      currentRef?.removeEventListener('pointerup', resetMousePosition)
    }
  }, [ref])

  useEffect(() => {
    const getInitialCoordinates = (e: MouseEvent) => {
      if (isDisabled || !ref.current) return
      const { top, left } = ref.current.getBoundingClientRect()
      mouseDownPosition.current = {
        absolute: { x: e.clientX, y: e.clientY },
        relative: {
          x: e.clientX - left,
          y: e.clientY - top,
        },
      }
    }

    const currentRef = ref.current
    currentRef?.addEventListener('pointerdown', getInitialCoordinates)
    return () => {
      currentRef?.removeEventListener('pointerdown', getInitialCoordinates)
    }
  }, [isDisabled, ref])

  useEffect(() => {
    let triggered = false
    const triggerDragCallbackIfMouseMovedEnough = (e: MouseEvent) => {
      if (!mouseDownPosition.current || triggered) return
      const { clientX, clientY } = e
      if (
        Math.abs(mouseDownPosition.current.absolute.x - clientX) >
          distanceTolerance ||
        Math.abs(mouseDownPosition.current.absolute.y - clientY) >
          distanceTolerance
      ) {
        triggered = true
        onDrag(mouseDownPosition.current)
      }
    }

    document.addEventListener(
      'pointermove',
      triggerDragCallbackIfMouseMovedEnough
    )

    return () => {
      document.removeEventListener(
        'pointermove',
        triggerDragCallbackIfMouseMovedEnough
      )
    }
  }, [distanceTolerance, onDrag])
}

export const computeNearestPlaceholderIndex = (
  offsetY: number,
  placeholderRefs: React.MutableRefObject<HTMLDivElement[]>
) => {
  const { closestIndex } = placeholderRefs.current.reduce(
    (prev, elem, index) => {
      const elementTop = elem.getBoundingClientRect().top
      const mouseDistanceFromPlaceholder = Math.abs(offsetY - elementTop)
      return mouseDistanceFromPlaceholder < prev.value
        ? { closestIndex: index, value: mouseDistanceFromPlaceholder }
        : prev
    },
    { closestIndex: 0, value: 999999999999 }
  )
  return closestIndex
}

export const useBlockDnd = () => useContext(graphDndContext)
