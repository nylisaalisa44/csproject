import type { IFooterConfig } from '@/types/footer.ts'

export const FOOTER_CONFIG: IFooterConfig = {
  navigation: [
    {
      title: 'Сайт',
      links: [
        {
          name: 'Продажа / обмен',
          url: '',
        },
        {
          name: 'Поддержка',
          url: '',
        },
        {
          name: 'Рюкзак',
          url: '',
        },
        {
          name: 'Депозит',
          url: '',
        },
      ],
    },
    {
      title: 'Профиль',
      links: [
        {
          name: 'Личный кабинет',
          url: '',
        },
        {
          name: 'Реферальная программа',
          url: '',
        },
        {
          name: 'Транзакции',
          url: '',
        },
        {
          name: 'Безопасность',
          url: '',
        },
      ],
    },
    {
      title: 'Настройки',
      links: [
        {
          name: 'Русский',
          url: '',
        },
        {
          name: 'USD $',
          url: '',
        },
      ],
    },
  ],
  legal: [
    {
      name: 'Политика cookie',
      url: '',
    },
    {
      name: 'Политика конфиденциальности',
      url: '',
    },
    {
      name: 'Условия пользования',
      url: '',
    },
    {
      name: 'Политика возврата',
      url: '',
    },
  ],
  social: {
    instagram: 'https://instagram.com', // you can omit empty link to remove it from rendering
    discord: 'https://discord.com',
    facebook: 'https://facebook.com',
    steam: 'https://steamcommunity.com/',
    tiktok: 'https://tiktok.com',
    vk: 'https://vk.com',
    x: 'https://x.com',
  },
}
