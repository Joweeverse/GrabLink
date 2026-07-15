import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity,
  ChefHat,
  Clock3,
  CookingPot,
  Plus,
  Send,
  Trash2,
  TrendingUp,
  Users,
  X,
  Lock,
  MapPin,
  RefreshCw,
  Terminal,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Sliders,
  DollarSign
} from 'lucide-react'
import './index.css'

// Initial Order Data representing G1246, G1245, G1247, G1249
const initialOrders = [
  { id: 'G1246', dish: 'Chicken Rice (2 Sets)', items: 2, stage: 'Cooking', progress: 62, manualEstimate: 25, aiBaseTime: 16 },
  { id: 'G1245', dish: 'Laksa Premium Set', items: 3, stage: 'Cooking', progress: 44, manualEstimate: 30, aiBaseTime: 22 },
  { id: 'G1247', dish: 'Chai Tow Kway (S)', items: 1, stage: 'Queued', progress: 18, manualEstimate: 15, aiBaseTime: 12 },
  { id: 'G1249', dish: 'Nasi Goreng Special', items: 2, stage: 'Queued', progress: 8, manualEstimate: 20, aiBaseTime: 15 }
]

// Base locations config to simulate different merchant outlets with localized baseline metrics
const locationsConfig = {
  "McDonald's - Orchard Road": {
    baseLoad: 82,
    baseConfidence: 94,
    baseSavedTime: 13,
    initialOrders: [
      { id: 'G1246', dish: 'Chicken Rice (2 Sets)', items: 2, stage: 'Cooking', progress: 62, manualEstimate: 25, aiBaseTime: 16 },
      { id: 'G1245', dish: 'Laksa Premium Set', items: 3, stage: 'Cooking', progress: 44, manualEstimate: 30, aiBaseTime: 22 },
      { id: 'G1247', dish: 'Chai Tow Kway (S)', items: 1, stage: 'Queued', progress: 18, manualEstimate: 15, aiBaseTime: 12 },
      { id: 'G1249', dish: 'Nasi Goreng Special', items: 2, stage: 'Queued', progress: 8, manualEstimate: 20, aiBaseTime: 15 }
    ]
  },
  "KFC - Bandung Junction": {
    baseLoad: 68,
    baseConfidence: 91,
    baseSavedTime: 9,
    initialOrders: [
      { id: 'G1301', dish: 'Crispy Chicken Combo', items: 4, stage: 'Cooking', progress: 75, manualEstimate: 22, aiBaseTime: 14 },
      { id: 'G1302', dish: 'Zinger Burger Meal', items: 2, stage: 'Cooking', progress: 50, manualEstimate: 18, aiBaseTime: 11 },
      { id: 'G1303', dish: 'Whipped Potato Lrg', items: 1, stage: 'Queued', progress: 10, manualEstimate: 10, aiBaseTime: 7 }
    ]
  },
  "GrabKitchen - Central Hub": {
    baseLoad: 91,
    baseConfidence: 96,
    baseSavedTime: 21,
    initialOrders: [
      { id: 'G1420', dish: 'Sate Ayam 10pcs', items: 1, stage: 'Cooking', progress: 85, manualEstimate: 20, aiBaseTime: 12 },
      { id: 'G1421', dish: 'Martabak Manis Cokelat', items: 1, stage: 'Cooking', progress: 58, manualEstimate: 24, aiBaseTime: 18 },
      { id: 'G1422', dish: 'Beef Rendang Plate', items: 2, stage: 'Queued', progress: 25, manualEstimate: 28, aiBaseTime: 20 },
      { id: 'G1423', dish: 'Es Cendol Durian', items: 3, stage: 'Queued', progress: 12, manualEstimate: 12, aiBaseTime: 8 },
      { id: 'G1424', dish: 'Ayam Penyet Sambal Ijo', items: 2, stage: 'Queued', progress: 5, manualEstimate: 18, aiBaseTime: 13 }
    ]
  }
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState("McDonald's - Orchard Road")
  const [orders, setOrders] = useState(locationsConfig["McDonald's - Orchard Road"].initialOrders)
  const [speed, setSpeed] = useState(2) // 1: Slow, 2: Normal, 3: Fast
  const [countdown, setCountdown] = useState(336) // 5 minutes 36 seconds (336s)
  const [isDispatched, setIsDispatched] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [riderSavedMinutes, setRiderSavedMinutes] = useState(locationsConfig["McDonald's - Orchard Road"].baseSavedTime)
  const [logs, setLogs] = useState([])
  const [newOrderForm, setNewOrderForm] = useState({ dish: '', prep: 12, items: 1 })

  // Refs to avoid setInterval closure problems
  const countdownRef = useRef(countdown)
  const speedRef = useRef(speed)
  const terminalEndRef = useRef(null)

  useEffect(() => {
    countdownRef.current = countdown
  }, [countdown])

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  const [currentTime, setCurrentTime] = useState(new Date())

  // Update real-time clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Helper: Get formatted current time
  const getFormattedTime = () => {
      return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:
  '2-digit', hour12: false })
      }
     
  // Helper to add timestamped logs with proper state alignment
  const addLog = (message) => {
    const timeStr = getFormattedTime()
    setLogs(prev => [...prev, `[${timeStr}] ${message}`])
  }

  // Initial Logs setup
  useEffect(() => {
    const timeStr = getFormattedTime()
    setLogs([
      `[${timeStr}] SYSTEM: Initialize Grab Sense Operations Command Center v4.12-Prod.`,
      `[${timeStr}] CV ANALYTICS: Connected overhead camera feed CAM-01 (1080p, 30fps).`,
      `[${timeStr}] AI MODEL: Active continuous readiness scoring calculation completed.`,
      `[${timeStr}] API PUSH: Updated dispatch recommendation sent to Grab Engine.`
    ])
  }, [])

  // 2. Countdown Timer ticking every second + Dynamic Kitchen Order Progress updates!
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Tick countdown
      setCountdown(prev => {
        if (prev <= 1) {
          addLog("AI MODEL: Dispatch countdown cycle completed. Starting next predictive epoch.")
          setIsDispatched(false)
          return 336 // Reset
        }
        return prev - 1
      })

      // 2. Progress active cooking orders and promote queued orders
      setOrders(currentOrders => {
        if (currentOrders.length === 0) return currentOrders

        let cookingCount = currentOrders.filter(o => o.stage === 'Cooking').length

        return currentOrders.map((order) => {
          // If Cooking, increase progress
          if (order.stage === 'Cooking') {
            const currentSpeed = speedRef.current
            // Fast: 3%, Slow: 1%, Normal: 2% progress increment per second
            const increment = currentSpeed === 3 ? 3 : currentSpeed === 1 ? 1 : 2
            const nextProgress = Math.min(100, order.progress + increment)
            const isFinished = nextProgress === 100

            if (isFinished && order.progress < 100) {
              setTimeout(() => {
                addLog(`CV ANALYTICS: Order ${order.id} (${order.dish}) cooking complete. Transitioned to PLATING station.`)
              }, 0)
              return { ...order, progress: 100, stage: 'Ready' }
            }
            return { ...order, progress: nextProgress }
          }
          
          // If Queued, and cooking capacity is available (max 2 cooking concurrently), promote to Cooking!
          if (order.stage === 'Queued' && cookingCount < 2) {
            cookingCount++
            setTimeout(() => {
              addLog(`AI MODEL: Enqueued Order ${order.id} (${order.dish}) promoted to Cooking station.`)
            }, 0)
            return { ...order, stage: 'Cooking', progress: 5 }
          }

          return order
        })
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  // 3. Periodic Background System Logs to make dashboard "feel alive"
  useEffect(() => {
    const liveLogInterval = setInterval(() => {
      const liveMessages = [
        "CV ANALYTICS: Processing overhead spatial flow. 3 active cooks detected.",
        "AI MODEL: Recalculating dish preparation velocities across stations.",
        "GRAB ENGINE: Scanning driver density indices in the merchant perimeter.",
        "TELEMETRY: Synchronized cloud logistics buffer with central registry.",
        "CV ANALYTICS: Woking and grill temperature status within normal range."
      ]
      const randomMsg = liveMessages[Math.floor(Math.random() * liveMessages.length)]
      addLog(randomMsg)
    }, 12000)

    return () => clearInterval(liveLogInterval)
  }, [])

  // 4. Handle Location Switching
  const handleLocationChange = (e) => {
    const newLoc = e.target.value
    setSelectedLocation(newLoc)
    setIsRefreshing(true)
    setIsDispatched(false)

    // Log the initiation of the fetch
    const currentSimTime = getFormattedTime()
    setLogs(prev => [...prev, `[${currentSimTime}] SYSTEM: Shifting merchant outlet context to [${newLoc}]...`])

    setTimeout(() => {
      const config = locationsConfig[newLoc]
      setOrders(config.initialOrders)
      setRiderSavedMinutes(config.baseSavedTime)
      setIsRefreshing(false)

      const finalSimTime = getFormattedTime()
      setLogs(prev => [
        ...prev,
        `[${finalSimTime}] SYSTEM: Merchant context shifted successfully. CCTV stream loaded.`,
        `[${finalSimTime}] AI MODEL: Calibrated CV parameters for [${newLoc}] environment.`
      ])
    }, 4000) // 4s transition effect
  }

  // 5. Kitchen Speed Multiplier
  const speedFactor = useMemo(() => {
    if (speed === 1) return 1.25 // Slow
    if (speed === 3) return 0.75 // Fast
    return 1.00 // Normal
  }, [speed])

  const handleSpeedSliderChange = (e) => {
    const newSpeed = Number(e.target.value)
    setSpeed(newSpeed)
    const labels = { 1: "SLOW (1.25x prep scale)", 2: "NORMAL (1.0x baseline)", 3: "FAST (0.75x high speed)" }
    addLog(`USER EVENT: Kitchen processing speed adjusted to ${labels[newSpeed]}.`)
  }

// 6. Action: Schedule Rider Dispatch (Improved Flow)
  const handleScheduleDispatch = () => {
    if (orders.length === 0 || isDispatched) return
    // Find the first order that is 'Ready', 'Cooking', or the oldest enqueued order
      const orderToDispatch = orders.find(o => o.stage === 'Ready') ||  orders.find(o => o.stage === 'Cooking') || orders[0]
      const orderId = orderToDispatch.id
  
      setIsDispatched(true)
      addlog(`USER EVENT: Manual override dispatch clicked for Order ${orderId}.`)
      addLog(`GRAB ENGINE: Match sequence completed. Driver assigned to Order ${orderId}. Approaching outlet...`)

    // Change status of this specific order to 'Dispatched'
    setOrders(current =>
      current.map(o => o.id === orderId ? { ...o, stage: 'Dispatched', progress: 100 } : o)
    )

    // Wait 3.5 seconds, then finalize handoff and reset states
    setTimeout(() => {
      setOrders(current => {
        const orderItem = current.find(o => o.id === orderId)
        if (!orderItem) return current

        // Calculate and add wait time saved to the accumulator
        const currentSpeed = speedRef.current
        const activeFactor = currentSpeed === 1 ? 1.25 : currentSpeed === 3 ? 0.75 : 1.0
        const scaledAiTime = Math.max(1, Math.round(orderItem.aiBaseTime * activeFactor))
        const savings = Math.max(0, orderItem.manualEstimate - scaledAiTime)
        
        setRiderSavedMinutes(prev => prev + savings)

        // Log final handoff and savings
        setTimeout(() => {
          addLog(`SYSTEM: Order ${orderId} successfully handed off to driver. Driver departed.`)
          addLog(`AI MODEL: Prevented ${savings} minutes of driver idle time in this cycle.`)
        }, 0)

        // Remove from list
        return current.filter(o => o.id !== orderId)
      })

      // Reset dispatch state and countdown timer for the next epoch
      setIsDispatched(false)
      setCountdown(336) // Reset timer to start fresh for the next order
    }, 3500)
  }

  // 7. Action: Dismiss Order Row (X button)
  const handleDismissOrder = (id, orderItem) => {
    setOrders(current => current.filter(o => o.id !== id))

    // Calculate time saved on this order to add to our "Rider Wait Saved"
    const scaledAiTime = Math.max(1, Math.round(orderItem.aiBaseTime * speedFactor))
    const savings = Math.max(0, orderItem.manualEstimate - scaledAiTime)

    setRiderSavedMinutes(prev => prev + savings)
    addLog(`USER EVENT: Dismissed Order ${id} (${orderItem.dish}). Order finalized. AI prevented ${savings} minutes of rider waiting.`)
  }

  // 8. Action: Add New Order Form Submit
  const handleAddOrder = (e) => {
    e.preventDefault()
    if (!newOrderForm.dish.trim()) return

    const newId = `G${1250 + Math.floor(Math.random() * 200)}`
    const basePrep = Number(newOrderForm.prep)
    const itemsCount = Number(newOrderForm.items)

    // Build the new order with an inflated manual estimate representing standard manual estimation bloating
    const inflatedManualEstimate = basePrep + Math.floor(Math.random() * 6) + 4 // base prep + 4-9 minutes bloat

    const newOrderObj = {
      id: newId,
      dish: newOrderForm.dish.trim(),
      items: itemsCount,
      stage: 'Queued',
      progress: 5,
      manualEstimate: inflatedManualEstimate,
      aiBaseTime: basePrep
    }

    setOrders(prev => [...prev, newOrderObj])
    addLog(`USER EVENT: Form submitted. Enqueued Order ${newId} [${newOrderObj.dish}] with baseline prep ${basePrep} mins.`)

    // Reset form
    setNewOrderForm({ dish: '', prep: 12, items: 1 })
  }

  // Dynamic Metrics calculations based on state
  const activeOrdersCount = orders.length
  
  const kitchenLoad = useMemo(() => {
    if (activeOrdersCount === 0) return 30
    return Math.min(99, Math.max(35, 50 + activeOrdersCount * 8))
  }, [activeOrdersCount])

  const etaConfidence = useMemo(() => {
    if (kitchenLoad > 85) return 92
    if (kitchenLoad < 60) return 96
    return locationsConfig[selectedLocation].baseConfidence
  }, [kitchenLoad, selectedLocation])

  // Financial ROI (Idle Costs Avoided): Wait minutes saved * $3.50
  const financialROI = useMemo(() => {
    return (riderSavedMinutes * 3.50).toFixed(2)
  }, [riderSavedMinutes])

  // Process rows with scaled values
  const processedOrders = useMemo(() => {
    return orders.map(order => {
      const scaledAiTime = Math.max(1, Math.round(order.aiBaseTime * speedFactor))
      const delta = scaledAiTime - order.manualEstimate
      return {
        ...order,
        scaledAiTime,
        delta
      }
    })
  }, [orders, speedFactor])

  // Circular timer details
  const totalCircleSeconds = 336
  const circleProgressPct = (countdown / totalCircleSeconds) * 100
  // SVG Stroke values
  const strokeRadius = 70
  const strokeCircumference = 2 * Math.PI * strokeRadius
  const strokeDashoffset = strokeCircumference - (circleProgressPct / 100) * strokeCircumference

  // Clock display logic for countdown ring
  const displayMin = String(Math.floor(countdown / 60)).padStart(2, '0')
  const displaySec = String(countdown % 60).padStart(2, '0')

  // Generate dynamic timestamps for the CCTV overlay
  const cctvTimeStr = useMemo(() => {
    return getFormattedTime()
  }, [currentTime])

  return (
    <div className="flex min-h-screen bg-[#F6F8F5] text-[#123B2D] antialiased">
      
      {/* 1. LEFT GLOBAL SIDEBAR */}
      <aside className="fixed bottom-0 top-0 left-0 hidden w-64 border-r border-[#DFE8E2] bg-white p-6 md:block">
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Grab Sense Logo Header */}
            <div className="mb-10 flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#00B14F] font-serif text-xl font-black text-white shadow-sm">
                G
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-[#00B14F]">Grab<span className="text-[#004A26] font-semibold">Sense</span></span>
                <span className="block text-[8px] font-bold tracking-wider text-[#789087] uppercase">Enterprise Physical AI</span>
              </div>
            </div>

            {/* Navigation Section */}
            <nav className="space-y-6">
              <div>
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-[#789087] mb-3">AI Ecosystem Modules</p>
                <div className="space-y-1">
                  
                  {/* Phase 1: Active */}
                  <button className="flex w-full items-center justify-between rounded-xl bg-[#00B14F]/10 px-3 py-2.5 text-xs font-bold text-[#004A26] transition">
                    <div className="flex items-center gap-2.5">
                      <ChefHat className="h-4 w-4 text-[#00B14F]" />
                      <span>Phase 1: Restaurant Readiness</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-[#00B14F]" />
                  </button>

                  {/* Phase 2: Locked */}
                  <div className="group flex w-full cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-[#789087]/70 transition hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Lock className="h-3.5 w-3.5 text-[#789087]/50" />
                      <span>Phase 2: Parking Intelligence</span>
                    </div>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#789087]">LOCKED</span>
                  </div>

                  {/* Phase 3: Locked */}
                  <div className="group flex w-full cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-[#789087]/70 transition hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Lock className="h-3.5 w-3.5 text-[#789087]/50" />
                      <span>Phase 3: Driver Safety AI</span>
                    </div>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#789087]">LOCKED</span>
                  </div>

                  {/* Phase 4: Locked */}
                  <div className="group flex w-full cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-[#789087]/70 transition hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Lock className="h-3.5 w-3.5 text-[#789087]/50" />
                      <span>Phase 4: Smart Pickup</span>
                    </div>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#789087]">LOCKED</span>
                  </div>

                  {/* Phase 5: Locked */}
                  <div className="group flex w-full cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-[#789087]/70 transition hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Lock className="h-3.5 w-3.5 text-[#789087]/50" />
                      <span>Phase 5: Logistics AI Platform</span>
                    </div>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#789087]">LOCKED</span>
                  </div>

                </div>
              </div>
            </nav>
          </div>

          {/* System Telemetry Tag bottom */}
          <div className="rounded-xl bg-slate-50 p-3 text-[10px] text-[#789087] border border-slate-100">
            <span className="font-bold text-[#123B2D] block mb-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00B14F] inline-block animate-pulse"></span>
              SECURE TELEMETRY
            </span>
            <span>Edge node sync active. Verified TLS 1.3 encryption. Continuous model calibrations loaded.</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 flex-col md:pl-64">
        
        {/* 2. TOP BAR */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#DFE8E2] bg-white px-6 md:px-10">
          <div className="flex items-center gap-2">
            {/* Mobile Hamburger Logo placeholder */}
            <div className="md:hidden grid h-8 w-8 place-items-center rounded-lg bg-[#00B14F] font-serif text-md font-black text-white">
              G
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-[#123B2D] md:text-base flex items-center gap-2">
              <span className="md:inline hidden text-xs bg-slate-100 text-[#789087] font-semibold px-2 py-0.5 rounded border border-slate-200">PROD-v4.12</span>
              <span>Operations Command Center</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/50 px-3 py-1 text-[11px] font-extrabold tracking-wide text-[#00B14F]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B14F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B14F]"></span>
              </span>
              LIVE OPERATIONS
            </div>

            {/* Enterprise Multi-Store Switcher Dropdown */}
            <div className="relative">
              <label htmlFor="location-switcher" className="sr-only">Select Location</label>
              <div className="flex items-center gap-1.5 rounded-lg border border-[#DFE8E2] bg-[#F6F8F5] px-3 py-1.5 text-xs font-bold text-[#123B2D] focus-within:ring-2 focus-within:ring-[#00B14F]/50">
                <MapPin className="h-3.5 w-3.5 text-[#00B14F]" />
                <select
                  id="location-switcher"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  disabled={isRefreshing}
                  className="bg-transparent pr-1 font-bold text-[#123B2D] focus:outline-none cursor-pointer"
                >
                  <option value="McDonald's - Orchard Road">McDonald's - Orchard Road</option>
                  <option value="KFC - Bandung Junction">KFC - Bandung Junction</option>
                  <option value="GrabKitchen - Central Hub">GrabKitchen - Central Hub</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6 md:p-10 space-y-6 relative">
          
          {/* Subtle Location Change Loader Overlay */}
          {isRefreshing && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F6F8F5]/80 backdrop-blur-sm transition-all duration-300">
              <div className="flex items-center gap-3 rounded-2xl border border-[#DFE8E2] bg-white px-6 py-5 shadow-xl">
                <RefreshCw className="h-6 w-6 animate-spin text-[#00B14F]" />
                <div>
                  <h4 className="font-bold text-[#123B2D]">SYNCING REGIONAL TELEMETRY</h4>
                  <p className="text-xs text-[#789087]">Recalculating video streams and delivery telemetry for {selectedLocation}...</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. METRICS ROW */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            
            {/* Kitchen Load */}
            <div className="rounded-2xl border border-[#DFE8E2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#789087] uppercase tracking-wider">Kitchen Load</span>
                <Activity className="h-4 w-4 text-[#00B14F]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-[#123B2D]">{kitchenLoad}%</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#789087]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Active load prediction</span>
              </div>
            </div>

            {/* Active Orders */}
            <div className="rounded-2xl border border-[#DFE8E2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#789087] uppercase tracking-wider">Active Orders</span>
                <Users className="h-4 w-4 text-[#00B14F]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-[#123B2D]">{activeOrdersCount}</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#789087]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00B14F]"></span>
                <span>Across prep stations</span>
              </div>
            </div>

            {/* ETA Confidence Score */}
            <div className="rounded-2xl border border-[#DFE8E2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#789087] uppercase tracking-wider">ETA Confidence</span>
                <TrendingUp className="h-4 w-4 text-[#00B14F]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-[#123B2D]">{etaConfidence}%</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <Sparkles className="h-3 w-3" />
                <span>High Certainty</span>
              </div>
            </div>

            {/* Rider Wait Saved */}
            <div className="rounded-2xl border border-[#DFE8E2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#789087] uppercase tracking-wider">Rider Wait Saved</span>
                <Clock3 className="h-4 w-4 text-[#00B14F]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-[#123B2D]">{riderSavedMinutes} min</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#789087]">
                <span>Vs. immediate dispatch</span>
              </div>
            </div>

            {/* Financial ROI (Idle Costs Avoided) */}
            <div className="rounded-2xl border border-[#DFE8E2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ring-2 ring-[#00B14F]/10">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#004A26] uppercase tracking-wider">Financial ROI</span>
                <DollarSign className="h-4 w-4 text-[#00B14F]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-[#004A26]">${financialROI}</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700 font-bold">
                <span>Idle costs avoided today</span>
              </div>
            </div>

          </section>

          {/* TWO-COLUMN LAYOUT */}
          <div className="grid gap-6 lg:grid-cols-[1.45fr_.8fr]">
            
            {/* COLUMN 1 */}
            <div className="space-y-6">
              
              {/* 4. LIVE COMPUTER VISION CAMERA FEED */}
              <article className="rounded-2xl border border-[#DFE8E2] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#789087]">Live Video Analytics Stream</p>
                    <h3 className="text-base font-bold text-[#123B2D]">Camera 01: Overhead Prep Line</h3>
                  </div>
                  {/* CV MODEL ACTIVE badge with pulsing red dot */}
                  <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-[#789087] border border-slate-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    CV MODEL ACTIVE
                  </span>
                </div>

                {/* Stylized, high-fidelity real kitchen overhead camera view */}
                <div className="relative h-[290px] overflow-hidden rounded-xl bg-[#131714] text-white shadow-2xl font-mono border border-slate-950 animate-cctv-flicker">
                  
                  {/* Real-looking floor tiling pattern using CSS gradients */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `
                      radial-gradient(#202923 1px, transparent 1px),
                      repeating-linear-gradient(0deg, transparent, transparent 19px, #000 19px, #000 20px),
                      repeating-linear-gradient(90deg, transparent, transparent 19px, #000 19px, #000 20px)
                    `,
                    backgroundSize: '20px 20px'
                  }} />

                  {/* CAMERA OVERLAYS: Rec timestamp indicators and overlays */}
                  <div className="absolute left-4 top-4 z-20 flex flex-col text-[8px] tracking-wide text-white/80 leading-3 bg-black/40 px-2 py-1 rounded">
                    <div className="flex items-center gap-1 text-red-500 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span>REC</span>
                    </div>
                    <span>CAM-01 / ACTIVE_FLOW</span>
                    <span>2026-07-15 {cctvTimeStr}</span>
                    <span className="text-[7px] text-emerald-400">FPS: 30.00 (LOW_LATENCY)</span>
                  </div>

                  {/* 1. WOK STATION (OVERHEAD VIEW) */}
                  <div className="absolute left-[5%] top-[15%] w-[150px] h-[135px] rounded-lg bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500 border border-slate-500 shadow-[0_12px_24px_rgba(0,0,0,0.5)] p-2 flex flex-col justify-between">
                    {/* Burner 1 */}
                    <div className="flex items-center justify-around w-full">
                      <div className="relative h-12 w-12 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-inner flex items-center justify-center">
                        {/* Orange Heat Pulse */}
                        <div className="absolute inset-1.5 rounded-full bg-gradient-to-t from-orange-600 via-red-600 to-amber-300 animate-flame"></div>
                        {/* Skillet / Wok atop stove */}
                        <div className="absolute inset-0.5 rounded-full bg-zinc-900 border border-slate-700 shadow-md flex items-center justify-center">
                          {/* Sizzling food details */}
                          <div className="h-3 w-3 rounded-full bg-amber-500 animate-ping opacity-60"></div>
                        </div>
                        {/* Steam clouds rising */}
                        <div className="absolute -top-6 left-2 text-white/20 select-none pointer-events-none text-xs font-sans filter blur-[1.5px] animate-steam-1">♨</div>
                        <div className="absolute -top-8 left-4 text-white/10 select-none pointer-events-none text-xs font-sans filter blur-[2px] animate-steam-2">♨</div>
                      </div>

                      {/* Burner 2 */}
                      <div className="relative h-12 w-12 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-inner flex items-center justify-center">
                        <div className="absolute inset-1.5 rounded-full bg-gradient-to-t from-orange-600 via-red-600 to-amber-300 animate-flame"></div>
                        <div className="absolute inset-0.5 rounded-full bg-zinc-900 border border-slate-700 shadow-md flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        </div>
                        <div className="absolute -top-7 right-2 text-white/25 select-none pointer-events-none text-xs font-sans filter blur-[1px] animate-steam-3">♨</div>
                      </div>
                    </div>

                    {/* Table Surface Ingredients */}
                    <div className="w-full flex justify-between px-1">
                      <div className="h-4 w-7 rounded bg-amber-100/80 border border-amber-300 flex items-center justify-center text-[6px] text-zinc-800 font-bold">BOARD</div>
                      <div className="h-4 w-4 rounded-full bg-[#123b2d]/40 border border-emerald-400 flex items-center justify-center text-[5px] text-white">HERB</div>
                    </div>

                    {/* Chef 1 (Overhead Circle View) */}
                    <div className="absolute -bottom-6 left-[40%] flex flex-col items-center z-10">
                      {/* Chef Hat Circular top */}
                      <div className="h-8 w-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center animate-chef-head">
                        <span className="text-[6px] font-black text-slate-800">HAT</span>
                      </div>
                      {/* Shoulder line top down */}
                      <div className="h-4 w-12 rounded-t-full bg-slate-800 border border-slate-900 -mt-1 shadow animate-chef-work"></div>
                    </div>
                  </div>

                  {/* 2. GRILL STATION (OVERHEAD VIEW) */}
                  <div className="absolute left-[44%] top-[18%] w-[130px] h-[125px] rounded-lg bg-gradient-to-b from-slate-400 to-slate-600 border border-slate-500 shadow-[0_12px_24px_rgba(0,0,0,0.5)] p-1.5 flex flex-col justify-between">
                    {/* Glowing Hot Grill Grates */}
                    <div className="h-[65px] w-full rounded bg-zinc-900 border border-zinc-950 p-1 relative overflow-hidden flex flex-col justify-around animate-grill-heat">
                      {/* Red Heat Rods Underneath */}
                      <div className="absolute inset-0 opacity-40" style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, #e11d48, #e11d48 3px, transparent 3px, transparent 12px)'
                      }} />
                      
                      {/* Hamburger patties cooking on grates */}
                      <div className="flex justify-around relative z-10">
                        <div className="h-4 w-4 rounded-full bg-amber-950 border border-amber-800 shadow flex items-center justify-center"><div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse"></div></div>
                        <div className="h-4 w-4 rounded-full bg-amber-950 border border-amber-800 shadow"></div>
                      </div>
                      <div className="flex justify-around relative z-10">
                        <div className="h-4 w-4 rounded-full bg-amber-950 border border-amber-800 shadow"></div>
                        <div className="h-4 w-4 rounded-full bg-amber-950 border border-amber-800 shadow flex items-center justify-center"><div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse"></div></div>
                      </div>
                    </div>

                    {/* Grill Controls panel */}
                    <div className="w-full h-3 bg-zinc-800 rounded border border-zinc-950 flex items-center justify-around px-1">
                      <span className="h-1 w-1 rounded-full bg-red-500"></span>
                      <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                      <span className="h-1 w-1 rounded-full bg-amber-500"></span>
                    </div>

                    {/* Chef 2 (Overhead Circle View) */}
                    <div className="absolute -bottom-6 left-[30%] flex flex-col items-center z-10">
                      <div className="h-8 w-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center animate-chef-head">
                        <span className="text-[6px] font-black text-slate-800">HAT</span>
                      </div>
                      <div className="h-4 w-12 rounded-t-full bg-zinc-700 border border-zinc-900 -mt-1 shadow animate-chef-work"></div>
                    </div>
                  </div>

                  {/* 3. PLATING STATION (OVERHEAD VIEW) */}
                  <div className="absolute right-[5%] top-[12%] w-[125px] h-[140px] rounded-lg bg-gradient-to-bl from-slate-300 via-slate-100 to-slate-400 border border-slate-400 shadow-[0_12px_24px_rgba(0,0,0,0.5)] p-2 flex flex-col justify-between">
                    {/* Wooden Prep Chopping Board */}
                    <div className="w-full h-[45px] rounded bg-amber-100 border border-amber-300 p-1 flex items-center justify-around shadow-inner">
                      {/* Vegetables on board */}
                      <div className="h-3 w-3 rounded bg-[#00B14F] shadow-sm"></div>
                      <div className="h-3 w-3 rounded-full bg-red-500/80 shadow-sm animate-pulse"></div>
                      <div className="h-1.5 w-6 rounded-sm bg-neutral-100 border border-neutral-300 rotate-12">KNIFE</div>
                    </div>

                    {/* Round Bowls & Plates */}
                    <div className="flex items-center justify-between w-full mt-1.5">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 border border-slate-300 shadow-md flex items-center justify-center">
                        {/* Food garnish details */}
                        <div className="h-4 w-4 rounded-full bg-gradient-to-tr from-[#00B14F] to-amber-300"></div>
                      </div>
                      <div className="h-6 w-6 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      </div>
                    </div>

                    {/* Plated Takeaway Boxes */}
                    <div className="w-full flex justify-end">
                      <div className="h-5 w-7 rounded bg-amber-900/10 border-2 border-[#CFFF3D] flex items-center justify-center text-[5px] text-zinc-900 font-extrabold shadow animate-pulse">BOX_T</div>
                    </div>

                    {/* Chef 3 (Overhead Circle View) */}
                    <div className="absolute -bottom-6 left-[25%] flex flex-col items-center z-10">
                      <div className="h-8 w-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center animate-chef-head">
                        <span className="text-[6px] font-black text-slate-800">HAT</span>
                      </div>
                      <div className="h-4 w-12 rounded-t-full bg-slate-900 border border-slate-950 -mt-1 shadow animate-chef-work"></div>
                    </div>
                  </div>

                  {/* COMPUTER VISION ACTIVE OVERLAYS & BOUNDING BOX BRACKETS */}
                  
                  {/* Wok Bounding Box (Green) */}
                  <div className="absolute left-[3%] top-[10%] w-[155px] h-[145px] border border-emerald-400 bg-emerald-500/5 rounded-lg pointer-events-none">
                    <span className="absolute top-1 left-2 bg-[#00B14F] text-white text-[7px] font-extrabold px-1 py-0.5 rounded shadow-md uppercase tracking-wider flex items-center gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse inline-block" />
                      WOK_ST_01 (ACT: {Math.max(1, activeOrdersCount - 1)})
                    </span>
                    <span className="absolute bottom-1 right-2 font-mono text-[7px] text-emerald-400 font-semibold">98.2% CALIBR_OK</span>
                  </div>

                  {/* Grill Bounding Box (Cyan) */}
                  <div className="absolute left-[42%] top-[12%] w-[135px] h-[135px] border border-cyan-400 bg-cyan-400/5 rounded-lg pointer-events-none">
                    <span className="absolute top-1 left-2 bg-cyan-500 text-slate-950 text-[7px] font-extrabold px-1 py-0.5 rounded shadow-md uppercase tracking-wider flex items-center gap-0.5">
                      GRILL_ST_01 (ACT: {Math.max(1, Math.min(2, activeOrdersCount - 2))})
                    </span>
                    <span className="absolute bottom-1 right-2 font-mono text-[7px] text-cyan-300 font-semibold">97.6% MODEL_MATCH</span>
                  </div>

                  {/* Plating Bounding Box (Yellow-Lime) */}
                  <div className="absolute right-[3%] top-[6%] w-[130px] h-[150px] border border-[#CFFF3D] bg-[#CFFF3D]/5 rounded-lg pointer-events-none">
                    <span className="absolute top-1 left-2 bg-[#CFFF3D] text-[#004A26] text-[7px] font-extrabold px-1 py-0.5 rounded shadow-md uppercase tracking-wider">
                      PLATE_LINE_01 (ACTIVE)
                    </span>
                    <span className="absolute bottom-1 right-2 font-mono text-[7px] text-[#CFFF3D] font-semibold">99.4% VERIF_EST</span>
                  </div>

                  {/* SWEEPING GREEN LASER LINES (Computer Vision Scan line) */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00B14F] to-transparent shadow-[0_0_15px_#00B14F] opacity-75 pointer-events-none animate-scan-sweep" />

                  {/* CAMERA FILTERS: Scanline overlay & Vignette */}
                  {/* Subtle TV Scanline pattern */}
                  <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)'
                  }} />
                  {/* Vignette Shadow */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.85)]" />

                  {/* Bottom Camera Metadata Box */}
                  <div className="absolute right-4 bottom-4 rounded border border-white/10 bg-black/85 p-2 font-mono text-[8px] leading-3 text-slate-300 shadow-lg z-20">
                    <strong className="text-[#CFFF3D] tracking-wider font-extrabold block mb-0.5 uppercase">CV Edge telemetry</strong>
                    <div>Total Active: <span className="text-white">{activeOrdersCount} Tickets</span></div>
                    <div>Wait Saved: <span className="text-[#00B14F] font-bold">+{riderSavedMinutes}m</span></div>
                    <div>Outlet ID: <span className="text-[#CFFF3D]">MS_{selectedLocation.slice(0,3).toUpperCase()}</span></div>
                  </div>

                </div>

                <p className="mt-3 text-xs text-[#789087]">
                  <strong className="text-[#123B2D]">Vision model insight:</strong> Edge computer vision dynamically detects chef positions, burner activity, and box placements to calculate sub-minute food completion readiness.
                </p>
              </article>

              {/* 6. READINESS FORECAST TABLE */}
              <article className="rounded-2xl border border-[#DFE8E2] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#789087]">Real-Time Logistics Arbitrage</p>
                    <h3 className="text-base font-bold text-[#123B2D]">Readiness Forecast: AI Prediction vs. Manual Delta</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EDF1EE] pb-2 font-black text-[#789087] uppercase tracking-wider">
                        <th className="py-2.5 pr-3 font-semibold">Order ID</th>
                        <th className="py-2.5 pr-3 font-semibold">Dish & Details</th>
                        <th className="py-2.5 pr-3 font-semibold">Stage & Progress</th>
                        <th className="py-2.5 pr-3 font-semibold text-center">Manual Estimate</th>
                        <th className="py-2.5 pr-3 font-semibold text-center">AI Predicted Time</th>
                        <th className="py-2.5 pr-3 font-semibold text-center text-[#00B14F]">Efficiency Delta</th>
                        <th className="py-2.5 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF1EE]">
                      {processedOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-8 text-center font-bold text-[#789087] italic">
                            No active orders in the current stream. Update the queue below to populate.
                          </td>
                        </tr>
                      ) : (
                        processedOrders.map(order => (
                          <tr key={order.id} className="group hover:bg-[#F7FBF8] transition">
                            <td className="py-3.5 font-mono font-bold text-[#123B2D]">{order.id}</td>
                            <td className="py-3.5 pr-3">
                              <span className="font-bold text-[#123B2D] block">{order.dish}</span>
                              <span className="text-[10px] text-[#789087]">{order.items} item{order.items > 1 ? 's' : ''} enqueued</span>
                            </td>
                            <td className="py-3.5 pr-3">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#DFE8E2]">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      order.stage === 'Ready' ? 'bg-emerald-500' :
                                      order.stage === 'Cooking' ? 'bg-[#00B14F]' :
                                      order.stage === 'Dispatched' ? 'bg-blue-500' :
                                      'bg-amber-400'
                                    }`} 
                                    style={{ width: `${order.progress}%` }}
                                  />
                                </div>
                                <span className={`font-bold uppercase text-[10px] ${
                                  order.stage === 'Ready' ? 'text-emerald-600 animate-pulse' :
                                  order.stage === 'Cooking' ? 'text-[#00B14F]' :
                                  order.stage === 'Dispatched' ? 'text-blue-500 font-extrabold animate-bounce' :
                                  'text-amber-500'
                                }`}>{order.stage}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-center font-mono text-[#789087] line-through decoration-red-400/50">{order.manualEstimate} min</td>
                            <td className="py-3.5 text-center font-mono font-bold text-[#004A26]">{order.scaledAiTime} min</td>
                            <td className="py-3.5 text-center">
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-600 border border-emerald-100">
                                {order.delta} min
                              </span>
                            </td>
                            <td className="py-3.5 text-center">
                              <button
                                onClick={() => handleDismissOrder(order.id, order)}
                                aria-label={`Complete and dismiss ${order.id}`}
                                className="rounded-lg p-1 text-[#789087] transition hover:bg-red-50 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 border-t border-[#EDF1EE] pt-3 text-[11px] text-[#789087] flex justify-between">
                  <span>* Manual estimates represent bloated historical restaurant default schedules.</span>
                  <span className="font-bold text-[#00B14F]">Total items: {processedOrders.reduce((sum, o) => sum + o.items, 0)}</span>
                </div>
              </article>

            </div>

            {/* COLUMN 2 */}
            <div className="space-y-6">
              
              {/* 5. DISPATCH READINESS ENGINE */}
              <article className="rounded-2xl border border-[#DFE8E2] bg-white p-5 text-center shadow-sm relative overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#789087]">Automated Orchestrator</p>
                <h3 className="text-base font-bold text-[#123B2D]">Dispatch Readiness Engine</h3>

                {/* Circular Progress Ring surrounding countdown */}
                <div className="relative mx-auto my-6 h-44 w-44">
                  <svg className="h-full w-full -rotate-90">
                    {/* Circle Background */}
                    <circle
                      cx="88"
                      cy="88"
                      r={strokeRadius}
                      className="stroke-[#EDF2EE]"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {/* Active Progress Circle */}
                    <circle
                      cx="88"
                      cy="88"
                      r={strokeRadius}
                      className="stroke-[#00B14F] transition-all duration-1000"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={strokeCircumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Absolute Centered Timer */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-3xl font-black tracking-tighter text-[#123B2D]">
                      {displayMin}:{displaySec}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#789087]">
                      Until Dispatch
                    </span>
                  </div>
                </div>

                {/* Dispatch Status / Metadata */}
                <div className="space-y-3">
                  <div className="rounded-xl bg-[#EFF9E8] p-3 text-left text-xs leading-5 border border-[#DFE8E2]/50 text-[#587065]">
                    <strong className="text-[#123B2D] block mb-0.5">Recommended action:</strong>
                    <span>Hold rider for {displayMin}:{displaySec} minutes. Kitchen completion tracking indicates cooking is dynamically progressing.</span>
                  </div>

                  <p className="text-[10px] text-left text-[#789087] leading-4 border-t border-slate-100 pt-3">
                    <strong>Dispatch for pickup at:</strong> <span className="font-bold text-[#123B2D]">10:38:30</span><br />
                    <strong>Est. Handover Completion:</strong> <span className="font-bold text-[#123B2D]">10:40:30</span> <span className="text-slate-400">(incl. 2m plating buffer)</span>
                  </p>

                  {/* Dispatch Button State Switch */}
                  {isDispatched ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EFF9E8] border border-emerald-300 py-3 text-sm font-bold text-[#004A26]">
                      <CheckCircle2 className="h-5 w-5 text-[#00B14F] animate-bounce" />
                      <span>Rider Dispatched Successfully</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleScheduleDispatch}
                      disabled={orders.length === 0}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition ${
                        orders.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#00B14F] hover:bg-[#009845] active:scale-[.98]'
                      }`}
                    >
                      <Send className="h-4 w-4" />
                      <span>Schedule Rider Dispatch</span>
                    </button>
                  )}
                </div>
              </article>

              {/* 7. INTERACTIVE QUEUE & SPEED SIMULATOR */}
              <article className="rounded-2xl bg-[#004A26] p-5 text-white shadow-sm">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Sliders className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-wider">Dynamic Controller</p>
                </div>
                <h3 className="mt-1 text-base font-bold text-white">Interactive Kitchen Simulator</h3>
                <p className="mt-1 text-xs text-emerald-100/75 leading-4">
                  Adjust simulated kitchen operational speed or enqueue fresh tickets to see AI models recalibrate logistics parameters.
                </p>

                {/* Speed Simulator Range Slider */}
                <div className="mt-5 rounded-xl bg-black/15 p-4 border border-white/5">
                  <div className="mb-2 flex justify-between text-xs font-semibold">
                    <span>Kitchen Speed Factor:</span>
                    <span className="text-[#CFFF3D] font-bold">
                      {speed === 1 ? 'Slow (1.25x)' : speed === 3 ? 'Fast (0.75x)' : 'Normal (1.0x)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={speed}
                    onChange={handleSpeedSliderChange}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#DFE8E2]/20 outline-none accent-[#CFFF3D]"
                    style={{
                      background: `linear-gradient(to right, #00B14F 0%, #00B14F ${(speed - 1) * 50}%, rgba(223, 232, 226, 0.2) ${(speed - 1) * 50}%, rgba(223, 232, 226, 0.2) 100%)`
                    }}
                  />
                  <div className="mt-2 flex justify-between text-[9px] text-emerald-100/50">
                    <span>Slow</span>
                    <span>Standard</span>
                    <span>Fast Speed</span>
                  </div>
                </div>

                {/* Add an Order Form */}
                <form onSubmit={handleAddOrder} className="mt-5 space-y-3.5 border-t border-white/10 pt-4">
                  <h4 className="text-xs font-bold tracking-wider text-emerald-300 uppercase">Update the Live Queue</h4>
                  
                  <div>
                    <label htmlFor="dish-name" className="block text-[10px] font-bold text-emerald-100 uppercase mb-1">Dish Name</label>
                    <input
                      id="dish-name"
                      type="text"
                      required
                      placeholder="e.g. Claypot Chicken Rice"
                      value={newOrderForm.dish}
                      onChange={e => setNewOrderForm({ ...newOrderForm, dish: e.target.value })}
                      className="w-full rounded-lg border border-emerald-300/25 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-emerald-100/40 outline-none transition focus:border-[#CFFF3D] focus:bg-white/15"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="prep-time" className="block text-[10px] font-bold text-emerald-100 uppercase mb-1">Prep Time (Min)</label>
                      <input
                        id="prep-time"
                        type="number"
                        min="1"
                        max="90"
                        required
                        value={newOrderForm.prep}
                        onChange={e => setNewOrderForm({ ...newOrderForm, prep: Number(e.target.value) })}
                        className="w-full rounded-lg border border-emerald-300/25 bg-white/10 px-3 py-2 text-xs text-white outline-none transition focus:border-[#CFFF3D] focus:bg-white/15"
                      />
                    </div>
                    <div>
                      <label htmlFor="items-count" className="block text-[10px] font-bold text-emerald-100 uppercase mb-1">Item Count</label>
                      <input
                        id="items-count"
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={newOrderForm.items}
                        onChange={e => setNewOrderForm({ ...newOrderForm, items: Number(e.target.value) })}
                        className="w-full rounded-lg border border-emerald-300/25 bg-white/10 px-3 py-2 text-xs text-white outline-none transition focus:border-[#CFFF3D] focus:bg-white/15"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CFFF3D] px-4 py-2.5 text-xs font-bold text-[#004A26] transition hover:bg-[#D4FF54] active:scale-[0.99]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add to Active Queue</span>
                  </button>
                </form>

              </article>

            </div>

          </div>

          {/* 8. REAL-TIME API LOG TERMINAL */}
          <section className="rounded-2xl border border-[#DFE8E2] bg-[#0E1512] p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Terminal className="h-4 w-4 animate-pulse" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">Real-Time API Log Telemetry Feed</span>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-[#00B14F] animate-ping" />
            </div>

            {/* Simulated terminal console */}
            <div className="h-32 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {logs.map((log, index) => {
                let colorClass = "text-slate-300"
                if (log.includes("SYSTEM:")) colorClass = "text-cyan-400"
                if (log.includes("USER EVENT:")) colorClass = "text-[#CFFF3D]"
                if (log.includes("AI MODEL:")) colorClass = "text-[#00B14F]"
                if (log.includes("CV ANALYTICS:")) colorClass = "text-emerald-300"
                if (log.includes("GRAB ENGINE:")) colorClass = "text-amber-400"

                return (
                  <div key={index} className={`leading-relaxed border-l-2 pl-2 border-white/5 ${colorClass}`}>
                    {log}
                  </div>
                )
              })}
              <div ref={terminalEndRef} />
            </div>
          </section>

        </main>
      </div>

    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
