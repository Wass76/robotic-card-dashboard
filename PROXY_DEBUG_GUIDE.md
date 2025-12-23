# Proxy Debug Guide - 500 Error Investigation

## المشاكل المحتملة والتحسينات المطبقة

### 1. Content-Type Header للـ GET Requests
**المشكلة:** الـ API يتوقع `Content-Type: text/plain` للـ GET requests، لكن الكود كان يرسل `application/json` أو لا يرسل شيء.

**الحل المطبق:**
- تم تحديث `src/services/api.js` لإرسال `Content-Type: text/plain` للـ GET requests
- للـ POST/PUT/DELETE، يتم إرسال `application/json` كما هو متوقع

### 2. Proxy Configuration
**التحسينات المطبقة:**
- إضافة logging مفصل في `vite.config.js` لتتبع:
  - الطلبات الصادرة (method, URL, headers, body)
  - الردود الواردة (status code, headers)
  - الأخطاء

### 3. API Client Logging
**التحسينات المطبقة:**
- إضافة logging في `src/services/api.js` لتتبع:
  - تفاصيل الطلب قبل الإرسال
  - تفاصيل الرد بعد الاستلام
  - تفاصيل الأخطاء (status, headers, body)

## كيفية التحقق من المشكلة

### 1. فحص Console في المتصفح
بعد تطبيق التغييرات، افتح المتصفح وافحص:
- Console logs للطلبات والردود
- Network tab لرؤية الطلبات الفعلية

### 2. فحص Proxy Logs
في terminal الذي يشغل Vite dev server، ستجد:
- `📤 Sending Request:` - تفاصيل الطلب المرسل
- `📥 Received Response:` - تفاصيل الرد المستلم
- `❌ Proxy Error:` - أي أخطاء في الـ proxy

### 3. مقارنة مع Postman
قارن بين:
- **URL:** يجب أن يكون نفس المسار (`/api/User`)
- **Method:** GET
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: text/plain` (للـ GET)
- **Body:** لا يوجد body للـ GET requests

## المشاكل المحتملة الأخرى

### 1. Double /api/api
**التحقق:** تأكد أن الـ base URL لا يحتوي على `/api`
- ✅ صحيح: `https://api-cards-robotic-club.tech-sauce.com`
- ❌ خطأ: `https://api-cards-robotic-club.tech-sauce.com/api`

### 2. CORS Preflight (OPTIONS)
**التحقق:** الـ proxy يجب أن يتعامل مع OPTIONS requests تلقائياً
- إذا كان هناك مشكلة، ستظهر في console

### 3. Host/Origin Header
**التحقق:** الـ proxy يستخدم `changeOrigin: true` مما يغير الـ Host header
- هذا صحيح ويجب أن يعمل

### 4. HTTPS vs HTTP
**التحقق:** الـ proxy يستخدم `secure: true` للـ HTTPS
- تأكد أن الـ SSL certificate صحيح

### 5. Authorization Token
**التحقق:** 
- تأكد أن الـ token موجود في localStorage
- تأكد أن الـ token يتم إرساله بشكل صحيح في header

## الخطوات التالية للـ Debug

1. **افتح المتصفح** وافحص Console
2. **قم بعمل request** (مثلاً تسجيل الدخول أو fetch users)
3. **راقب الـ logs:**
   - في المتصفح Console
   - في Vite dev server terminal
4. **قارن الطلب** مع Postman request
5. **تحقق من:**
   - URL الصحيح
   - Headers الصحيحة
   - Status code
   - Error message

## ملاحظات إضافية

- إذا كان الـ error 500 يحدث فقط في المتصفح وليس في Postman، المشكلة غالباً في:
  - Headers مختلفة
  - URL مختلف
  - Body مختلف (للـ POST/PUT)
  - CORS issues

- الـ proxy logs ستساعد في تحديد المشكلة بدقة

