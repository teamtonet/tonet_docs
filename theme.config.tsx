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
    </>
  )

}

export default config
