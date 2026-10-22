/** User-facing error copy. Kept free of server-only imports so the browser can use it too. */

import type { StreamErrorCode } from "./stream-events";

export const ERROR_MESSAGES: Record<StreamErrorCode, string> = {
  unauthorized: "في مشكلة في صلاحية الاتصال بالخدمة — كلّم الأدمن.",
  no_credits: "رصيد الحساب خلص — كلّم الأدمن.",
  model_not_found: "الموديل ده مش متاح — اختار موديل تاني.",
  network: "مقدرناش نوصل للخدمة دلوقتي — جرّب تاني.",
  bad_request: "الرسالة مش مظبوطة — جرّب تاني.",
};
