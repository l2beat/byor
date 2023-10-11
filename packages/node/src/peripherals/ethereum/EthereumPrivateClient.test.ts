import { EthereumAddress, Hex } from '@byor/shared'
import { Logger } from '@l2beat/backend-tools'
import { expect, mockFn, mockObject } from 'earl'
import { Account, Chain, PublicClient, WalletClient } from 'viem'

import { abi } from '../../core/abi'
import { EthereumPrivateClient } from './EthereumPrivateClient'

describe(EthereumPrivateClient.name, () => {
  describe(EthereumPrivateClient.prototype.writeToInputsContract.name, () => {
    it('writes data to the Inputs contract using private provider', async () => {
      const publicProvider = mockObject<PublicClient>({})
      const privateProvider = mockObject<WalletClient>({
        writeContract: mockFn().returnsOnce(''),
        account: mockObject<Account | undefined>({}),
        chain: mockObject<Chain>({}),
      })
      const ctcContractAddress = EthereumAddress(
        '0x1e950E339C82dB045408FB65034e702170855578',
      )
      const ethereumClient = new EthereumPrivateClient(
        privateProvider,
        publicProvider,
        ctcContractAddress,
        Logger.SILENT,
      )

      await ethereumClient.writeToInputsContract(Hex('0x1234'))

      expect(privateProvider.writeContract).toHaveBeenCalledWith({
        address: ctcContractAddress.toString(),
        abi: abi,
        functionName: 'appendBatch',
        args: ['0x1234'],
        account: privateProvider.account!,
        chain: privateProvider.chain,
      })
    })
  })
})
