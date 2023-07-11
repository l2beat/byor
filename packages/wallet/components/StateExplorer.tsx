'use client'

import { EthereumAddress, Hex } from '@byor/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { NextRouter, useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { Account } from './Account'
import AccountBalance from './AccountBalance'
import Transaction from './Transaction'

export function setExplorerInput(router: NextRouter, input: string) {
  router
    .push(`/?addrhash=${input}`, undefined, { shallow: true })
    .catch((err) => {
      console.warn('Failed to push router path', err)
    })
}

export function StateExplorer() {
  const formSchema = z.object({
    addressOrHash: z.string().refine(
      (a: string) => {
        try {
          const aHex = Hex(a)
          if (Hex.removePrefix(aHex).length === 40) {
            EthereumAddress(a)
          } else if (Hex.removePrefix(aHex).length !== 64) {
            return false
          }
          return true
        } catch {
          return false
        }
      },
      {
        message: 'Input is neither an Ethereum Address nor a Transaction Hash',
      },
    ),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      addressOrHash: '',
    },
  })

  const [addressOrHash, setAddressOrHash] = useState<string | undefined>(
    undefined,
  )
  const router = useRouter()
  useEffect(() => {
    if (router.query.addrhash && typeof router.query.addrhash === 'string') {
      setAddressOrHash(router.query.addrhash)
    }
  }, [router.query.addrhash])

  function onSubmit(values: z.infer<typeof formSchema>) {
    setExplorerInput(router, values.addressOrHash)
  }

  return (
    <div className="container flex bg-zinc-800 rounded-xl mt-10 column flex-wrap">
      <div className="basis-full my-2">
        <Form {...form}>
          <form
            onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
          >
            <FormField
              control={form.control}
              name="addressOrHash"
              render={({ field }) => (
                <FormItem>
                  <div className="flex w-full max-w-sm items-center space-x-2 ">
                    <Input
                      placeholder="ETH Address or Transaction Hash"
                      {...field}
                    />
                    <Button type="submit">Check</Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      {addressOrHash ? (
        <>
          {Hex.removePrefix(Hex(addressOrHash)).length === 40 ? (
            <div className="max-w-full my-2">
              <Account address={addressOrHash}>
                <AccountBalance />
              </Account>
            </div>
          ) : (
            <div className="max-w-full my-2">
              <Transaction hash={Hex(addressOrHash).toString()} />
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
