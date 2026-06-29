import { useEffect, useState } from 'react'
import { translateToSpanish, translateLinesToSpanish } from '../services/translate'

// Traduce un texto EN -> ES. Muestra el original mientras llega la traducción.
export function useSpanish(text) {
  const [value, setValue] = useState(text)
  useEffect(() => {
    let alive = true
    setValue(text)
    if (text) {
      translateToSpanish(text).then((t) => {
        if (alive) setValue(t)
      })
    }
    return () => {
      alive = false
    }
  }, [text])
  return value
}

// Traduce una lista de líneas EN -> ES (instrucciones).
export function useSpanishLines(lines) {
  const [value, setValue] = useState(lines)
  const dep = JSON.stringify(lines)
  useEffect(() => {
    let alive = true
    setValue(lines)
    if (lines && lines.length) {
      translateLinesToSpanish(lines).then((t) => {
        if (alive) setValue(t)
      })
    }
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep])
  return value
}
