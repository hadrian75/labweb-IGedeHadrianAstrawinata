import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Cloud,
  Stars,
  Sparkles,
  PerspectiveCamera,
  Float,
} from "@react-three/drei";
import * as THREE from "three";
import {
  Search,
  Wind,
  Droplets,
  MapPin,
  Sun,
  Menu,
  Eye,
  Sunrise,
  Sunset,
  Zap,
  Calendar,
  Clock,
  Trash2,
  Sliders,
  Umbrella,
  History,
  AlertTriangle,
  Navigation,
  Thermometer,
  X,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- 3D ENGINE COMPONENTS (Unchanged) ---
const RainSystem = ({ count = 1000 }) => {
  const rainGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions.push((Math.random() - 0.5) * 40);
      positions.push((Math.random() - 0.5) * 40);
      positions.push((Math.random() - 0.5) * 20 - 5);
      velocities.push(0.3 + Math.random() * 0.2);
    }
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute(
      "velocity",
      new THREE.Float32BufferAttribute(velocities, 1)
    );
    return geo;
  }, [count]);

  const rainMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const points = useRef();

  useFrame(() => {
    if (!points.current) return;
    const positions = points.current.geometry.attributes.position.array;
    const velocities = points.current.geometry.attributes.velocity.array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= velocities[i];
      if (positions[i * 3 + 1] < -10) {
        positions[i * 3 + 1] = 10;
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return <points ref={points} geometry={rainGeo} material={rainMat} />;
};

const SnowSystem = ({ count = 500 }) => {
  const snowGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions.push((Math.random() - 0.5) * 30);
      positions.push((Math.random() - 0.5) * 30);
      positions.push((Math.random() - 0.5) * 20 - 5);
      velocities.push((Math.random() - 0.5) * 0.02);
    }
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute("drift", new THREE.Float32BufferAttribute(velocities, 1));
    return geo;
  }, [count]);

  const snowMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const points = useRef();

  useFrame(({ clock }) => {
    if (!points.current) return;
    const positions = points.current.geometry.attributes.position.array;
    const drifts = points.current.geometry.attributes.drift.array;
    const time = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= 0.05;
      positions[i * 3] +=
        Math.sin(time + positions[i * 3 + 1]) * 0.01 + drifts[i];
      if (positions[i * 3 + 1] < -10) {
        positions[i * 3 + 1] = 15;
        positions[i * 3] = (Math.random() - 0.5) * 30;
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return <points ref={points} geometry={snowGeo} material={snowMat} />;
};

const CameraRig = ({ mouseX, mouseY }) => {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      mouseX.get() * 2,
      0.05
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      mouseY.get() * 2,
      0.05
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

const WeatherScene = ({ code, isDay, mouseX, mouseY }) => {
  const isRain = [
    1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246,
  ].includes(code);
  const isSnow = [1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225].includes(
    code
  );
  const isThunder = [1087, 1273, 1276, 1279, 1282].includes(code);
  const isCloudy = [1003, 1006, 1009, 1030, 1135, 1147].includes(code);
  const isClear = [1000].includes(code);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
      <CameraRig mouseX={mouseX} mouseY={mouseY} />
      <ambientLight intensity={isDay ? 0.8 : 0.2} />
      <pointLight
        position={[10, 10, 10]}
        intensity={isDay ? 1.5 : 0.5}
        color={isDay ? "#ffaa00" : "#4444ff"}
      />

      {!isDay && isClear && (
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      )}

      {(isCloudy || isRain || isThunder || isSnow) && (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
          <Cloud
            opacity={isDay ? 0.6 : 0.3}
            segments={40}
            bounds={[10, 2, 2]}
            volume={10}
            color={isDay ? "white" : "#6b7280"}
            position={[0, 0, -5]}
          />
          <Cloud
            opacity={0.3}
            segments={20}
            bounds={[10, 2, 2]}
            volume={5}
            color={isDay ? "#efefef" : "#4b5563"}
            position={[0, -5, -10]}
            seed={2}
          />
        </Float>
      )}

      {isRain && <RainSystem count={2000} />}
      {isSnow && <SnowSystem count={1000} />}
      {isThunder && <ThunderEffect />}
      {isClear && isDay && (
        <Sparkles
          count={50}
          scale={12}
          size={4}
          speed={0.4}
          opacity={0.5}
          color="#ffffcc"
        />
      )}
    </>
  );
};

const ThunderEffect = () => {
  const light = useRef();
  useFrame(() => {
    if (Math.random() > 0.98) {
      light.current.intensity = 5 + Math.random() * 5;
      setTimeout(() => (light.current.intensity = 0), 100);
    }
  });
  return (
    <rectAreaLight
      ref={light}
      color="#aaddff"
      intensity={0}
      position={[0, 10, 5]}
      width={20}
      height={20}
    />
  );
};

// --- UI COMPONENTS ---

const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
        y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={cn("relative transition-all duration-200 ease-out", className)}
    >
      {children}
    </motion.div>
  );
};

