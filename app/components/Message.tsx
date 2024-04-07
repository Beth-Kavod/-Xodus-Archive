import './Message.css'

interface Props {
  params: {
    textMessage: string
    success: boolean
  }
}

export default function Message({ params }: Props) {
  const { textMessage, success } = params
  return (
    <div className={`message ${success ? 'success' : 'error'}`}>
      <p>{textMessage}</p>
    </div>
  )
}