import { zip } from 'lodash'
import {
  formatUnixTimestampMs,
  formatUnixTimestampMsOrDefault,
} from './formatUnixTimestamp'
import { expect } from 'earl'

describe(formatUnixTimestampMs.name, () => {
  const inputs = [
    1278721675000, 1644341814000, 1436459615000, 1293514972000, 1902078581000,
    2045260183000, 748529067000, 1641745357000, 1981923321000, 1714703492000,
    1826906277000, 658107489000, 1079922794000, 1610599363000, 2026539089000,
  ]

  const outputs = [
    '2010 Jul 10 00:27:55 (UTC)',
    '2022 Feb 08 17:36:54 (UTC)',
    '2015 Jul 09 16:33:35 (UTC)',
    '2010 Dec 28 05:42:52 (UTC)',
    '2030 Apr 10 19:09:41 (UTC)',
    '2034 Oct 23 23:49:43 (UTC)',
    '1993 Sep 20 12:44:27 (UTC)',
    '2022 Jan 09 16:22:37 (UTC)',
    '2032 Oct 20 22:15:21 (UTC)',
    '2024 May 03 02:31:32 (UTC)',
    '2027 Nov 22 17:57:57 (UTC)',
    '1990 Nov 08 23:38:09 (UTC)',
    '2004 Mar 22 02:33:14 (UTC)',
    '2021 Jan 14 04:42:43 (UTC)',
    '2034 Mar 21 07:31:29 (UTC)',
  ]

  zip(inputs, outputs).forEach(([input, output]) => {
    it(`Parses ${output}`, () => {
      expect(formatUnixTimestampMs(input!)).toEqual(output!)
    })
  })
})

describe(formatUnixTimestampMsOrDefault.name, () => {
  const inputs = [
    1278721675000, 1644341814000, 1436459615000, 1293514972000, 1902078581000,
    2045260183000, 748529067000, 1641745357000, 1981923321000, 1714703492000,
    1826906277000, 658107489000, 1079922794000, 1610599363000, 2026539089000,
  ]

  const outputs = [
    '2010 Jul 10 00:27:55 (UTC)',
    '2022 Feb 08 17:36:54 (UTC)',
    '2015 Jul 09 16:33:35 (UTC)',
    '2010 Dec 28 05:42:52 (UTC)',
    '2030 Apr 10 19:09:41 (UTC)',
    '2034 Oct 23 23:49:43 (UTC)',
    '1993 Sep 20 12:44:27 (UTC)',
    '2022 Jan 09 16:22:37 (UTC)',
    '2032 Oct 20 22:15:21 (UTC)',
    '2024 May 03 02:31:32 (UTC)',
    '2027 Nov 22 17:57:57 (UTC)',
    '1990 Nov 08 23:38:09 (UTC)',
    '2004 Mar 22 02:33:14 (UTC)',
    '2021 Jan 14 04:42:43 (UTC)',
    '2034 Mar 21 07:31:29 (UTC)',
  ]

  zip(inputs, outputs).forEach(([input, output]) => {
    it(`Parses correct ${output}`, () => {
      expect(formatUnixTimestampMsOrDefault(input!, 'UNREACHABLE')).toEqual(
        output!,
      )
    })
  })

  it('Parses incorrect and returns the default value', () => {
    const defaultValue = 'defaultValuePassedAroundBecauseNull'

    expect(formatUnixTimestampMsOrDefault(null, defaultValue)).toEqual(
      defaultValue,
    )
  })
})
