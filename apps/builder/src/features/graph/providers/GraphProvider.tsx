import { Coordinates } from '@dnd-kit/utilities'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'
import { graphPositionDefaultValue } from '../constants'
import { ConnectingIds } from '../types'

type Position = Coordinates & { scale: number }

type PreviewingBlock = {
  id: string
  groupId: string
}

const graphContext = createContext<{
  graphPosition: Position
  setGraphPosition: Dispatch<SetStateAction<Position>>
  connectingIds: ConnectingIds | null
  setConnectingIds: Dispatch<SetStateAction<ConnectingIds | null>>
  previewingBlock?: PreviewingBlock
  setPreviewingBlock: Dispatch<SetStateAction<PreviewingBlock | undefined>>
  isReadOnly: boolean
  focusedGroupId?: string
  setFocusedGroupId: Dispatch<SetStateAction<string | undefined>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({
  graphPosition: graphPositionDefaultValue({ x: 0, y: 0 }),
  connectingIds: null,
})

export const GraphProvider = ({
  children,
  isReadOnly = false,
}: {
  children: ReactNode
  isReadOnly?: boolean
}) => {
  const [graphPosition, setGraphPosition] = useState(
    graphPositionDefaultValue({ x: 0, y: 0 })
  )
  const [connectingIds, setConnectingIds] = useState<ConnectingIds | null>(null)
  const [previewingBlock, setPreviewingBlock] = useState<PreviewingBlock>()
  const [focusedGroupId, setFocusedGroupId] = useState<string>()

  return (
    <graphContext.Provider
      value={{
        graphPosition,
        setGraphPosition,
        connectingIds,
        setConnectingIds,
        isReadOnly,
        focusedGroupId,
        setFocusedGroupId,
        setPreviewingBlock,
        previewingBlock,
      }}
    >
      {children}
    </graphContext.Provider>
  )
}

export const useGraph = () => useContext(graphContext)
