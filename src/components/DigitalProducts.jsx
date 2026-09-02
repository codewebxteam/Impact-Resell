import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Check, ArrowRight, Star, Zap, Crown } from "lucide-react";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { useAgency } from "../context/AgencyContext"; // [ADDED]

// Styling Config for dynamic cards
const CARD_VARIANTS = [
  { icon: Zap, color: "from-[#cff9fe] to-[#5edff4]", type: "Best Seller" },
  {
    icon: Crown,
    color: "from-[#5edff4] to-[#0891b2]",
    type: "Premium",
    popular: true,
  },
  { icon: Star, color: "from-purple-200 to-purple-400", type: "New Arrival" },
];

const ProductCard = ({ product, index }) => {
  const ref = useRef(null);
  const style = CARD_VARIANTS[index % CARD_VARIANTS.length];
  const Icon = style.icon;

  // [ADDED] Dynamic Price Logic
  const { getPrice, isMainSite } = useAgency();
  const finalPrice = getPrice(product.id, product.price);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xOffset = clientX - left - width / 2;
    const yOffset = clientY - top - height / 2;
    x.set(xOffset / 25);
    y.set(yOffset / 25);
  }

  const transform = useMotionTemplate`perspective(1000px) rotateX(${mouseY}deg) rotateY(${mouseX}deg)`;

  const features = [
    "Full Course Access",
    `${product.pages || "Multiple"} Lessons/Modules`,
    "Lifetime Updates",
    "Certificate Included",
  ];

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ transformStyle: "preserve-3d", transform }}
      className={`relative group h-full rounded-4xl transition-all duration-300
        ${style.popular ? "z-10 md:scale-105" : "hover:z-10"}
      `}
    >
      <div
        className={`absolute inset-0 rounded-4xl bg-slate-900 border border-slate-800 transition-colors duration-300 group-hover:border-[#5edff4]/30 ${
          style.popular
            ? "ring-1 ring-[#5edff4]/50 shadow-2xl shadow-[#5edff4]/20"
            : "hover:shadow-xl hover:shadow-[#5edff4]/10"
        }`}
      />

      <div
        className="relative h-44 rounded-t-4xl overflow-hidden bg-slate-800"
        style={{ transform: "translateZ(20px)" }}
      >
        <div
          className={`absolute inset-0 bg-linear-to-b ${
            style.popular ? "from-[#5edff4]/20" : "from-slate-800/20"
          } to-slate-900 z-10`}
        />
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          src={product.image}
          alt={product.title}
          className="size-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          onError={(e) => {
            e.target.src = "https://placehold.co/600x400?text=Course";
          }}
        />
        <div className="absolute top-3 right-3 size-8 rounded-full bg-slate-900/80 backdrop-blur-md flex items-center justify-center border border-white/10 z-20">
          <Icon className="size-4 text-white" />
        </div>
      </div>

      <div
        className="p-5 md:p-6 flex flex-col h-auto justify-between relative z-10"
        style={{ transform: "translateZ(30px)" }}
      >
        <div>
          <div
            className={`text-[10px] font-bold uppercase tracking-wider mb-1 bg-linear-to-r ${style.color} bg-clip-text text-transparent`}
          >
            {style.type}
          </div>

          <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-1">
            {product.title}
          </h3>

          {/* Price — only on partner subdomain, hidden on main site */}
          {!isMainSite && (
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl md:text-3xl font-bold text-white">
                {finalPrice == 0 || finalPrice === "Free"
                  ? "Free"
                  : `₹${finalPrice}`}
              </span>
            </div>
          )}

          <p className="text-slate-400 text-xs leading-relaxed mb-5 min-h-8 line-clamp-2">
            {product.description}
          </p>
          <div className="w-full h-px bg-slate-800 mb-5" />

          <ul className="space-y-2 mb-6">
            {features.map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-slate-300"
              >
                <Check
                  className={`size-3.5 mt-0.5 shrink-0 ${
                    style.popular ? "text-[#5edff4]" : "text-slate-500"
                  }`}
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Link to={`/courses/${product.id}`}>
          <button
            className={`w-full py-3 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer ${
              style.popular
                ? "bg-linear-to-r from-[#5edff4] to-[#0891b2] text-slate-900 shadow-lg shadow-[#5edff4]/25 hover:shadow-[#5edff4]/40"
                : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
            }`}
          >
            View Course <ArrowRight className="size-3.5" />
          </button>
        </Link>
      </div>

      <div
        className={`absolute inset-0 rounded-4xl bg-linear-to-br ${style.color} opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity duration-500`}
        style={{ transform: "translateZ(0px)" }}
      />
    </motion.div>
  );
};

const DigitalProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isMainSite, agency } = useAgency();

  const getValidImageUrl = (url) => {
    if (!url) return "https://placehold.co/600x400?text=No+Cover";
    try {
      if (url.includes("drive.google.com")) {
        let id = "";
        if (url.includes("/file/d/"))
          id = url.split("/file/d/")[1].split("/")[0];
        else if (url.includes("id=")) id = url.split("id=")[1].split("&")[0];
        if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
      }
    } catch (e) {
      console.error(e);
    }
    return url;
  };

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courseVideos"));
        let data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          image: getValidImageUrl(doc.data().image),
        }));

        if (isMainSite) {
          data = data.filter(c => !c.partnerId || c.partnerId === "admin");
        } else {
          data = data.filter(c => !c.partnerId || c.partnerId === "admin" || c.partnerId === agency?.id);
        }

        data.sort((a, b) => {
          const pA = parseInt(a.priority) || 9999;
          const pB = parseInt(b.priority) || 9999;
          if (pA !== pB) return pA - pB;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        setProducts(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, [isMainSite, agency?.id]);

  if (loading || products.length === 0) return null;

  return (
    <section className="relative w-full bg-slate-950 py-16 md:py-20 px-4 overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-75 bg-[#5edff4]/5 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-slate-900 border border-slate-800 text-[#5edff4] text-[10px] font-bold tracking-widest uppercase mb-3">
            Unlock Your Potential
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Featured{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#5edff4] to-[#0891b2]">
              Courses
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-sm mx-auto">
            Top-rated courses from our academy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={index === 1 ? "md:-mt-6 md:-mb-6" : ""}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-[#5edff4] font-bold text-sm hover:underline"
          >
            View All Courses <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DigitalProducts;
