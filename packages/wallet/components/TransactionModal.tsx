'use client'

import {
  deserialize,
  EthereumAddress,
  hashTransaction,
  Hex,
  serialize,
  SignedTransaction,
  typedDataPrimaryType,
  typedDataTypes,
  Unsigned8,
  Unsigned64,
} from '@byor/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { Copy, Loader2 } from 'lucide-react'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSignTypedData } from 'wagmi'
import * as z from 'zod'

import { getTypedDataDomain } from '@/../shared/build'
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
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc'
import { copyToClipboard } from '@/utils/copyToClipboard'

import { AccountContext } from './AccountContext'
import { ToastAction } from './ui/toast'

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
    .gte(0, { message: "Value can't be negative" })
    .max(10, "Value can't be bigger than 10"),
  fee: z
    .number({ invalid_type_error: 'Fee should be a number' })
    .gte(0, { message: "Fee can't be negative" })
    .max(10, "Fee can't be bigger than 10"),
})

export function TransactionModal() {
  const acc = useContext(AccountContext)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiver: '',
    },
    mode: 'onChange',
  })

  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const mutation = trpc.transactions.submit.useMutation({
    onSuccess: async (_, variables) => {
      const tx = await deserialize(variables)
      const hash = hashTransaction(tx)

      toast({
        title: 'Your transaction has been submitted to the mempool',
        description: `Transaction Hash: ${hash.slice(0, 18)}...`,
        action: (
          <ToastAction altText="copy" asChild>
            <Button variant="secondary">
              <Copy onClick={() => copyToClipboard(hash.toString())} />
            </Button>
          </ToastAction>
        ),
      })
    },
  })

  const { isLoading, signTypedData } = useSignTypedData({
    onSuccess: (data) => {
      const signature = data
      const values = form.getValues()
      const tx: SignedTransaction = {
        from: EthereumAddress(acc.address),
        to: EthereumAddress(values.receiver),
        value: Unsigned64(values.value),
        nonce: Unsigned64(parseInt(acc.nonce, 10) + 1),
        fee: Unsigned64(values.fee),
        r: Hex(signature.substring(2, 66)),
        s: Hex(signature.substring(66, 130)),
        v: Unsigned8(parseInt(signature.substring(130, 132), 16)),
      }
      mutation.mutate(serialize(tx))

      setDialogOpen(false)
    },
  })

  const handleSend = (values: z.infer<typeof formSchema>) => {
    signTypedData({
      domain: getTypedDataDomain(),
      types: typedDataTypes,
      primaryType: typedDataPrimaryType,
      message: {
        to: values.receiver,
        value: values.value,
        nonce: parseInt(acc.nonce, 10) + 1,
        fee: values.fee,
      },
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Send Transaction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[655px]">
        <DialogHeader>
          <DialogTitle>Send Transaction</DialogTitle>
          <DialogDescription>
            Your current balance is {acc.balance}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onKeyDown={preventEnterKeySubmission}
            onSubmit={(...args) => void form.handleSubmit(handleSend)(...args)}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="receiver"
                render={({ field }) => (
                  <FormItem>
                    <FormMessage />
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="receiver_label" className="text-right">
                        {"Receiver's Address"}
                      </Label>
                      <FormControl>
                        <Input className="col-span-3" {...field} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={() => (
                  <FormItem>
                    <FormMessage />
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fee"
                render={() => (
                  <FormItem>
                    <FormMessage />
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
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <div className="flex justify-center basis-full">
                <DialogTrigger asChild>
                  <Button className="mx-1" variant="outline">
                    Cancel
                  </Button>
                </DialogTrigger>
                <Button disabled={isLoading} className="mx-1" type="submit">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function preventEnterKeySubmission(e: React.KeyboardEvent<HTMLFormElement>) {
  return e.key === 'Enter' && e.preventDefault()
}
