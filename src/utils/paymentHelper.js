import { openRazorpayCheckout } from "../services/razorpayService";

/**
 * Checks if the agency has configured their own Razorpay Key ID for instant checkout.
 */
export const isRazorpayConfigured = (agency) => {
  return Boolean(agency?.razorpayKeyId && agency.razorpayKeyId.trim());
};

/**
 * Helper to ensure URLs have http:// or https:// protocol.
 * Prevents window.open from interpreting external payment links as relative URLs on the current site.
 */
export const formatPaymentUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/**
 * Resolves the payment link for a given course and agency configuration.
 */
export const getCoursePaymentLink = (course, agency) => {
  if (!course) return null;
  const courseId = course.id || course.courseId;

  // 1. Bundle payment link
  if (courseId === "bundle" || course.isBundle || course.title?.toLowerCase?.().includes("bundle")) {
    const bundleLink =
      agency?.customPaymentLinks?.["bundle"] ||
      agency?.bundlePaymentLink ||
      agency?.paymentLink ||
      course?.paymentLink ||
      null;
    return formatPaymentUrl(bundleLink);
  }

  // 2. Specific course payment link
  const customPaymentLink = agency?.customPaymentLinks?.[courseId];
  const partnerCoursePaymentLink =
    course.partnerId && course.partnerId !== "admin" ? course.paymentLink : null;
  const directCoursePaymentLink = course.paymentLink;
  const globalAgencyPaymentLink = agency?.paymentLink;

  const resolvedLink =
    customPaymentLink ||
    partnerCoursePaymentLink ||
    directCoursePaymentLink ||
    globalAgencyPaymentLink ||
    null;

  return formatPaymentUrl(resolvedLink);
};

/**
 * Safely opens the payment link in a new tab.
 */
export const openPaymentLink = (url) => {
  const formatted = formatPaymentUrl(url);
  if (!formatted) return false;
  window.open(formatted, "_blank", "noopener,noreferrer");
  return true;
};

/**
 * Universal Checkout Handler:
 * 1. Requires authenticated user (prompts AuthModal if not signed in).
 * 2. Checks if partner has Razorpay Key ID -> Opens Razorpay Modal with 100% instant auto-allocation.
 * 3. Fallback to custom payment link (if configured).
 * 4. Fallback to WhatsApp direct message.
 */
export const handleUniversalCheckout = async ({
  course,
  agency,
  currentUser,
  rawPrice,
  setIsAuthOpen,
  onPaymentSuccess,
  onError,
  isMainSite = false,
}) => {
  if (!currentUser) {
    if (setIsAuthOpen) {
      setIsAuthOpen(true);
    }
    return { status: "auth_required" };
  }

  // 1. Check if Partner has active Razorpay API Keys (BYOK Model)
  if (isRazorpayConfigured(agency)) {
    try {
      const opened = await openRazorpayCheckout({
        course,
        agency,
        currentUser,
        rawPrice,
        onSuccess: (allocResult, rzpResponse) => {
          if (onPaymentSuccess) {
            onPaymentSuccess(allocResult, rzpResponse);
          }
        },
        onError: (err) => {
          if (onError) onError(err);
        },
      });
      return { status: "razorpay_modal_opened", opened };
    } catch (err) {
      console.error("Razorpay checkout failed to initialize:", err);
      // If Razorpay fails, fall through to link or WhatsApp
    }
  }

  // 2. Check for Custom Payment Link
  const finalPaymentLink = getCoursePaymentLink(course, agency);
  if (finalPaymentLink) {
    openPaymentLink(finalPaymentLink);
    return { status: "custom_link_opened", url: finalPaymentLink };
  }

  // 3. Fallback to WhatsApp
  const targetWhatsapp = agency?.whatsapp || "919999999999";
  if (!agency?.whatsapp && !isMainSite) {
    alert("Partner contact number not configured. Please contact support.");
    return { status: "error", message: "No contact number" };
  }

  const priceDisplay =
    !rawPrice || rawPrice === "Free" || rawPrice === 0 || rawPrice === "0"
      ? "₹499"
      : `${rawPrice}`.startsWith("₹")
      ? rawPrice
      : `₹${rawPrice}`;

  const studentName = currentUser.displayName || "Student";
  const studentEmail = currentUser.email || "Email Not Provided";

  let offerText = "";
  if (agency?.promoType === "bogo" && course.id !== "bundle") {
    offerText = `\n🎁 *Promo Applied:* Buy 1 Get All Free! 🎉`;
  } else if (course.id === "bundle") {
    offerText = `\n🎁 *Promo Applied:* All Courses Bundle`;
  }

  const message =
    `*New Course Enrollment Request* 🎓\n\n` +
    `Hello, I am interested in purchasing this course. Here are my details:\n\n` +
    `👤 *Student Name:* ${studentName}\n` +
    `📧 *Mail:* ${studentEmail}\n\n` +
    `📚 *Course Name:* ${course.title}\n` +
    `💰 *Price:* ${priceDisplay}\n` +
    `🆔 *Course ID:* ${course.id}\n` +
    offerText +
    `\n\n` +
    `Please share payment details so I can complete enrollment and get access.`;

  const whatsappUrl = `https://wa.me/${targetWhatsapp.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");

  return { status: "whatsapp_opened", url: whatsappUrl };
};

