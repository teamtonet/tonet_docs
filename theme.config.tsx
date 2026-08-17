import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <><img src={"/images/logo.png"} style={{width:'100px'}} />  Docs </>,

  chat: {
    link: 'https://dashboard.tonet.ai',
    icon: <>Go to Manage</>
    
  },
  docsRepositoryBase: 'https://tonet.ai',
  editLink:{text:''},
  feedback:{
    content:null
  },
  footer: {
    text: 'Tonet 2026 ©.',
  },

  useNextSeoProps: () => ({ titleTemplate: "%s \u2013 Tonet" }),
  head: (
    <>
      <link rel="icon" type="image/png" href="/images/logo_t.png" />
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-1N6KVQV3HQ"></script>
      <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-1N6KVQV3HQ');` }} />
      <script defer src="https://app.rybbit.io/api/script.js" data-site-id="8404"></script>
    </>
  )

}

export default config
