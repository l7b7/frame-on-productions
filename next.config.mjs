import path from 'node:path';
import {fileURLToPath} from 'node:url';
export default {poweredByHeader:false,turbopack:{root:path.dirname(fileURLToPath(import.meta.url))},async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'}]}];}};
