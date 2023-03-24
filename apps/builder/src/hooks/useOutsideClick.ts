import { RefObject, useEffect } from 'react'

type Handler = (event: MouseEvent) => void

type Props<T> = {
  ref: RefObject<T>
  handler: Handler
  capture?: boolean
}

export const useOutsideClick = <T extends HTMLElement = HTMLElement>({
  ref,
  handler,
  capture,
}: Props<T>): void => {
  useEffect(() => {
    const triggerHandlerIfOutside = (event: MouseEvent) => {
      const el = ref?.current
      if (!el || el.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener('pointerdown', triggerHandlerIfOutside, {
      capture,
    })

    return () => {
      document.removeEventListener('pointerdown', triggerHandlerIfOutside, {
        capture,
      })
    }
  })
}
