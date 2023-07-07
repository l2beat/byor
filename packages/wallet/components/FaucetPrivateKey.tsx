import { Hex } from '@/../shared/build'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const PUBLIC_FAUCET_PRIVATE_KEY = Hex(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
)

export function FaucetPrivateKey() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="max-w-full">
          <div className="text-xl text-left max-w-full">
            <div className="text-accent-foreground/60 max-w-full">
              {'To send yourself some tokens, use this private key: '}
            </div>
            <div className="truncate max-w-full">
              {PUBLIC_FAUCET_PRIVATE_KEY}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div>
            <p>
              {'To import this private key (using Metamask):'}
              <br />
              {
                '1. Open your Metamask and click your avatar in the top-right corner'
              }
              <br />
              {'2. From the drop down choose "Import Account"'}
              <br />
              {'3. Choose type "Private Key" and paste this private key'}
              <br />
              {'4. After that choose that test account to connect with the app'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
