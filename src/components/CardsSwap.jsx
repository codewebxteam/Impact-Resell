import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { Check, ArrowRight, Zap, Crown, Star, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase/config";

// ==========================================
// SECTION 1: DYNAMIC CARD DESIGNS (Styled)
// ==========================================

// Style 1: White Card
const FrontendCard = ({ data }) => {
  const info = {
    title: data?.title || "Course Title",
    desc: data?.description || "Master new skills with our expert led courses.",
    price: data?.price || "2,999",
    features: ["Instant Access", "Video Lessons", "Secure Content"],
  };

  return (
    <div className="size-full bg-white rounded-4xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 size-32 bg-[#f0fdff] rounded-bl-[4rem] -mr-4 -mt-4 z-0 transition-transform duration-700 group-hover:scale-110" />
      <div className="relative z-10">
        <div className="size-10 md:size-12 bg-[#f0fdff] rounded-2xl flex items-center justify-center text-[#0891b2] mb-4 md:mb-6">
          <Zap className="size-5 md:size-6" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 line-clamp-1">
          {info.title}
        </h3>
        <p className="text-slate-500 mt-2 text-sm font-medium line-clamp-2">
          {info.desc}
        </p>
      </div>
      <div className="relative z-10">
        <div className="flex items-baseline gap-1 mb-4 md:mb-6">
          <span className="text-3xl md:text-4xl font-bold text-slate-900">
            {info.price === 0 || info.price === "Free"
              ? "Free"
              : `₹${info.price}`}
          </span>
          <span className="text-slate-400 text-sm">/course</span>
        </div>
        <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
          {info.features.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-sm text-slate-600 font-medium"
            >
              <div className="size-5 rounded-full bg-[#f0fdff] flex items-center justify-center shrink-0">
                <Check className="size-3 text-[#0891b2]" />
              </div>
              {item}
            </li>
          ))}
        </ul>
        <Link
          to={`/courses/${data?.id}`}
          className="w-full py-3 md:py-3.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm hover:bg-[#f0fdff] hover:border-[#cff9fe] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          View Details <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
};

// Style 2: Cyan Gradient Card
const FullStackCard = ({ data }) => {
  const info = {
    title: data?.title || "Full Stack",
    desc: data?.description || "MERN Stack Specialization.",
    price: data?.price || "5,999",
    features: ["Frontend + Backend", "Database Mastery", "Live Projects"],
  };

  return (
    <div className="size-full bg-linear-to-br from-[#5edff4] to-[#06b6d4] rounded-4xl shadow-2xl shadow-[#5edff4]/40 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden border border-white/20 group">
      <div className="absolute top-6 right-6 z-50">
        <span className="px-4 py-1.5 bg-white text-[#0891b2] text-xs font-bold rounded-full shadow-xl uppercase tracking-wider flex items-center gap-1">
          <Crown className="size-3" /> Best Seller
        </span>
      </div>
      <div className="relative z-10">
        <div className="size-10 md:size-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6 shadow-inner border border-white/20">
          <Crown className="size-5 md:size-6" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white line-clamp-1">
          {info.title}
        </h3>
        <p className="text-[#cff9fe] mt-2 text-sm font-medium line-clamp-2">
          {info.desc}
        </p>
      </div>
      <div className="relative z-10">
        <div className="flex items-baseline gap-1 mb-4 md:mb-6">
          <span className="text-3xl md:text-4xl font-bold text-white">
            {info.price === 0 || info.price === "Free"
              ? "Free"
              : `₹${info.price}`}
          </span>
        </div>
        <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
          {info.features.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-sm text-white font-medium"
            >
              <div className="size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="size-3 text-white" />
              </div>
              {item}
            </li>
          ))}
        </ul>
        <Link
          to={`/courses/${data?.id}`}
          className="w-full py-3 md:py-3.5 rounded-xl bg-white text-[#0891b2] font-bold text-sm hover:bg-[#f0fdff] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Enroll Now <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
};

// Style 3: Dark Card
const DataScienceCard = ({ data }) => {
  const info = {
    title: data?.title || "AI & Data Science",
    desc: data?.description || "Machine Learning Masters.",
    price: data?.price || "7,999",
    features: ["Python & SQL", "ML Algorithms", "Big Data"],
  };

  return (
    <div className="size-full bg-slate-900 rounded-4xl border border-slate-800 shadow-2xl shadow-slate-900/50 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#5edff4] to-purple-500" />
      <div className="relative z-10">
        <div className="size-10 md:size-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6 border border-slate-700 shadow-lg">
          <Star className="size-5 md:size-6 text-[#5edff4]" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white line-clamp-1">
          {info.title}
        </h3>
        <p className="text-slate-400 mt-2 text-sm font-medium line-clamp-2">
          {info.desc}
        </p>
      </div>
      <div className="relative z-10">
        <div className="flex items-baseline gap-1 mb-4 md:mb-6">
          <span className="text-3xl md:text-4xl font-bold text-white">
            {info.price === 0 || info.price === "Free"
              ? "Free"
              : `₹${info.price}`}
          </span>
        </div>
        <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
          {info.features.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-sm text-slate-300 font-medium"
            >
              <div className="size-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <Check className="size-3 text-[#5edff4]" />
              </div>
              {item}
            </li>
          ))}
        </ul>
        <Link
          to={`/courses/${data?.id}`}
          className="w-full py-3 md:py-3.5 rounded-xl bg-slate-800 text-white border border-slate-700 font-bold text-sm hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          View Details <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
};

