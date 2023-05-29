import { Logger } from './Logger'

export async function delay(timeoutPeriodMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeoutPeriodMs))
}

export async function setIntervalAsync(
  callback: () => Promise<void>,
  delayMs: number,
  logger: Logger,
): Promise<void> {
  for (;;) {
    await delay(delayMs)
    await callback().catch((err) => logger.error(err))
  }
}
