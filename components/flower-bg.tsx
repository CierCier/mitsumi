'use client'

import { useEffect, useState } from 'react'

interface Flower {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  hue: number
  sat: number
  light: number
  opacity: number
  isPetal: boolean
  initialRotation: number
}

const HUES = [
  { h: 14, s: 62, l: 55 },
  { h: 345, s: 70, l: 60 },
  { h: 25, s: 75, l: 55 },
  { h: 42, s: 75, l: 55 },
  { h: 335, s: 65, l: 58 },
  { h: 10, s: 60, l: 50 },
  { h: 50, s: 70, l: 50 },
  { h: 0, s: 65, l: 50 },
]

export function FlowerBackground() {
  const [flowers, setFlowers] = useState<Flower[]>([])

  useEffect(() => {
    const items: Flower[] = []
    for (let i = 0; i < 22; i++) {
      const c = HUES[Math.floor(Math.random() * HUES.length)]
      items.push({
        id: i,
        x: Math.random() * 100,
        size: 10 + Math.random() * 14,
        duration: 14 + Math.random() * 16,
        delay: Math.random() * 25,
        hue: c.h + Math.random() * 6 - 3,
        sat: c.s + Math.random() * 10 - 5,
        light: c.l + Math.random() * 8 - 4,
        opacity: 0.35 + Math.random() * 0.3,
        isPetal: Math.random() > 0.5, // 50% petals, 50% full flowers
        initialRotation: Math.random() * 360,
      })
    }
    setFlowers(items)
  }, [])

  if (flowers.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {flowers.map(f => (
        <div
          key={f.id}
          className="absolute"
          style={{
            left: `${f.x}%`,
            top: '-48px',
            width: `${f.size}px`,
            height: `${f.size}px`,
            color: `hsl(${f.hue}, ${f.sat}%, ${f.light}%)`,
            opacity: f.opacity,
            animation: `flower-fall ${f.duration}s linear ${f.delay}s infinite`,
            willChange: 'transform',
          }}
        >
          <svg
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            style={{ transform: `rotate(${f.initialRotation}deg)` }}
          >
            {f.isPetal ? (
              <path
                d="M10 18C6 15 3 11 3 8C3 4.5 6.5 2 8.5 2C9.2 2 9.7 3.2 10 4C10.3 3.2 10.8 2 11.5 2C13.5 2 17 4.5 17 8C17 11 14 15 10 18Z"
                fill="currentColor"
              />
            ) : (
              <g fill="currentColor">
                <path d="M10 10C8.5 8.5 7.5 6.5 7.5 5C7.5 3.5 9 2 9.5 2C9.7 2 9.9 2.6 10 3C10.1 2.6 10.3 2 10.5 2C11 2 12.5 3.5 12.5 5C12.5 6.5 11.5 8.5 10 10Z" />
                <path d="M10 10C8.5 8.5 7.5 6.5 7.5 5C7.5 3.5 9 2 9.5 2C9.7 2 9.9 2.6 10 3C10.1 2.6 10.3 2 10.5 2C11 2 12.5 3.5 12.5 5C12.5 6.5 11.5 8.5 10 10Z" transform="rotate(72 10 10)" />
                <path d="M10 10C8.5 8.5 7.5 6.5 7.5 5C7.5 3.5 9 2 9.5 2C9.7 2 9.9 2.6 10 3C10.1 2.6 10.3 2 10.5 2C11 2 12.5 3.5 12.5 5C12.5 6.5 11.5 8.5 10 10Z" transform="rotate(144 10 10)" />
                <path d="M10 10C8.5 8.5 7.5 6.5 7.5 5C7.5 3.5 9 2 9.5 2C9.7 2 9.9 2.6 10 3C10.1 2.6 10.3 2 10.5 2C11 2 12.5 3.5 12.5 5C12.5 6.5 11.5 8.5 10 10Z" transform="rotate(216 10 10)" />
                <path d="M10 10C8.5 8.5 7.5 6.5 7.5 5C7.5 3.5 9 2 9.5 2C9.7 2 9.9 2.6 10 3C10.1 2.6 10.3 2 10.5 2C11 2 12.5 3.5 12.5 5C12.5 6.5 11.5 8.5 10 10Z" transform="rotate(288 10 10)" />
                <circle cx="10" cy="10" r="1.2" fill="white" opacity="0.3" />
              </g>
            )}
          </svg>
        </div>
      ))}
    </div>
  )
}
