import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Sparkles,
  Upload,
  Settings,
  Eye,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Loader2,
  X,
  Image as ImageIcon,
  Hash,
  FileText,
  Download,
  RefreshCw,
  Building2,
  Clock,
  Plus,
  Instagram,
  Zap,
  ArrowRight,
  Target,
  Palette,
  Calendar,
  Send,
  ExternalLink,
  Globe,
} from "lucide-react";

const API_BASE = "/api";

// ════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ════════════════════════════════════════════════════════════════════════════
const translations = {
  it: {
    // Header
    subtitle: "Instagram Content Generator",
    stepOf: "di",

    // Steps
    steps: [
      { title: "Brand", description: "Identità" },
      { title: "Campagna", description: "Obiettivi" },
      { title: "Media", description: "Contenuti" },
      { title: "Output", description: "Risultati" },
    ],

    // Step 1 - Brand
    step1Title: "Configura il tuo",
    step1Highlight: "Brand",
    step1Desc:
      "Inserisci le informazioni per generare contenuti autentici e personalizzati",
    identity: "Identità",
    identityDesc: "Chi sei e cosa fai",
    brandName: "Nome Brand",
    brandNamePlaceholder: "es. Artisan Studio",
    description: "Descrizione",
    descriptionPlaceholder:
      "es. Creiamo gioielli artigianali in argento e pietre naturali...",
    tagline: "Tagline",
    taglinePlaceholder: "es. Artigianato dal 2000",
    taglineHint: "Chiusura dei post",
    history: "Storia",
    historyPlaceholder: "es. Attivo dal 2010, presente alle fiere...",
    hashtags: "Hashtag",
    hashtagsDesc: "Visibilità e reach",
    requiredHashtags: "Hashtag Obbligatori",
    requiredHashtagsHint: "Sempre inclusi in ogni post",
    noHashtags: "Nessun hashtag",
    additionalHashtags: "Hashtag Aggiuntivi",
    additionalHashtagsHint: "Hashtag base del brand",
    optional: "Opzionale",

    // Step 2 - Campaign
    step2Title: "Definisci la",
    step2Highlight: "Campagna",
    step2Desc: "Obiettivi e parametri per questa settimana di contenuti",
    goals: "Obiettivi",
    goalsDesc: "Cosa vuoi ottenere",
    goal: "Goal",
    goalPlaceholder: "es. Aumentare engagement del 20%",
    theme: "Theme",
    themePlaceholder: "es. Collezione Primavera 2025",
    featuredCategory: "Featured Category",
    featuredCategoryPlaceholder: "es. collane, anelli, bracciali",
    nPosts: "Numero Post",
    includeCta: "Include CTA domenicale",
    noCta: "Senza CTA finale",
    parameters: "Parametri",
    parametersDesc: "Personalizzazione",
    ctaMode: "CTA Mode",
    voice: "Voice",
    availability: "Availability",
    noAvailability: "Non menzionare disponibilità",
    showAvailability: "Mostra disponibilità",
    calendarPreview: "Anteprima Calendario",

    // Step 3 - Images
    step3Title: "Carica le",
    step3Highlight: "Immagini",
    step3Desc: "Servono almeno",
    step3Desc2: "immagini con prefisso template",
    dragImages: "Trascina qui le immagini",
    orClick: "oppure clicca per selezionare",
    uploaded: "Caricate",
    readyToGenerate: "Pronto per generare",
    generating: "Generazione in corso",
    generatingDesc: "Comunicazione con OpenAI in corso...",

    // Step 4 - Results
    step4Title: "I tuoi",
    step4Highlight: "Contenuti",
    postsReady: "post pronti per",
    weekBrief: "Week Brief",
    keywords: "Keywords",
    copyCaption: "Copia Caption",
    copied: "Copiato!",
    newCampaign: "Nuova Campagna",
    exportJson: "Esporta JSON",

    // Navigation
    back: "Indietro",
    continue: "Continua",
    generateContent: "Genera Contenuti",

    // Days
    days: {
      mon: "Lunedì",
      tue: "Martedì",
      wed: "Mercoledì",
      thu: "Giovedì",
      fri: "Venerdì",
      sat: "Sabato",
      sun: "Domenica",
    },
    daysShort: {
      mon: "L",
      tue: "M",
      wed: "M",
      thu: "G",
      fri: "V",
      sat: "S",
      sun: "D",
    },
  },
  en: {
    // Header
    subtitle: "Instagram Content Generator",
    stepOf: "of",

    // Steps
    steps: [
      { title: "Brand", description: "Identity" },
      { title: "Campaign", description: "Goals" },
      { title: "Media", description: "Content" },
      { title: "Output", description: "Results" },
    ],

    // Step 1 - Brand
    step1Title: "Configure your",
    step1Highlight: "Brand",
    step1Desc:
      "Enter information to generate authentic and personalized content",
    identity: "Identity",
    identityDesc: "Who you are and what you do",
    brandName: "Brand Name",
    brandNamePlaceholder: "e.g. Artisan Studio",
    description: "Description",
    descriptionPlaceholder:
      "e.g. We create handcrafted silver jewelry with natural stones...",
    tagline: "Tagline",
    taglinePlaceholder: "e.g. Craftsmanship since 2000",
    taglineHint: "Post closing line",
    history: "History",
    historyPlaceholder: "e.g. Active since 2010, present at major fairs...",
    hashtags: "Hashtags",
    hashtagsDesc: "Visibility and reach",
    requiredHashtags: "Required Hashtags",
    requiredHashtagsHint: "Always included in every post",
    noHashtags: "No hashtags",
    additionalHashtags: "Additional Hashtags",
    additionalHashtagsHint: "Brand base hashtags",
    optional: "Optional",

    // Step 2 - Campaign
    step2Title: "Define your",
    step2Highlight: "Campaign",
    step2Desc: "Goals and parameters for this week of content",
    goals: "Goals",
    goalsDesc: "What you want to achieve",
    goal: "Goal",
    goalPlaceholder: "e.g. Increase engagement by 20%",
    theme: "Theme",
    themePlaceholder: "e.g. Spring 2025 Collection",
    featuredCategory: "Featured Category",
    featuredCategoryPlaceholder: "e.g. necklaces, rings, bracelets",
    nPosts: "Number of Posts",
    includeCta: "Includes Sunday CTA",
    noCta: "Without final CTA",
    parameters: "Parameters",
    parametersDesc: "Customization",
    ctaMode: "CTA Mode",
    voice: "Voice",
    availability: "Availability",
    noAvailability: "Don't mention availability",
    showAvailability: "Show availability",
    calendarPreview: "Calendar Preview",

    // Step 3 - Images
    step3Title: "Upload your",
    step3Highlight: "Images",
    step3Desc: "You need at least",
    step3Desc2: "images with template prefix",
    dragImages: "Drag images here",
    orClick: "or click to select",
    uploaded: "Uploaded",
    readyToGenerate: "Ready to generate",
    generating: "Generating",
    generatingDesc: "Communicating with OpenAI...",

    // Step 4 - Results
    step4Title: "Your",
    step4Highlight: "Content",
    postsReady: "posts ready for",
    weekBrief: "Week Brief",
    keywords: "Keywords",
    copyCaption: "Copy Caption",
    copied: "Copied!",
    newCampaign: "New Campaign",
    exportJson: "Export JSON",

    // Navigation
    back: "Back",
    continue: "Continue",
    generateContent: "Generate Content",

    // Days
    days: {
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday",
      sun: "Sunday",
    },
    daysShort: {
      mon: "M",
      tue: "T",
      wed: "W",
      thu: "T",
      fri: "F",
      sat: "S",
      sun: "S",
    },
  },
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 max-w-lg">
            <h2 className="text-xl font-bold text-red-400 mb-4">
              Errore di Rendering
            </h2>
            <p className="text-zinc-400 mb-4">
              Si è verificato un errore. Controlla la console per dettagli.
            </p>
            <pre className="text-xs text-red-300 bg-black/50 p-4 rounded overflow-auto max-h-40">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Ricarica Pagina
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// REACTBITS-INSPIRED COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

// Aurora Background
const Aurora = () => (
  <div className="aurora-container">
    <div className="aurora-layer aurora-layer-1" />
    <div className="aurora-layer aurora-layer-2" />
    <div className="aurora-layer aurora-layer-3" />
    <div className="aurora-layer aurora-layer-4" />
  </div>
);

// Beams Effect
const Beams = () => (
  <div className="beams-container">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="beam" />
    ))}
  </div>
);

