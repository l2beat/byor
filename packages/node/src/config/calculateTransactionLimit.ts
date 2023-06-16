import { SIGNED_TX_SIZE } from '@byor/shared'

// NOTE(radomski): Assume the worst case scenario, where
// all the calldata bytes are nonzero (4x gas price)
// In the ideal world we would count the zero/non-zero bytes
// and compute the gas based on that
//
// Based on: Ethereum Yellow Paper Appendix G. Fee Schedule
// G_txdatanonzero = 16
const CALLDATA_BYTE_GAS = 16
const EMPTY_TRANSACTION_GAS = 23208

export function calculateTransactionLimit(gasLimit: number): number {
  const calldataGas = gasLimit - EMPTY_TRANSACTION_GAS
  const availableBytes = calldataGas / CALLDATA_BYTE_GAS
  // Minus one to ensure space for 32byte padding
  const transactionLimit = Math.floor(availableBytes / SIGNED_TX_SIZE) - 1

  return transactionLimit
}
