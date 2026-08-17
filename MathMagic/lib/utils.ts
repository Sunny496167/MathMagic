export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "#10B981";
    case "shipped":
      return "#3B82F6";
    case "pending":
      return "#F59E0B";
    case "cancelled":
      return "#EF4444";
    default:
      return "#666";
  }
};

export const resolveImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `https://iqvenus-frontend.vercel.app${cleanPath}`;
};

export const formatPhoneNumber = (phone: string) => {
  if (!phone) return "";
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  if (cleanPhone.length === 10) {
    return `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
  } else if (cleanPhone.startsWith("+91") && cleanPhone.length === 13) {
    return `+91 ${cleanPhone.slice(3, 8)} ${cleanPhone.slice(8)}`;
  } else if (cleanPhone.length > 10 && !cleanPhone.startsWith("+")) {
    const countryCodeLength = cleanPhone.length - 10;
    return `+${cleanPhone.slice(0, countryCodeLength)} ${cleanPhone.slice(countryCodeLength, countryCodeLength + 5)} ${cleanPhone.slice(countryCodeLength + 5)}`;
  }
  return phone;
};
