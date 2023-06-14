'use client'

import { EthereumAddress } from '@byor/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { Account } from './Account'
import AccountBalance from './WalletBalance'

export function AccountExplorer() {
  const formSchema = z.object({
    address: z.string().refine(
      (a: string) => {
        try {
          EthereumAddress(a)
          return true
        } catch {
          return false
        }
      },
      { message: 'Input is neither an Ethereum Address nor a Transaction Hash' },
    ),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
    },
  })

  const [address, setAddress] = useState<string | undefined>(undefined)

  function onSubmit(values: z.infer<typeof formSchema>) {
    setAddress(values.address)
  }

  return (
    <div className="container flex border rounded mt-10 column flex-wrap">
      <div className="basis-full my-2">
        <Form {...form}>
          <form
            onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
          >
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <div className="flex w-full max-w-sm items-center space-x-2 ">
                    <Input placeholder="ETH Address or Transaction Hash" {...field} />
                    <Button type="submit">Check</Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      {address && (
        <div className="basis-full my-2">
          <Account address={address}>
            <AccountBalance />
          </Account>
        </div>
      )}
    </div>
  )
}
