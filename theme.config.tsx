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
}

export default config
