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
  DollarSign,
  Map,
  Camera,
  Cpu,
  Flame,
  AlertTriangle,
  Zap,
  Info,
  ShieldCheck
} from 'lucide-react'
import './index.css'

// Initial Order Data representing G1246, G1245, G1247, G1249 (Context-aware for McDonald's Orchard Road)
const initialOrders = [
  { id: 'G1246', dish: 'Big Mac Meal (2 Sets)', items: 2, stage: 'Cooking', progress: 62, manualEstimate: 25, aiBaseTime: 16 },
  { id: 'G1245', dish: 'McSpicy Double Meal', items: 3, stage: 'Cooking', progress: 44, manualEstimate: 30, aiBaseTime: 22 },
  { id: 'G1247', dish: 'French Fries (Lrg)', items: 1, stage: 'Queued', progress: 18, manualEstimate: 15, aiBaseTime: 12 },
  { id: 'G1249', dish: 'Chicken McNuggets 9pc', items: 2, stage: 'Queued', progress: 8, manualEstimate: 20, aiBaseTime: 15 }
]

// Base locations config to simulate different merchant outlets with localized baseline metrics and menus
const locationsConfig = {
  "McDonald's - Orchard Road": {
    baseLoad: 82,
    baseConfidence: 94,
    baseSavedTime: 13,
    dishes: [
      "Big Mac Meal", "McSpicy Double Meal", "French Fries (Lrg)", 
      "Chicken McNuggets 9pc", "Filet-O-Fish Set", "Double Cheeseburger", 
      "McChicken Meal", "Egg McMuffin Set", "Apple Pie Duo"
    ],
    initialOrders: [
      { id: 'G1246', dish: 'Big Mac Meal (2 Sets)', items: 2, stage: 'Cooking', progress: 62, manualEstimate: 25, aiBaseTime: 16 },
      { id: 'G1245', dish: 'McSpicy Double Meal', items: 3, stage: 'Cooking', progress: 44, manualEstimate: 30, aiBaseTime: 22 },
      { id: 'G1247', dish: 'French Fries (Lrg)', items: 1, stage: 'Queued', progress: 18, manualEstimate: 15, aiBaseTime: 12 },
      { id: 'G1249', dish: 'Chicken McNuggets 9pc', items: 2, stage: 'Queued', progress: 8, manualEstimate: 20, aiBaseTime: 15 }
    ]
  },
  "KFC - Bandung Junction": {
    baseLoad: 68,
    baseConfidence: 91,
    baseSavedTime: 9,
    dishes: [
      "Crispy Chicken Combo", "Zinger Burger Meal", "Whipped Potato Lrg",
      "Colonel Rice Bowl", "Hot & Crispy Chicken 9pc", "French Fries Med",
      "Chicken Strips 3pc", "Perkedel KFC"
    ],
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
    dishes: [
      "Sate Ayam 10pcs", "Martabak Manis Cokelat", "Beef Rendang Plate",
      "Es Cendol Durian", "Ayam Penyet Sambal Ijo", "Hainanese Chicken Rice",
      "Nasi Lemak Royal", "Char Kway Teow", "Roti Prata Double Egg", 
      "Laksa Premium Set", "Chai Tow Kway (S)", "Nasi Goreng Special"
    ],
    initialOrders: [
      { id: 'G1420', dish: 'Sate Ayam 10pcs', items: 1, stage: 'Cooking', progress: 85, manualEstimate: 20, aiBaseTime: 12 },
      { id: 'G1421', dish: 'Martabak Manis Cokelat', items: 1, stage: 'Cooking', progress: 58, manualEstimate: 24, aiBaseTime: 18 },
      { id: 'G1422', dish: 'Beef Rendang Plate', items: 2, stage: 'Queued', progress: 25, manualEstimate: 28, aiBaseTime: 20 },
      { id: 'G1423', dish: 'Es Cendol Durian', items: 3, stage: 'Queued', progress: 12, manualEstimate: 12, aiBaseTime: 8 },
      { id: 'G1424', dish: 'Ayam Penyet Sambal Ijo', items: 2, stage: 'Queued', progress: 5, manualEstimate: 18, aiBaseTime: 13 }
    ]
  }
}

// Preset riders list
const ridersList = [
  { name: "Adi Wijaya", vehicle: "Honda PCX (Green)", plate: "SG 9422 P", rating: "4.96", status: "Active" },
  { name: "Sarah Lim", vehicle: "Yamaha NMAX (Black)", plate: "SG 8812 B", rating: "4.98", status: "Active" },
  { name: "Rian Hidayat", vehicle: "Suzuki Nex II (Green)", plate: "SG 5410 X", rating: "4.92", status: "Active" },
  { name: "Taufik H.", vehicle: "Vespa LX 125 (Yellow)", plate: "SG 7731 C", rating: "4.95", status: "Active" }
]

// Sleek, futuristic tech Logo Component for GrabSense
const LogoIcon = ({ className = "h-11 w-11" }) => (
  <div className={`relative ${className} flex items-center justify-center rounded-xl bg-gradient-to-br from-[#041A0F] to-[#010C07] border border-[#00B14F]/30 shadow-[0_0_20px_rgba(0,177,79,0.2)] overflow-hidden group select-none`}>
    {/* Animated shine line on hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00B14F]/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
    
    <svg viewBox="0 0 100 100" className="h-4/5 w-4/5 drop-shadow-[0_0_8px_rgba(0,177,79,0.5)]">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00B14F" />
          <stop offset="100%" stopColor="#CFFF3D" />
        </linearGradient>
      </defs>
      {/* Outer spinning radar array */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0, 177, 79, 0.15)" strokeWidth="4" strokeDasharray="10 15" className="animate-[spin_40s_linear_infinite]" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(207, 255, 61, 0.1)" strokeWidth="2" />
      {/* Dynamic route/link mapping symbol (Stylized merged G and S path) */}
      <path 
        d="M 75 35 A 30 30 0 1 0 75 65 L 55 65 A 10 10 0 0 1 55 55 L 75 55" 
        fill="none" 
        stroke="url(#logoGrad)" 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Pulse central AI core node */}
      <circle cx="50" cy="45" r="5" fill="#CFFF3D" className="animate-pulse" />
      <circle cx="50" cy="45" r="10" fill="none" stroke="#CFFF3D" strokeWidth="1" opacity="0.5" className="animate-ping" />
    </svg>
    
    {/* Micro status pin on corner */}
    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#CFFF3D] shadow-[0_0_6px_#CFFF3D]">
      <span className="absolute inset-0 rounded-full bg-[#CFFF3D] animate-ping" />
    </span>
  </div>
)