// Blur Text Animation - SNAPPY
const BlurText = ({ children, delay = 0, className = "" }) => (
  <motion.span
    initial={{ opacity: 0, filter: "blur(8px)", y: 20 }}
    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={`inline-block ${className}`}
  >
    {children}
  </motion.span>
);

// Split Text Animation (word by word) - SNAPPY
const SplitText = ({ children, className = "", staggerDelay = 0.04 }) => {
  const words = children.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: i * staggerDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

// Shiny Text with animated gradient
const ShinyText = ({ children, className = "" }) => (
  <span className={`shiny-text ${className}`}>{children}</span>
);

// Gradient Text
const GradientText = ({ children, className = "" }) => (
  <span className={`gradient-text ${className}`}>{children}</span>
);

// Decrypted Text Effect
const DecryptedText = ({ children, className = "" }) => {
  const [displayText, setDisplayText] = useState("");
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

  useEffect(() => {
    const text = children;
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, i) => {
            if (i < iteration) return char;
            if (char === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      iteration += 1 / 3;
      if (iteration >= text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [children]);

  return <span className={className}>{displayText}</span>;
};

// Counter with spring animation
const Counter = ({ value, duration = 2 }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const rounded = useTransform(springValue, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return rounded.on("change", (v) => setDisplay(v));
  }, [rounded]);

  return <span className="counter">{display}</span>;
};

// Spotlight Card with mouse tracking - SNAPPY
const SpotlightCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card ${className}`}
      style={{ "--mouse-x": `${position.x}%`, "--mouse-y": `${position.y}%` }}
      whileHover={!isMobile ? { scale: 1.01 } : {}}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
};

// Magnetic Button Effect - SNAPPY
const MagneticButton = ({
  children,
  className = "",
  strength = 0.2,
  ...props
}) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 500, damping: 20 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.97 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Click Spark Effect
const ClickSpark = ({ children, sparkCount = 8, sparkColor = "#f97316" }) => {
  const [sparks, setSparks] = useState([]);

  const createSparks = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparks = [...Array(sparkCount)].map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (360 / sparkCount) * i,
      distance: 30 + Math.random() * 20,
    }));

    setSparks((prev) => [...prev, ...newSparks]);
    setTimeout(() => {
      setSparks((prev) =>
        prev.filter((s) => !newSparks.find((ns) => ns.id === s.id))
      );
    }, 600);
  };

  return (
    <div className="relative" onClick={createSparks}>
      {children}
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            className="spark"
            initial={{
              x: spark.x,
              y: spark.y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x:
                spark.x +
                Math.cos((spark.angle * Math.PI) / 180) * spark.distance,
              y:
                spark.y +
                Math.sin((spark.angle * Math.PI) / 180) * spark.distance,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: sparkColor,
              boxShadow: `0 0 6px ${sparkColor}, 0 0 12px ${sparkColor}40`,
              pointerEvents: "none",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Animated List Item - SNAPPY
const AnimatedListItem = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -10, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 10, scale: 0.95 }}
    transition={{
      duration: 0.15,
      delay: index * 0.02,
      ease: [0.25, 0.1, 0.25, 1],
    }}
  >
    {children}
  </motion.div>
);

// Tilt Card - disabled on mobile
const TiltCard = ({ children, className = "", tiltAmount = 8 }) => {
  const cardRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springConfig = { stiffness: 400, damping: 25 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);
    rotateY.set(percentX * tiltAmount);
    rotateX.set(-percentY * tiltAmount);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  if (isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ════════════════════════════════════════════════════════════════════════════

// Step icons only - titles from translations
const STEP_ICONS = [Building2, Target, ImageIcon, Sparkles];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [lang, setLang] = useState("it");

  // Translation helper
  const t = useCallback((key) => translations[lang][key], [lang]);

  // State
  const [brand, setBrand] = useState({
    brand_name: "",
    brand_description: "",
    brand_tagline: "",
    brand_history: "",
    required_hashtags: [],
    base_hashtags: [],
  });

  const [campaign, setCampaign] = useState({
    goal: "",
    theme: "",
    n_posts: 6,
    cta_mode: "dm",
    voice: "minimal",
    featured_category: "",
    availability_policy: "no_availability",
    strict_routing: false,
  });

  const [images, setImages] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [newRequiredHashtag, setNewRequiredHashtag] = useState("");
  const [newBaseHashtag, setNewBaseHashtag] = useState("");

  // Effects
  useEffect(() => {
    fetchSchedulePreview();
  }, [campaign.n_posts]);

  const fetchSchedulePreview = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/schedule-preview?n_posts=${campaign.n_posts}`
      );
      if (!res.ok) {
        console.error("Schedule preview failed:", res.status);
        return;
      }
      const data = await res.json();
      setSchedule(data.schedule || []);
    } catch (err) {
      console.error("Schedule fetch failed:", err);
      setSchedule([]);
    }
  };

  // Handlers
  const handleImageUpload = useCallback(async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    try {
      const res = await fetch(`${API_BASE}/upload-multiple`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setImages((prev) => [...prev, ...data.uploaded]);
    } catch (err) {
      setError("Upload failed");
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.currentTarget.classList.remove("active");
      if (e.dataTransfer.files.length > 0)
        handleImageUpload(e.dataTransfer.files);
    },
    [handleImageUpload]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("active");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("active");
  };

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const addHashtag = (type) => {
    const value = type === "required" ? newRequiredHashtag : newBaseHashtag;
    if (!value.trim()) return;

    // Split by spaces, commas, or newlines to support multiple hashtags at once
    const tags = value
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    if (type === "required") {
      const newTags = tags.filter(
        (tag) => !brand.required_hashtags.includes(tag)
      );
      if (newTags.length > 0) {
        setBrand((prev) => ({
          ...prev,
          required_hashtags: [...prev.required_hashtags, ...newTags],
        }));
      }
      setNewRequiredHashtag("");
    } else {
      const newTags = tags.filter((tag) => !brand.base_hashtags.includes(tag));
      if (newTags.length > 0) {
        setBrand((prev) => ({
          ...prev,
          base_hashtags: [...prev.base_hashtags, ...newTags],
        }));
      }
      setNewBaseHashtag("");
    }
  };

  const removeHashtag = (type, index) => {
    if (type === "required") {
      setBrand((prev) => ({
        ...prev,
        required_hashtags: prev.required_hashtags.filter((_, i) => i !== index),
      }));
    } else {
      setBrand((prev) => ({
        ...prev,
        base_hashtags: prev.base_hashtags.filter((_, i) => i !== index),
      }));
    }
  };

  const generatePosts = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 2, 85));
      }, 400);

      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...campaign,
          ...brand,
          images: images.map((img) => img.path),
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(95);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Generation failed");
      }

      const data = await res.json();
      console.log("Generation response:", data); // Debug log
      setResults(data);
      setGenerationProgress(100);
      setTimeout(() => setCurrentStep(3), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return (
          brand.brand_name.trim() &&
          brand.brand_description.trim() &&
          brand.required_hashtags.length > 0
        );
      case 1:
        return campaign.goal.trim() && campaign.theme.trim();
      case 2:
        return images.length >= campaign.n_posts;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceed()) {
      if (currentStep === 2) generatePosts();
      else setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => currentStep > 0 && setCurrentStep((prev) => prev - 1);

  const resetAll = () => {
    setCurrentStep(0);
    setResults(null);
    setImages([]);
    setBrand({
      brand_name: "",
      brand_description: "",
      brand_tagline: "",
      brand_history: "",
      required_hashtags: [],
      base_hashtags: [],
    });
    setCampaign({
      goal: "",
      theme: "",
      n_posts: 6,
      cta_mode: "dm",
      voice: "minimal",
      featured_category: "",
      availability_policy: "no_availability",
      strict_routing: false,
    });
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <Aurora />
      <Beams />
      <div className="grid-pattern" />
      <div className="noise-overlay" />

      {/* Header */}
      <header className="relative-z border-b border-white/5 backdrop-blur-heavy sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative group">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/25"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Instagram className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-black flex items-center justify-center border-2 border-orange-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-orange-400" />
                </motion.div>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl tracking-tight">
                  <span className="text-white">Copy</span>
                  <GradientText>AI</GradientText>
                </h1>
                <p className="text-[10px] text-zinc-500">{t("subtitle")}</p>
              </div>
            </motion.div>

            {/* Step Progress - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {t("steps").map((step, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <React.Fragment key={i}>
                    <motion.button
                      onClick={() => i < currentStep && setCurrentStep(i)}
                      disabled={i > currentStep}
                      className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        i === currentStep
                          ? "bg-orange-500/15 border border-orange-500/30"
                          : i < currentStep
                          ? "hover:bg-white/5 cursor-pointer"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={i <= currentStep ? { scale: 1.02 } : {}}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                          i === currentStep
                            ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                            : i < currentStep
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-zinc-800/50 text-zinc-600"
                        }`}
                      >
                        {i < currentStep ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="text-left">
                        <p
                          className={`font-semibold text-sm ${
                            i === currentStep
                              ? "text-orange-400"
                              : "text-zinc-300"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {step.description}
                        </p>
                      </div>
                    </motion.button>
                    {i < 3 && (
                      <div
                        className={`w-6 h-0.5 rounded-full transition-colors ${
                          i < currentStep ? "bg-orange-500" : "bg-zinc-800"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Right side: Language + Mobile dots */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <motion.button
                onClick={() => setLang(lang === "it" ? "en" : "it")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Globe className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-300 uppercase">
                  {lang}
                </span>
              </motion.button>

              {/* Mobile Step Indicator */}
              <div className="lg:hidden flex items-center gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStep
                        ? "bg-orange-500 w-6"
                        : i < currentStep
                        ? "bg-orange-500/50 w-2"
                        : "bg-zinc-700 w-2"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative-z container pt-8 pb-60">
        <AnimatePresence mode="wait">
          {/* ═══════════ STEP 0: BRAND ═══════════ */}
          {currentStep === 0 && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 badge badge-accent mb-5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Step 1 {t("stepOf")} 4</span>
                </motion.div>

                <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                  <BlurText delay={0.1}>{t("step1Title")}</BlurText>{" "}
                  <ShinyText className="font-display text-4xl md:text-5xl font-bold">
                    {t("step1Highlight")}
                  </ShinyText>
                </h2>

                <motion.p
                  className="text-zinc-400 text-base max-w-lg mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {t("step1Desc")}
                </motion.p>
              </div>

              {/* Cards Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Identity Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TiltCard tiltAmount={5}>
                    <SpotlightCard className="p-6 h-full">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/20">
                          <Building2 className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg">
                            {t("identity")}
                          </h3>
                          <p className="text-zinc-500 text-xs">
                            {t("identityDesc")}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="label">{t("brandName")} *</label>
                          <input
                            type="text"
                            className="input"
                            placeholder={t("brandNamePlaceholder")}
                            value={brand.brand_name}
                            onChange={(e) =>
                              setBrand((prev) => ({
                                ...prev,
                                brand_name: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="label">{t("description")} *</label>
                          <textarea
                            className="input"
                            rows={3}
                            placeholder={t("descriptionPlaceholder")}
                            value={brand.brand_description}
                            onChange={(e) =>
                              setBrand((prev) => ({
                                ...prev,
                                brand_description: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="label">{t("tagline")}</label>
                          <input
                            type="text"
                            className="input"
                            placeholder={t("taglinePlaceholder")}
                            value={brand.brand_tagline}
                            onChange={(e) =>
                              setBrand((prev) => ({
                                ...prev,
                                brand_tagline: e.target.value,
                              }))
                            }
                          />
                          <p className="text-[11px] text-zinc-600 mt-2">
                            {t("taglineHint")}
                          </p>
                        </div>

                        <div>
                          <label className="label">{t("history")}</label>
                          <textarea
                            className="input"
                            rows={2}
                            placeholder={t("historyPlaceholder")}
                            value={brand.brand_history}
                            onChange={(e) =>
                              setBrand((prev) => ({
                                ...prev,
                                brand_history: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </SpotlightCard>
                  </TiltCard>
                </motion.div>

                {/* Hashtags Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <TiltCard tiltAmount={5}>
                    <SpotlightCard className="p-6 h-full">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/20">
                          <Hash className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg">
                            {t("hashtags")}
                          </h3>
                          <p className="text-zinc-500 text-xs">
                            {t("hashtagsDesc")}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Required Hashtags */}
                        <div>
                          <label className="label">
                            {t("requiredHashtags")} *
                          </label>
                          <p className="text-[11px] text-zinc-600 mb-3">
                            {t("requiredHashtagsHint")}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <AnimatePresence mode="popLayout">
                              {brand.required_hashtags.length === 0 ? (
                                <span className="text-zinc-600 text-sm">
                                  {t("noHashtags")}
                                </span>
                              ) : (
                                brand.required_hashtags.map((tag, i) => (
                                  <AnimatedListItem key={tag} index={i}>
                                    <span className="badge badge-accent flex items-center gap-1.5 pr-1.5">
                                      {tag}
                                      <button
                                        onClick={() =>
                                          removeHashtag("required", i)
                                        }
                                        className="w-4 h-4 rounded-full bg-orange-500/20 hover:bg-orange-500/40 flex items-center justify-center transition-colors"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </span>
                                  </AnimatedListItem>
                                ))
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                className="input"
                                placeholder="#handmade"
                                value={newRequiredHashtag}
                                onChange={(e) =>
                                  setNewRequiredHashtag(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), addHashtag("required"))
                                }
                              />
                            </div>
                            <ClickSpark sparkCount={6}>
                              <MagneticButton
                                onClick={() => addHashtag("required")}
                                className="btn btn-secondary h-[48px] w-[48px] p-0"
                              >
                                <Plus className="w-5 h-5" />
                              </MagneticButton>
                            </ClickSpark>
                          </div>
                        </div>

                        {/* Base Hashtags */}
                        <div>
                          <label className="label">
                            {t("additionalHashtags")}
                          </label>
                          <p className="text-[11px] text-zinc-600 mb-3">
                            {t("additionalHashtagsHint")}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <AnimatePresence mode="popLayout">
                              {brand.base_hashtags.length === 0 ? (
                                <span className="text-zinc-600 text-sm">
                                  {t("optional")}
                                </span>
                              ) : (
                                brand.base_hashtags.map((tag, i) => (
                                  <AnimatedListItem key={tag} index={i}>
                                    <span className="badge badge-neutral flex items-center gap-1.5 pr-1.5">
                                      {tag}
                                      <button
                                        onClick={() => removeHashtag("base", i)}
                                        className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </span>
                                  </AnimatedListItem>
                                ))
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                className="input"
                                placeholder="#madeinitaly"
                                value={newBaseHashtag}
                                onChange={(e) =>
                                  setNewBaseHashtag(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), addHashtag("base"))
                                }
                              />
                            </div>
                            <MagneticButton
                              onClick={() => addHashtag("base")}
                              className="btn btn-secondary h-[48px] w-[48px] p-0"
                            >
                              <Plus className="w-5 h-5" />
                            </MagneticButton>
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  </TiltCard>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ STEP 1: CAMPAIGN ═══════════ */}
          {currentStep === 1 && (
            <motion.div
              key="campaign"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 badge badge-accent mb-5"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Step 2 {t("stepOf")} 4</span>
                </motion.div>
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                  <BlurText delay={0.1}>{t("step2Title")}</BlurText>{" "}
                  <ShinyText className="font-display text-4xl md:text-5xl font-bold">
                    {t("step2Highlight")}
                  </ShinyText>
                </h2>
                <motion.p
                  className="text-zinc-400 text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {t("step2Desc")}
                </motion.p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Goals */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TiltCard tiltAmount={5}>
                    <SpotlightCard className="p-6 h-full">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/20">
                          <Zap className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg">
                            {t("goals")}
                          </h3>
                          <p className="text-zinc-500 text-xs">
                            {t("goalsDesc")}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="label">{t("goal")} *</label>
                          <input
                            type="text"
                            className="input"
                            placeholder={t("goalPlaceholder")}
                            value={campaign.goal}
                            onChange={(e) =>
                              setCampaign((prev) => ({
                                ...prev,
                                goal: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="label">{t("theme")} *</label>
                          <input
                            type="text"
                            className="input"
                            placeholder={t("themePlaceholder")}
                            value={campaign.theme}
                            onChange={(e) =>
                              setCampaign((prev) => ({
                                ...prev,
                                theme: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="label">
                            {t("featuredCategory")}
                          </label>
                          <input
                            type="text"
                            className="input"
                            placeholder={t("featuredCategoryPlaceholder")}
                            value={campaign.featured_category}
                            onChange={(e) =>
                              setCampaign((prev) => ({
                                ...prev,
                                featured_category: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="label">
                            {t("nPosts")}:{" "}
                            <span className="text-orange-400 font-bold text-lg">
                              {campaign.n_posts}
                            </span>
                          </label>
                          <div className="mt-3 px-1">
                            <input
                              type="range"
                              min="1"
                              max="7"
                              value={campaign.n_posts}
                              onChange={(e) =>
                                setCampaign((prev) => ({
                                  ...prev,
                                  n_posts: parseInt(e.target.value),
                                }))
                              }
                              className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 
                                [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full 
                                [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-orange-400 
                                [&::-webkit-slider-thumb]:to-orange-600 [&::-webkit-slider-thumb]:shadow-lg
                                [&::-webkit-slider-thumb]:shadow-orange-500/40 [&::-webkit-slider-thumb]:border-2
                                [&::-webkit-slider-thumb]:border-orange-300/50"
                            />
                          </div>
                          <p className="text-xs text-zinc-500 mt-3 flex items-center gap-2">
                            {campaign.n_posts >= 7 ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-400" />{" "}
                                {t("includeCta")}
                              </>
                            ) : (
                              <>
                                <Calendar className="w-3.5 h-3.5" />{" "}
                                {t("noCta")}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </SpotlightCard>
                  </TiltCard>
                </motion.div>

                {/* Parameters */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <TiltCard tiltAmount={5}>
                    <SpotlightCard className="p-6 h-full">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/20">
                          <Settings className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg">
                            {t("parameters")}
                          </h3>
                          <p className="text-zinc-500 text-xs">
                            {t("parametersDesc")}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="label">{t("ctaMode")}</label>
                            <select
                              className="select"
                              value={campaign.cta_mode}
                              onChange={(e) =>
                                setCampaign((prev) => ({
                                  ...prev,
                                  cta_mode: e.target.value,
                                }))
                              }
                            >
                              <option value="dm">DM</option>
                              <option value="link_in_bio">Link in Bio</option>
                              <option value="fiera">Fiera</option>
                            </select>
                          </div>
                          <div>
                            <label className="label">{t("voice")}</label>
                            <select
                              className="select"
                              value={campaign.voice}
                              onChange={(e) =>
                                setCampaign((prev) => ({
                                  ...prev,
                                  voice: e.target.value,
                                }))
                              }
                            >
                              <option value="minimal">Minimal</option>
                              <option value="warm">Warm</option>
                              <option value="professional">Professional</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="label">{t("availability")}</label>
                          <select
                            className="select"
                            value={campaign.availability_policy}
                            onChange={(e) =>
                              setCampaign((prev) => ({
                                ...prev,
                                availability_policy: e.target.value,
                              }))
                            }
                          >
                            <option value="no_availability">
                              {t("noAvailability")}
                            </option>
                            <option value="show_availability">
                              {t("showAvailability")}
                            </option>
                          </select>
                        </div>

                        {/* Schedule Preview */}
                        {schedule.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-zinc-800">
                            <label className="label mb-3">
                              {t("calendarPreview")}
                            </label>
                            <div className="grid grid-cols-7 gap-1">
                              {schedule.map((slot, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.03 }}
                                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-center ${
                                    slot.cta_enabled
                                      ? "bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30"
                                      : "bg-zinc-800/50 border border-zinc-700/30"
                                  }`}
                                >
                                  <span className="text-[9px] text-zinc-500 font-medium">
                                    {t("daysShort")[slot.day_code]}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold ${
                                      slot.cta_enabled
                                        ? "text-orange-400"
                                        : "text-zinc-400"
                                    }`}
                                  >
                                    {slot.template_id.split("_")[0].charAt(0)}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </SpotlightCard>
                  </TiltCard>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ STEP 2: IMAGES ═══════════ */}
          {currentStep === 2 && (
            <motion.div
              key="images"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 badge badge-accent mb-5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Step 3 {t("stepOf")} 4</span>
                </motion.div>
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                  <BlurText delay={0.1}>{t("step3Title")}</BlurText>{" "}
                  <ShinyText className="font-display text-4xl md:text-5xl font-bold">
                    {t("step3Highlight")}
                  </ShinyText>
                </h2>
                <motion.p
                  className="text-zinc-400 text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {t("step3Desc")}{" "}
                  <span className="text-orange-400 font-bold">
                    {campaign.n_posts}
                  </span>{" "}
                  {t("step3Desc2")}
                </motion.p>
              </div>

              {/* Dropzone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div
                  className="dropzone"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />

                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 flex items-center justify-center border border-orange-500/20 mb-5">
                      <Upload className="w-8 h-8 text-orange-400" />
                    </div>
                  </motion.div>

                  <p className="text-xl font-display font-bold mb-2">
                    {t("dragImages")}
                  </p>
                  <p className="text-zinc-500 text-sm mb-6">{t("orClick")}</p>

                  <div className="flex flex-wrap justify-center gap-2">
                    {["oggetto_", "dettaglio_", "processo_", "storia_"].map(
                      (prefix, i) => (
                        <motion.span
                          key={prefix}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="badge badge-neutral"
                        >
                          {prefix}*.jpg
                        </motion.span>
                      )
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Uploaded Images */}
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 mb-8"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display font-bold text-base">
                      {t("uploaded")}:{" "}
                      <GradientText>{images.length}</GradientText>/
                      {campaign.n_posts}
                    </h3>
                    {images.length >= campaign.n_posts && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="badge badge-success"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />{" "}
                        {t("readyToGenerate")}
                      </motion.span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence mode="popLayout">
                      {images.map((img, i) => (
                        <motion.div
                          key={img.filename}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: i * 0.03 }}
                          className="group relative"
                        >
                          <SpotlightCard className="p-2">
                            <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 mb-2">
                              <img
                                src={img.path}
                                alt={img.filename}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <p className="text-xs font-medium truncate px-1">
                              {img.filename}
                            </p>
                            <span
                              className={`badge mt-1.5 text-[10px] ${
                                img.inferred_template !== "unknown"
                                  ? "badge-accent"
                                  : "badge-neutral"
                              }`}
                            >
                              {img.inferred_template}
                            </span>
                          </SpotlightCard>

                          {/* Delete button - outside SpotlightCard for correct positioning */}
                          <button
                            type="button"
                            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-black/90 backdrop-blur-sm
                              flex items-center justify-center hover:bg-red-500 transition-colors border border-white/20 z-30"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(i);
                            }}
                          >
                            <X className="w-3.5 h-3.5 text-white" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Generation Progress */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10"
                >
                  <SpotlightCard className="p-10 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-xl shadow-orange-500/30"
                    >
                      <Loader2 className="w-8 h-8 text-white" />
                    </motion.div>

                    <h3 className="font-display text-2xl font-bold mb-2">
                      <DecryptedText>{t("generating")}</DecryptedText>
                    </h3>
                    <p className="text-zinc-400 text-sm mb-8">
                      {t("generatingDesc")}
                    </p>

                    <div className="max-w-sm mx-auto">
                      <div className="progress-container">
                        <div className="progress-bar">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${generationProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                      <p className="text-lg font-bold text-orange-400 mt-3">
                        <Counter value={generationProgress} duration={0.3} />%
                      </p>
                    </div>
                  </SpotlightCard>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══════════ STEP 3: RESULTS ═══════════ */}
          {currentStep === 3 && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Success Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/40"
                >
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </motion.div>

                <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                  <SplitText>{`${t("step4Title")} ${t(
                    "step4Highlight"
                  )}`}</SplitText>
                </h2>
                <motion.p
                  className="text-zinc-400 text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Counter value={results.posts?.length || 0} duration={1} />{" "}
                  {t("postsReady")}{" "}
                  <GradientText>{brand.brand_name}</GradientText>
                </motion.p>
              </div>

              {/* Week Brief */}
              {results.week_brief && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-4xl mx-auto mb-10"
                >
                  <SpotlightCard className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-orange-400" />
                      </div>
                      <h3 className="font-display font-bold text-base">
                        {t("weekBrief")}
                      </h3>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        {
                          label: t("theme"),
                          value: results.week_brief?.theme || "-",
                          icon: Palette,
                        },
                        {
                          label: t("goal"),
                          value: results.week_brief?.goal || "-",
                          icon: Target,
                        },
                        {
                          label: t("keywords"),
                          value:
                            results.week_brief?.keywords
                              ?.slice(0, 3)
                              .join(", ") || "-",
                          icon: Hash,
                        },
                        {
                          label: "CTA",
                          value: results.week_brief?.cta?.text || "-",
                          icon: Send,
                        },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <item.icon className="w-3 h-3 text-zinc-500" />
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                              {item.label}
                            </p>
                          </div>
                          <p className="font-medium text-sm line-clamp-2">
                            {item.value}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </SpotlightCard>
                </motion.div>
              )}

              {/* Posts Grid */}
              {results.posts && results.posts.length > 0 && (
                <div className="grid lg:grid-cols-2 gap-5 max-w-6xl mx-auto">
                  {results.posts.map((post, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                    >
                      <TiltCard tiltAmount={3}>
                        <SpotlightCard className="overflow-hidden">
                          {/* Header */}
                          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  post.post_role === "cta"
                                    ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30"
                                    : "bg-zinc-800/80"
                                }`}
                              >
                                <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-display font-bold">
                                  {t("days")[post.day_name] ||
                                    post.day_name ||
                                    `Post ${i + 1}`}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {post.template_id || ""}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`badge ${
                                post.post_role === "cta"
                                  ? "badge-accent"
                                  : "badge-neutral"
                              }`}
                            >
                              {post.post_role || "post"}
                            </span>
                          </div>

                          {/* IG Preview */}
                          <div className="p-5">
                            <div className="ig-mock">
                              <div className="ig-header">
                                <div className="ig-avatar">
                                  {brand.brand_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="ig-username">
                                  {brand.brand_name
                                    .toLowerCase()
                                    .replace(/\s+/g, "")}
                                </span>
                              </div>

                              {post.image_url && (
                                <div className="ig-image">
                                  <img src={post.image_url} alt="" />
                                </div>
                              )}

                              <div className="ig-content">
                                {post.title && (
                                  <p className="font-bold mb-2">{post.title}</p>
                                )}
                                <p className="text-sm text-zinc-300 leading-relaxed mb-3 line-clamp-3">
                                  {post.caption || ""}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {(post.content?.hashtags || [])
                                    .slice(0, 5)
                                    .map((tag, j) => (
                                      <span
                                        key={j}
                                        className="text-xs text-orange-400/80"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  {(post.content?.hashtags?.length || 0) >
                                    5 && (
                                    <span className="text-xs text-zinc-600">
                                      +{post.content.hashtags.length - 5}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="p-4 border-t border-zinc-800/50 flex gap-2">
                            <ClickSpark sparkCount={10}>
                              <MagneticButton
                                onClick={() =>
                                  copyToClipboard(
                                    post.ig_caption_full || post.caption || "",
                                    i
                                  )
                                }
                                className="btn btn-secondary flex-1"
                              >
                                {copiedIndex === i ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-400" />{" "}
                                    {t("copied")}
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />{" "}
                                    {t("copyCaption")}
                                  </>
                                )}
                              </MagneticButton>
                            </ClickSpark>
                            <MagneticButton
                              onClick={() =>
                                copyToClipboard(
                                  (post.content?.hashtags || []).join(" "),
                                  `h${i}`
                                )
                              }
                              className="btn btn-ghost"
                            >
                              <Hash className="w-4 h-4" />
                            </MagneticButton>
                          </div>
                        </SpotlightCard>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Export Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-3 mt-12"
              >
                <ClickSpark>
                  <MagneticButton
                    onClick={resetAll}
                    className="btn btn-secondary"
                  >
                    <RefreshCw className="w-4 h-4" /> {t("newCampaign")}
                  </MagneticButton>
                </ClickSpark>
                <ClickSpark sparkColor="#22c55e">
                  <MagneticButton
                    onClick={() => {
                      const blob = new Blob(
                        [JSON.stringify({ brand, campaign, results }, null, 2)],
                        { type: "application/json" }
                      );
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = `${brand.brand_name
                        .replace(/\s+/g, "-")
                        .toLowerCase()}-posts-${
                        new Date().toISOString().split("T")[0]
                      }.json`;
                      a.click();
                    }}
                    className="btn btn-primary"
                  >
                    <Download className="w-4 h-4" /> {t("exportJson")}
                  </MagneticButton>
                </ClickSpark>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-28 right-6 z-50"
            >
              <div className="glass p-5 flex items-center gap-4 rounded-2xl border-red-500/30 bg-red-500/10 max-w-md shadow-2xl">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-red-300 text-sm flex-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      {currentStep < 3 && !isGenerating && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/50 bg-black/80 backdrop-blur-heavy">
          <div className="container py-4 flex justify-between items-center">
            <MagneticButton
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`btn btn-ghost ${
                currentStep === 0 ? "opacity-30" : ""
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> {t("back")}
            </MagneticButton>

            <ClickSpark sparkCount={12}>
              <MagneticButton
                onClick={nextStep}
                disabled={!canProceed()}
                className={`btn btn-primary min-w-[180px] ${
                  !canProceed() ? "opacity-40" : ""
                }`}
              >
                {currentStep === 2 ? (
                  <>
                    <Sparkles className="w-5 h-5" /> {t("generateContent")}
                  </>
                ) : (
                  <>
                    {t("continue")} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </MagneticButton>
            </ClickSpark>
          </div>
        </footer>
      )}
    </div>
  );
}
