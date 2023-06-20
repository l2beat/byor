import { expect } from 'earl'
import { formatTimeDifferenceFromNow } from './formatTimeDifferenceFromNow'

const ONE_SEC = 1000
const ONE_MIN = ONE_SEC * 60
const ONE_HOUR = ONE_MIN * 60
const ONE_DAY = ONE_HOUR * 24

describe(formatTimeDifferenceFromNow.name, () => {
  it('correctly formats 1 sec for a full second', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - ONE_SEC)).toEqual(
      '1 sec ago',
    )
  })

  it('correctly formats 1 min for a full min', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - ONE_MIN)).toEqual(
      '1 min ago',
    )
  })

  it('correctly formats 1 hour for a full hour', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - ONE_HOUR)).toEqual(
      '1 hour ago',
    )
  })

  it('correctly formats 1 day for a full day', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - ONE_DAY)).toEqual(
      '1 day ago',
    )
  })

  it('correctly formats 1 sec for a one and a half second', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - ONE_SEC * 1.5)).toEqual(
      '1 sec ago',
    )
  })

  it('correctly formats 1 min for a one and a half min', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - ONE_MIN * 1.5)).toEqual(
      '1 min ago',
    )
  })

  it('correctly formats 1 hour for a one and a half hour', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - ONE_HOUR * 1.5)).toEqual(
      '1 hour ago',
    )
  })

  it('correctly formats 1 day for a one and a half day', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - ONE_DAY * 1.5)).toEqual(
      '1 day ago',
    )
  })

  it('correctly formats 1 min for two minutes minus one second', () => {
    expect(
      formatTimeDifferenceFromNow(Date.now() - (2 * ONE_MIN - ONE_SEC)),
    ).toEqual('1 min ago')
  })

  it('correctly formats 1 hour for two hours minus one second', () => {
    expect(
      formatTimeDifferenceFromNow(Date.now() - (2 * ONE_HOUR - ONE_SEC)),
    ).toEqual('1 hour ago')
  })

  it('correctly formats 1 day for two days minus one second', () => {
    expect(
      formatTimeDifferenceFromNow(Date.now() - (2 * ONE_DAY - ONE_SEC)),
    ).toEqual('1 day ago')
  })

  it('correctly formats 2 seconds adding the s', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 2 * ONE_SEC)).toEqual(
      '2 secs ago',
    )
  })

  it('correctly formats 2 minutes adding the s', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 2 * ONE_MIN)).toEqual(
      '2 mins ago',
    )
  })

  it('correctly formats 2 hours adding the s', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 2 * ONE_HOUR)).toEqual(
      '2 hours ago',
    )
  })

  it('correctly formats 2 days adding the s', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 2 * ONE_DAY)).toEqual(
      '2 days ago',
    )
  })

  it('correctly formats 59 seconds', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 59 * ONE_SEC)).toEqual(
      '59 secs ago',
    )
  })

  it('correctly formats 59 mins', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 59 * ONE_MIN)).toEqual(
      '59 mins ago',
    )
  })

  it('correctly formats 23 hours', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 23 * ONE_DAY)).toEqual(
      '23 days ago',
    )
  })

  it('correctly formats 1 minute from seconds', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 60 * ONE_SEC)).toEqual(
      '1 min ago',
    )
  })

  it('correctly formats 1 hour from mintues', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 60 * ONE_MIN)).toEqual(
      '1 hour ago',
    )
  })

  it('correctly formats 1 day from hours', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 24 * ONE_HOUR)).toEqual(
      '1 day ago',
    )
  })

  it('correctly formats 32 days', () => {
    expect(formatTimeDifferenceFromNow(Date.now() - 32 * ONE_DAY)).toEqual(
      '32 days ago',
    )
  })
})
