

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Submit a new booking
 */
// export async function createBooking(formData) {

//   const payload = {
//     full_name:      formData.full_name,
//     email:          formData.email,
//     phone:          formData.phone,
//     pickup_city:    formData.pickup_city    || formData.pickup_address || "",
//     drop_location:  formData.drop_location  || formData.drop_address  || "",
//     pickup_date:    formData.pickup_date,
//     pickup_time:    formData.pickup_time,
//     service_type:   formData.service_type,
//     vehicle_type:   formData.vehicle_type,
//     vehicle_number: formData.vehicle_number || "",
//     trip_type:      formData.trip_type      || "one_way",   // ← NEW
//     special_notes:  formData.special_notes  || "",
//     promo_code:     formData.promo_code     || "",
//   };

//   console.log("📦 Sending booking payload:", payload);

//   const res = await fetch(`${API_BASE}/bookings`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     const msg = data?.errors?.[0]?.msg || data?.message || "Booking submission failed.";
//     console.error("❌ Booking error:", data);
//     throw new Error(msg);
//   }

//   return data;
// }

export async function createBooking(formData) {

  const payload = {
    full_name:      formData.full_name,
    email:          formData.email,
    phone:          formData.phone,
    pickup_city:    formData.pickup_city    || formData.pickup_address || "",
    drop_location:  formData.drop_location  || formData.drop_address  || "",
    pickup_date:    formData.pickup_date,
    pickup_time:    formData.pickup_time,
    return_date:    formData.return_date    || "",
    return_time:    formData.return_time    || "",
    service_type:   formData.service_type,
    vehicle_type:   formData.vehicle_type,
    vehicle_class:  formData.vehicle_class  || "normal",
    vehicle_number: formData.vehicle_number || "",
    trip_type:      formData.trip_type      || "one_way",
    food_provided:  !!formData.food_provided,
    special_notes:  formData.special_notes  || "",
    promo_code:     formData.promo_code     || "",
  };

  console.log("📦 Sending booking payload:", payload);

  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.errors?.[0]?.msg || data?.message || "Booking submission failed.";
    console.error("❌ Booking error:", data);
    throw new Error(msg);
  }

  return data;
}

// getPriceEstimate and getBooking — unchanged, no edits needed
/**
 *
 * Get a live fare estimate while the customer fills the form.
 * Returns null silently on error so the form never breaks.
 */
export async function getPriceEstimate(params) {
  try {
    const res = await fetch(`${API_BASE}/pricing/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return null;
    return data.data;
  } catch (e) {
    console.warn("Price estimate failed silently:", e.message);
    return null;
  }
}

/**
 * Fetch booking by ID
 */
export async function getBooking(bookingId) {
  const res  = await fetch(`${API_BASE}/bookings/${bookingId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}