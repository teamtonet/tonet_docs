import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <><img src={"https://tonet.ai/static/images/logo.png"} style={{width:'100px'}} />  Docs </>,

  chat: {
    link: 'https://dashboard.tonet.ai',
    icon: <>Go to Manage</>
    
  },
  docsRepositoryBase: 'https://github.com/shuding/nextra-docs-template',
  editLink:{text:''},
  feedback:{
    content:null
  },
  footer: {
    text: 'Tonet 2023 ©.',
  },

  useNextSeoProps: () => ({ titleTemplate: "%s \u2013 Tonet" }),
  head: (
    <>
      <link rel="icon" type="image/x-icon" href="https://tonet.ai/static/images/logo_t.png" />
    </>
  )

}

export default config
