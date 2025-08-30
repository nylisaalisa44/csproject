type IBuyData = {
  price: string
  sellerImage: string
  itemImage: string
  date: number
}

type ISellData = {
  price: string
  buyerImage: string
  itemImage: string
  date: number
}

type IWithdrawalData = {
  walletAddress: string
  amount: string
  date: number
}

type IDepositData = {
  walletAddress: string
  amount: string
  date: number
}

export type IStatus = 'completed' | 'failed' | 'suspended' | 'pending' | 'other'

export type ITransaction =
  | {
      type: 'buy'
      status: IStatus
      data: IBuyData
    }
  | {
      type: 'sell'
      status: IStatus
      data: ISellData
    }
  | {
      type: 'withdrawal'
      status: IStatus
      data: IWithdrawalData
    }
  | {
      type: 'deposit'
      status: IStatus
      data: IDepositData
    }
