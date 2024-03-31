import './Message.css'

interface Props {
  params: {
    textMessage: string
  }
}

export default function Message({ params }: Props) {
  const { textMessage } = params
  return (
    <div className="message">
      <p>Welcome, {textMessage}!</p>
    </div>
  )
}