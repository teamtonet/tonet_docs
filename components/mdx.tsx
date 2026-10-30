import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
import { PriceCalculator } from './price-calculator';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // Every screenshot can be clicked to see it full size.
    img: (props: ComponentProps<'img'>) => <ImageZoom {...(props as ComponentProps<typeof ImageZoom>)} />,
    Accordion,
    Accordions,
    Step,
    Steps,
    Tab,
    Tabs,
    PriceCalculator,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
