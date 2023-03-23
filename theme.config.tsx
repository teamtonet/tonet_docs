import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <><img src={"https://tonet.io/static/images/logo.png"} style={{width:'100px'}} />  Docs </>,

  chat: {
    link: 'https://tonet.io/dashboard',
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
  head:<head> 
  <link rel="icon" type="image/x-icon" href="https://tonet.io/static/images/logo_t.png" />
  </head>

}

export default config
