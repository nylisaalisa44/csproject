import type { ISocials } from '@/types/socials.ts'

type IFooterLink = {
  name: string
  url: string
}

type IFooterNavigation = {
  title: string
  links: IFooterLink[]
}

type IFooterSocial = Record<ISocials, string>

export type IFooterConfig = {
  navigation: IFooterNavigation[]
  legal: IFooterLink[]
  social: IFooterSocial
}
