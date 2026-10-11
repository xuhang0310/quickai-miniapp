/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_JAVA_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// uni-app 在编译时注入当前平台
declare const process: {
  env: {
    UNI_PLATFORM?: string
    NODE_ENV?: string
  }
}
