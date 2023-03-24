import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import { parseInitPopupCode, typebotImportCode } from '../../snippetParsers'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { PopupProps } from '@typebot.io/js'
import { env, getViewerUrl } from '@typebot.io/lib'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'

type Props = Pick<PopupProps, 'autoShowDelay'>

export const JavascriptPopupSnippet = ({ autoShowDelay }: Props) => {
  const { typebot } = useTypebot()
  const snippet = prettier.format(
    createSnippet({
      typebot: typebot?.publicId ?? '',
      apiHost: isCloudProdInstance
        ? undefined
        : env('VIEWER_INTERNAL_URL') ?? getViewerUrl(),
      autoShowDelay,
    }),
    {
      parser: 'html',
      plugins: [parserHtml],
    }
  )
  return <CodeEditor value={snippet} lang="html" isReadOnly />
}

const createSnippet = (params: PopupProps): string => {
  const jsCode = parseInitPopupCode(params)
  return `<script type="module">${typebotImportCode}

${jsCode}</script>`
}
