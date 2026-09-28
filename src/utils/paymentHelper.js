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