const CARD_STYLES = [FrontendCard, FullStackCard, DataScienceCard];

// ==========================================
// SECTION 2: 3D ENGINE
// ==========================================

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 transform-3d will-change-transform backface-hidden ${
      customClass ?? ""
    } ${rest.className ?? ""}`.trim()}
  />
));
Card.displayName = "Card";

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });

const SwapEngine = ({
  width,
  height,
  cardDistance,
  verticalDistance,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  children,
}) => {
  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    [childArr.length],
  );
  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef(null);
  const intervalRef = useRef();
  const container = useRef(null);

  useEffect(() => {
    const total = refs.length;
    if (total === 0) return;

    refs.forEach((r, i) =>
      placeNow(
        r.current,
        makeSlot(i, cardDistance, verticalDistance, total),
        skewAmount,
      ),
    );

    const swap = () => {
      if (order.current.length < 2) return;
      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: "+=300",
        opacity: 0,
        rotation: -5,
        duration: config.durDrop,
        ease: "power2.in",
      });
      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.15}`,
        );
      });

      const backSlot = makeSlot(
        refs.length - 1,
        cardDistance,
        verticalDistance,
        refs.length,
      );
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, {
            zIndex: backSlot.zIndex,
            opacity: 0,
            rotation: 0,
          });
        },
        undefined,
        "return",
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          opacity: 1,
          duration: config.durReturn,
          ease: "power2.out",
        },
        "return",
      );
      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    if (childArr.length > 1) {
      intervalRef.current = window.setInterval(swap, delay);
    }

    if (pauseOnHover) {
      const node = container.current;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        if (childArr.length > 1) {
          tlRef.current?.play();
          intervalRef.current = window.setInterval(swap, delay);
        }
      };
      node.addEventListener("mouseenter", pause);
      node.addEventListener("mouseleave", resume);
      return () => {
        node.removeEventListener("mouseenter", pause);
        node.removeEventListener("mouseleave", resume);
        clearInterval(intervalRef.current);
      };
    }
    return () => clearInterval(intervalRef.current);
  }, [
    cardDistance,
    verticalDistance,
    delay,
    pauseOnHover,
    skewAmount,
    easing,
    childArr.length,
  ]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e) => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          },
        })
      : child,
  );

  return (
    <div
      ref={container}
      className="relative flex items-center justify-center perspective-[900px] overflow-visible z-20"
      style={{ width, height }}
    >
      {rendered}
    </div>
  );
};

// ==========================================
// SECTION 3: RESPONSIVE LAYOUT & DATA
// ==========================================

const CardsSwap = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courseVideos"), limit(5));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCourses(data);
      } catch (e) {
        console.error("Error fetching courses:", e);
      }
    };
    fetchCourses();
  }, []);

  const cardWidth = isMobile ? "320px" : "380px";
  const cardHeight = isMobile ? "480px" : "480px";
  const cardDist = isMobile ? 30 : 45;
  const vertDist = isMobile ? 40 : 55;

  return (
    <section className="w-full bg-transparent py-16 md:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 items-center gap-12 lg:gap-0">
            {/* Left Content */}
            <div className="flex flex-col justify-center w-full order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] md:text-xs font-bold tracking-wider uppercase mb-6 w-fit">
                <Bookmark className="size-3" /> The Syllabus
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                Choose Your <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#5edff4] to-[#0891b2]">
                  Career Path.
                </span>
              </h2>
              <p className="text-slate-600 text-base md:text-lg mb-8">
                From beginner basics to advanced specialization, Alifestable
                Academy guides you every step of the way.
              </p>
              <div className="space-y-6">
                {[
                  {
                    num: 1,
                    title: "Foundation",
                    desc: "Build your skills from the ground up.",
                    color: "bg-[#f0fdff] text-[#0891b2]",
                  },
                  {
                    num: 2,
                    title: "Specialization",
                    desc: "Master specific tools and frameworks.",
                    color: "bg-slate-100 text-slate-600",
                  },
                  {
                    num: 3,
                    title: "Career Launch",
                    desc: "Turn Skills Into Career with expert guidance.",
                    color: "bg-[#5edff4]/10 text-[#0891b2]",
                  },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="flex gap-4 group cursor-default"
                  >
                    <div
                      className={`size-10 md:size-12 rounded-2xl ${item.color} flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform`}
                    >
                      {item.num}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base">
                        {item.title}
                      </h4>
                      <p className="text-xs md:text-sm text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Cards */}
            <div className="w-full flex items-center justify-center relative order-2 mt-10 lg:mt-0">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="size-52 md:size-64 bg-[#5edff4]/20 rounded-full blur-[80px]" />
              </div>
              {courses.length > 0 ? (
                <SwapEngine
                  width={cardWidth}
                  height={cardHeight}
                  cardDistance={cardDist}
                  verticalDistance={vertDist}
                  delay={3500}
                  skewAmount={3}
                >
                  {courses.map((course, index) => {
                    const CardComponent =
                      CARD_STYLES[index % CARD_STYLES.length];
                    return (
                      <Card key={course.id}>
                        <CardComponent data={course} />
                      </Card>
                    );
                  })}
                </SwapEngine>
              ) : (
                <div
                  className="animate-pulse bg-slate-100 rounded-4xl border border-slate-200 flex items-center justify-center text-slate-400"
                  style={{ width: cardWidth, height: cardHeight }}
                >
                  Loading Courses...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardsSwap;