const formatTemp = (c, unit) => {
  if (unit === "c") return Math.round(c);
  return Math.round((c * 9) / 5 + 32);
};

// --- IMPROVED GRAPH COMPONENT ---
const AdvancedGraph = ({ hours, unit }) => {
  if (!hours || hours.length < 3) return null;
  const data = hours.slice(0, 24);
  const temps = data.map((h) => (unit === "c" ? h.temp_c : h.temp_f));
  const min = Math.min(...temps) - 2;
  const max = Math.max(...temps) + 2;
  const range = max - min;

  const points = data.map((h, i) => {
    const x = (i / (data.length - 1)) * 100;
    const val = unit === "c" ? h.temp_c : h.temp_f;
    const y = 85 - ((val - min) / range) * 70;
    return { x, y, temp: val, time: new Date(h.time).getHours() };
  });

  const buildPath = (pts) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) * 0.5;
      const cp2x = p1.x - (p1.x - p0.x) * 0.5;
      d += ` C ${cp1x},${p0.y} ${cp2x},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const pathD = buildPath(points);

  return (
    <div className="w-full h-48 relative mt-4 group select-none">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="graphGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          d={`${pathD} L 100,100 L 0,100 Z`}
          fill="url(#graphGrad)"
          className="text-yellow-400"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          className="text-yellow-300 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]"
          vectorEffect="non-scaling-stroke"
        />
        {points.map(
          (p, i) =>
            i % 3 === 0 && (
              <g key={i}>
                <circle
                  cx={`${p.x}%`}
                  cy={`${p.y}%`}
                  r="1.5"
                  fill="white"
                  className="drop-shadow-md"
                />
                <text
                  x={`${p.x}%`}
                  y={`${p.y - 8}%`}
                  fontSize="4"
                  fill="white"
                  textAnchor="middle"
                  fontWeight="bold"
                  style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.4)" }}
                >
                  {Math.round(p.temp)}°
                </text>
                <text
                  x={`${p.x}%`}
                  y="105%"
                  fontSize="3"
                  fill="white"
                  textAnchor="middle"
                  opacity="0.8"
                >
                  {p.time}:00
                </text>
                <line
                  x1={`${p.x}%`}
                  y1={`${p.y}%`}
                  x2={`${p.x}%`}
                  y2="100%"
                  stroke="white"
                  strokeWidth="0.1"
                  strokeDasharray="1,1"
                  opacity="0.2"
                />
              </g>
            )
        )}
      </svg>
    </div>
  );
};

const WindCompass = ({ dir, degree, speed }) => {
  return (
    <div className="bg-black/10 p-3 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center">
        <div className="absolute top-0 text-[6px] font-bold opacity-50">N</div>
        <div className="absolute bottom-0 text-[6px] font-bold opacity-50">
          S
        </div>
        <div className="absolute left-0 text-[6px] font-bold opacity-50">W</div>
        <div className="absolute right-0 text-[6px] font-bold opacity-50">
          E
        </div>
        <motion.div
          animate={{ rotate: degree }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          <Navigation
            size={16}
            className="text-yellow-400 fill-yellow-400/50"
          />
        </motion.div>
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
          Wind
        </div>
        <div className="font-bold">{speed} km/h</div>
        <div className="text-[10px] opacity-40">{dir}</div>
      </div>
    </div>
  );
};

const AQIGauge = ({ aqi }) => {
  const labels = [
    "Good",
    "Moderate",
    "Sensitive",
    "Unhealthy",
    "V. Unhealthy",
    "Hazardous",
  ];
  const colors = [
    "bg-emerald-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-rose-900",
  ];
  const index = Math.min(6, Math.max(1, aqi)) - 1;
  return (
    <div className="bg-black/10 p-3 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
          <Eye size={12} /> Air Quality
        </div>
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-bold text-white",
            colors[index].replace("bg-", "bg-opacity-20 bg-")
          )}
        >
          {labels[index]}
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-full border-r border-black/20 last:border-0",
              i <= index ? colors[i] : "bg-transparent"
            )}
          />
        ))}
      </div>
    </div>
  );
};

const AlertModal = ({ alert, onClose }) => {
  if (!alert) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1a1a1a]/90 border border-red-500/30 text-white p-6 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-3 mb-6 text-red-400">
          <AlertTriangle size={32} />
          <h2 className="text-2xl font-bold uppercase tracking-widest">
            Severe Weather Alert
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase opacity-50 tracking-wider mb-1">
              Event
            </h3>
            <p className="text-xl font-bold">{alert.event}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase opacity-50 tracking-wider mb-1">
                Effective
              </h3>
              <p className="text-sm">
                {new Date(alert.effective).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase opacity-50 tracking-wider mb-1">
                Expires
              </h3>
              <p className="text-sm">
                {new Date(alert.expires).toLocaleString()}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase opacity-50 tracking-wider mb-1">
              Description
            </h3>
            <p className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap">
              {alert.desc}
            </p>
          </div>
          {alert.instruction && (
            <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
              <h3 className="text-xs font-bold uppercase text-red-400 tracking-wider mb-2">
                Instruction
              </h3>
              <p className="text-sm leading-relaxed">{alert.instruction}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const AlertBanner = ({ alerts, onViewDetails }) => {
  if (!alerts || alerts.length === 0) return null;
  const alert = alerts[0];
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
    >
      <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 text-white p-4 rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.3)] flex items-center gap-4">
        <div className="p-2 bg-red-500 rounded-full animate-pulse">
          <AlertTriangle size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-red-100 text-sm uppercase tracking-wider">
            Severe Weather Alert
          </h4>
          <p className="text-sm truncate opacity-90">
            {alert.headline || alert.event}
          </p>
        </div>
        <button
          onClick={onViewDetails}
          className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
};

// --- NEW HELPER: GET DYNAMIC SUN ROTATION ---
const getSunRotation = (sunriseStr, sunsetStr, locationTimeStr) => {
  if (!sunriseStr || !sunsetStr || !locationTimeStr) return -75; // Default (sunrise position)

  // Helper to parse "05:30 AM" or "2023-10-25 14:30" to minutes from midnight
  const parseMinutes = (timeStr, isFullDate = false) => {
    let h, m, period;

    if (isFullDate) {
      // Format: "2023-10-25 14:30"
      const timePart = timeStr.split(" ")[1];
      [h, m] = timePart.split(":").map(Number);
    } else {
      // Format: "05:30 AM"
      const [t, p] = timeStr.split(" ");
      [h, m] = t.split(":").map(Number);
      period = p;
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
    }
    return h * 60 + m;
  };

  const sunriseMins = parseMinutes(sunriseStr);
  const sunsetMins = parseMinutes(sunsetStr);
  const currentMins = parseMinutes(locationTimeStr, true);

  // If currently before sunrise, stay at start
  if (currentMins < sunriseMins) return -75;
  // If after sunset, stay at end
  if (currentMins > sunsetMins) return 75;

  // Calculate percentage of day passed
  const dayDuration = sunsetMins - sunriseMins;
  const elapsed = currentMins - sunriseMins;
  const percentage = elapsed / dayDuration;

  // Map 0-1 to -75 to 75 degrees
  return percentage * 150 - 75;
};

// --- MAIN APPLICATION ---

export default function App() {
  const [city, setCity] = useState("New York");
  const [searchInput, setSearchInput] = useState("");
  const [forecastDays, setForecastDays] = useState(3);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("c");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const API_KEY = "8c8a71a5f1574e8c87d63843252011";

  const fetchWeather = async (q, days) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${q}&days=${days}&aqi=yes&alerts=yes`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setWeather(data);
      setForecast(data.forecast.forecastday);

      setHistory((prev) => {
        const normalizedCity = data.location.name;
        const exists = prev.some(
          (item) => item.toLowerCase() === normalizedCity.toLowerCase()
        );
        if (exists) return prev;
        return [normalizedCity, ...prev].slice(0, 5);
      });
    } catch (err) {
      setError("City not found or API limit reached.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city, forecastDays);
  }, [city, forecastDays]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchInput.trim()) {
      setCity(searchInput);
      setSearchInput("");
    }
  };

  useEffect(() => {
    const handler = (e) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set(-(e.clientY / window.innerHeight) * 2 + 1);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const formatTime = () =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date());

  const isDay = weather?.current?.is_day === 1;
  const bgGradient = isDay
    ? "from-blue-400 via-sky-400 to-indigo-500"
    : "from-slate-900 via-slate-800 to-black";

  // Calculate dynamic sun rotation
  const sunRotation = weather
    ? getSunRotation(
        weather.forecast.forecastday[0].astro.sunrise,
        weather.forecast.forecastday[0].astro.sunset,
        weather.location.localtime
      )
    : -75;

  // FILTER OUT TEST/MONITORING ALERTS
  const realAlerts = useMemo(() => {
    if (!weather?.alerts?.alert) return [];
    return weather.alerts.alert.filter((a) => {
      const evt = (a.event || "").toLowerCase();
      const desc = (a.desc || "").toLowerCase();
      return (
        !evt.includes("test") &&
        !desc.includes("test message") &&
        !desc.includes("monitoring message")
      );
    });
  }, [weather]);

  return (
    <div
      className={cn(
        "min-h-screen w-full font-sans text-white overflow-x-hidden relative selection:bg-yellow-400/30 bg-gradient-to-b",
        bgGradient
      )}
    >
      {/* 3D BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            {weather && (
              <WeatherScene
                code={weather.current.condition.code}
                isDay={isDay}
                mouseX={mouseX}
                mouseY={mouseY}
              />
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* UI LAYER */}
      <div className="relative z-10 container mx-auto p-4 md:p-8 max-w-[1600px]">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/10"
            >
              <Menu size={24} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {weather?.location?.name}
                <span className="text-xs font-normal opacity-50 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  {weather?.location?.country}
                </span>
              </h1>
              <p className="text-sm opacity-60 flex items-center gap-2">
                <Clock size={12} /> {formatTime()}
              </p>
            </div>
          </div>

          {/* Search & Controls */}
          <div className="flex items-center gap-4 w-full md:w-auto bg-black/20 p-2 rounded-full backdrop-blur-xl border border-white/10">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                size={16}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search city..."
                className="w-full bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm placeholder-white/30"
              />
            </div>
            <div className="h-6 w-px bg-white/10" />
            <button
              onClick={() => setUnit(unit === "c" ? "f" : "c")}
              className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span
                className={cn(
                  "font-bold text-sm",
                  unit === "c" ? "text-white" : "text-white/40"
                )}
              >
                °C
              </span>
              <span className="text-white/20">/</span>
              <span
                className={cn(
                  "font-bold text-sm",
                  unit === "f" ? "text-white" : "text-white/40"
                )}
              >
                °F
              </span>
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2 px-3">
              <span className="text-xs opacity-50 whitespace-nowrap hidden sm:block">
                Days:
              </span>
              <input
                type="number"
                min="1"
                max="14"
                value={forecastDays}
                onChange={(e) =>
                  setForecastDays(
                    Math.min(14, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="w-12 bg-white/10 rounded px-2 py-1 text-center text-sm outline-none border border-white/10 focus:border-white/30"
              />
            </div>
          </div>
        </header>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm rounded-3xl">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {weather && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: MAIN WEATHER (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <TiltCard className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 shadow-2xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[10px] font-bold uppercase tracking-widest mb-4"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                      Realtime Feed
                    </motion.div>
                    <h1 className="text-8xl md:text-[10rem] font-bold leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                      {formatTemp(weather.current.temp_c, unit)}°
                    </h1>
                    <p className="text-3xl font-light opacity-80 mt-2 flex items-center gap-3">
                      {weather.current.condition.text}
                      <img
                        src={`https:${weather.current.condition.icon}`}
                        className="w-10 h-10"
                        alt="icon"
                      />
                    </p>
                  </div>

                  {/* Quick Stats with Compass and AQI */}
                  <div className="mt-8 md:mt-0 grid grid-cols-2 gap-4 min-w-[300px]">
                    <WindCompass
                      dir={weather.current.wind_dir}
                      degree={weather.current.wind_degree}
                      speed={weather.current.wind_kph}
                    />
                    <StatBox
                      icon={Droplets}
                      label="Humidity"
                      value={`${weather.current.humidity}%`}
                      sub={`Dew: ${formatTemp(
                        weather.current.dewpoint_c,
                        unit
                      )}°`}
                    />

                    <div className="col-span-2">
                      {weather.current.air_quality && (
                        <AQIGauge
                          aqi={weather.current.air_quality["us-epa-index"]}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-xs font-bold uppercase opacity-50 tracking-[0.2em]">
                      24-Hour Temperature Trend
                    </h3>
                  </div>
                  <AdvancedGraph hours={forecast[0]?.hour} unit={unit} />
                </div>
              </TiltCard>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full overflow-x-auto pb-4 no-scrollbar"
              >
                <div className="flex gap-4">
                  {forecast[0]?.hour.map((h, i) => {
                    const currentH = new Date().getHours();
                    const thisH = new Date(h.time).getHours();
                    if (thisH < currentH) return null;
                    return (
                      <div
                        key={i}
                        className="min-w-[100px] p-4 rounded-3xl bg-black/20 backdrop-blur-md border border-white/5 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors group"
                      >
                        <span className="text-xs font-bold opacity-50">
                          {thisH === currentH ? "NOW" : `${thisH}:00`}
                        </span>
                        <img
                          src={`https:${h.condition.icon}`}
                          className="w-10 h-10 group-hover:scale-110 transition-transform"
                          alt="icon"
                        />
                        <span className="text-xl font-bold">
                          {formatTemp(h.temp_c, unit)}°
                        </span>
                        <div className="flex items-center gap-1 text-[10px] opacity-50 text-blue-300">
                          <Umbrella size={8} /> {h.chance_of_rain}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* RIGHT: FORECAST & HISTORY (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex-1 rounded-[2.5rem] bg-black/20 border border-white/10 p-8 backdrop-blur-xl flex flex-col"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={16} className="text-yellow-400" /> Outlook
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-3 custom-scrollbar">
                  {forecast.map((day, idx) => (
                    <div
                      key={idx}
                      className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20 overflow-hidden"
                    >
                      <div className="relative flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 flex flex-col text-center">
                            <span className="text-xs font-bold uppercase text-yellow-400">
                              {idx === 0
                                ? "Today"
                                : new Date(day.date).toLocaleDateString(
                                    "en-US",
                                    { weekday: "short" }
                                  )}
                            </span>
                            <span className="text-[10px] opacity-50">
                              {new Date(day.date).getDate()}
                            </span>
                          </div>
                          <div className="h-8 w-px bg-white/10" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {day.day.condition.text}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatTemp(day.day.maxtemp_c, unit)}°
                          </div>
                          <div className="text-xs opacity-50">
                            {formatTemp(day.day.mintemp_c, unit)}°
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {history.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-[2.5rem] bg-white/5 border border-white/10 p-6 backdrop-blur-xl"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-60">
                      <History size={14} /> Recent
                    </h3>
                    <button
                      onClick={() => setHistory([])}
                      className="text-xs opacity-40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {history.map((hCity, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCity(hCity);
                        }}
                        className="px-4 py-2 rounded-xl bg-black/20 hover:bg-white/20 border border-white/5 text-xs whitespace-nowrap transition-all"
                      >
                        {hCity}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* --- UPDATED DYNAMIC SOLAR CYCLE --- */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="rounded-[2.5rem] bg-gradient-to-b from-indigo-900/50 to-purple-900/50 border border-white/10 p-8 backdrop-blur-xl relative overflow-hidden"
              >
                <h3 className="text-xs font-bold uppercase opacity-50 tracking-[0.2em] mb-6">
                  Solar Cycle
                </h3>
                <div className="flex justify-between items-end h-24 relative">
                  {/* Arc */}
                  <div className="absolute bottom-0 left-4 right-4 top-4 border-t-2 border-dashed border-white/20 rounded-[100%] pointer-events-none" />

                  {/* Dynamic Sun Container */}
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-full origin-bottom"
                    initial={{ rotate: -75 }}
                    animate={{ rotate: sunRotation }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  >
                    {/* The Sun Icon */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 p-2 rounded-full bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                      <Sun
                        size={20}
                        className="text-yellow-900 animate-spin-slow"
                      />
                    </div>
                  </motion.div>

                  <div className="flex flex-col items-center z-10">
                    <Sunrise size={20} className="text-orange-400 mb-2" />
                    <span className="text-sm font-bold">
                      {weather.forecast.forecastday[0].astro.sunrise}
                    </span>
                  </div>
                  <div className="flex flex-col items-center z-10">
                    <Sunset size={20} className="text-purple-400 mb-2" />
                    <span className="text-sm font-bold">
                      {weather.forecast.forecastday[0].astro.sunset}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Alert Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <AlertModal
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
          />
        )}
      </AnimatePresence>

      {/* Alert Banner for Severe Weather - Filtered */}
      {realAlerts.length > 0 && (
        <AlertBanner
          alerts={realAlerts}
          onViewDetails={() => setSelectedAlert(realAlerts[0])}
        />
      )}
    </div>
  );
}

const StatBox = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-black/10 p-3 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
    <div className="flex items-center gap-2 opacity-60 mb-1 text-[10px] font-bold uppercase tracking-wider group-hover:text-yellow-400 transition-colors">
      <Icon size={12} /> {label}
    </div>
    <div className="font-bold text-lg">{value}</div>
    {sub && <div className="text-[10px] opacity-40">{sub}</div>}
  </div>
);
