export type IDevice = {
  browser: string
  os: string
  ip: string
  geolocation: string
  status: 'active' | 'inactive'
  thisDevice?: boolean
}
