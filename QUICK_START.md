# 🚀 Quick Start - 5 Minutes to Running Plugin

## One-Line Setup

```bash
./setup-dev.sh
```

Done! Now follow the steps below.

---

## ⚡ Manual Quick Start (If you prefer)

### Step 1: Install & Build (2 min)

```bash
nvm use 18          # Use Node 18 (or skip if already 18+)
npm install --legacy-peer-deps
npm run build
```

### Step 2: Start Services (3 terminals needed)

**Terminal 1 - Backend:**
```bash
go run ./pkg/main.go
# Shows: Listening on :8080
```

**Terminal 2 - Frontend Watch:**
```bash
npm run dev
# Shows: compiled successfully
```

**Terminal 3 - Grafana:**
```bash
docker-compose up -d
# Wait 10 seconds for startup
```

### Step 3: Open & Enable Plugin (1 min)

1. Open: **http://localhost:3000**
2. Login: `admin` / `admin`
3. Click ⚙️ (gear icon)
4. Go to: **Plugins** (search for "All-in-One")
5. Click **Enable**
6. Go to: **Administration** → **All-in-One Monitoring App**

✅ **Done!** Plugin is now active!

---

## 🧭 Navigate the Plugin

From main dashboard, you'll see these tabs:

| Tab | What it does |
|-----|----------|
| **Alert Management** | View and manage alerts |
| **Contact Points** | Configure alert routing (Telegram, Slack, etc) |
| **Data Enrichment** | VM mappings, escalation rules, extraction rules |
| **Dashboards** | Custom dashboard views |
| **Settings** | Configure API backend URL |

---

## 🛑 Stop Everything

```bash
# Terminal 1 & 2: Press Ctrl+C
# Terminal 3:
docker-compose down
```

---

## 🔧 Common Issues

### Plugin doesn't show in Grafana?

```bash
npm run build           # Rebuild
docker restart grafana  # Restart Grafana
# Wait 10 seconds, refresh browser
```

### Backend not responding?

```bash
curl http://localhost:8080/api/health
# Should return: {"status":"ok"}
```

### Port already in use?

```bash
# Find what's using port 3000
lsof -i :3000
# Kill process: kill -9 <PID>

# Or use different port in docker-compose.yml
```

---

## 📚 Want More?

- **Development Guide**: `cat DEV_GUIDE.md`
- **Full Setup**: `cat SETUP.md`
- **Backend API**: `cat BACKEND.md`

---

## 💡 Pro Tips

1. **Use VSCode**:
   - Install "Prettier" extension for auto-format
   - Set `"editor.formatOnSave": true`

2. **Monitor all 3 terminals**:
   ```
   ┌─────────────────────────────────────────┐
   │ Terminal 1: Backend    (Go)              │
   │ Terminal 2: Frontend   (npm dev)         │
   │ Terminal 3: Grafana    (docker)          │
   │ Terminal 4: Editor     (VSCode/etc)      │
   └─────────────────────────────────────────┘
   ```

3. **Auto-reload on file change**:
   - Frontend: Automatic via webpack watcher
   - Backend: Restart terminal (or use `go run` with file watcher)
   - Grafana: Hard-refresh browser (Ctrl+Shift+R)

4. **Debug in Chrome DevTools**:
   - Press F12
   - Network tab shows API calls
   - Console shows errors

---

## 🎯 Next Steps After Setup

1. **Make a change**: Edit `src/pages/AppPage.tsx`
2. **See it live**: Browser auto-reloads
3. **Check API**: Edit backend in `pkg/api/`
4. **Test backend**: `curl http://localhost:8080/api/health`

Happy developing! 🎉
