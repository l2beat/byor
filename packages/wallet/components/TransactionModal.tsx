'use client'

import { EthereumAddress } from '@byor/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSignMessage } from 'wagmi'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TransactionModalProps {
  balance: string
}

export function TransactionModal(props: TransactionModalProps) {
  const formSchema = z.object({
    receiver: z.string().refine(
      (a: string) => {
        try {
          EthereumAddress(a)
          return true
        } catch {
          return false
        }
      },
      { message: "Provided receiver's address is not valid" },
    ),
    value: z
      .number({ invalid_type_error: 'Value should be a number' })
      .gte(0, { message: "Value can't be negative" }),
    fee: z
      .number({ invalid_type_error: 'Fee should be a number' })
      .gte(0, { message: "Fee can't be negative" }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiver: '',
      value: 0,
      fee: 0,
    },
    mode: 'onChange',
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const { data, isSuccess, signMessage } = useSignMessage()

  function handleSend() {
    const values = form.getValues()
    console.log('here', values)
    signMessage({ message: values.receiver })
  }

  useEffect(() => {
    console.log('naura', data)
    if (isSuccess) {
      setDialogOpen(false)
    }
  }, [isSuccess])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Send Transaction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[655px]">
        <DialogHeader>
          <DialogTitle>Send Transaction</DialogTitle>
          <DialogDescription>
            Your current balance is {props.balance}
          </DialogDescription>
        </DialogHeader>
        <div className="basis-full my-2">
          <Form {...form}>
            <form
              onKeyDown={preventEnterKeySubmission}
              onSubmit={(...args) =>
                void form.handleSubmit(handleSend)(...args)
              }
            >
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="receiver"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="receiver_label" className="text-right">
                          {"Receiver's Address"}
                        </Label>
                        <FormControl>
                          <Input className="col-span-3" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value_label" className="text-right">
                          Value
                        </Label>
                        <FormControl>
                          <Input
                            className="col-span-3"
                            {...form.register('value', {
                              setValueAs: (v: string) =>
                                v === '' ? undefined : parseInt(v, 10),
                            })}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fee"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fee_label" className="text-right">
                          Fee
                        </Label>
                        <FormControl>
                          <Input
                            className="col-span-3"
                            {...form.register('fee', {
                              setValueAs: (v: string) =>
                                v === '' ? undefined : parseInt(v, 10),
                            })}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <div className="flex justify-center basis-full">
                  <DialogTrigger>
                    <Button className="mx-1" type="submit" variant="outline">
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <Button className="mx-1" type="submit">
                    Send
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function preventEnterKeySubmission(e: React.KeyboardEvent<HTMLFormElement>) {
  return e.key === 'Enter' && e.preventDefault()
}
