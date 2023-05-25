import { EthereumAddress, Hex, Logger } from '@byor/shared'
import { expect, mockFn, mockObject } from 'earl'
import { parseAbiItem, PublicClient, WalletClient, Hex as ViemHex, Account, Chain } from 'viem'

import { EthereumPrivateClient } from './EthereumPrivateClient'
import { abi } from '../../config/abi'
import { access } from 'fs'

describe(EthereumPrivateClient.name, () => {
  describe(EthereumPrivateClient.prototype.writeToCTCContract.name, () => {
    it('writes data to the CTC contract using private provider', async () => {
      const publicProvider = mockObject<PublicClient>({})
      const privateProvider = mockObject<WalletClient>({
          writeContract: mockFn().returnsOnce(""),
          account: mockObject<Account | undefined>({}),
          chain: mockObject<Chain>({})
      })
      const ctcContractAddress = EthereumAddress("0x1e950E339C82dB045408FB65034e702170855578")
      const ethereumClient = new EthereumPrivateClient(privateProvider, publicProvider, ctcContractAddress, Logger.SILENT)

      await ethereumClient.writeToCTCContract(Hex("0x1234"))

      expect(privateProvider.writeContract).toHaveBeenCalledWith({
          address: ctcContractAddress.toString() as ViemHex,
          abi: abi,
          functionName: 'appendBatch',
          args: ["0x1234"],
          account: privateProvider.account!,
          chain: privateProvider.chain,
      })
    })
  })
})
