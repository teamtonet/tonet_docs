import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
import { AskDemo } from './ask-demo';
import { CallDemo } from './call-demo';
import { CallFlow } from './call-flow';
import { Heading } from './heading';
import { LiveCallDemo } from './live-call-demo';
import { MenuDemo } from './menu-demo';
import { PhonePicker } from './phone-picker';
import { PortTimeline } from './port-timeline';
import { PriceCalculator } from './price-calculator';
import { RingEverywhere } from './ring-everywhere';
import { RingVsQueue } from './ring-vs-queue';
import { Shot } from './shot';
import { TextingChecker } from './texting-checker';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    h2: (props: ComponentProps<'h2'>) => <Heading as="h2" {...props} />,
    h3: (props: ComponentProps<'h3'>) => <Heading as="h3" {...props} />,
    h4: (props: ComponentProps<'h4'>) => <Heading as="h4" {...props} />,
    h5: (props: ComponentProps<'h5'>) => <Heading as="h5" {...props} />,
    h6: (props: ComponentProps<'h6'>) => <Heading as="h6" {...props} />,
    // Every screenshot can be clicked to see it full size.
    img: (props: ComponentProps<'img'>) => <ImageZoom {...(props as ComponentProps<typeof ImageZoom>)} />,
    Accordion,
    Accordions,
    Step,
    Steps,
    Tab,
    Tabs,
    PriceCalculator,
    CallFlow,
    CallDemo,
    AskDemo,
    Shot,
    RingEverywhere,
    PortTimeline,
    LiveCallDemo,
    TextingChecker,
    MenuDemo,
    RingVsQueue,
    PhonePicker,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
