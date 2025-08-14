# 🚀 Telegram Clone - Startup Guide

## ❌ **Muammo: Server Connection Error**

Hozirda quyidagi xatolik yuz beryapti:
```
Error generating token: AxiosError {message: 'timeout of 10000ms exceeded'}
```

Bu xatolik server ishlamayotgani yoki noto'g'ri port ga ulanishga urinishidan kelib chiqadi.

## 🔧 **Yechim: Serverni Ishga Tushirish**

### 1. **Root directory da kerakli paketlarni o'rnatish**
```bash
npm install
```

### 2. **Server paketlarini o'rnatish**
```bash
cd server
npm install
cd ..
```

### 3. **Client paketlarini o'rnatish**
```bash
cd client
npm install
cd ..
```

### 4. **Socket paketlarini o'rnatish**
```bash
cd socket
npm install
cd ..
```

## 🚀 **Serverni Ishga Tushirish**

### **Variant 1: Alohida terminal larda**
```bash
# Terminal 1: Server (port 6000)
cd server
npm run server

# Terminal 2: Client (port 3000)
cd client
npm run dev

# Terminal 3: Socket (port 3001)
cd socket
node socket.js
```

### **Variant 2: Bir terminal da (concurrently bilan)**
```bash
# Root directory da
npm run dev
```

## 🌐 **Port Configuration**

- **Server**: `http://localhost:6000` ✅ (fixed)
- **Client**: `http://localhost:3000`
- **Socket**: `ws://localhost:3001`

## 📋 **Server Status Check**

Har bir server ishlayotganini tekshirish:

1. **Server**: `http://localhost:6000` - "Server is running on port 6000"
2. **Client**: `http://localhost:3000` - Next.js app
3. **Socket**: `ws://localhost:3001` - Socket connection

## 🔍 **Troubleshooting**

### **Server ishlamayapti:**
```bash
cd server
npm run server
```

### **MongoDB connection error:**
`.env` faylida `MONGO_URI` to'g'ri ko'rsatilganini tekshiring

### **Port already in use:**
```bash
# Port 6000 ni bo'shatish
lsof -ti:6000 | xargs kill -9
```

## ✅ **Success Indicators**

- ✅ Server: "Server is running on port 6000"
- ✅ MongoDB: "MongoDB connected"
- ✅ Client: Next.js development server
- ✅ Socket: Socket.io server running
- ✅ No more "timeout" errors in console

## 🎯 **Keyingi Qadamlar**

1. Serverni ishga tushiring
2. Client ni ishga tushiring
3. Socket server ni ishga tushiring
4. Browser da `http://localhost:3000` ni oching
5. Call funksiyalarini test qiling

## 📞 **Call Features Test**

Server ishlagandan keyin:
- Call buttons ko'rinadi
- Demo incoming call ishlaydi
- Call UI components ko'rinadi
- No more connection errors
