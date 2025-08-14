# Telegram Clone - Call Features

Bu loyihada Telegram kabi audio va video call funksiyalari qo'shildi.

## Qo'shilgan Funksiyalar

### 1. Call Buttons (Top Chat)
- Har bir chat tepasida audio va video call tugmalari
- Audio call uchun yashil telefon ikonasi
- Video call uchun ko'k video ikonasi

### 2. Incoming Call UI
- Qo'ng'iroq kelganda chiqadigan chiroyli interfeys
- Qo'ng'iroq qiluvchining avatari va ismi
- Accept va Reject tugmalari
- Audio/video call turi ko'rsatiladi

### 3. Active Call UI
- Davom etayotgan qo'ng'iroq uchun to'liq interfeys
- Video call uchun: asosiy video + kichik local video
- Audio call uchun: chiroyli gradient fon + avatar
- Mute, video on/off, qo'ng'iroq tugatish tugmalari
- Minimize qilish imkoniyati

### 4. Calling UI (Waiting)
- Qo'ng'iroq javobini kutish vaqti
- Loading animatsiya
- Cancel tugmasi
- Qo'ng'iroq turi ko'rsatiladi

## Texnik Tuzilma

### useCall Hook
- Call state management
- Media controls (audio/video toggle)
- Call actions (initiate, accept, reject, end)

### Socket Integration
- Real-time call signaling
- WebRTC connection handling
- Call state synchronization

### UI Components
- `CallButtons` - Call tugmalari
- `IncomingCall` - Kiruvchi qo'ng'iroq
- `ActiveCall` - Faol qo'ng'iroq
- `Calling` - Qo'ng'iroq kutish

## Qanday Ishlatish

### 1. Qo'ng'iroq Qilish
1. Contact bilan chat qiling
2. Chat tepasidagi audio/video call tugmasini bosing
3. Qo'ng'iroq javobini kuting

### 2. Qo'ng'iroq Qabul Qilish
1. Qo'ng'iroq kelganda notification chiqadi
2. Accept tugmasini bosing
3. Call UI ochiladi

### 3. Call Boshqarish
- Mute: Audio ni o'chirish/yoqish
- Video: Video ni o'chirish/yoqish (faqat video call)
- End Call: Qo'ng'iroqni tugatish
- Minimize: Call ni kichraytirish

## Demo Testing

Hozirda demo qo'ng'iroq uchun:
- Chat oching
- Pastki o'ng burchakda "Demo Incoming Call" tugmasi
- Bosing va incoming call UI ni ko'ring

## Keyingi Qadamlar

1. **WebRTC Integration** - Haqiqiy media streaming
2. **Socket Events** - Real-time call signaling
3. **Call History** - Qo'ng'iroqlar tarixi
4. **Group Calls** - Guruh qo'ng'iroqlari
5. **Screen Sharing** - Ekranni ulashish

## Eslatma

Bu hali development holatida. WebRTC va socket integration keyingi versiyalarda qo'shiladi.
Hozirda faqat UI va basic state management ishlaydi.
