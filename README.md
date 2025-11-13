# Alert Management System

Hệ thống quản trị Alert được xây dựng với ReactJS + TypeScript + Docker.

## 🚀 Tính năng

- ✅ Dashboard thống kê alerts theo severity và status
- ✅ Danh sách alerts với filter và search
- ✅ Tạo mới, xem chi tiết, sửa, xóa alerts
- ✅ Phân loại alerts theo severity (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Quản lý trạng thái alerts (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- ✅ Tích hợp Swagger APIs
- ✅ Responsive UI với Ant Design
- ✅ Docker support cho production và development

## 🛠 Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design 5
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **State Management**: Zustand (ready to use)
- **Date Library**: Day.js
- **Containerization**: Docker + Docker Compose

## 📋 Yêu cầu

- Node.js 20+
- npm hoặc yarn
- Docker & Docker Compose (optional)

## 🔧 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/NamVH1996/NamVH1996.github.io.git
cd NamVH1996.github.io
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` theo cấu hình của bạn:

```env
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Alert Management System
VITE_APP_VERSION=1.0.0
```

### 4. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 🐳 Chạy với Docker

### Development mode

```bash
# Uncomment phần alert-management-dev trong docker-compose.yml
docker-compose up alert-management-dev
```

### Production mode

```bash
# Build và chạy
docker-compose up -d

# Hoặc build image riêng
docker build -t alert-management-fe .
docker run -p 3000:80 -e VITE_API_URL=http://your-api-url alert-management-fe
```

## 📁 Cấu trúc project

```
.
├── src/
│   ├── config/          # Cấu hình (API endpoints, constants)
│   ├── layouts/         # Layout components
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── AlertList.tsx
│   │   ├── AlertDetail.tsx
│   │   └── AlertCreate.tsx
│   ├── services/        # API services
│   │   ├── api.ts       # Axios instance với interceptors
│   │   └── alertService.ts
│   ├── types/           # TypeScript types/interfaces
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── Dockerfile           # Production Dockerfile
├── docker-compose.yml   # Docker Compose config
├── nginx.conf           # Nginx configuration
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## 🔌 Tích hợp với Backend API

Project đã được cấu hình sẵn để tích hợp với Swagger APIs. Các endpoints mặc định:

```typescript
// src/config/api.ts
export const API_ENDPOINTS = {
  alerts: '/api/alerts',
  alertById: (id: string) => `/api/alerts/${id}`,
  alertStats: '/api/alerts/stats',
}
```

### Cấu hình API URL

Có 2 cách để cấu hình API URL:

1. **Development**: Sử dụng proxy trong `vite.config.ts`
2. **Production**: Set biến môi trường `VITE_API_URL`

### Swagger Integration

Để tích hợp với Swagger API của bạn:

1. Copy Swagger JSON/YAML definition
2. Cập nhật types trong `src/types/alert.ts`
3. Cập nhật service methods trong `src/services/alertService.ts`
4. Update API endpoints trong `src/config/api.ts`

## 🧪 Testing

```bash
# Run tests (sau khi setup testing framework)
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 📦 Build Production

```bash
npm run build
```

Folder `dist/` sẽ chứa production build.

## 🌐 Deployment

### Deploy với Docker

```bash
docker-compose up -d
```

### Deploy lên Vercel/Netlify

```bash
npm run build
# Upload folder dist/
```

### Deploy lên Nginx

```bash
# Build project
npm run build

# Copy dist folder vào nginx
cp -r dist/* /usr/share/nginx/html/

# Restart nginx
systemctl restart nginx
```

## 📚 API Documentation

Chi tiết các API endpoints và request/response format, xem tại Swagger UI của backend.

## 🎨 Customization

### Thay đổi theme color

Edit `src/main.tsx`:

```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff', // Thay đổi màu chủ đạo
      borderRadius: 4,
    },
  }}
>
```

### Thêm menu items

Edit `src/layouts/MainLayout.tsx`:

```typescript
const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  // Thêm menu mới
  { key: '/new-page', icon: <YourIcon />, label: 'New Page' },
]
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License

## 👤 Author

**NamVH1996**

- GitHub: [@NamVH1996](https://github.com/NamVH1996)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Ant Design](https://ant.design/)
- [TypeScript](https://www.typescriptlang.org/)