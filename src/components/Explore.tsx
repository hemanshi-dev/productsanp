import { useState, useEffect, useRef, useCallback } from 'react'
import { apiService } from '../services/api'
import { toast } from 'react-toastify'
import { gsap } from 'gsap'

interface ExplorerItem {
  id: string
  title: string
  type: string
  url: string
  created_at: string
}

const Explore = () => {
  const [items, setItems] = useState<ExplorerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ExplorerItem | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)
  const cursorRef = useRef<string | null>(null)
  const hasMoreRef = useRef(true)

  const sectionRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorFollowRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedItem])

  // Update refs when state changes
  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  // Canvas dot-grid background logic
  useEffect(() => {
    const section = sectionRef.current
    const cursorFollow = cursorFollowRef.current
    const dot = dotRef.current
    const canvas = canvasRef.current
    const ctxCanvas = canvas?.getContext('2d')
    if (!section || !cursorFollow || !dot || !canvas || !ctxCanvas) return

    const xSetterDot = gsap.quickSetter(dot, 'x', 'px')
    const ySetterDot = gsap.quickSetter(dot, 'y', 'px')
    const dotsGrid: {
      x: number
      y: number
      originalX: number
      originalY: number
      size: number
    }[] = []
    const spacing = 40
    const mousePos = { x: section.offsetWidth / 2, y: section.offsetHeight / 2 }
    let animationFrameId: number
    let lastTime = 0
    let lastX = mousePos.x
    let lastY = mousePos.y

    const initGrid = () => {
      dotsGrid.length = 0
      canvas.width = section.offsetWidth
      canvas.height = section.offsetHeight

      for (let x = spacing / 2; x < canvas.width; x += spacing) {
        for (let y = spacing / 2; y < canvas.height; y += spacing) {
          dotsGrid.push({ x, y, originalX: x, originalY: y, size: 0.8 })
        }
      }
    }

    const render = (time: number) => {
      ctxCanvas.clearRect(0, 0, canvas.width, canvas.height)

      const deltaTime = time - lastTime
      lastTime = time
      const dxMouse = mousePos.x - lastX
      const dyMouse = mousePos.y - lastY
      const velocity = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse) / (deltaTime || 1)
      lastX = mousePos.x
      lastY = mousePos.y

      dotsGrid.forEach((gridDot, i) => {
        const dx = mousePos.x - gridDot.x
        const dy = mousePos.y - gridDot.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = 200
        const pulse = Math.sin(time * 0.002 + i * 0.1) * 0.5 + 0.5

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist
          gridDot.x = gridDot.originalX - dx * force * 0.15
          gridDot.y = gridDot.originalY - dy * force * 0.15
          ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.1 + force * 0.5})`
          ctxCanvas.beginPath()
          ctxCanvas.arc(gridDot.x, gridDot.y, gridDot.size + force * 2, 0, Math.PI * 2)
          ctxCanvas.fill()
        } else {
          gridDot.x += (gridDot.originalX - gridDot.x) * 0.1
          gridDot.y += (gridDot.originalY - gridDot.y) * 0.1
          ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.05 + pulse * 0.1})`
          ctxCanvas.beginPath()
          ctxCanvas.arc(gridDot.x, gridDot.y, gridDot.size + pulse * 0.5, 0, Math.PI * 2)
          ctxCanvas.fill()
        }
      })

      const stretch = Math.min(1 + velocity * 0.1, 1.8)
      const rotation = (Math.atan2(dyMouse, dxMouse) * 180) / Math.PI
      gsap.set(dot, {
        scaleX: stretch,
        scaleY: 1 / Math.sqrt(stretch),
        rotation: velocity > 0.5 ? rotation : 0,
        transformOrigin: 'center center',
      })

      animationFrameId = requestAnimationFrame(render)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mousePos.x = x
      mousePos.y = y

      gsap.to(cursorFollow, { x, y, duration: 0.6, ease: 'power3.out' })
      xSetterDot(x)
      ySetterDot(y)
    }

    initGrid()
    gsap.set(cursorFollow, { x: mousePos.x, y: mousePos.y })
    gsap.set(dot, { x: mousePos.x, y: mousePos.y })
    animationFrameId = requestAnimationFrame(render)

    window.addEventListener('resize', initGrid)
    section.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', initGrid)
      section.removeEventListener('mousemove', handleMouseMove)
    }
  }, [loading])

  // Fetch items
  const fetchItems = useCallback(async (isLoadMore: boolean = false) => {
    if (isFetchingRef.current) {
      console.log('Already fetching, skipping...')
      return
    }
    
    if (isLoadMore && !hasMoreRef.current) {
      console.log('No more items to load')
      return
    }

    console.log('Fetching items...', { isLoadMore, cursor: cursorRef.current, hasMore: hasMoreRef.current })

    if (isLoadMore) {
      // Don't show loading spinner for load more
    } else {
      setLoading(true)
    }

    isFetchingRef.current = true

    try {
      const response = await apiService.getExplorer(100, cursorRef.current || undefined)
      console.log('API response:', response)
      
      if (response.status && response.data) {
        if (isLoadMore) {
          // Append new items to existing ones
          setItems(prev => {
            const newItems = response.data!.items
            // Filter out duplicates in case of race conditions
            const existingIds = new Set(prev.map(item => item.id))
            const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id))
            return [...prev, ...uniqueNewItems]
          })
        } else {
          setItems(response.data.items)
        }
        const nextCursor = response.data.pagination.next_cursor || null
        const nextHasMore = response.data.pagination.has_more || false
        setCursor(nextCursor)
        setHasMore(nextHasMore)
        cursorRef.current = nextCursor
        hasMoreRef.current = nextHasMore
      } else {
        toast.error(response.message || 'Failed to load items')
      }
    } catch (error: any) {
      console.error('Error fetching explorer items:', error)
      toast.error(error.message || 'Failed to load items')
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    let observer: IntersectionObserver | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    // Wait for next tick to ensure DOM is updated
    timeoutId = setTimeout(() => {
      const currentTarget = observerTarget.current
      if (!currentTarget) {
        console.log('Observer target not found')
        return
      }

      if (!hasMoreRef.current) {
        console.log('No more items, observer not needed')
        return
      }

      console.log('Setting up intersection observer')

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          console.log('Intersection observer callback:', {
            isIntersecting: entry.isIntersecting,
            hasMore: hasMoreRef.current,
            isFetching: isFetchingRef.current,
            intersectionRatio: entry.intersectionRatio
          })
          
          if (entry.isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
            console.log('Triggering fetchItems for load more...')
            fetchItems(true)
          }
        },
        { 
          threshold: 0.1,
          rootMargin: '100px' // Start loading before reaching the bottom
        }
      )

      observer.observe(currentTarget)
      console.log('Observer attached to target')
    }, 100)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (observer) {
        console.log('Cleaning up observer')
        observer.disconnect()
      }
    }
  }, [hasMore, fetchItems, items.length])

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen md:pt-[180px] pt-32 pb-20 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#00FFFF]/30"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[#00FFFF] absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading explore items...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={sectionRef} className="relative overflow-hidden min-h-screen md:pt-[180px] pt-32 pb-20 bg-black text-white">
      {/* Dynamic Background elements */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ mixBlendMode: 'screen' }}
      />
      <div
        ref={cursorFollowRef}
        className="pointer-events-none absolute z-50 hidden h-20 w-20 -ml-10 -mt-10 rounded-full border border-[#00FFFF]/20 bg-white/5"
        style={{ backdropFilter: 'blur(4px)' }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none absolute z-50 hidden h-1.5 w-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
      />

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-2.5 h-2.5 rounded-full border border-[#00FFFF]"></div>
            <span className="font-geist-reference text-xs font-semibold uppercase tracking-[0.32em] text-[#00FFFF]">
              Explore
            </span>
          </div>
          <h1 className="font-clash-display text-5xl md:text-7xl font-bold mb-2 leading-tight tracking-[-1px]">
            Discover <span className="text-[#00FFFF]">Creative</span> Works
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-geist-reference">
            Browse through amazing AI generated images and videos
          </p>
        </div>

        {/* Masonry Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#00FFFF] text-black flex items-center justify-center">
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">No Items Yet</h3>
            <p className="text-white/60">Check back later for new content</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative break-inside-avoid mb-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(0, 255, 255, 0.15)',
                }}
              >
                {/* Glow Effect */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 blur-2xl -z-10 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%)',
                  }}
                />

                {item.type === 'video' ? (
                  <div className="relative w-full">
                    <video
                      src={item.url}
                      autoPlay
                      muted
                      loop
                      className="w-full h-auto object-cover rounded-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement
                        target.style.display = 'none'
                      }}
                      onLoadStart={() => {
                        // Video started loading
                      }}
                    />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-auto object-cover rounded-2xl"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                )}

                {/* Overlay with title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold font-geist-reference">{item.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && items.length > 0 && (
          <div 
            ref={observerTarget} 
            className="h-20 flex items-center justify-center py-8"
            style={{ minHeight: '80px' }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00FFFF]/30 border-t-[#00FFFF]"></div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setSelectedItem(null)}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-auto max-w-[95vw] max-h-[90vh] rounded-4xl border overflow-hidden bg-zinc-950 my-4"
            style={{
              borderColor: 'rgba(0, 255, 255, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black border border-[#00FFFF]/30 hover:border-[#00FFFF] hover:bg-black transition-all text-[#00FFFF] flex items-center justify-center backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-4 text-white font-geist-reference">{selectedItem.title}</h2>
              
              <div className="flex items-center justify-center rounded-2xl">
                {selectedItem.type === 'video' ? (
                  <video
                    src={selectedItem.url}
                    className="h-[80vh] w-auto rounded-lg object-contain"
                    controls={false}
                    autoPlay
                    loop
                  />
                ) : (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="h-[80vh] w-auto rounded-lg object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Explore
