import { useRef, useEffect } from "react"

// from https://codesandbox.io/s/requestanimationframe-with-hooks-0kzh3?from-embed
const useAnimationFrame = (callback) => {
    const requestRef = useRef()
    const previousTimeRef = useRef()
    useEffect(() => {
        const animate = time => {
            if (previousTimeRef.current !== undefined) {
                const deltaMs = time - previousTimeRef.current
                callback(deltaMs)
            }
            previousTimeRef.current = time
            requestRef.current = requestAnimationFrame(animate)
        }
        requestRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(requestRef.current)
    }, [])
  }

  export default useAnimationFrame