function App() {
  const [selectedLocation, setSelectedLocation] = useState("McDonald's - Orchard Road")
  const [orders, setOrders] = useState(() => JSON.parse(JSON.stringify(locationsConfig["McDonald's - Orchard Road"].initialOrders)))
  const [speed, setSpeed] = useState(2) // 1: Slow, 2: Normal, 3: Fast
  
  // Dynamic Real-time States for Vision Analytics & Camera Overlay
  const [inferenceTime, setInferenceTime] = useState(12)
  const [wokTemp, setWokTemp] = useState(218.4)
  const [grillTemp, setGrillTemp] = useState(182.1)
  const [matchScores, setMatchScores] = useState({ wok: 98.4, grill: 97.6, plating: 98.2 })
  const [cctvLatency, setCctvLatency] = useState(0.082)
  const [cctvFps, setCctvFps] = useState(30)

  // Calculate clean initial countdown based on default cooking progress
  const [countdown, setCountdown] = useState(() => {
    const defaultOrders = locationsConfig["McDonald's - Orchard Road"].initialOrders
    const oldest = defaultOrders.filter(o => o.stage === 'Cooking').sort((a, b) => b.progress - a.progress)[0]
    if (oldest) {
      const dispatchProgressThreshold = ((oldest.aiBaseTime - 2) / oldest.aiBaseTime) * 100
      const remainingProgress = dispatchProgressThreshold - oldest.progress
      return Math.max(0, Math.ceil(remainingProgress / 2)) // default speed 2 is increment 2
    }
    return 15
  })
  const [isDispatched, setIsDispatched] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [riderSavedMinutes, setRiderSavedMinutes] = useState(locationsConfig["McDonald's - Orchard Road"].baseSavedTime)
  const [logs, setLogs] = useState([])
  const [logFilter, setLogFilter] = useState("all")
  const [newOrderForm, setNewOrderForm] = useState({ dish: '', prep: 12, items: 1 })
  
  // Custom interactive features
  const [viewMode, setViewMode] = useState("cctv") // "cctv" or "map"
  const [isLunchRush, setIsLunchRush] = useState(false)
  const [riderProgress, setRiderProgress] = useState(0)
  const [currentRider, setCurrentRider] = useState(ridersList[0])
  const [edgeTemperature, setEdgeTemperature] = useState(41.8)

  // Keep cache of locations with localized metrics history
  const locationCache = useRef({
    "McDonald's - Orchard Road": {
      orders: JSON.parse(JSON.stringify(locationsConfig["McDonald's - Orchard Road"].initialOrders)),
      riderSavedMinutes: locationsConfig["McDonald's - Orchard Road"].baseSavedTime,
      metricsHistory: {
        kitchenLoad: [40, 52, 63, 60, 58, 62, 70, 82],
        activeOrders: [2, 3, 4, 3, 2, 3, 4, 4],
        confidence: [92, 94, 91, 95, 96, 94, 95, 94],
        savedTime: [6, 8, 9, 10, 11, 13, 13, 13],
        roi: [21.00, 28.00, 31.50, 35.00, 38.50, 45.50, 45.50, 45.50]
      }
    },
    "KFC - Bandung Junction": {
      orders: JSON.parse(JSON.stringify(locationsConfig["KFC - Bandung Junction"].initialOrders)),
      riderSavedMinutes: locationsConfig["KFC - Bandung Junction"].baseSavedTime,
      metricsHistory: {
        kitchenLoad: [35, 42, 48, 55, 52, 58, 62, 68],
        activeOrders: [1, 2, 3, 2, 2, 3, 3, 3],
        confidence: [88, 90, 89, 92, 93, 91, 92, 91],
        savedTime: [4, 5, 6, 7, 8, 9, 9, 9],
        roi: [14.00, 17.50, 21.00, 24.50, 28.00, 31.50, 31.50, 31.50]
      }
    },
    "GrabKitchen - Central Hub": {
      orders: JSON.parse(JSON.stringify(locationsConfig["GrabKitchen - Central Hub"].initialOrders)),
      riderSavedMinutes: locationsConfig["GrabKitchen - Central Hub"].baseSavedTime,
      metricsHistory: {
        kitchenLoad: [55, 65, 72, 80, 78, 85, 88, 91],
        activeOrders: [3, 4, 5, 4, 4, 5, 5, 5],
        confidence: [94, 95, 93, 96, 97, 95, 96, 96],
        savedTime: [10, 12, 14, 16, 18, 20, 21, 21],
        roi: [35.00, 42.00, 49.00, 56.00, 63.00, 70.00, 73.50, 73.50]
      }
    }
  })

  // Sparkline history state initialized with McDonald's data
  const [metricsHistory, setMetricsHistory] = useState(() => ({
    ...locationCache.current["McDonald's - Orchard Road"].metricsHistory
  }))

  // Refs to avoid setInterval closure problems
  const countdownRef = useRef(countdown)
  const speedRef = useRef(speed)
  const terminalEndRef = useRef(null)
  const ordersRef = useRef(orders)
  const isDispatchedRef = useRef(isDispatched)
  const isRefreshingRef = useRef(isRefreshing)

  useEffect(() => {
    countdownRef.current = countdown
  }, [countdown])

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => {
    ordersRef.current = orders
  }, [orders])

  useEffect(() => {
    isDispatchedRef.current = isDispatched
  }, [isDispatched])

  useEffect(() => {
    isRefreshingRef.current = isRefreshing
  }, [isRefreshing])

  // Synchronize orders, riderSavedMinutes, and metrics history back to cache whenever they change
  useEffect(() => {
    if (locationCache.current[selectedLocation]) {
      locationCache.current[selectedLocation].orders = orders
    }
  }, [orders, selectedLocation])

  useEffect(() => {
    if (locationCache.current[selectedLocation]) {
      locationCache.current[selectedLocation].riderSavedMinutes = riderSavedMinutes
    }
  }, [riderSavedMinutes, selectedLocation])

  useEffect(() => {
    if (locationCache.current[selectedLocation]) {
      locationCache.current[selectedLocation].metricsHistory = metricsHistory
    }
  }, [metricsHistory, selectedLocation])

  const [currentTime, setCurrentTime] = useState(new Date())

  // Update real-time clock and dynamic analytics data every second (prevents static numbers)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      // Jitter edge temperature
      setEdgeTemperature(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1))
      
      // Fluctuating inference latency
      setInferenceTime(prev => Math.max(9, Math.min(15, prev + (Math.random() > 0.5 ? 1 : -1))))
      
      // Dynamic camera latency & FPS
      setCctvLatency(+(0.075 + (Math.random() * 0.015 - 0.007)).toFixed(3))
      setCctvFps(Math.random() > 0.85 ? 29 : 30)

      // Jitter burner temperature based on cooking activity
      setWokTemp(prev => {
        const activeCooks = ordersRef.current.filter(o => o.stage === 'Cooking').length
        const base = activeCooks > 0 ? 220 : 160
        const drift = Math.random() * 2 - 1
        return +(base + drift).toFixed(1)
      })

      // Jitter grill temperature
      setGrillTemp(prev => {
        const drift = Math.random() * 1.6 - 0.8
        return +(182.1 + drift).toFixed(1)
      })

      // Jitter match scores slightly
      setMatchScores({
        wok: +(98.4 + (Math.random() * 0.4 - 0.2)).toFixed(1),
        grill: +(97.6 + (Math.random() * 0.6 - 0.3)).toFixed(1),
        plating: +(98.2 + (Math.random() * 0.4 - 0.2)).toFixed(1)
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Helper: Get formatted current time
  const getFormattedTime = () => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
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

  // Smooth rider delivery map movement
  useEffect(() => {
    if (isDispatched) {
      setRiderProgress(0)
      const startTime = Date.now()
      const duration = 3500 // matches the timeout in dispatchOrder
      
      const animInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const pct = Math.min(100, (elapsed / duration) * 100)
        setRiderProgress(pct)
        if (elapsed >= duration) {
          clearInterval(animInterval)
        }
      }, 30) // ~33fps smooth animation
      
      return () => clearInterval(animInterval)
    } else {
      setRiderProgress(0)
    }
  }, [isDispatched])

  // Common order dispatch logic (shared between manual dispatch and automated countdown)
  const dispatchOrder = (isAutomated, targetOrderId = null) => {
    const currentOrders = ordersRef.current
    const currentlyDispatched = isDispatchedRef.current

    if (currentOrders.length === 0 || currentlyDispatched) return

    // Find the first order that matches targetOrderId, is 'Ready', 'Cooking', or the oldest enqueued order
    const orderToDispatch = targetOrderId 
      ? currentOrders.find(o => o.id === targetOrderId) 
      : (currentOrders.find(o => o.stage === 'Ready') || currentOrders.find(o => o.stage === 'Cooking') || currentOrders[0])
      
    if (!orderToDispatch || orderToDispatch.stage === 'Dispatched') return
    const orderId = orderToDispatch.id

    // Randomize rider assigned
    const rider = ridersList[Math.floor(Math.random() * ridersList.length)]
    setCurrentRider(rider)

    // Switch view to Map Mode automatically to let the user watch the rider live!
    setViewMode("map")

    setIsDispatched(true)
    if (isAutomated) {
      if (targetOrderId) {
        addLog(`AUTOMATED EVENT: Order ${orderId} is READY. Automated rider dispatch triggered.`)
      } else {
        addLog(`AUTOMATED EVENT: Dispatch countdown cycle completed. Automated dispatch triggered for Order ${orderId}.`)
      }
    } else {
      addLog(`USER EVENT: Manual override dispatch clicked for Order ${orderId}.`)
    }
    addLog(`GRAB ENGINE: Match sequence completed. Rider ${rider.name} (${rider.vehicle}) assigned to Order ${orderId}. Approaching outlet...`)
    addLog(`SYSTEM: DRIVER DISPATCHED for Order ${orderId}. Match sequence confirmed.`)

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
          addLog(`SYSTEM: Order ${orderId} successfully handed off to rider ${rider.name}. Rider departed.`)
          addLog(`AI MODEL: Prevented ${savings} minutes of rider idle time in this cycle.`)
        }, 0)

        // Remove from list and generate a new random order to renew the queue (context-aware dishes)
        let updatedOrders = current.filter(o => o.id !== orderId)

        const dishes = locationsConfig[selectedLocation].dishes
        const randomDish = dishes[Math.floor(Math.random() * dishes.length)]
        const basePrep = Math.floor(Math.random() * 15) + 10 // 10 to 24 mins
        const itemsCount = Math.floor(Math.random() * 3) + 1
        const inflatedManualEstimate = basePrep + Math.floor(Math.random() * 6) + 4
        const newId = `G${1250 + Math.floor(Math.random() * 500)}`

        const newOrderObj = {
          id: newId,
          dish: randomDish,
          items: itemsCount,
          stage: 'Queued',
          progress: 5,
          manualEstimate: inflatedManualEstimate,
          aiBaseTime: basePrep
        }

        updatedOrders.push(newOrderObj)
        
        setTimeout(() => {
          addLog(`AI MODEL: New ticket enqueued automatically. Order ${newId} (${randomDish}) added to queue.`)
        }, 0)

        return updatedOrders
      })

      // Reset dispatch state for the next epoch
      setIsDispatched(false)
    }, 3500)
  }

  // 2. Countdown Timer ticking every second + Dynamic Kitchen Order Progress updates!
  // Count down ticks smoothly by 1 second every second until dispatch threshold is met.
  useEffect(() => {
    const timer = setInterval(() => {
      if (isRefreshingRef.current) return

      const currentOrders = ordersRef.current
      if (currentOrders.length === 0) return

      let cookingCount = currentOrders.filter(o => o.stage === 'Cooking').length
      let newlyReadyOrders = []

      const updatedOrders = currentOrders.map((order) => {
        // If Cooking, increase progress
        if (order.stage === 'Cooking') {
          const currentSpeed = speedRef.current
          // Fast: 3%, Slow: 1%, Normal: 2% progress increment per second
          const increment = currentSpeed === 3 ? 3 : currentSpeed === 1 ? 1 : 2
          const nextProgress = Math.min(100, order.progress + increment)
          const isFinished = nextProgress === 100

          if (isFinished && order.progress < 100) {
            newlyReadyOrders.push(order.id)
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

      // Update orders state synchronously
      setOrders(updatedOrders)

      if (newlyReadyOrders.length > 0) {
        // Auto-dispatch the first newly ready order immediately
        const orderIdToDispatch = newlyReadyOrders[0]
        setTimeout(() => {
          dispatchOrder(true, orderIdToDispatch)
        }, 500)
      }

      // Calculate countdown dynamically based on cooking progress:
      // Auto dispatch is triggered exactly 2 minutes before the oldest cooking order is ready!
      const currentlyDispatched = isDispatchedRef.current

      if (currentlyDispatched) {
        setCountdown(0)
      } else {
        const cooking = updatedOrders.filter(o => o.stage === 'Cooking')
        if (cooking.length > 0) {
          // Sort descending to get the oldest (closest to complete) cooking order
          const oldest = cooking.sort((a, b) => b.progress - a.progress)[0]
          const currentSpeed = speedRef.current
          const activeFactor = currentSpeed === 1 ? 1.25 : currentSpeed === 3 ? 0.75 : 1.0
          const scaledAiTime = Math.max(1, Math.round(oldest.aiBaseTime * activeFactor))
          const increment = currentSpeed === 3 ? 3 : currentSpeed === 1 ? 1 : 2

          // Dispatch happens at the threshold where remaining cooking time is 2 minutes
          const dispatchProgressThreshold = ((scaledAiTime - 2) / scaledAiTime) * 100
          const remainingProgress = dispatchProgressThreshold - oldest.progress
          const timeUntilDispatch = Math.max(0, Math.ceil(remainingProgress / increment))
          
          setCountdown(timeUntilDispatch)

          // If remaining cook time is <= 2 minutes (progress meets or exceeds threshold), auto dispatch!
          if (oldest.progress >= dispatchProgressThreshold) {
            dispatchOrder(true, oldest.id)
          }
        } else {
          // If no cooking orders, look at queued orders
          const queued = updatedOrders.filter(o => o.stage === 'Queued')
          if (queued.length > 0) {
            const firstQueued = queued[0]
            const currentSpeed = speedRef.current
            const activeFactor = currentSpeed === 1 ? 1.25 : currentSpeed === 3 ? 0.75 : 1.0
            const scaledAiTime = Math.max(1, Math.round(firstQueued.aiBaseTime * activeFactor))
            setCountdown(Math.max(0, Math.round((scaledAiTime - 2) * 60)))
          } else {
            setCountdown(0)
          }
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto scroll disabled by request

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

  // 4. Handle Location Switching (preserves current state in cache)
  const handleLocationChange = (e) => {
    const newLoc = e.target.value
    
    // Save current location data to cache first including metrics history
    if (locationCache.current[selectedLocation]) {
      locationCache.current[selectedLocation] = {
        orders: orders,
        riderSavedMinutes: riderSavedMinutes,
        metricsHistory: metricsHistory
      }
    }

    setSelectedLocation(newLoc)
    setIsRefreshing(true)
    setIsDispatched(false)

    // Log the initiation of the fetch
    const currentSimTime = getFormattedTime()
    setLogs(prev => [...prev, `[${currentSimTime}] SYSTEM: Shifting merchant outlet context to [${newLoc}]...`])

    setTimeout(() => {
      // Load cache data
      const cached = locationCache.current[newLoc]
      setOrders(cached.orders)
      setRiderSavedMinutes(cached.riderSavedMinutes)
      setMetricsHistory(cached.metricsHistory)
      
      // Recalculate countdown immediately for the new location's orders!
      const cooking = cached.orders.filter(o => o.stage === 'Cooking')
      if (cooking.length > 0) {
        const oldest = cooking.sort((a, b) => b.progress - a.progress)[0]
        const currentSpeed = speedRef.current
        const activeFactor = currentSpeed === 1 ? 1.25 : currentSpeed === 3 ? 0.75 : 1.0
        const scaledAiTime = Math.max(1, Math.round(oldest.aiBaseTime * activeFactor))
        const increment = currentSpeed === 3 ? 3 : currentSpeed === 1 ? 1 : 2
        const dispatchProgressThreshold = ((scaledAiTime - 2) / scaledAiTime) * 100
        const remainingProgress = dispatchProgressThreshold - oldest.progress
        setCountdown(Math.max(0, Math.ceil(remainingProgress / increment)))
      } else {
        const queued = cached.orders.filter(o => o.stage === 'Queued')
        if (queued.length > 0) {
          const firstQueued = queued[0]
          const currentSpeed = speedRef.current
          const activeFactor = currentSpeed === 1 ? 1.25 : currentSpeed === 3 ? 0.75 : 1.0
          const scaledAiTime = Math.max(1, Math.round(firstQueued.aiBaseTime * activeFactor))
          setCountdown(Math.max(0, Math.round((scaledAiTime - 2) * 60)))
        } else {
          setCountdown(0)
        }
      }

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
    dispatchOrder(false)
  }

  // 7. Action: Dismiss Order Row (X button) with Order Renewal
  const handleDismissOrder = (id, orderItem) => {
    setOrders(current => {
      let updatedOrders = current.filter(o => o.id !== id)

      // Calculate time saved on this order to add to our "Rider Wait Saved"
      const scaledAiTime = Math.max(1, Math.round(orderItem.aiBaseTime * speedFactor))
      const savings = Math.max(0, orderItem.manualEstimate - scaledAiTime)
      setRiderSavedMinutes(prev => prev + savings)

      // Generate a new random order to renew the queue (context-aware)
      const dishes = locationsConfig[selectedLocation].dishes
      const randomDish = dishes[Math.floor(Math.random() * dishes.length)]
      const basePrep = Math.floor(Math.random() * 15) + 10 // 10 to 24 mins
      const itemsCount = Math.floor(Math.random() * 3) + 1
      const inflatedManualEstimate = basePrep + Math.floor(Math.random() * 6) + 4
      const newId = `G${1250 + Math.floor(Math.random() * 500)}`

      const newOrderObj = {
        id: newId,
        dish: randomDish,
        items: itemsCount,
        stage: 'Queued',
        progress: 5,
        manualEstimate: inflatedManualEstimate,
        aiBaseTime: basePrep
      }

      updatedOrders.push(newOrderObj)

      // Immediately calculate the new countdown based on updatedOrders!
      const cooking = updatedOrders.filter(o => o.stage === 'Cooking')
      if (cooking.length > 0) {
        const oldest = cooking.sort((a, b) => b.progress - a.progress)[0]
        const orderScaledAiTime = Math.max(1, Math.round(oldest.aiBaseTime * speedFactor))
        const remainingMinutes = (1 - oldest.progress / 100) * orderScaledAiTime
        const timeUntilDispatch = Math.max(0, Math.round((remainingMinutes - 2) * 60))
        setCountdown(timeUntilDispatch)
      } else {
        const queued = updatedOrders.filter(o => o.stage === 'Queued')
        if (queued.length > 0) {
          const firstQueued = queued[0]
          const orderScaledAiTime = Math.max(1, Math.round(firstQueued.aiBaseTime * speedFactor))
          setCountdown(Math.max(0, Math.round((orderScaledAiTime - 2) * 60)))
        } else {
          setCountdown(0)
        }
      }

      setTimeout(() => {
        addLog(`USER EVENT: Dismissed Order ${id} (${orderItem.dish}). Order finalized. AI prevented ${savings} minutes of rider waiting.`)
        addLog(`AI MODEL: Re-calibrated dispatch scheduler. Dispatch countdown recalculated to reflect remaining cook times.`)
        addLog(`AI MODEL: New ticket enqueued automatically. Order ${newId} (${randomDish}) added to queue.`)
      }, 0)

      return updatedOrders
    })
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

  // 9. Interactive Trigger: Lunch Rush SURGE
  const handleLunchRushSurge = () => {
    if (isLunchRush) {
      setIsLunchRush(false)
      setSpeed(2)
      addLog("USER EVENT: Deactivated Peak Lunch Rush simulation.")
      return
    }

    setIsLunchRush(true)
    setSpeed(3) // Fast kitchen speed

    // Generate 3 urgent rush-hour tickets
    const rushOrders = [
      { id: `G${1200 + Math.floor(Math.random() * 50)}`, dish: "Laksa Premium Set (RUSH)", items: 2, stage: 'Cooking', progress: 30, manualEstimate: 30, aiBaseTime: 20 },
      { id: `G${1251 + Math.floor(Math.random() * 50)}`, dish: "Char Kway Teow (RUSH)", items: 3, stage: 'Queued', progress: 5, manualEstimate: 22, aiBaseTime: 12 },
      { id: `G${1301 + Math.floor(Math.random() * 50)}`, dish: "Hainanese Chicken Rice (RUSH)", items: 1, stage: 'Queued', progress: 5, manualEstimate: 20, aiBaseTime: 14 }
    ]

    setOrders(prev => [...prev, ...rushOrders])
    
    addLog("USER EVENT: [CRITICAL LUNCH RUSH] Simulating peak rush. 3 urgent orders enqueued.")
    addLog("AI MODEL: Dynamic rider dispatch window compressed. Safety padding factor adjusted to 0.70x.")
    addLog("CV ANALYTICS: High kitchen occupancy count detected (6 cooking staff active).")
  }

  // Live sparklines data generation every 3 seconds
  const activeOrdersCount = orders.length
  const kitchenLoad = useMemo(() => {
    if (activeOrdersCount === 0) return 30
    return Math.min(99, Math.max(35, 50 + activeOrdersCount * 8 + (isLunchRush ? 15 : 0)))
  }, [activeOrdersCount, isLunchRush])

  const etaConfidence = useMemo(() => {
    if (kitchenLoad > 85) return 92
    if (kitchenLoad < 60) return 96
    return locationsConfig[selectedLocation].baseConfidence
  }, [kitchenLoad, selectedLocation])

  const financialROI = useMemo(() => {
    return (riderSavedMinutes * 3.50).toFixed(2)
  }, [riderSavedMinutes])

  useEffect(() => {
    const historyTimer = setInterval(() => {
      setMetricsHistory(prev => {
        const appendVal = (arr, val) => [...arr.slice(1), val]
        return {
          kitchenLoad: appendVal(prev.kitchenLoad, kitchenLoad),
          activeOrders: appendVal(prev.activeOrders, activeOrdersCount),
          confidence: appendVal(prev.confidence, etaConfidence),
          savedTime: appendVal(prev.savedTime, riderSavedMinutes),
          roi: appendVal(prev.roi, parseFloat(financialROI))
        }
      })
    }, 3000)
    return () => clearInterval(historyTimer)
  }, [kitchenLoad, activeOrdersCount, etaConfidence, riderSavedMinutes, financialROI])

  // Sparkline Path Generator Helper
  const getSparklinePath = (data, width = 140, height = 35) => {
    if (!data || data.length < 2) return { strokePath: "", fillPath: "" }
    const minVal = Math.min(...data)
    const maxVal = Math.max(...data)
    const range = maxVal - minVal || 1
    
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - 2 - ((val - minVal) / range) * (height - 6)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    
    const strokePath = `M ${points.join(' L ')}`
    const fillPath = `${strokePath} L ${width},${height} L 0,${height} Z`
    return { strokePath, fillPath }
  }

  // Filter logs for terminal view
  const filteredLogs = useMemo(() => {
    if (logFilter === "all") return logs
    return logs.filter(log => {
      if (logFilter === "ai" && log.includes("AI MODEL:")) return true
      if (logFilter === "vision" && log.includes("CV ANALYTICS:")) return true
      if (logFilter === "engine" && log.includes("GRAB ENGINE:")) return true
      if (logFilter === "system" && log.includes("SYSTEM:")) return true
      if (logFilter === "user" && (log.includes("USER EVENT:") || log.includes("AUTOMATED EVENT:"))) return true
      return false
    })
  }, [logs, logFilter])

  // Map bezier coordinate interpolation logic for rider scooter path
  const pA = { x: 40, y: 190 }
  const pB = { x: 180, y: 120 }
  const pC = { x: 380, y: 70 }

  const getBezierPoint = (p0, p1, p2, t) => {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y
    return { x, y }
  }

  const riderCoords = useMemo(() => {
    if (!isDispatched) return pA
    
    if (riderProgress < 40) {
      // Approach phase (0% to 40%)
      const t = riderProgress / 40
      return getBezierPoint(pA, { x: 90, y: 150 }, pB, t)
    } else if (riderProgress < 60) {
      // Arrived / Loading phase (40% to 60%)
      return pB
    } else {
      // Delivery departure phase (60% to 100%)
      const t = (riderProgress - 60) / 40
      return getBezierPoint(pB, { x: 280, y: 110 }, pC, t)
    }
  }, [riderProgress, isDispatched])

  const mapStatusText = useMemo(() => {
    if (!isDispatched) return "Dispatcher idle. Waiting to trigger rider assignment..."
    if (riderProgress < 40) return `Rider ${currentRider.name} approaching kitchen...`
    if (riderProgress < 60) return "Rider arrived at outlet. Handing over fresh package."
    return "Departure sequence complete. En route to client address."
  }, [riderProgress, isDispatched, currentRider])

  // Dynamic cooking status checks for camera overlay
  const cookingOrdersCount = orders.filter(o => o.stage === 'Cooking').length
  const readyOrdersCount = orders.filter(o => o.stage === 'Ready').length

  // Process rows with scaled values
  const processedOrders = useMemo(() => {
    return orders.map(order => {
      const scaledAiTime = Math.max(1, Math.round(order.aiBaseTime * speedFactor))
      const delta = order.manualEstimate - scaledAiTime
      return {
        ...order,
        scaledAiTime,
        delta
      }
    })
  }, [orders, speedFactor])

  // Circular timer details
  const totalCircleSeconds = useMemo(() => {
    const cooking = orders.filter(o => o.stage === 'Cooking')
    if (cooking.length > 0) {
      const oldest = cooking.sort((a, b) => b.progress - a.progress)[0]
      const scaledAiTime = Math.max(1, Math.round(oldest.aiBaseTime * speedFactor))
      return Math.max(60, (scaledAiTime - 2) * 60)
    }
    const queued = orders.filter(o => o.stage === 'Queued')
    if (queued.length > 0) {
      const firstQueued = queued[0]
      const scaledAiTime = Math.max(1, Math.round(firstQueued.aiBaseTime * speedFactor))
      return Math.max(60, (scaledAiTime - 2) * 60)
    }
    return 336
  }, [orders, speedFactor])
  const circleProgressPct = totalCircleSeconds > 0 ? (countdown / totalCircleSeconds) * 100 : 0
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

  // Dynamic timestamps for dispatch ETA and handover completion based on current simulated clock
  const dispatchTimeStr = useMemo(() => {
    const dispatchDate = new Date(currentTime.getTime() + countdown * 1000)
    return dispatchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }, [currentTime, countdown])

  const handoverTimeStr = useMemo(() => {
    const dispatchDate = new Date(currentTime.getTime() + countdown * 1000)
    const handoverDate = new Date(dispatchDate.getTime() + 120 * 1000) // 2-minute plating buffer
    return handoverDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }, [currentTime, countdown])

  // Map dish names to Emojis and Colors for beautiful table details
  const getDishDetails = (dishName) => {
    const lower = dishName.toLowerCase()
    if (lower.includes("chicken rice")) return { emoji: "🍛", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" }
    if (lower.includes("laksa")) return { emoji: "🍜", color: "bg-red-500/10 text-red-400 border-red-500/20" }
    if (lower.includes("burger")) return { emoji: "🍔", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" }
    if (lower.includes("rendang") || lower.includes("sate") || lower.includes("satay")) return { emoji: "🍢", color: "bg-amber-500/10 text-amber-300 border-amber-500/20" }
    if (lower.includes("kway teow") || lower.includes("goreng") || lower.includes("mee ")) return { emoji: "🍝", color: "bg-amber-500/10 text-yellow-300 border-yellow-500/20" }
    if (lower.includes("prata")) return { emoji: "🥞", color: "bg-yellow-500/10 text-amber-200 border-amber-500/20" }
    if (lower.includes("cendol") || lower.includes("es ")) return { emoji: "🥤", color: "bg-teal-500/10 text-teal-300 border-teal-500/20" }
    return { emoji: "🍱", color: "bg-slate-500/10 text-slate-300 border-slate-500/20" }
  }

  return (
    <div className={`relative flex min-h-screen text-[#E6F4ED] antialiased select-none transition-all duration-1000 ${
      isLunchRush ? 'animate-emergency' : 'bg-[#050A07]'
    }`}>
      
      {/* BACKGROUND GLOW ORBS */}
      <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-[#00B14F] filter blur-[150px] opacity-[0.08] pointer-events-none animate-orb-1 z-0"></div>
      <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#CFFF3D] filter blur-[160px] opacity-[0.05] pointer-events-none animate-orb-2 z-0"></div>

      {/* 1. LEFT GLOBAL SIDEBAR */}
      <aside className="fixed bottom-0 top-0 left-0 hidden w-64 glass-sidebar p-6 md:block z-40">
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-8">
            
            {/* Grab Sense Logo Header */}
            <div className="flex items-center gap-3">
              <LogoIcon className="h-11 w-11" />
              <div>
                <span className="text-lg font-black tracking-tight text-white block leading-none">
                  Grab<span className="bg-gradient-to-r from-[#00B14F] to-[#CFFF3D] bg-clip-text text-transparent font-extrabold">Sense</span>
                </span>
                <span className="block text-[7.5px] font-black tracking-widest text-[#CFFF3D] uppercase mt-1.5 leading-none font-mono">
                  Link Smarter, Move Faster
                </span>
              </div>
            </div>

            {/* Navigation Section */}
            <nav className="space-y-6">
              <div>
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-[#8DA99C] mb-3">AI Ecosystem Modules</p>
                <div className="space-y-1.5">
                  
                  {/* Phase 1: Active */}
                  <button className="flex w-full items-center justify-between rounded-xl bg-[#00B14F]/10 border border-[#00B14F]/20 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#00B14F]/15">
                    <div className="flex items-center gap-2.5">
                      <ChefHat className="h-4 w-4 text-[#00B14F]" />
                      <span>Phase 1: Kitchen Readiness</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-[#00B14F]" />
                  </button>

                  {/* Locked Modules with premium encrypted style */}
                  {[
                    { title: "Phase 2: Parking Intelligence", step: "LOCKED" },
                    { title: "Phase 3: Driver Safety AI", step: "LOCKED" },
                    { title: "Phase 4: Smart Pickup Hubs", step: "LOCKED" },
                    { title: "Phase 5: Logistics Analytics", step: "LOCKED" }
                  ].map((phase, idx) => (
                    <div key={idx} className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-500 border border-transparent cursor-not-allowed transition hover:bg-white/[0.02]">
                      <div className="flex items-center gap-2.5">
                        <Lock className="h-3.5 w-3.5 opacity-55" />
                        <span className="opacity-75">{phase.title}</span>
                      </div>
                      <span className="rounded bg-white/[0.04] border border-white/5 px-1.5 py-0.5 text-[7px] font-bold tracking-wider text-slate-400">{phase.step}</span>
                    </div>
                  ))}

                </div>
              </div>
            </nav>

            {/* Dynamic Edge Engine Diagnostics panel */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8DA99C] block">AI Edge Engine Diagnostics</span>
              <div className="space-y-2 text-[10px] text-slate-400 font-mono">
                <div className="flex justify-between border-b border-white/[0.03] pb-1">
                  <span>Temperature:</span>
                  <span className={`font-bold ${edgeTemperature > 43 ? 'text-amber-400' : 'text-emerald-400'}`}>{edgeTemperature} °C</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1">
                  <span>Core Model:</span>
                  <span className="text-white">YOLOv8-GrabCook</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-1">
                  <span>Inference:</span>
                  <span className="text-emerald-400 font-bold">{inferenceTime}ms (Active)</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span>Edge Nodes:</span>
                  <span className="text-white">{selectedLocation.includes("Orchard") ? "Orchard-CV-01" : selectedLocation.includes("Bandung") ? "Bandung-CV-02" : "CentralHub-CV-09"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* System Telemetry Tag bottom */}
          <div className="rounded-xl bg-gradient-to-tr from-[#004A26]/50 to-[#00B14F]/10 p-3.5 text-[10px] text-[#8DA99C] border border-[#00B14F]/15">
            <span className="font-bold text-white block mb-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#00B14F] inline-block animate-pulse"></span>
              SECURE TLS CONNECTED
            </span>
            <span>Real-time cryptographic pipeline synchronized to central Grab dispatch hubs.</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 flex-col md:pl-64 z-10">
        
        {/* 2. TOP BAR */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between glass-header px-6 md:px-10">
          <div className="flex items-center gap-2.5">
            <div className="md:hidden">
              <LogoIcon className="h-9 w-9" />
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-white md:text-base flex items-center gap-2">
              <span className="md:inline hidden text-[9px] bg-white/[0.04] text-[#CFFF3D] border border-white/5 font-mono px-2 py-0.5 rounded tracking-widest font-black uppercase">PROD-v4.12</span>
              <span>Operations Command Center</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Live Indicator */}
            <div className="flex items-center gap-2.5 rounded-full border border-[#00B14F]/30 bg-[#00B14F]/10 px-3.5 py-1 text-[11px] font-extrabold tracking-wider text-[#CFFF3D]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B14F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B14F]"></span>
              </span>
              LIVE ARBITRAGE
            </div>

            {/* Enterprise Multi-Store Switcher Dropdown */}
            <div className="relative">
              <label htmlFor="location-switcher" className="sr-only">Select Location</label>
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] px-3.5 py-1.5 text-xs font-bold text-white transition focus-within:ring-1 focus-within:ring-[#00B14F]/50">
                <MapPin className="h-4 w-4 text-[#00B14F]" />
                <select
                  id="location-switcher"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  disabled={isRefreshing}
                  className="bg-transparent pr-2 font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="McDonald's - Orchard Road" className="bg-[#050A07] text-[#E6F4ED]">McDonald's - Orchard Road</option>
                  <option value="KFC - Bandung Junction" className="bg-[#050A07] text-[#E6F4ED]">KFC - Bandung Junction</option>
                  <option value="GrabKitchen - Central Hub" className="bg-[#050A07] text-[#E6F4ED]">GrabKitchen - Central Hub</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6 md:p-10 space-y-6 relative z-10">
          
          {/* Subtle Location Change Loader Overlay */}
          {isRefreshing && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050A07]/90 backdrop-blur-md transition-all duration-300">
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-8 shadow-2xl max-w-sm text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-[#CFFF3D] glow-lime" />
                <div>
                  <h4 className="font-extrabold text-white text-base">SYNCING GLOBAL TELEMETRY</h4>
                  <p className="text-xs text-[#8DA99C] mt-1.5">Recalculating CV parameters, mapping driver grid vectors, and downloading cache for {selectedLocation}...</p>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled System Update Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-[#00B14F]/25 bg-gradient-to-r from-[#004A26]/30 via-white/[0.01] to-[#CFFF3D]/5 px-4.5 py-3 text-xs text-slate-300 shadow-md gap-3 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00B14F] shadow-[0_0_15px_#00B14F]"></div>
            <div className="flex items-center gap-3 pl-1.5">
              <Sparkles className="h-4.5 w-4.5 text-[#CFFF3D] animate-pulse" />
              <div>
                <h4 className="font-extrabold text-white text-[11px] tracking-wide uppercase flex items-center gap-1.5">
                  SYSTEM UPDATE EN ROUTE: GRAB SENSE ENGINE v5.0-BETA
                </h4>
                <p className="text-[10px] text-[#8DA99C] mt-0.5 leading-snug">
                  Our next major edge platform upgrade is scheduled for deployment on <span className="text-[#CFFF3D] font-mono font-bold">July 30 at 02:00 UTC</span>. Live operations will remain uninterrupted during node calibrations.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:self-center self-end">
              <span className="rounded bg-[#CFFF3D]/10 border border-[#CFFF3D]/30 px-2 py-0.5 text-[8px] font-black uppercase text-[#CFFF3D] tracking-widest animate-pulse">
                v5.0 Upgrade Scheduled
              </span>
            </div>
          </div>

          {/* Peak Demand flash alert warning */}
          {isLunchRush && (
            <div className="flex items-center justify-between rounded-xl border border-red-500/35 bg-red-950/20 px-4 py-3 text-red-200 shadow-md animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 glow-red animate-bounce" />
                <div>
                  <h4 className="text-xs font-extrabold tracking-wide uppercase text-red-400">Peak Demand Emergency Mode Active</h4>
                  <p className="text-[10px] text-red-300/80">CCTV edge node reports high queue congestion. Dispatch windows are compressed to minimize rider idling.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsLunchRush(false)
                  setSpeed(2)
                  addLog("USER EVENT: Deactivated Lunch Rush mode. Kitchen speed reverted to Normal.")
                }}
                className="rounded bg-red-500/20 px-3 py-1.5 text-[10px] font-black uppercase text-red-400 border border-red-500/40 hover:bg-red-500/35 hover:text-white transition"
              >
                Deactivate Rush
              </button>
            </div>
          )}

          {/* 3. METRICS ROW (Ticking live with SVGs!) */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                title: "Kitchen Load",
                val: `${kitchenLoad}%`,
                history: metricsHistory.kitchenLoad,
                status: "Active load prediction",
                statusColor: "bg-amber-500 animate-pulse",
                icon: Activity,
                color: "text-[#00B14F]",
                gradId: "loadGrad",
                gradColor: "#00B14F"
              },
              {
                title: "Active Orders",
                val: activeOrdersCount,
                history: metricsHistory.activeOrders,
                status: "Across prep stations",
                statusColor: "bg-[#00B14F]",
                icon: Users,
                color: "text-[#CFFF3D]",
                gradId: "ordersGrad",
                gradColor: "#CFFF3D"
              },
              {
                title: "Confidence Score",
                val: `${etaConfidence}%`,
                history: metricsHistory.confidence,
                status: "Dynamic SLA Certitude",
                statusColor: "bg-emerald-400",
                icon: TrendingUp,
                color: "text-emerald-400",
                gradId: "confGrad",
                gradColor: "#10B981"
              },
              {
                title: "Rider Wait Saved",
                val: `${riderSavedMinutes} min`,
                history: metricsHistory.savedTime,
                status: "Compared to default",
                statusColor: "bg-cyan-400 animate-pulse",
                icon: Clock3,
                color: "text-cyan-400",
                gradId: "savedGrad",
                gradColor: "#06B6D4"
              },
              {
                title: "Financial ROI",
                val: `$${financialROI}`,
                history: metricsHistory.roi,
                status: "Driver idle costs saved",
                statusColor: "bg-yellow-400",
                icon: DollarSign,
                color: "text-[#CFFF3D]",
                gradId: "roiGrad",
                gradColor: "#CFFF3D"
              }
            ].map((metric, idx) => {
              const { strokePath, fillPath } = getSparklinePath(metric.history)
              return (
                <div key={idx} className="relative overflow-hidden rounded-2xl glass-card p-5 pb-8 shadow-sm flex flex-col justify-between h-[120px]">
                  
                  {/* Background sparkline svg */}
                  <div className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-[0.15] pointer-events-none">
                    <svg className="h-full w-full" viewBox="0 0 140 35" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={metric.gradId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={metric.gradColor} stopOpacity="0.4" />
                          <stop offset="100%" stopColor={metric.gradColor} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={fillPath} fill={`url(#${metric.gradId})`} />
                      <path d={strokePath} fill="none" stroke={metric.gradColor} strokeWidth="1.5" />
                    </svg>
                  </div>

                  <div className="flex items-start justify-between z-10">
                    <span className="text-[10px] font-extrabold text-[#8DA99C] uppercase tracking-wider">{metric.title}</span>
                    <metric.icon className={`h-4.5 w-4.5 ${metric.color}`} />
                  </div>
                  <div className="mt-1 flex items-baseline gap-2 z-10">
                    <span className="text-2xl font-black tracking-tight text-white">{metric.val}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[9px] text-[#8DA99C] z-10 font-medium">
                    <span className={`h-1.5 w-1.5 rounded-full ${metric.statusColor}`}></span>
                    <span>{metric.status}</span>
                  </div>
                </div>
              )
            })}
          </section>

          {/* TWO-COLUMN LAYOUT */}
          <div className="grid gap-6 lg:grid-cols-[1.45fr_.8fr]">
            
            {/* COLUMN 1 */}
            <div className="space-y-6">
              
              {/* 4. LIVE COMPUTER VISION STREAM OR LIVE GPS MAP VIEW */}
              <article className="rounded-2xl glass-card p-5 shadow-sm relative overflow-hidden">
                
                {/* Mode Selector and Titles */}
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#CFFF3D] flex items-center gap-1.5">
                      <Cpu className="h-3 w-3 animate-pulse" />
                      <span>{viewMode === "cctv" ? `Vision Model Feed: ${selectedLocation.includes("Orchard") ? "CAM_ORCHARD_01" : selectedLocation.includes("Bandung") ? "CAM_BANDUNG_01" : "CAM_GRABKITCHEN_01"}` : "Dynamic Logistics Routing Matrix"}</span>
                    </p>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {viewMode === "cctv" ? "Continuous Spatial Occupancy Tracking" : "Simulated GPS Courier Matching"}
                    </h3>
                  </div>

                  {/* View Toggler Tabs */}
                  <div className="flex items-center rounded-lg bg-black/40 p-1 border border-white/5">
                    <button
                      onClick={() => setViewMode("cctv")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                        viewMode === "cctv" ? 'bg-[#00B14F] text-white shadow' : 'text-[#8DA99C] hover:text-white'
                      }`}
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>CCTV Feed</span>
                    </button>
                    <button
                      onClick={() => setViewMode("map")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                        viewMode === "map" ? 'bg-[#00B14F] text-white shadow' : 'text-[#8DA99C] hover:text-white'
                      }`}
                    >
                      <Map className="h-3.5 w-3.5" />
                      <span>Live Rider Map</span>
                    </button>
                  </div>
                </div>

                {/* THE VIEW SCREEN */}
                {viewMode === "cctv" ? (
                  /* CCTV CAMERA STREAM VIEW */
                  <div className="relative h-[290px] overflow-hidden rounded-xl bg-[#090F0C] text-white shadow-2xl font-mono border border-[#00B14F]/10 animate-cctv-flicker">
                    
                    {/* Kitchen Tiling floor lines (CSS Gradients) */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                      backgroundImage: `
                        radial-gradient(#202923 1px, transparent 1px),
                        repeating-linear-gradient(0deg, transparent, transparent 19px, #000 19px, #000 20px),
                        repeating-linear-gradient(90deg, transparent, transparent 19px, #000 19px, #000 20px)
                      `,
                      backgroundSize: '20px 20px'
                    }} />

                    {/* CCTV Text Overlay */}
                    <div className="absolute left-4 top-4 z-20 flex flex-col text-[8px] tracking-wide text-white/70 leading-3 bg-black/50 backdrop-blur-sm border border-white/5 px-2.5 py-1.5 rounded">
                      <div className="flex items-center gap-1 text-red-500 font-black">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
                        <span>CCTV REC</span>
                      </div>
                      <span className="text-[7.5px] mt-0.5 text-slate-400">CAM-01 / PREP_FLOOR</span>
                      <span className="text-[7.5px] text-slate-400">2026-07-15 {cctvTimeStr}</span>
                      <span className="text-[7.5px] text-[#CFFF3D] font-bold">LATENCY: {cctvLatency}s | FPS: {cctvFps}</span>
                    </div>

                    {/* 1. WOK STATION (Dynamic Cook details based on orders) */}
                    <div className="absolute left-[5%] top-[15%] w-[150px] h-[135px] rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 border border-slate-600 shadow-[0_12px_24px_rgba(0,0,0,0.5)] p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-around w-full">
                        
                        {/* Burner 1 */}
                        <div className="relative h-12 w-12 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-inner flex items-center justify-center">
                          {cookingOrdersCount > 0 && (
                            <div className="absolute inset-1.5 rounded-full bg-gradient-to-t from-orange-600 via-red-600 to-amber-300 animate-flame"></div>
                          )}
                          <div className="absolute inset-0.5 rounded-full bg-zinc-900 border border-slate-700 shadow-md flex items-center justify-center">
                            {cookingOrdersCount > 0 && (
                              <div className="h-3 w-3 rounded-full bg-[#CFFF3D] animate-ping opacity-60"></div>
                            )}
                          </div>
                          {cookingOrdersCount > 0 && (
                            <>
                              <div className="absolute -top-6 left-2 text-white/20 select-none pointer-events-none text-xs font-sans filter blur-[1.5px] animate-steam-1">♨</div>
                              <div className="absolute -top-8 left-4 text-white/10 select-none pointer-events-none text-xs font-sans filter blur-[2px] animate-steam-2">♨</div>
                            </>
                          )}
                        </div>

                        {/* Burner 2 */}
                        <div className="relative h-12 w-12 rounded-full bg-zinc-800 border-2 border-zinc-950 shadow-inner flex items-center justify-center">
                          {cookingOrdersCount > 1 && (
                            <div className="absolute inset-1.5 rounded-full bg-gradient-to-t from-orange-600 via-red-600 to-amber-300 animate-flame"></div>
                          )}
                          <div className="absolute inset-0.5 rounded-full bg-zinc-900 border border-slate-700 shadow-md flex items-center justify-center">
                            {cookingOrdersCount > 1 && (
                              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                            )}
                          </div>
                          {cookingOrdersCount > 1 && (
                            <div className="absolute -top-7 right-2 text-white/25 select-none pointer-events-none text-xs font-sans filter blur-[1px] animate-steam-3">♨</div>
                          )}
                        </div>
                      </div>

                      {/* Station Countertop */}
                      <div className="w-full flex justify-between px-1">
                        <div className="h-4 w-7 rounded bg-amber-900/40 border border-amber-800 flex items-center justify-center text-[5px] text-amber-200 font-bold">BOARD</div>
                        <div className="h-4 w-4 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-[5px] text-emerald-300">HERB</div>
                      </div>

                      {/* Overhead Chef Hat */}
                      <div className="absolute -bottom-6 left-[40%] flex flex-col items-center z-10">
                        <div className="h-8 w-8 rounded-full bg-white shadow-lg border border-slate-300 flex items-center justify-center animate-chef-head">
                          <span className="text-[6px] font-black text-slate-800">CHEF_1</span>
                        </div>
                        <div className="h-4 w-12 rounded-t-full bg-slate-900 border border-slate-950 -mt-1 shadow animate-chef-work"></div>
                      </div>
                    </div>

                    {/* 2. GRILL STATION */}
                    <div className="absolute left-[44%] top-[18%] w-[130px] h-[125px] rounded-lg bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 shadow-[0_12px_24px_rgba(0,0,0,0.5)] p-1.5 flex flex-col justify-between">
                      <div className="h-[65px] w-full rounded bg-zinc-900 border border-zinc-950 p-1 relative overflow-hidden flex flex-col justify-around animate-grill-heat">
                        
                        {/* Red Heating rods */}
                        <div className="absolute inset-0 opacity-25" style={{
                          backgroundImage: 'repeating-linear-gradient(90deg, #ea580c, #ea580c 3px, transparent 3px, transparent 12px)'
                        }} />
                        
                        {/* Grill patties */}
                        <div className="flex justify-around relative z-10">
                          <div className="h-4 w-4 rounded-full bg-amber-950 border border-amber-900 shadow flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                          </div>
                          <div className="h-4 w-4 rounded-full bg-amber-950 border border-amber-900 shadow"></div>
                        </div>
                        <div className="flex justify-around relative z-10">
                          <div className="h-4 w-4 rounded-full bg-amber-950 border border-amber-900 shadow"></div>
                          <div className="h-4 w-4 rounded-full bg-amber-950 border border-amber-900 shadow flex items-center justify-center">
                            <div className="h-1 w-1 rounded-full bg-orange-500 animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="w-full h-3 bg-zinc-800 rounded border border-zinc-900 flex items-center justify-around px-1">
                        <span className="h-1 w-1 rounded-full bg-red-500"></span>
                        <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                      </div>

                      {/* Overhead Chef 2 */}
                      <div className="absolute -bottom-6 left-[30%] flex flex-col items-center z-10">
                        <div className="h-8 w-8 rounded-full bg-white shadow-lg border border-slate-300 flex items-center justify-center animate-chef-head">
                          <span className="text-[6px] font-black text-slate-800">CHEF_2</span>
                        </div>
                        <div className="h-4 w-12 rounded-t-full bg-slate-900 border border-slate-950 -mt-1 shadow animate-chef-work"></div>
                      </div>
                    </div>

                    {/* 3. PLATING STATION (Labels update dynamically based on ready orders) */}
                    <div className="absolute right-[5%] top-[12%] w-[125px] h-[140px] rounded-lg bg-gradient-to-bl from-slate-600 via-slate-500 to-slate-700 border border-slate-500 shadow-[0_12px_24px_rgba(0,0,0,0.5)] p-2 flex flex-col justify-between">
                      <div className="w-full h-[45px] rounded bg-amber-800/20 border border-amber-700/40 p-1 flex items-center justify-around shadow-inner">
                        <div className="h-3 w-3 rounded bg-emerald-500/80 shadow-sm"></div>
                        <div className="h-3 w-3 rounded-full bg-red-500/80 shadow-sm animate-pulse"></div>
                        <div className="h-1.5 w-6 rounded-sm bg-neutral-200/20 border border-neutral-200/30 rotate-12 text-[4px] flex items-center justify-center">KNIFE</div>
                      </div>

                      <div className="flex items-center justify-between w-full mt-1.5">
                        <div className="h-8 w-8 rounded-full bg-zinc-700/60 border border-slate-600 shadow-md flex items-center justify-center">
                          <div className="h-4 w-4 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-400"></div>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-zinc-700/60 border border-slate-600 shadow-md flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-red-400/80"></div>
                        </div>
                      </div>

                      {/* takeaway box */}
                      <div className="w-full flex justify-end">
                        <div className={`h-5 w-8 rounded flex items-center justify-center text-[5px] text-zinc-950 font-black shadow border border-[#CFFF3D]/40 ${
                          readyOrdersCount > 0 ? 'bg-[#CFFF3D] animate-pulse shadow-[0_0_10px_#CFFF3D]' : 'bg-[#CFFF3D]/20 text-[#CFFF3D]'
                        }`}>
                          {readyOrdersCount > 0 ? "FOOD_RDY" : "BOX_T"}
                        </div>
                      </div>

                      {/* Overhead Chef 3 */}
                      <div className="absolute -bottom-6 left-[25%] flex flex-col items-center z-10">
                        <div className="h-8 w-8 rounded-full bg-white shadow-lg border border-slate-300 flex items-center justify-center animate-chef-head">
                          <span className="text-[6px] font-black text-slate-800">CHEF_3</span>
                        </div>
                        <div className="h-4 w-12 rounded-t-full bg-slate-900 border border-slate-950 -mt-1 shadow animate-chef-work"></div>
                      </div>
                    </div>

                    {/* AI COMPUTER VISION BOUNDING BOX BRACKETS OVERLAYS */}
                    {/* Wok Bounding Box (Green) */}
                    <div className="absolute left-[3%] top-[10%] w-[155px] h-[145px] border border-emerald-500/40 bg-emerald-500/[0.02] rounded-lg pointer-events-none">
                      <span className="absolute top-1 left-2 bg-[#00B14F] text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow uppercase tracking-wider flex items-center gap-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse inline-block" />
                        WOK_STATION_01 (TEMP: {wokTemp}°C)
                      </span>
                      <span className="absolute bottom-1 right-2 font-mono text-[7px] text-emerald-400 font-semibold">MATCH: {matchScores.wok}%</span>
                    </div>

                    {/* Grill Bounding Box (Cyan) */}
                    <div className="absolute left-[42%] top-[12%] w-[135px] h-[135px] border border-cyan-500/30 bg-cyan-500/[0.02] rounded-lg pointer-events-none">
                      <span className="absolute top-1 left-2 bg-cyan-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow uppercase tracking-wider">
                        GRILL_01 (TEMP: {grillTemp}°C)
                      </span>
                      <span className="absolute bottom-1 right-2 font-mono text-[7px] text-cyan-300 font-semibold">MATCH: {matchScores.grill}%</span>
                    </div>

                    {/* Plating Bounding Box (Neon Yellow-Lime) */}
                    <div className="absolute right-[3%] top-[6%] w-[130px] h-[150px] border border-[#CFFF3D]/40 bg-[#CFFF3D]/[0.02] rounded-lg pointer-events-none">
                      <span className="absolute top-1 left-2 bg-[#CFFF3D] text-[#004A26] text-[7px] font-black px-1.5 py-0.5 rounded shadow uppercase tracking-wider">
                        PLATING_STATION_01
                      </span>
                      <span className="absolute bottom-1 right-2 font-mono text-[7px] text-[#CFFF3D] font-bold">MATCH: {matchScores.plating}%</span>
                    </div>

                    {/* CCTV Sweeping Scan line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00B14F] to-transparent shadow-[0_0_12px_#00B14F] opacity-60 pointer-events-none animate-scan-sweep" />

                    {/* CRT Scanline pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay" style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)'
                    }} />
                    {/* Vignette Shadow overlay */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]" />

                    {/* Overlay Metadata */}
                    <div className="absolute right-4 bottom-4 rounded border border-white/10 bg-black/85 backdrop-blur-sm p-2.5 font-mono text-[8px] leading-3 text-slate-300 shadow-xl z-20">
                      <strong className="text-[#CFFF3D] tracking-wider font-extrabold block mb-0.5 uppercase">CV Edge telemetry</strong>
                      <div>Inference: <span className="text-white">{inferenceTime}ms</span></div>
                      <div>Saved: <span className="text-[#00B14F] font-bold">+{riderSavedMinutes}m</span></div>
                      <div>Edge Node: <span className="text-[#CFFF3D]">{selectedLocation.includes("Orchard") ? "MS_ORC" : selectedLocation.includes("Bandung") ? "KFC_BDG" : "GK_CTR"}</span></div>
                    </div>

                  </div>
                ) : (
                  /* LIVE COURIER GPS SIMULATED MAP VIEW */
                  <div className="relative h-[290px] overflow-hidden rounded-xl bg-[#090F0C] border border-[#00B14F]/10 shadow-2xl">
                    
                    {/* Map Grid Pattern background */}
                    <div className="absolute inset-0 opacity-[0.06]" style={{
                      backgroundImage: 'radial-gradient(circle, #00B14F 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }} />

                    {/* Cyber Grid SVG Map */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 240">
                      
                      {/* Secondary aesthetic roads */}
                      <line x1="100" y1="20" x2="100" y2="220" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                      <line x1="20" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                      <line x1="300" y1="20" x2="420" y2="220" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                      <path d="M 30 50 L 470 50" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                      <path d="M 450 20 L 450 220" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />

                      {/* Primary courier delivery route tracks */}
                      {/* 1st segment: rider origin to restaurant */}
                      <path 
                        id="route-approach"
                        d="M 40 190 Q 90 150 180 120" 
                        stroke="rgba(0, 177, 79, 0.15)" 
                        strokeWidth="5" 
                        fill="none" 
                        strokeLinecap="round" 
                      />
                      <path 
                        d="M 40 190 Q 90 150 180 120" 
                        stroke="#00B14F" 
                        strokeWidth="1.5" 
                        strokeDasharray="4, 12" 
                        fill="none" 
                        strokeLinecap="round" 
                        className="animate-conveyor"
                        opacity={isDispatched && riderProgress < 40 ? 1 : 0.4}
                      />

                      {/* 2nd segment: restaurant to customer */}
                      <path 
                        id="route-deliver"
                        d="M 180 120 Q 280 110 380 70" 
                        stroke="rgba(207, 255, 61, 0.15)" 
                        strokeWidth="5" 
                        fill="none" 
                        strokeLinecap="round" 
                      />
                      <path 
                        d="M 180 120 Q 280 110 380 70" 
                        stroke="#CFFF3D" 
                        strokeWidth="1.5" 
                        strokeDasharray="4, 12" 
                        fill="none" 
                        strokeLinecap="round" 
                        className="animate-conveyor"
                        opacity={isDispatched && riderProgress >= 60 ? 1 : 0.4}
                      />

                      {/* Customer Location Pin */}
                      <g transform="translate(380, 70)">
                        <circle r="12" fill="none" stroke="#CFFF3D" strokeWidth="1" className="animate-radar-pulse" />
                        <circle r="4" fill="#CFFF3D" />
                        <text y="-10" textAnchor="middle" fill="#CFFF3D" fontSize="8" fontWeight="bold" fontFamily="monospace">CUSTOMER</text>
                      </g>

                      {/* Grab Merchant Hub Pin */}
                      <g transform="translate(180, 120)">
                        <circle r="16" fill="none" stroke="#00B14F" strokeWidth="1" className="animate-radar-pulse" />
                        <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#00B14F" />
                        <text y="-13" textAnchor="middle" fill="#00B14F" fontSize="8" fontWeight="bold" fontFamily="monospace">GRAB_MERCHANT</text>
                      </g>

                      {/* Initial Courier Start Position Indicator */}
                      <g transform="translate(40, 190)">
                        <circle r="4" fill="#587065" />
                        <text y="-8" textAnchor="middle" fill="#8DA99C" fontSize="7" fontFamily="monospace">DRIVER_IDLE_ZONE</text>
                      </g>

                      {/* Dispatched Rider Dot */}
                      {isDispatched && (
                        <g transform={`translate(${riderCoords.x}, ${riderCoords.y})`}>
                          <circle r="8" fill="rgba(0,177,79,0.3)" className="animate-ping" />
                          <circle r="5" fill="#00B14F" stroke="#white" strokeWidth="1" />
                          <text y="-8" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="monospace" className="bg-black/80 px-1 py-0.5 rounded">
                            {currentRider.name.split(" ")[0]}
                          </text>
                        </g>
                      )}

                    </svg>

                    {/* Floating Map Status Overlay */}
                    <div className="absolute left-4 top-4 bg-black/60 backdrop-blur-md border border-white/5 p-3 rounded-lg max-w-[280px]">
                      <span className="text-[8px] font-black tracking-wider text-[#CFFF3D] uppercase font-mono block">GPS Dispatch Arbitrage</span>
                      <p className="text-[10px] text-white font-bold font-mono mt-1 leading-snug">{mapStatusText}</p>
                      <div className="flex items-center gap-1.5 text-[8px] text-slate-400 font-mono mt-2 border-t border-white/5 pt-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${isDispatched ? 'bg-[#00B14F] animate-pulse' : 'bg-slate-500'}`}></span>
                        <span>{isDispatched ? `Rider progress: ${riderProgress.toFixed(0)}%` : "Ready for dispatch trigger"}</span>
                      </div>
                    </div>

                    {/* Telemetry coordinate box */}
                    <div className="absolute right-4 bottom-4 rounded border border-white/10 bg-black/85 backdrop-blur-sm p-2.5 font-mono text-[8px] leading-3 text-slate-300 shadow-xl">
                      <strong className="text-[#CFFF3D] tracking-wider font-extrabold block mb-0.5 uppercase">GPS Node Stream</strong>
                      {isDispatched ? (
                        <>
                          <div>X-Coord: <span className="text-white">{riderCoords.x.toFixed(1)}</span></div>
                          <div>Y-Coord: <span className="text-white">{riderCoords.y.toFixed(1)}</span></div>
                          <div>Velocity: <span className="text-emerald-400 font-bold">
                            {riderProgress < 40 
                              ? `${Math.round(25 + Math.sin(riderProgress * 0.1) * 3 + (Math.random() * 2 - 1))} km/h` 
                              : riderProgress < 60 ? "0 km/h (Arrived)" 
                              : `${Math.round(40 + Math.cos(riderProgress * 0.1) * 5 + (Math.random() * 3 - 1))} km/h`}
                          </span></div>
                        </>
                      ) : (
                        <div className="text-slate-400">Satellite stream idle.</div>
                      )}
                    </div>

                  </div>
                )}

                <p className="mt-3 text-xs text-[#8DA99C]">
                  <strong className="text-white">Active AI Optimization Index:</strong> The system monitors order prep in real-time, calculates exact food plating milestones, and delays rider dispatches dynamically to coordinate arrivals perfectly.
                </p>
              </article>

              {/* 6. READINESS FORECAST TABLE */}
              <article className="rounded-2xl glass-card p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#CFFF3D]">Real-Time Logistics Arbitrage</p>
                    <h3 className="text-base font-bold text-white">Readiness Forecast: AI Prediction vs. Manual Delta</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 pb-2 font-black text-[#8DA99C] uppercase tracking-wider">
                        <th className="py-2.5 pr-3 font-bold text-[10px]">Order ID</th>
                        <th className="py-2.5 pr-3 font-bold text-[10px]">Dish & Category</th>
                        <th className="py-2.5 pr-3 font-bold text-[10px]">Stage & Progress</th>
                        <th className="py-2.5 pr-3 font-bold text-[10px] text-center">Manual Estimate</th>
                        <th className="py-2.5 pr-3 font-bold text-[10px] text-center">AI Predicted Time</th>
                        <th className="py-2.5 pr-3 font-bold text-[10px] text-center text-[#CFFF3D]">Efficiency Delta</th>
                        <th className="py-2.5 font-bold text-[10px] text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {processedOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-8 text-center font-bold text-[#8DA99C] italic">
                            No active orders in the current stream. Use the form on the right to add tickets.
                          </td>
                        </tr>
                      ) : (
                        processedOrders.map(order => {
                          const details = getDishDetails(order.dish)
                          return (
                            <tr key={order.id} className="group hover:bg-white/[0.02] transition">
                              <td className="py-3.5 font-mono font-bold text-[#CFFF3D]">{order.id}</td>
                              <td className="py-3.5 pr-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={`h-8 w-8 rounded-lg border flex items-center justify-center font-serif text-lg ${details.color}`}>
                                    {details.emoji}
                                  </div>
                                  <div>
                                    <span className="font-bold text-white block">{order.dish}</span>
                                    <span className="text-[10px] text-[#8DA99C]">{order.items} item{order.items > 1 ? 's' : ''} enqueued</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 pr-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.04]">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        order.stage === 'Ready' ? 'bg-emerald-500' :
                                        order.stage === 'Cooking' ? 'bg-[#00B14F] animate-conveyor' :
                                        order.stage === 'Dispatched' ? 'bg-cyan-500' :
                                        'bg-amber-400'
                                      }`} 
                                      style={{ width: `${order.progress}%` }}
                                    />
                                  </div>
                                  <span className={`font-bold uppercase text-[9px] tracking-wider ${
                                    order.stage === 'Ready' ? 'text-emerald-400 animate-pulse font-black' :
                                    order.stage === 'Cooking' ? 'text-[#00B14F]' :
                                    order.stage === 'Dispatched' ? 'text-cyan-400 font-extrabold animate-bounce' :
                                    'text-amber-500'
                                  }`}>{order.stage}</span>
                                </div>
                              </td>
                              <td className="py-3.5 text-center font-mono text-[#8DA99C] line-through decoration-red-500/40">{order.manualEstimate} min</td>
                              <td className="py-3.5 text-center font-mono font-bold text-white">{order.scaledAiTime} min</td>
                              <td className="py-3.5 text-center">
                                <span className="inline-flex items-center rounded-full bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] font-bold text-[#CFFF3D] border border-[#00B14F]/20">
                                  {order.delta} min
                                </span>
                              </td>
                              <td className="py-3.5 text-center">
                                <button
                                  onClick={() => handleDismissOrder(order.id, order)}
                                  aria-label={`Complete and dismiss ${order.id}`}
                                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 border-t border-white/5 pt-3 text-[10px] text-[#8DA99C] flex justify-between">
                  <span>* Manual estimates reflect standard bloated legacy dispatcher timing algorithms.</span>
                  <span className="font-bold text-[#CFFF3D]">Total Items: {processedOrders.reduce((sum, o) => sum + o.items, 0)}</span>
                </div>
              </article>

            </div>

            {/* COLUMN 2 */}
            <div className="space-y-6">
              
              {/* 5. DISPATCH READINESS ENGINE */}
              <article className="rounded-2xl glass-card p-5 text-center shadow-sm relative overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#8DA99C]">Automated Dispatch Hub</p>
                <h3 className="text-base font-bold text-white">Dynamic Dispatcher Cycle</h3>

                {/* Circular Progress Ring surrounding countdown */}
                <div className="relative mx-auto my-6 h-44 w-44">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r={strokeRadius}
                      className="stroke-white/[0.03]"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="88"
                      cy="88"
                      r={strokeRadius}
                      className="stroke-[#00B14F] transition-all duration-1000"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={strokeCircumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Absolute Centered Timer */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-3.5xl font-black tracking-tighter text-white glow-text-green">
                      {displayMin}:{displaySec}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#8DA99C] mt-0.5">
                      Next Auto-Dispatch
                    </span>
                  </div>
                </div>

                {/* Dispatch Status & Rider Info Cards */}
                <div className="space-y-3.5">
                  
                  {/* Dynamic Action Recommended Panel */}
                  <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5 text-left text-xs leading-relaxed text-[#8DA99C]">
                    <strong className="text-white block mb-1">Recommended Dispatch Action:</strong>
                    {isDispatched ? (
                      <span className="text-[#CFFF3D] font-bold animate-pulse">Rider assigned and en route. Dispatch sequence locked. Monitoring GPS locations on live map view...</span>
                    ) : (
                      <span>Hold rider dispatch for {displayMin}:{displaySec}. Vision analysis reports food cooking progress is active. Syncing arrival to completion.</span>
                    )}
                  </div>

                  {/* Dynamic Dispatched Rider Info Card overlay */}
                  {isDispatched ? (
                    <div className="rounded-xl border border-[#00B14F]/20 bg-gradient-to-tr from-[#004A26]/40 to-[#00B14F]/5 p-3.5 text-left text-xs relative overflow-hidden">
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-[#CFFF3D] text-[8px] font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#CFFF3D] animate-ping"></span>
                        <span>MATCHED</span>
                      </div>
                      
                      <span className="text-[8px] font-black tracking-wider text-[#CFFF3D] uppercase font-mono block">Matched Grab Courier</span>
                      
                      <div className="flex items-center gap-3 mt-2 border-b border-white/[0.04] pb-2.5">
                        {/* Helmet Avatar Icon */}
                        <div className="h-9 w-9 rounded-full bg-[#00B14F]/20 border border-[#00B14F]/30 flex items-center justify-center text-white">
                          🏍️
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">{currentRider.name}</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Rating: <span className="text-[#CFFF3D]">⭐ {currentRider.rating}</span> | Gold Tier</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[10px] font-mono text-slate-400 mt-2.5">
                        <div className="flex justify-between">
                          <span>Vehicle:</span>
                          <span className="text-white">{currentRider.vehicle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Plate Number:</span>
                          <span className="text-[#CFFF3D] font-bold">{currentRider.plate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pickup Status:</span>
                          <span className="text-[#00B14F] font-bold">
                            {riderProgress < 40 ? "En Route (0.2km)" : riderProgress < 60 ? "Arrived - Handing Over" : "Departed to Customer"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-left text-[#8DA99C] leading-4 border-t border-white/5 pt-3">
                      <strong>Scheduled pickup:</strong> <span className="font-bold text-white">{dispatchTimeStr}</span><br />
                      <strong>Est. Handover Completion:</strong> <span className="font-bold text-white">{handoverTimeStr}</span> <span className="text-slate-500">(incl. 2m buffer)</span>
                    </p>
                  )}

                  {/* Dispatch Button state switcher */}
                  {isDispatched ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-950/20 border border-[#00B14F]/40 py-3 text-sm font-bold text-[#CFFF3D] shadow-[0_0_15px_rgba(0,177,79,0.15)]">
                      <CheckCircle2 className="h-5 w-5 text-[#00B14F] animate-bounce" />
                      <span>Rider Assigned & Tracking</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleScheduleDispatch}
                      disabled={orders.length === 0}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md transition ${
                        orders.length === 0 ? 'bg-white/[0.04] text-slate-500 cursor-not-allowed border border-white/5' : 'btn-premium'
                      }`}
                    >
                      <Send className="h-4 w-4" />
                      <span>Force Rider Dispatch</span>
                    </button>
                  )}
                </div>
              </article>

              {/* 7. INTERACTIVE QUEUE & SPEED SIMULATOR */}
              <article className="rounded-2xl bg-gradient-to-tr from-[#021A0F] to-[#004A26] border border-[#00B14F]/25 p-5 text-white shadow-sm">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#CFFF3D]">
                    <Sliders className="h-4 w-4" />
                    <p className="text-[10px] font-black uppercase tracking-wider">Kitchen Control Deck</p>
                  </div>

                  {/* Lunch Rush Trigger Button */}
                  <button
                    onClick={handleLunchRushSurge}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition ${
                      isLunchRush 
                        ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30' 
                        : 'bg-[#CFFF3D]/10 border-[#CFFF3D]/30 text-[#CFFF3D] hover:bg-[#CFFF3D]/20'
                    }`}
                  >
                    <Zap className="h-3 w-3 animate-pulse" />
                    <span>{isLunchRush ? "Rush Active" : "Simulate Rush"}</span>
                  </button>
                </div>

                <h3 className="mt-1 text-base font-bold text-white">Dynamic Simulator Parameters</h3>
                <p className="mt-1 text-xs text-slate-300 leading-normal">
                  Adjust simulated kitchen operational speed or enqueue fresh tickets to see AI models recalibrate logistics parameters.
                </p>

                {/* Speed Simulator Range Slider */}
                <div className="mt-4 rounded-xl bg-black/20 p-4 border border-white/5">
                  <div className="mb-2 flex justify-between text-xs font-semibold">
                    <span>Kitchen Speed Factor:</span>
                    <span className="text-[#CFFF3D] font-bold">
                      {speed === 1 ? 'Slow (1.25x prep)' : speed === 3 ? 'Fast (0.75x prep)' : 'Normal (1.0x)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={speed}
                    onChange={handleSpeedSliderChange}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 outline-none accent-[#CFFF3D]"
                    style={{
                      background: `linear-gradient(to right, #00B14F 0%, #00B14F ${(speed - 1) * 50}%, rgba(255, 255, 255, 0.1) ${(speed - 1) * 50}%, rgba(255, 255, 255, 0.1) 100%)`
                    }}
                  />
                  <div className="mt-2 flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>SLOW (DELAYED)</span>
                    <span>STANDARD</span>
                    <span>FAST (ACCELERATED)</span>
                  </div>
                </div>

                {/* Add an Order Form */}
                <form onSubmit={handleAddOrder} className="mt-4.5 space-y-3 border-t border-white/10 pt-4">
                  <h4 className="text-[10px] font-black tracking-wider text-[#CFFF3D] uppercase">Update the Live Queue</h4>
                  
                  <div>
                    <label htmlFor="dish-name" className="block text-[9px] font-bold text-slate-300 uppercase mb-1">Dish Title</label>
                    <input
                      id="dish-name"
                      type="text"
                      required
                      placeholder="e.g. Laksa Premium Set"
                      value={newOrderForm.dish}
                      onChange={e => setNewOrderForm({ ...newOrderForm, dish: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition focus:border-[#CFFF3D] focus:bg-black/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="prep-time" className="block text-[9px] font-bold text-slate-300 uppercase mb-1">Prep Time (Min)</label>
                      <input
                        id="prep-time"
                        type="number"
                        min="1"
                        max="90"
                        required
                        value={newOrderForm.prep}
                        onChange={e => setNewOrderForm({ ...newOrderForm, prep: Number(e.target.value) })}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none transition focus:border-[#CFFF3D] focus:bg-black/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="items-count" className="block text-[9px] font-bold text-slate-300 uppercase mb-1">Quantity</label>
                      <input
                        id="items-count"
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={newOrderForm.items}
                        onChange={e => setNewOrderForm({ ...newOrderForm, items: Number(e.target.value) })}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none transition focus:border-[#CFFF3D] focus:bg-black/30"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CFFF3D] hover:bg-[#d5ff52] px-4 py-2.5 text-xs font-black text-[#004A26] transition active:scale-[0.99]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Enqueue Ticket</span>
                  </button>
                </form>

              </article>

            </div>

          </div>

          {/* 8. REAL-TIME API LOG TERMINAL */}
          <section className="rounded-2xl border border-white/5 bg-[#070B09] p-5 shadow-lg">
            <div className="mb-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.04] pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Terminal className="h-4 w-4 animate-pulse" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">Real-Time Operations Telemetry Console</span>
              </div>
              
              {/* Terminal Logs Filtering Tabs */}
              <div className="flex items-center gap-1.5 font-mono text-[9px]">
                {[
                  { id: "all", label: "ALL" },
                  { id: "system", label: "SYSTEM" },
                  { id: "ai", label: "AI_MODEL" },
                  { id: "vision", label: "CV_VISION" },
                  { id: "engine", label: "GRAB_ENG" },
                  { id: "user", label: "ACTIONS" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setLogFilter(tab.id)}
                    className={`px-2 py-1 rounded border transition ${
                      logFilter === tab.id 
                        ? 'bg-[#00B14F]/10 border-[#00B14F] text-[#CFFF3D] font-bold' 
                        : 'border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Console Screen */}
            <div className="h-36 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-600 italic">No events match the selected category filter.</div>
              ) : (
                filteredLogs.map((log, index) => {
                  let colorClass = "text-slate-300"
                  if (log.includes("SYSTEM:")) colorClass = "text-cyan-400"
                  if (log.includes("USER EVENT:")) colorClass = "text-[#CFFF3D]"
                  if (log.includes("AUTOMATED EVENT:")) colorClass = "text-sky-400 font-bold"
                  if (log.includes("AI MODEL:")) colorClass = "text-[#00B14F]"
                  if (log.includes("CV ANALYTICS:")) colorClass = "text-emerald-400"
                  if (log.includes("GRAB ENGINE:")) colorClass = "text-amber-400"

                  return (
                    <div key={index} className={`leading-relaxed border-l-2 pl-2.5 border-white/[0.04] ${colorClass}`}>
                      {log}
                    </div>
                  )
                })
              )}
              <div ref={terminalEndRef} />
            </div>
          </section>

        </main>
      </div>

    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
