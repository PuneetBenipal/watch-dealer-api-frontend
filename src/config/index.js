// export const FRONTEND_URL = 'http://localhost:3000'
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ? process.env.REACT_APP_BACKEND_URL : 'http://localhost:5000';
// export const FRONTEND_URL = 'https://watch-dealer-hub.vercel.app'
// export const BACKEND_URL = 'https://watch-dealer-hub-server-06m8.onrender.com'

console.log("UI console process env",process.env.REACT_APP_BACKEND_URL)