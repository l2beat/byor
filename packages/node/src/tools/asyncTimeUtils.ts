export async function delay(timeoutPeriodMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeoutPeriodMs))
}

/**
 * Asynchronously executes a callback function at fixed intervals.
 * If a single invocation of the callback function rejects, the loop will be terminated,
 * and the rejection will propagate to the caller of `setIntervalAsync`.
 * It is the responsibility of the caller to handle errors in the callback function.
 *
 * @param callback - The callback function to be executed at each interval.
 * @param delayMs - The delay in milliseconds between each invocation of the callback function.
 * @returns Return result should be ignored
 */
export async function setIntervalAsync(
  callback: () => Promise<void>,
  delayMs: number,
  leading = false,
): Promise<void> {
  if (leading) {
    await callback()
  }
  for (;;) {
    await delay(delayMs)
    await callback()
  }
}
